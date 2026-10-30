// [AESP-42] Cấu hình OpenRouter + OpenAI GPT (API key, request wrapper)
/**
 * Assistant AI Service - AI phụ trợ học từ OpenRouter
 * Chạy song song với OpenRouter và học cách phân tích
 * Khi đủ thông minh sẽ thay thế OpenRouter
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get backend directory (go up from ai-service/src/services to backend)
const backendDir = path.resolve(__dirname, "..", "..", "..");

/**
 * Gọi AI phụ trợ để kiểm tra translation
 */
export async function checkTranslation(englishText, vietnameseTranslation) {
  return new Promise((resolve, reject) => {
    try {
      // Path to assistantAI.py
      const assistantPath = path.resolve(backendDir, "ai_models", "assistantAI.py");
      
      const pythonProcess = spawn('python', [assistantPath, 'check_translation'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        env: {
          ...process.env,
          PYTHONIOENCODING: 'utf-8'
        }
      });
      
      let stdout = '';
      let stderr = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.warn("⚠️ Assistant AI error:", stderr);
          resolve(null); // Return null để fallback về OpenRouter
          return;
        }
        
        try {
          // Extract JSON from stdout
          const firstBrace = stdout.indexOf('{');
          const lastBrace = stdout.lastIndexOf('}');
          
          if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
            resolve(null);
            return;
          }
          
          const jsonString = stdout.substring(firstBrace, lastBrace + 1);
          const result = JSON.parse(jsonString);
          resolve(result);
        } catch (err) {
          console.warn("⚠️ Error parsing assistant AI output:", err);
          resolve(null);
        }
      });
      
      pythonProcess.on('error', (err) => {
        console.warn("⚠️ Error spawning assistant AI:", err);
        resolve(null); // Return null để fallback
      });
      
      // Gửi data qua stdin
      const inputData = JSON.stringify({
        english_text: englishText,
        vietnamese_translation: vietnameseTranslation
      });
      pythonProcess.stdin.write(inputData);
      pythonProcess.stdin.end();
      
    } catch (err) {
      console.warn("⚠️ Error calling assistant AI:", err);
      resolve(null); // Return null để fallback
    }
  });
}

/**
 * Lưu training data từ OpenRouter để AI phụ trợ học
 */
export async function learnFromOpenRouter(englishText, vietnameseTranslation, openRouterResponse) {
  try {
    // Parse OpenRouter response
    let openRouterResult;
    try {
      const content = typeof openRouterResponse === 'string' 
        ? openRouterResponse 
        : openRouterResponse.choices?.[0]?.message?.content || "{}";
      
      // Extract JSON
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonString = content.substring(firstBrace, lastBrace + 1);
        openRouterResult = JSON.parse(jsonString);
      } else {
        openRouterResult = JSON.parse(content);
      }
    } catch (err) {
      console.warn("Failed to parse OpenRouter response for training:", err);
      return;
    }
    
    // Lưu vào database để AI phụ trợ học
    try {
      await pool.query(
        `INSERT INTO assistant_ai_training 
         (task_type, input_data, expected_output, created_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (task_type, md5(input_data::text)) DO NOTHING`,
        [
          'translation_check',
          JSON.stringify({
            english_text: englishText,
            vietnamese_translation: vietnameseTranslation
          }),
          JSON.stringify(openRouterResult)
        ]
      );
    } catch (err) {
      // Nếu bảng chưa tồn tại, bỏ qua (sẽ được tạo khi chạy migration)
      if (err.code === '42P01') {
        console.warn("⚠️ assistant_ai_training table not found. Run migration: npm run migrate:assistant");
      } else {
        console.warn("Failed to save training data:", err.message);
      }
    }
    
    // Trigger training nếu đủ dữ liệu
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM assistant_ai_training 
       WHERE task_type = 'translation_check'`
    );
    
    const trainingCount = parseInt(countResult.rows[0]?.count || 0);
    
    // Train mỗi 50 samples
    if (trainingCount > 0 && trainingCount % 50 === 0) {
      console.log(`🔄 Training assistant AI with ${trainingCount} samples...`);
      trainAssistantAI('translation_check').catch(err => {
        console.error("Failed to train assistant AI:", err);
      });
    }
  } catch (err) {
    console.error("❌ Error saving training data:", err);
  }
}

/**
 * Train AiESP với dữ liệu đã thu thập - hỗ trợ nhiều task types
 */
export async function trainAssistantAI(taskType = 'translation_check') {
  return new Promise((resolve, reject) => {
    try {
      const assistantPath = path.resolve(backendDir, "ai_models", "assistantAI.py");
      
      const pythonProcess = spawn('python', [assistantPath, 'train', taskType], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        env: {
          ...process.env,
          PYTHONIOENCODING: 'utf-8'
        }
      });
      
      let stdout = '';
      let stderr = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`❌ AiESP training error for ${taskType}:`, stderr);
          reject(new Error(`Training failed: ${stderr}`));
          return;
        }
        
        console.log(`✅ AiESP training completed for ${taskType}`);
        resolve(stdout);
      });
      
      pythonProcess.on('error', (err) => {
        reject(err);
      });
      
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Kiểm tra xem AI phụ trợ đã đủ thông minh chưa
 */
export async function isAssistantAIReady(taskType = 'translation_check') {
  try {
    const result = await pool.query(
      `SELECT accuracy_score FROM assistant_ai_models 
       WHERE task_type = $1 
       ORDER BY trained_at DESC 
       LIMIT 1`,
      [taskType]
    );
    
    if (result.rows.length === 0) {
      return false;
    }
    
    const accuracy = parseFloat(result.rows[0].accuracy_score || 0);
    // Sẵn sàng nếu accuracy >= 85%
    return accuracy >= 0.85;
  } catch (err) {
    console.warn("Error checking assistant AI readiness:", err);
    return false;
  }
}

// Cache model để tránh load lại mỗi lần
let conversationModelCache = null;
let conversationModelCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

/**
 * Load và cache conversation model
 */
async function loadConversationModel() {
  const now = Date.now();
  if (conversationModelCache && (now - conversationModelCacheTime) < CACHE_TTL) {
    return conversationModelCache;
  }
  
  try {
    const result = await pool.query(
      `SELECT model_state, accuracy_score 
       FROM assistant_ai_models 
       WHERE task_type = 'conversation_ai'
       ORDER BY trained_at DESC 
       LIMIT 1`
    );
    
    if (result.rows.length > 0) {
      const model = result.rows[0];
      conversationModelCache = {
        model_state: model.model_state,
        accuracy: parseFloat(model.accuracy_score || 0)
      };
      conversationModelCacheTime = now;
      return conversationModelCache;
    }
  } catch (err) {
    console.warn("⚠️ Error loading conversation model:", err);
  }
  
  conversationModelCache = { model_state: {}, accuracy: 0.0 };
  conversationModelCacheTime = now;
  return conversationModelCache;
}

/**
 * Fast rule-based response (không cần Python)
 */
function fastRuleBasedResponse(userMessage, history) {
  const userLower = userMessage.toLowerCase();
  
  // Emotional responses - nhanh nhất
  if (userLower.includes('sad') || userLower.includes('unhappy') || userLower.includes('depressed') || userLower.includes('down') || userLower.includes('bad')) {
    return "Oh no... that sounds really hard. I'm here with you. What's going on?";
  }
  
  if (userLower.includes('happy') || userLower.includes('excited') || userLower.includes('great') || userLower.includes('good') || userLower.includes('amazing')) {
    return "That's awesome! I'm so happy for you! Tell me more about it!";
  }
  
  if (userLower.includes('worried') || userLower.includes('anxious') || userLower.includes('nervous') || userLower.includes('scared')) {
    return "I understand that feeling. It's okay to feel that way. What's on your mind?";
  }
  
  if (userLower.includes('thank') || userLower.includes('thanks')) {
    return "You're welcome! I'm here whenever you need me.";
  }
  
  // Default empathetic response
  return "I hear you. That sounds important. Can you tell me more?";
}

/**
 * AiESP: Generate conversation response (nhân tố phản hồi chính) - TỐI ƯU TỐC ĐỘ
 */
export async function generateConversationResponse(userMessage, history) {
  // 1. Thử rule-based trước (nhanh nhất, không cần Python)
  const ruleBasedResponse = fastRuleBasedResponse(userMessage, history);
  
  // 2. Load model từ cache
  const model = await loadConversationModel();
  
  // 3. Nếu accuracy thấp, dùng rule-based luôn (không cần Python)
  if (model.accuracy < 0.5) {
    return ruleBasedResponse;
  }
  
  // 4. Nếu có patterns, tìm match nhanh (không cần Python)
  const patterns = model.model_state?.conversation_patterns || [];
  if (patterns.length > 0) {
    const userLower = userMessage.toLowerCase();
    for (const pattern of patterns) {
      const keywords = pattern.keywords || [];
      if (keywords.some(kw => userLower.includes(kw.toLowerCase()))) {
        return pattern.response || ruleBasedResponse;
      }
    }
  }
  
  // 5. Fallback về rule-based (nhanh, không cần Python)
  return ruleBasedResponse;
}

/**
 * Lưu OpenRouter response để AiESP học từ conversation
 */
export async function learnFromOpenRouterConversation(userMessage, history, openRouterResponse) {
  try {
    // Lưu vào database để AiESP học
    await pool.query(
      `INSERT INTO assistant_ai_training 
       (task_type, input_data, expected_output, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (task_type, md5(input_data::text)) DO NOTHING`,
      [
        'conversation_ai',
        JSON.stringify({
          user_message: userMessage,
          history: history.map(h => ({
            text_content: h.text_content || "[Audio]",
            ai_response: h.ai_response || ""
          }))
        }),
        JSON.stringify({ response: openRouterResponse })
      ]
    );
    
    // Trigger training tự động (continuous learning system sẽ xử lý)
    // Không cần trigger ở đây vì aiespContinuousLearning.py sẽ tự động train
    // Chỉ log để monitoring
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM assistant_ai_training 
       WHERE task_type = 'conversation_ai'`
    );
    
    const trainingCount = parseInt(countResult.rows[0]?.count || 0);
    
    if (trainingCount > 0 && trainingCount % 50 === 0) {
      console.log(`📚 OpenRouter đã dạy AiESP ${trainingCount} samples. Continuous learning system sẽ tự động train.`);
    }
  } catch (err) {
    // Nếu bảng chưa tồn tại, bỏ qua
    if (err.code === '42P01') {
      console.warn("⚠️ assistant_ai_training table not found. Run migration.");
    } else {
      console.warn("Failed to save conversation training data:", err.message);
    }
  }
}

