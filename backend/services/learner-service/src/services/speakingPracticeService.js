// Learner Service - Speaking Practice Service
import pool from "../config/db.js";
import { runWhisperX } from "../utils/whisperxRunner.js";
// TODO: Replace with API calls to AI Service
// import * as learnerAiService from "./learnerAiService.js";
// import * as aiService from "./aiService.js";
// import * as trainedAIService from "./trainedAIService.js";
import * as aiServiceClient from "../utils/aiServiceClient.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

/**
 * Tìm project root (đi lên từ learner-service/src/services đến root)
 */
function getProjectRoot() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // __dirname = backend/services/learner-service/src/services
  // Go up 4 levels: services -> src -> learner-service -> services -> backend
  // .. -> src
  // .. -> learner-service
  // .. -> services
  // .. -> backend ✅
  const backendDir = path.resolve(__dirname, "..", "..", "..", "..");
  
  console.log("🔍 getProjectRoot() called from speakingPracticeService.js:", {
    __dirname: __dirname,
    backendDir: backendDir,
    aiModelsDir: path.join(backendDir, "ai_models"),
    aiModelsExists: fs.existsSync(path.join(backendDir, "ai_models"))
  });
  
  return backendDir;
}

// QUAN TRỌNG: Không còn hardcoded prompts
// Tất cả prompts được generate bởi AI trainer trong ai_models/comprehensiveAITrainer.py
// Training data nằm trong ai_models/promptSamples.json

/**
 * Tính thời gian cố định cho tất cả các vòng
 * Dựa trên thời gian người giỏi tiếng Anh nói câu khó (30-40 từ) trong khoảng 10-15 giây
 * Set thời gian cố định là 18 giây cho tất cả các vòng (bất kể mức độ dễ/khó)
 */
function calculateTimeLimit(text, level) {
  // Thời gian cố định: 18 giây cho tất cả các vòng
  // Người giỏi tiếng Anh nói câu khó (30-40 từ) trong khoảng 10-15 giây
  // Thêm buffer 3 giây cho người học = 18 giây
  return 18;
}

/**
 * Khởi tạo learning từ các nguồn (chạy một lần khi server start)
 */
export async function initializeAILearning() {
  try {
    // Kiểm tra xem đã học chưa
    const existing = await pool.query(
      `SELECT COUNT(*) as count FROM ai_learning_context LIMIT 1`
    );
    
    if (parseInt(existing.rows[0]?.count || 0) === 0) {
      console.log("🤖 Initializing AI learning from available sources...");
      await learnFromAvailableSources();
      console.log("✅ AI learning initialized");
    }
  } catch (err) {
    console.error("❌ Error initializing AI learning:", err);
  }
}

/**
 * Tạo session mới cho luyện nói
 * Kiểm tra xem có session đang dở dang không, nếu có thì bắt buộc phải hoàn thành trước
 */
export async function createPracticeSession(learnerId, level) {
  // Đảm bảo AI đã học từ các nguồn
  await initializeAILearning();
  
  // Kiểm tra xem có session đang dở dang không (status = 'active' và chưa completed)
  const existingSession = await pool.query(
    `SELECT id, created_at, 
       (SELECT COUNT(*) FROM speaking_practice_rounds WHERE session_id = speaking_practice_sessions.id) as rounds_count
     FROM speaking_practice_sessions 
     WHERE learner_id = $1 
       AND mode = 'practice'
       AND status = 'active'
       AND completed_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [learnerId]
  );

  if (existingSession.rows.length > 0) {
    const session = existingSession.rows[0];
    const roundsCount = parseInt(session.rounds_count || 0);
    
    // Nếu session đang dở dang (chưa đủ 10 rounds), throw error
    if (roundsCount < 10) {
      throw new Error(`Bạn đang có một bài luyện tập chưa hoàn thành (${roundsCount}/10 vòng). Vui lòng hoàn thành bài đó trước khi bắt đầu bài mới.`);
    }
  }
  
  const result = await pool.query(
    `INSERT INTO speaking_practice_sessions (learner_id, level, mode, status)
     VALUES ($1, $2, 'practice', 'active')
     RETURNING *`,
    [learnerId, level]
  );
  return result.rows[0];
}

/**
 * Tạo session mới cho Tell me your story
 */
export async function createStorySession(learnerId) {
  const result = await pool.query(
    `INSERT INTO speaking_practice_sessions (learner_id, level, mode, status)
     VALUES ($1, 1, 'story', 'active')
     RETURNING *`,
    [learnerId]
  );
  return result.rows[0];
}

/**
 * AI tự học từ các nguồn có sẵn (scenarios, topics, etc.)
 */
async function learnFromAvailableSources() {
  try {
    // Học từ scenarios
    const scenarios = await pool.query(
      `SELECT id, vocabulary, initial_prompt, difficulty_level 
       FROM speaking_scenarios 
       WHERE vocabulary IS NOT NULL 
       LIMIT 20`
    );

    for (const scenario of scenarios.rows) {
      if (scenario.vocabulary && scenario.initial_prompt) {
        // Lưu vào learning context
        try {
          // Đảm bảo vocabulary là JSON hợp lệ
          let vocabularyJson = scenario.vocabulary;
          
          // Nếu đã là object (từ JSONB), convert sang JSON string
          if (typeof vocabularyJson === 'object' && vocabularyJson !== null) {
            vocabularyJson = JSON.stringify(vocabularyJson);
          } else if (typeof vocabularyJson === 'string') {
            // Nếu là string, kiểm tra xem có phải JSON hợp lệ không
            try {
              JSON.parse(vocabularyJson);
              // Nếu parse được, giữ nguyên string
            } catch (e) {
              // Nếu không parse được, bỏ qua vocabulary
              vocabularyJson = null;
            }
          } else {
            vocabularyJson = null;
          }
          
          await pool.query(
            `INSERT INTO ai_learning_context (source_type, source_id, content, vocabulary, level)
             VALUES ('scenario', $1, $2, $3::jsonb, $4)
             ON CONFLICT (source_type, source_id, content) DO NOTHING`,
            [
              scenario.id || null,
              scenario.initial_prompt,
              vocabularyJson,
              scenario.difficulty_level || 1
            ]
          );
        } catch (err) {
          // Ignore duplicate errors và conflict errors
          if (!err.message.includes('duplicate') && 
              !err.message.includes('conflict') && 
              err.code !== '23505') {
            console.error("Error inserting learning context:", err.message);
          }
        }
      }
    }

    // QUAN TRỌNG: Không còn học từ hardcoded prompts
    // AI sẽ học từ promptSamples.json trong ai_models/comprehensiveAITrainer.py
    // và từ sampleTranscripts.json

    // Học từ sampleTranscripts.json nếu có
    try {
      const backendDir = getProjectRoot();
      const sampleTranscriptsPath = path.join(backendDir, "ai_models", "sampleTranscripts.json");
      if (fs.existsSync(sampleTranscriptsPath)) {
        const sampleData = JSON.parse(fs.readFileSync(sampleTranscriptsPath, "utf-8"));
        for (const item of sampleData) {
          if (item.topic && item.text) {
            const words = item.text.split(/\s+/).length;
            // Xác định level dựa trên độ dài
            const estimatedLevel = words <= 15 ? 1 : words <= 30 ? 2 : 3;
            
            try {
              await pool.query(
                `INSERT INTO ai_learning_context (source_type, source_id, content, level, metadata)
                 VALUES ('sample_transcripts', NULL, $1, $2, $3)
                 ON CONFLICT (source_type, source_id, content) DO NOTHING`,
                [
                  item.text,
                  estimatedLevel,
                  JSON.stringify({ topic: item.topic, word_count: words, source: 'sampleTranscripts' })
                ]
              );
            } catch (err) {
              // Ignore duplicate errors
              if (!err.message.includes('duplicate') && !err.message.includes('conflict')) {
                console.error("Error inserting sample transcript:", err);
              }
            }
          }
        }
        console.log(`✅ Loaded ${sampleData.length} sample transcripts into learning context`);
      }
    } catch (err) {
      console.error("❌ Error loading sampleTranscripts:", err);
    }
  } catch (err) {
    console.error("❌ Error learning from sources:", err);
  }
}

// Danh sách topics phong phú từ nhiều nguồn
const TOPIC_THEMES = {
  1: [
    "Self-introduction", "Family", "Daily routine", "Food", "Colors", "Numbers", 
    "Weather", "Pets", "School", "Friends", "Hobbies", "Sports", "Shopping",
    "Transportation", "Home", "Clothing", "Body parts", "Time", "Days of week"
  ],
  2: [
    "Travel", "Work", "Education", "Music", "Movies", "Books", "Technology",
    "Health", "Culture", "Future plans", "Dreams", "Art", "Photography",
    "Cooking", "Fitness", "Relationships", "Career", "Language learning",
    "Entertainment", "Social media", "Environment", "Holidays", "Festivals"
  ],
  3: [
    "Artificial Intelligence", "Climate change", "Globalization", "Philosophy",
    "Psychology", "Economics", "Politics", "Science", "Research", "Innovation",
    "Sustainability", "Ethics", "Society", "History", "Literature", "Mathematics",
    "Physics", "Chemistry", "Biology", "Astronomy", "Cybersecurity", "Data science",
    "Machine learning", "AI ethics", "Public health", "Mental health", "Nutrition"
  ]
};

/**
 * Lấy topics và prompts đã dùng trong session để tránh lặp lại
 */
async function getUsedTopicsInSession(sessionId, level) {
  try {
    if (!sessionId) return { topics: [], prompts: [] };
    
    const usedRounds = await pool.query(
      `SELECT spr.prompt, agp.topic 
       FROM speaking_practice_rounds spr
       LEFT JOIN ai_generated_prompts agp ON spr.prompt = agp.prompt_text
       WHERE spr.session_id = $1
       ORDER BY spr.round_number DESC
       LIMIT 10`,
      [sessionId]
    );
    
    const topics = usedRounds.rows.map(r => r.topic).filter(Boolean);
    const prompts = usedRounds.rows.map(r => r.prompt).filter(Boolean);
    
    return { topics, prompts };
  } catch (err) {
    console.error("Error getting used topics:", err);
    return { topics: [], prompts: [] };
  }
}

/**
 * Gọi Python continuous learning engine để phân tích và cá nhân hóa
 */
async function getPersonalizationContext(learnerId, sessionId) {
  try {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);
    
    const backendDir = getProjectRoot();
    const enginePath = path.join(backendDir, "ai_models", "aiespContinuousLearning.py");
    
    // Lấy dữ liệu session để phân tích
    const rounds = await pool.query(
      `SELECT score, prompt, time_taken, analysis 
       FROM speaking_practice_rounds 
       WHERE session_id = $1 AND score > 0
       ORDER BY round_number`,
      [sessionId]
    );
    
    if (rounds.rows.length === 0) {
      return null;
    }
    
    // Chuẩn bị data cho continuous learning
    const sessionData = {
      scores: rounds.rows.map(r => parseFloat(r.score) || 0),
      topics: rounds.rows.map(r => {
        try {
          const analysis = typeof r.analysis === 'string' ? JSON.parse(r.analysis) : r.analysis;
          return analysis?.topic || 'general';
        } catch {
          return 'general';
        }
      }),
      durations: rounds.rows.map(r => parseInt(r.time_taken) || 0),
      strengths: rounds.rows.map(r => {
        try {
          const analysis = typeof r.analysis === 'string' ? JSON.parse(r.analysis) : r.analysis;
          return analysis?.strengths || [];
        } catch {
          return [];
        }
      }),
      improvements: rounds.rows.map(r => {
        try {
          const analysis = typeof r.analysis === 'string' ? JSON.parse(r.analysis) : r.analysis;
          return analysis?.improvements || [];
        } catch {
          return [];
        }
      })
    };
    
    const sessionDataJson = JSON.stringify(sessionData).replace(/"/g, '\\"');
    const command = `python "${enginePath}" check speaking`;
    
    const { stdout } = await execAsync(command);
    const result = JSON.parse(stdout);
    
    // Lấy personalization context từ kết quả
    const personalization = result.personalization_context || {};
    const analysis = result.analysis || {};
    
    // Tạo personalization context từ analysis
    return {
      recommended_level: analysis.adaptive_strategy?.recommended_level || personalization.recommended_level,
      preferred_topics: analysis.strength_areas?.top_strengths || personalization.preferred_topics || [],
      focus_areas: analysis.improvement_areas?.priority_improvements || personalization.focus_areas || [],
      learning_style: analysis.adaptive_strategy?.learning_style || personalization.learning_style || 'balanced',
      pace: analysis.adaptive_strategy?.pace_adjustment || personalization.pace || 'normal'
    };
  } catch (err) {
    console.error("❌ Error getting personalization context:", err);
    return null;
  }
}

/**
 * Gọi Python comprehensive trainer để tạo training data thông minh
 */
async function getTrainingDataFromPython(trainingType, options = {}) {
  return new Promise(async (resolve) => {
    try {
      const { spawn } = await import("child_process");
      const backendDir = getProjectRoot();
      const trainerPath = path.join(backendDir, "ai_models", "comprehensiveAITrainer.py");
      
      // Tạo data object để gửi qua stdin
      let stdinData = { training_type: trainingType };
      
      if (trainingType === 'prompt_generator') {
        // Tạo topics từ TOPIC_THEMES constant (không còn bảng topics)
        const level = options.level || 2;
        const availableTopics = TOPIC_THEMES[level] || TOPIC_THEMES[2];
        const selectedTopics = availableTopics
          .sort(() => Math.random() - 0.5)
          .slice(0, 20)
          .map((title, index) => ({
            id: index + 1,
            title,
            description: `Topic: ${title}`,
            level
          }));
        
        const challenges = await pool.query(`SELECT id, title, description, level, type FROM challenges ORDER BY RANDOM() LIMIT 20`);
        
        const topicsJson = JSON.stringify(selectedTopics);
        const challengesJson = JSON.stringify(challenges.rows);
        
        // Lấy personalization context nếu có learnerId
        let personalizationContext = null;
        if (options.learnerId && options.sessionId) {
          personalizationContext = await getPersonalizationContext(options.learnerId, options.sessionId);
        }
        
        stdinData = {
          training_type: 'prompt_generator',
          level: options.level || 2,
          used_topics: options.usedTopics || [],
          used_prompts: options.usedPrompts || [],
          topics_json: topicsJson,
          challenges_json: challengesJson,
          learner_id: options.learnerId || null,
          personalization_context: personalizationContext
        };
      } else if (trainingType === 'conversation_ai') {
        stdinData = {
          training_type: 'conversation_ai',
          topic: options.topic || null,
          history: options.history || []
        };
      } else if (trainingType === 'quick_analysis') {
        stdinData = {
          training_type: 'quick_analysis',
          transcript: options.transcript || "",
          expected: options.expected || null,
          level: options.level || 2
        };
      }
      
      // Spawn Python process với stdin và set UTF-8 encoding
      const pythonProcess = spawn('python', [trainerPath], {
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
          console.error("❌ Python trainer error:", stderr);
          resolve(null); // Return null để fallback
          return;
        }
        
        try {
          // Extract JSON từ stdout (bỏ qua debug messages)
          const firstBrace = stdout.indexOf('{');
          const lastBrace = stdout.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            const jsonString = stdout.substring(firstBrace, lastBrace + 1);
            const result = JSON.parse(jsonString);
            resolve(result);
          } else {
            console.error("❌ No JSON found in Python output");
            console.error("Python stdout:", stdout);
            resolve(null);
          }
        } catch (err) {
          console.error("❌ Error parsing Python output:", err);
          console.error("Python stdout:", stdout);
          resolve(null); // Return null để fallback
        }
      });
      
      pythonProcess.on('error', (err) => {
        console.error("❌ Error spawning Python process:", err);
        resolve(null); // Return null để fallback
      });
      
      // Gửi data qua stdin
      pythonProcess.stdin.write(JSON.stringify(stdinData));
      pythonProcess.stdin.end();
      
    } catch (err) {
      console.error("❌ Error calling Python trainer:", err);
      resolve(null); // Return null để fallback
    }
  });
}

/**
 * Lấy điểm trung bình của học viên
 */
async function getLearnerAverageScore(learnerId) {
  if (!learnerId) return null;
  
  try {
    const result = await pool.query(
      `SELECT AVG(average_score) as avg_score
       FROM practice_history 
       WHERE learner_id = $1 
         AND practice_type = 'speaking_practice' 
         AND average_score IS NOT NULL`,
      [learnerId]
    );
    
    return result.rows[0]?.avg_score ? parseFloat(result.rows[0].avg_score) : null;
  } catch (err) {
    console.error("❌ Error getting learner average score:", err);
    return null;
  }
}

/**
 * Xác định độ khó của câu dựa trên điểm trung bình và round number
 * Phân bổ: dễ/trung bình/khó theo tỉ lệ phù hợp với trình độ
 */
function determineDifficultyForRound(averageScore, roundNumber) {
  // Nếu không có điểm, dùng tỉ lệ mặc định cho người mới
  if (!averageScore || averageScore === 0) {
    // Round 1-3: dễ, Round 4-7: trung bình, Round 8-10: khó
    if (roundNumber <= 3) return 'easy';
    if (roundNumber <= 7) return 'medium';
    return 'hard';
  }
  
  // Phân bổ dựa trên điểm trung bình
  let easyRatio, mediumRatio, hardRatio;
  
  if (averageScore < 50) {
    // Điểm < 50: 70% dễ, 25% trung bình, 5% khó
    easyRatio = 0.7;
    mediumRatio = 0.25;
    hardRatio = 0.05;
  } else if (averageScore < 70) {
    // Điểm 50-70: 40% dễ, 45% trung bình, 15% khó
    easyRatio = 0.4;
    mediumRatio = 0.45;
    hardRatio = 0.15;
  } else if (averageScore < 85) {
    // Điểm 70-85: 20% dễ, 50% trung bình, 30% khó
    easyRatio = 0.2;
    mediumRatio = 0.5;
    hardRatio = 0.3;
  } else {
    // Điểm > 85: 10% dễ, 40% trung bình, 50% khó
    easyRatio = 0.1;
    mediumRatio = 0.4;
    hardRatio = 0.5;
  }
  
  // Xác định độ khó cho round này dựa trên tỉ lệ
  const random = Math.random();
  if (random < easyRatio) {
    return 'easy';
  } else if (random < easyRatio + mediumRatio) {
    return 'medium';
  } else {
    return 'hard';
  }
}

/**
 * AI tự tạo prompt mới sử dụng Python trainer (đơn giản hóa)
 * Phân bổ câu dễ/trung bình/khó dựa trên điểm trung bình của học viên
 */
async function generateAIPrompt(level, roundNumber, learnerId = null, sessionId = null) {
  try {
    // Lấy điểm trung bình của học viên
    const averageScore = await getLearnerAverageScore(learnerId);
    
    // Xác định độ khó cho round này
    const difficulty = determineDifficultyForRound(averageScore, roundNumber);
    
    console.log(`📊 Learner average score: ${averageScore || 'N/A'}, Round ${roundNumber}, Difficulty: ${difficulty}`);
    
    // Lấy topics và prompts đã dùng trong session để tránh lặp lại
    const { topics: usedTopics, prompts: usedPrompts } = await getUsedTopicsInSession(sessionId, level);
    
    // Lấy personalization context từ continuous learning engine
    let personalizationContext = null;
    if (learnerId && sessionId) {
      personalizationContext = await getPersonalizationContext(learnerId, sessionId);
    }
    
    // Tạo topics từ TOPIC_THEMES constant (không còn bảng topics)
    const availableTopics = TOPIC_THEMES[level] || TOPIC_THEMES[2];
    const selectedTopics = availableTopics
      .sort(() => Math.random() - 0.5)
      .slice(0, 20)
      .map((title, index) => ({
        id: index + 1,
        title,
        description: `Topic: ${title}`,
        level
      }));
    
    const challenges = await pool.query(`SELECT id, title, description, level, type FROM challenges ORDER BY RANDOM() LIMIT 20`);
    
    // Gọi OpenRouter với training data từ Python qua trainedAIService
    // trainedAIService sẽ tự động gọi Python trainer với topics/challenges
    // QUAN TRỌNG: Độ khó được xác định dựa trên điểm trung bình của học viên
    const response = await aiServiceClient.callTrainedAI(
      'prompt_generator',
      {
        level,
        usedTopics,
        usedPrompts,
        learnerId,
        sessionId,
        topicsJson: JSON.stringify(selectedTopics),
        challengesJson: JSON.stringify(challenges.rows),
        personalizationContext,
        // Độ khó được xác định dựa trên điểm trung bình
        difficulty_requirement: difficulty === 'hard' ? 'very_hard' : difficulty === 'medium' ? 'medium' : 'easy',
        average_score: averageScore // Truyền điểm trung bình để AI có thể điều chỉnh
      },
      null, // Messages sẽ được tạo tự động với randomization
      { 
        model: 'openai/gpt-4o-mini', 
        temperature: difficulty === 'hard' ? 1.2 : difficulty === 'medium' ? 1.1 : 1.0,
        max_tokens: difficulty === 'hard' ? 300 : difficulty === 'medium' ? 250 : 200
      }
    );
    
    // Nếu response fail, fallback
    if (!response || !response.choices || !response.choices[0]) {
      console.warn("⚠️ AI response failed, using fallback");
      return await generateAIPromptFallback(level, usedTopics, usedPrompts, difficulty);
    }

    const content = response.choices?.[0]?.message?.content || "{}";
    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      // Nếu không phải JSON, extract
      const promptMatch = content.match(/"suggested_prompt":\s*"([^"]+)"/);
      const topicMatch = content.match(/"topic":\s*"([^"]+)"/);
      result = {
        topic: topicMatch ? topicMatch[1] : usedTopics[0] || "general",
        suggested_prompt: promptMatch ? promptMatch[1] : content.trim().replace(/^["']|["']$/g, ""),
        description: ""
      };
    }

    // Sử dụng suggested_prompt hoặc tạo prompt từ topic
    const finalPrompt = result.suggested_prompt || result.prompt || 
      `Let's talk about ${result.topic || 'something interesting'}.`;

    if (!finalPrompt) {
      throw new Error("Failed to generate prompt");
    }

    // Lưu prompt đã generate vào database
    const wordCount = finalPrompt.split(/\s+/).length;
    // Tính difficulty_score dựa trên độ khó thực tế
    const difficultyScore = difficulty === 'hard' ? 0.9 : difficulty === 'medium' ? 0.6 : 0.3;

    await pool.query(
      `INSERT INTO ai_generated_prompts 
       (level, prompt_text, topic, word_count, difficulty_score, usage_count)
       VALUES ($1, $2, $3, $4, $5, 1)
       ON CONFLICT (prompt_text) DO UPDATE 
       SET usage_count = ai_generated_prompts.usage_count + 1, 
           last_used_at = NOW(),
           updated_at = NOW()`,
      [
        level,
        finalPrompt,
        result.topic || "general",
        wordCount,
        difficultyScore
      ]
    );

    return finalPrompt;
  } catch (err) {
    console.error("❌ Error generating AI prompt:", err);
    
    // Fallback: Lấy lại difficulty và averageScore để tạo prompt phù hợp
    try {
      const averageScore = await getLearnerAverageScore(learnerId);
      const difficulty = determineDifficultyForRound(averageScore, roundNumber);
      
      // Fallback: Generate simple prompt with AI dựa trên difficulty
      const difficultyDesc = difficulty === 'hard' ? 'difficult (30-50 words, complex vocabulary)' : 
                             difficulty === 'medium' ? 'medium (15-30 words, moderate vocabulary)' : 
                             'easy (5-15 words, simple vocabulary)';
      
      const fallbackPrompt = `Generate a ${difficultyDesc} English speaking practice sentence. Return only the sentence, no explanation.`;
      
      const response = await aiServiceClient.callOpenRouter(
        [{ role: "user", content: fallbackPrompt }],
        { model: "openai/gpt-4o-mini", temperature: 1.0, max_tokens: 100 }
      );
      const content = response.choices?.[0]?.message?.content || "";
      return content.trim().replace(/^["']|["']$/g, "") || 
        (difficulty === 'hard' ? "The advancement of technology has significantly transformed how we learn and interact with information in the modern world." :
         difficulty === 'medium' ? "I enjoy learning English because it helps me communicate with people from different countries." :
         "Hello, my name is Anna. I am from Vietnam.");
    } catch (fallbackErr) {
      // Ultimate fallback: Tạo prompt ngẫu nhiên từ topics
      try {
        const averageScore = await getLearnerAverageScore(learnerId);
        const difficulty = determineDifficultyForRound(averageScore, roundNumber);
        const { topics: usedTopics } = await getUsedTopicsInSession(sessionId, level);
        
        // Tạo prompt ngẫu nhiên từ topics
        return await generateAIPromptFallback(level, usedTopics, [], difficulty);
      } catch (fallbackErr) {
        console.error("❌ Ultimate fallback failed:", fallbackErr);
        // Last resort: prompt đơn giản nhất
        const lastResort = {
          easy: "Hello, my name is Anna. I am from Vietnam.",
          medium: "I enjoy learning English because it helps me communicate with people from different countries.",
          hard: "The advancement of technology has significantly transformed how we learn and interact with information in the modern world."
        };
        return lastResort.easy;
      }
    }
  }
}

/**
 * Fallback method nếu Python trainer không hoạt động (đơn giản hóa)
 */
async function generateAIPromptFallback(level, usedTopics = [], usedPrompts = [], difficulty = 'easy') {
  // Đơn giản hóa: chỉ tạo prompt ngắn gọn với AI
  const availableTopics = TOPIC_THEMES[level] || TOPIC_THEMES[1];
  const unusedTopics = availableTopics.filter(t => !usedTopics.includes(t));
  const selectedTopics = unusedTopics.length > 0 
    ? unusedTopics.sort(() => Math.random() - 0.5).slice(0, 3)
    : availableTopics.sort(() => Math.random() - 0.5).slice(0, 3);
  
  // Xác định độ dài dựa trên difficulty thay vì level
  const lengthDesc = difficulty === 'hard' ? '30-50' : difficulty === 'medium' ? '15-30' : '5-15';
  
  const simplePrompt = `Generate a NEW speaking practice sentence for ${difficulty} difficulty English learners.
- Length: ${lengthDesc} words
- Topic: ${selectedTopics.join(' or ')}
- Avoid: ${usedPrompts.slice(0, 3).join(', ') || 'none'}
- Natural, conversational English

Return JSON: {"prompt": "sentence", "topic": "topic name", "word_count": number}`;

  try {
    const response = await aiServiceClient.callOpenRouter(
      [{ role: "user", content: simplePrompt }],
      { model: "openai/gpt-4o-mini", temperature: 0.95, max_tokens: 200 }
    );

    const content = response.choices?.[0]?.message?.content || "{}";
    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      result = {
        prompt: content.trim().replace(/^["']|["']$/g, ""),
        topic: selectedTopics[0] || "general",
        word_count: content.split(/\s+/).length
      };
    }

    // Nếu có prompt hợp lệ, trả về
    if (result.prompt && result.prompt.length > 10) {
      return result.prompt;
    }
  } catch (err) {
    console.warn("⚠️ Fallback AI call failed, using topic-based prompts:", err.message);
  }

  // Nếu vẫn fail, tạo prompt ngẫu nhiên từ topics thay vì dùng prompt cố định
  const randomTopic = selectedTopics[Math.floor(Math.random() * selectedTopics.length)] || selectedTopics[0] || "general";
  
  // Tạo prompt đa dạng dựa trên topic và difficulty
  const topicBasedPrompts = {
    easy: [
      `Hello, my name is ${randomTopic === 'Self-introduction' ? 'Anna' : 'John'}. I am from Vietnam.`,
      `I like ${randomTopic.toLowerCase()}. It is fun.`,
      `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}. I feel happy.`,
      `My favorite ${randomTopic.toLowerCase()} is ${randomTopic === 'Colors' ? 'blue' : randomTopic === 'Food' ? 'pizza' : 'good'}.`,
      `I have a ${randomTopic === 'Pets' ? 'dog' : randomTopic === 'Family' ? 'sister' : 'friend'}.`
    ],
    medium: [
      `I enjoy ${randomTopic.toLowerCase()} because it helps me learn new things and meet interesting people.`,
      `Last weekend, I went to a ${randomTopic.toLowerCase()} event and had a wonderful time with my friends.`,
      `In my opinion, ${randomTopic.toLowerCase()} is very important for personal development and growth.`,
      `I have been interested in ${randomTopic.toLowerCase()} since I was young, and it has become my passion.`,
      `When I think about ${randomTopic.toLowerCase()}, I feel excited and motivated to explore more.`
    ],
    hard: [
      `The advancement of ${randomTopic.toLowerCase()} has significantly transformed how we learn and interact with information in the modern world.`,
      `In today's globalized society, understanding ${randomTopic.toLowerCase()} is crucial for effective communication and cultural exchange.`,
      `Research in ${randomTopic.toLowerCase()} has revealed fascinating insights into human behavior and cognitive processes.`,
      `The intersection of ${randomTopic.toLowerCase()} and technology has created unprecedented opportunities for innovation and discovery.`,
      `Critical analysis of ${randomTopic.toLowerCase()} requires a deep understanding of historical context and contemporary perspectives.`
    ]
  };
  
  const prompts = topicBasedPrompts[difficulty] || topicBasedPrompts.easy;
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  
  return randomPrompt;
}

/**
 * Lấy prompt cho vòng nói (ưu tiên AI-generated, đa dạng hóa)
 * QUAN TRỌNG: Luôn tạo prompt MỚI, không reuse prompts đã dùng trong session
 */
export async function getPromptForRound(level, roundNumber, learnerId = null, sessionId = null) {
  try {
    console.log(`🎯 getPromptForRound called: level=${level}, round=${roundNumber}, sessionId=${sessionId}`);
    
    // Lấy topics và prompts đã dùng trong session
    const { topics: usedTopics, prompts: usedPrompts } = await getUsedTopicsInSession(sessionId, level);
    console.log(`📋 Used in session: ${usedPrompts.length} prompts, ${usedTopics.length} topics`);
    
    // QUAN TRỌNG: Luôn generate prompt MỚI thay vì lấy từ database
    // Điều này đảm bảo mỗi round có prompt khác nhau
    console.log(`🔄 Generating NEW prompt for round ${roundNumber}...`);
    const newPrompt = await generateAIPrompt(level, roundNumber, learnerId, sessionId);
    
    // Kiểm tra xem prompt mới có trùng với prompts đã dùng không
    if (usedPrompts.includes(newPrompt)) {
      console.warn(`⚠️ Generated prompt matches used prompt, generating again...`);
      // Generate lại nếu trùng
      const retryPrompt = await generateAIPrompt(level, roundNumber, learnerId, sessionId);
      return retryPrompt;
    }
    
    console.log(`✅ Generated new prompt: "${newPrompt.substring(0, 50)}..."`);
    return newPrompt;
    
    /* OLD LOGIC - Commented out để luôn generate mới
    // Thử lấy từ AI-generated prompts với ưu tiên topics chưa dùng và prompts chưa dùng
    let aiPrompt;
    if (usedPrompts.length > 0) {
      // Nếu có prompts đã dùng, loại bỏ chúng
      aiPrompt = await pool.query(
        `SELECT prompt_text, topic FROM ai_generated_prompts 
         WHERE level = $1 
         AND prompt_text NOT IN (${usedPrompts.map((_, i) => `$${i + 2}`).join(", ")})
         ${usedTopics.length > 0 
           ? `AND (topic NOT IN (${usedTopics.map((_, i) => `$${usedPrompts.length + i + 2}`).join(", ")}) OR topic IS NULL)`
           : ""}
         ORDER BY 
           ${usedTopics.length > 0 
             ? `CASE WHEN topic NOT IN (${usedTopics.map((_, i) => `$${usedPrompts.length + i + 2}`).join(", ")}) THEN 0 ELSE 1 END, `
             : ""}
           usage_count ASC, 
           RANDOM()
         LIMIT 1`,
        [level, ...usedPrompts, ...usedTopics]
      );
    } else if (usedTopics.length > 0) {
      // Chỉ có topics đã dùng
      aiPrompt = await pool.query(
        `SELECT prompt_text, topic FROM ai_generated_prompts 
         WHERE level = $1 
         AND (topic NOT IN (${usedTopics.map((_, i) => `$${i + 2}`).join(", ")}) OR topic IS NULL)
         ORDER BY 
           CASE WHEN topic NOT IN (${usedTopics.map((_, i) => `$${i + 2}`).join(", ")}) THEN 0 ELSE 1 END,
           usage_count ASC, 
           RANDOM()
         LIMIT 1`,
        [level, ...usedTopics]
      );
    } else {
      // Chưa có gì được dùng
      aiPrompt = await pool.query(
        `SELECT prompt_text, topic FROM ai_generated_prompts 
         WHERE level = $1 
         ORDER BY usage_count ASC, RANDOM()
         LIMIT 1`,
        [level]
      );
    }

    // Nếu không tìm thấy prompt với topic mới, tìm bất kỳ
    let selectedPrompt = aiPrompt.rows[0];
    if (!selectedPrompt) {
      const anyPrompt = await pool.query(
        `SELECT prompt_text, topic FROM ai_generated_prompts 
         WHERE level = $1 
         ORDER BY usage_count ASC, RANDOM() 
         LIMIT 1`,
        [level]
      );
      selectedPrompt = anyPrompt.rows[0];
    }

    if (selectedPrompt) {
      // Update usage
      await pool.query(
        `UPDATE ai_generated_prompts 
         SET usage_count = usage_count + 1, last_used_at = NOW()
         WHERE prompt_text = $1`,
        [selectedPrompt.prompt_text]
      );
      return selectedPrompt.prompt_text;
    }

    // Nếu chưa có, generate mới với đa dạng hóa
    return await generateAIPrompt(level, roundNumber, learnerId, sessionId);
    */
  } catch (err) {
    console.error("❌ Error getting prompt:", err);
    // Fallback cuối cùng: tạo prompt đơn giản với AI trực tiếp
    try {
      const fallbackPrompt = `Generate a simple English speaking practice sentence for level ${level} learners. Return only the sentence, no explanation.`;
      const response = await aiServiceClient.callOpenRouter(
        [{ role: "user", content: fallbackPrompt }],
        { model: "openai/gpt-4o-mini", temperature: 1.0, max_tokens: 100 }
      );
      const content = response.choices?.[0]?.message?.content || "";
      return content.trim().replace(/^["']|["']$/g, "") || `Let's practice speaking English. This is level ${level}.`;
    } catch (fallbackErr) {
      console.error("❌ Fallback prompt generation failed:", fallbackErr);
      // Ultimate fallback - simple prompts
      const ultimateFallback = {
        1: "Hello, my name is Anna. I am from Vietnam.",
        2: "I enjoy learning English because it helps me communicate with people from different countries.",
        3: "The advancement of technology has significantly transformed how we learn and interact with information in the modern world."
      };
      return ultimateFallback[level] || ultimateFallback[1];
    }
  }
}

/**
 * Lấy time limit cho level và prompt
 */
export function getTimeLimit(level, prompt = "") {
  return calculateTimeLimit(prompt, level);
}

/**
 * Lưu vòng nói (lưu ngay, xử lý ở background)
 */
export async function saveRound(sessionId, roundNumber, audioUrl, timeTaken, promptText = null, webSpeechTranscript = null, webSpeechHighlights = null) {
  const session = await pool.query(
    `SELECT level, learner_id FROM speaking_practice_sessions WHERE id = $1`,
    [sessionId]
  );

  if (!session.rows[0]) {
    throw new Error("Session not found");
  }

  const level = session.rows[0].level;
  const learnerId = session.rows[0].learner_id;
  
  // QUAN TRỌNG: Nếu promptText được truyền từ frontend, dùng nó. Nếu không, fetch mới
  let prompt = promptText;
  if (!prompt) {
    // Fetch prompt mới với sessionId để track used prompts
    prompt = await getPromptForRound(level, roundNumber, learnerId, sessionId);
  }

  // Lưu vào database ngay (chưa có transcript và analysis)
  const result = await pool.query(
    `INSERT INTO speaking_practice_rounds 
     (session_id, round_number, prompt, audio_url, transcript, time_taken, score, analysis, web_speech_transcript, web_speech_highlights)
     VALUES ($1, $2, $3, $4, NULL, $5, 0, NULL, $6, $7)
     RETURNING *`,
    [
      sessionId,
      roundNumber,
      prompt,
      audioUrl,
      timeTaken,
      webSpeechTranscript,
      webSpeechHighlights ? JSON.stringify(webSpeechHighlights) : null
    ]
  );

  const roundId = result.rows[0].id;

  // QUAN TRỌNG: Phân tích ngay sau mỗi vòng (không đợi đến cuối)
  // Xử lý ngay trong background để kết quả sẵn sàng khi đến summary
  try {
    const { enqueue } = await import("../utils/queue.js");
    // Enqueue với priority cao để xử lý nhanh
    console.log("📤 Enqueueing speaking round with Web Speech data:", {
      roundId,
      webSpeechTranscript: !!webSpeechTranscript,
      webSpeechHighlights: webSpeechHighlights ? webSpeechHighlights.length : 0
    });
    await enqueue("processSpeakingRound", {
      roundId,
      sessionId,
      audioUrl,
      prompt,
      level,
      time_taken: timeTaken,
      webSpeechTranscript,
      webSpeechHighlights
    }, {
      priority: 1, // Priority cao để xử lý ngay
      attempts: 2 // Retry nếu fail
    });
  } catch (err) {
    console.error("❌ Error enqueueing processing job:", err);
    // Nếu không có queue, xử lý ngay (fallback) - không đợi
    processRoundInBackground(roundId, audioUrl, prompt, level, sessionId).catch(err => {
      console.error("❌ Background processing error:", err);
    });
  }

  return result.rows[0];
}

/**
 * Xử lý round ở background (transcription + AI analysis)
 * QUAN TRỌNG: Phân tích ngay sau mỗi vòng để kết quả sẵn sàng khi đến summary
 */
async function processRoundInBackground(roundId, audioUrl, prompt, level, sessionId = null) {
  const localPath = audioUrl.startsWith("/uploads/")
    ? path.join(getProjectRoot(), audioUrl)
    : audioUrl;

  let transcript = null;
  let transcriptionError = null;
  if (fs.existsSync(localPath)) {
    try {
      const { json: transcriptJson } = await runWhisperX(localPath, {
        model: "base"
        // computeType không cần chỉ định - tự động dùng GPU với float16
      });
      transcript = transcriptJson;
    } catch (err) {
      console.error("❌ Transcription error:", err);
      const errMsg = err.message || String(err);
      
      // Kiểm tra nếu là lỗi torchvision compatibility
      if (errMsg.includes("torchvision") || errMsg.includes("nms") || errMsg.includes("extension")) {
        transcriptionError = `Lỗi tương thích torchvision/torch. Vui lòng chạy script fix: python backend/scripts/fix_torchvision.py. Chi tiết: ${errMsg}`;
        console.error("💡 To fix torchvision error, run: python backend/scripts/fix_torchvision.py");
      } else {
        transcriptionError = errMsg;
      }
      // Không return ngay - tiếp tục để cập nhật database với lỗi
    }
  }

  // Analyze với AI
  let analysis = null;
  let score = 0;
  let feedback = "";
  let errors = [];
  let correctedText = "";

  // Nếu có lỗi transcription, cập nhật database với thông báo lỗi
  if (transcriptionError) {
    feedback = `Lỗi phân tích âm thanh: ${transcriptionError}. Vui lòng thử lại hoặc kiểm tra file audio.`;
    score = 0;
    analysis = {
      score: 0,
      feedback: feedback,
      missing_words: prompt.toLowerCase().split(/\s+/).filter(w => w.length > 0),
      errors: [{ type: "transcription_error", message: transcriptionError }],
      corrected_text: prompt
    };
  } else if (transcript) {
    const transcriptText =
      transcript.text ||
      (transcript.segments || [])
        .map((s) => s.text || "")
        .join(" ");
    
    // Kiểm tra nếu transcriptText rỗng
    if (!transcriptText || !transcriptText.trim()) {
      console.warn(`⚠️ Empty transcript text for round ${roundId}`);
      score = 0;
      feedback = "Không thể nhận diện được lời nói. Vui lòng nói to và rõ ràng hơn.";
      analysis = {
        score: 0,
        feedback: feedback,
        missing_words: prompt.toLowerCase().split(/\s+/).filter(w => w.length > 0),
        errors: [],
        corrected_text: prompt
      };
    } else {

    try {
      // Lấy learner_id từ session để lưu vào quick_evaluations
      const sessionInfo = await pool.query(
        `SELECT learner_id FROM speaking_practice_sessions WHERE id = $1`,
        [sessionId]
      );
      const learnerId = sessionInfo.rows[0]?.learner_id;
      
      console.log(`📊 Analyzing: transcript="${transcriptText.substring(0, 50)}...", prompt="${prompt.substring(0, 50)}..."`);
      analysis = await analyzePronunciation(transcriptText, prompt, level, roundId, sessionId, learnerId);
      score = Math.round(analysis.score || 0); // Làm tròn điểm
      feedback = analysis.feedback || "";
      errors = analysis.errors || [];
      correctedText = analysis.corrected_text || "";
      
      console.log(`✅ Analysis result for round ${roundId}: score=${score}, missing_words=${analysis?.missing_words?.length || 0}`);
      
    } catch (err) {
      console.error("❌ AI analysis error:", err);
      console.error("❌ Error stack:", err.stack);
      feedback = "Không thể phân tích. Vui lòng thử lại.";
      score = 0; // Nếu lỗi, score = 0
      analysis = {
        score: 0,
        feedback: feedback,
        missing_words: prompt.toLowerCase().split(/\s+/).filter(w => w.length > 0),
        errors: [],
        corrected_text: prompt
      };
    }
    }
  } else {
    // Nếu không có transcript (không nói gì), score = 0
    score = 0;
    feedback = "Bạn chưa nói gì. Hãy thử lại và nói to, rõ ràng.";
    analysis = {
      score: 0,
      feedback: feedback,
      missing_words: prompt.toLowerCase().split(/\s+/).filter(w => w.length > 0),
      errors: [],
      corrected_text: prompt
    };
  }

  // Build word_analysis từ transcript (nếu có)
  let wordAnalysis = [];
  if (transcript && transcript.words && Array.isArray(transcript.words)) {
    wordAnalysis = transcript.words.map((w, idx) => ({
      word: w.text ?? w.word ?? "",
      start: typeof w.start === "number" ? w.start : null,
      end: typeof w.end === "number" ? w.end : null,
      confidence: typeof w.score === "number" ? w.score : w.confidence ?? null,
      wordIndex: idx
    }));
  }
  
  // Cập nhật database với kết quả (bao gồm missing_words)
  // Lưu ý: word_analysis không có trong schema, chỉ lưu trong analysis
  try {
    await pool.query(
      `UPDATE speaking_practice_rounds 
       SET transcript = $1, score = $2, analysis = $3
       WHERE id = $4`,
      [
        transcript ? JSON.stringify(transcript) : null,
        score,
        JSON.stringify({
          feedback,
          errors,
          corrected_text: correctedText || prompt,
          score,
          missing_words: analysis?.missing_words || [],
          word_analysis: wordAnalysis.length > 0 ? wordAnalysis : [],
          transcription_error: transcriptionError || null
        }),
        roundId
      ]
    );
    console.log(`✅ Updated round ${roundId} with score ${score}`);
  } catch (dbErr) {
    console.error(`❌ Database update error for round ${roundId}:`, dbErr);
    // Không throw - đã log lỗi
  }
}

/**
 * Phân tích phát âm với AI sử dụng Python trainer (quick analysis)
 */
async function analyzePronunciation(transcript, expectedText, level, roundId = null, sessionId = null, learnerId = null) {
  console.log(`🎤 BACKEND analyzePronunciation called:`);
  console.log(`   Transcript: "${transcript}"`);
  console.log(`   Expected: "${expectedText}"`);
  console.log(`   Level: ${level}`);
  console.log(`   Round ID: ${roundId}`);
  
  // QUAN TRỌNG: Kiểm tra nếu không nói gì (transcript rỗng hoặc không có từ nào) thì score = 0
  if (!transcript || !transcript.trim()) {
    return {
      score: 0,
      feedback: "Bạn chưa nói gì. Hãy thử lại và nói to, rõ ràng.",
      errors: [],
      corrected_text: expectedText,
      missing_words: expectedText.toLowerCase().split(/\s+/).filter(w => w.length > 0),
      strengths: [],
      improvements: ["Hãy nói to và rõ ràng hơn"]
    };
  }
  
  // Kiểm tra xem có từ nào trong transcript match với expected text không
  const transcriptWords = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const expectedWords = expectedText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  
  console.log(`🔍 Word matching: expected="${expectedText.substring(0, 60)}..." (${expectedWords.length} words)`);
  console.log(`🔍 Transcript: "${transcript.substring(0, 60)}..." (${transcriptWords.length} words)`);
  
  // Xử lý từ ghép phổ biến (everyday -> every day, etc.)
  const compoundWords = {
    'everyday': ['every', 'day'],
    'every day': ['every', 'day'],
    'yourself': ['your', 'self'],
    'myself': ['my', 'self'],
    'himself': ['him', 'self'],
    'herself': ['her', 'self'],
    'itself': ['it', 'self'],
    'ourselves': ['our', 'selves'],
    'yourselves': ['your', 'selves'],
    'themselves': ['them', 'selves']
  };
  
  // Nếu không có từ nào match, score = 0
  // Logic: Một từ được coi là "đúng" nếu:
  // 1. Exact match (sau khi loại bỏ dấu câu)
  // 2. Transcript word chứa expected word (cho phép nói thêm)
  // 3. Expected word chứa transcript word (cho phép nói ngắn gọn)
  // 4. Compound word matching (everyday -> every + day)
  const matchedWords = expectedWords.filter(ew => {
    const cleanExpected = ew.replace(/[.,!?;:]/g, "").trim();
    if (!cleanExpected) return false;
    
    return transcriptWords.some(tw => {
      const cleanTranscript = tw.replace(/[.,!?;:]/g, "").trim();
      if (!cleanTranscript) return false;
      
      // Exact match
      if (cleanTranscript === cleanExpected) return true;
      
      // Partial match: transcript chứa expected (cho phép nói thêm)
      if (cleanTranscript.length >= cleanExpected.length && cleanTranscript.includes(cleanExpected)) return true;
      
      // Partial match: expected chứa transcript (cho phép nói ngắn gọn, nhưng phải >= 3 ký tự)
      if (cleanExpected.length >= cleanTranscript.length && cleanExpected.includes(cleanTranscript) && cleanTranscript.length >= 3) return true;
      
      // Compound word matching: kiểm tra xem transcript word có phải là từ ghép không
      if (compoundWords[cleanTranscript]) {
        return compoundWords[cleanTranscript].includes(cleanExpected);
      }
      
      // Compound word matching: kiểm tra xem expected word có phải là từ ghép không
      if (compoundWords[cleanExpected]) {
        return compoundWords[cleanExpected].includes(cleanTranscript);
      }
      
      return false;
    });
  });
  
  console.log(`✅ Matched words: ${matchedWords.length}/${expectedWords.length} = ${Math.round((matchedWords.length / expectedWords.length) * 100)}%`);
  if (matchedWords.length < expectedWords.length) {
    const missing = expectedWords.filter(ew => !matchedWords.includes(ew));
    console.log(`⚠️ Missing words:`, missing.slice(0, 10));
  }
  
  // Nếu không match từ nào, score = 0
  if (matchedWords.length === 0) {
    return {
      score: 0,
      feedback: "Bạn chưa nói đúng từ nào. Hãy nghe lại và nói theo prompt.",
      errors: [],
      corrected_text: expectedText,
      missing_words: expectedWords,
      strengths: [],
      improvements: ["Hãy nghe kỹ prompt và nói theo đúng nội dung"]
    };
  }
  
  // Tính score dựa trên tỷ lệ từ match (0-10 điểm)
  const matchRatio = matchedWords.length / expectedWords.length;
  const score = Math.round(matchRatio * 10); // 0-10 điểm
  
  console.log(`📊 Score calculation: ${matchedWords.length}/${expectedWords.length} = ${matchRatio.toFixed(2)} → ${score}/10`);
  
  // Tạo feedback dựa trên score
  let feedback = "";
  if (score >= 9) {
    feedback = "Xuất sắc! Bạn đã nói rất chính xác và rõ ràng.";
  } else if (score >= 7) {
    feedback = "Tốt! Bạn đã nói đúng hầu hết nội dung. Tiếp tục luyện tập!";
  } else if (score >= 5) {
    feedback = "Khá! Bạn đã nói được một phần nội dung. Hãy cố gắng nói rõ ràng hơn.";
  } else if (score >= 3) {
    feedback = "Cần cải thiện. Hãy nghe kỹ prompt và nói theo đúng nội dung.";
  } else {
    feedback = "Bạn chưa nói đúng nhiều từ. Hãy thử lại và nói to, rõ ràng.";
  }
  
  return {
    score: score,
    feedback: feedback,
    errors: [],
    corrected_text: expectedText,
    missing_words: expectedWords.filter(ew => !matchedWords.includes(ew)),
    strengths: score >= 5 ? ["Nỗ lực tốt", "Tiếp tục luyện tập"] : [],
    improvements: score < 5 ? ["Hãy nói to và rõ ràng hơn", "Nghe kỹ prompt trước khi nói"] : ["Tiếp tục cải thiện phát âm"]
  };
}

/**
 * Fallback cho pronunciation analysis
 */
async function analyzePronunciationFallback(transcript, expectedText, level) {
  // Kiểm tra nếu không nói gì
  if (!transcript || !transcript.trim()) {
    return {
      score: 0,
      feedback: "Bạn chưa nói gì. Hãy thử lại và nói to, rõ ràng.",
      errors: [],
      corrected_text: expectedText,
      missing_words: expectedText.toLowerCase().split(/\s+/).filter(w => w.length > 0),
      strengths: [],
      improvements: ["Hãy nói to và rõ ràng hơn"]
    };
  }
  
  // Tính missing_words và matchedWords với logic nhất quán
  const transcriptWords = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const expectedWords = expectedText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  
  const matchedWords = expectedWords.filter(ew => {
    const cleanExpected = ew.replace(/[.,!?;:]/g, "").trim();
    if (!cleanExpected) return false;
    
    return transcriptWords.some(tw => {
      const cleanTranscript = tw.replace(/[.,!?;:]/g, "").trim();
      if (!cleanTranscript) return false;
      
      // Exact match
      if (cleanTranscript === cleanExpected) return true;
      
      // Partial match: transcript chứa expected
      if (cleanTranscript.length >= cleanExpected.length && cleanTranscript.includes(cleanExpected)) return true;
      
      // Partial match: expected chứa transcript (>= 3 ký tự)
      if (cleanExpected.length >= cleanTranscript.length && cleanExpected.includes(cleanTranscript) && cleanTranscript.length >= 3) return true;
      
      return false;
    });
  });
  
  // Nếu không match từ nào, score = 0
  if (matchedWords.length === 0) {
    return {
      score: 0,
      feedback: "Bạn chưa nói đúng từ nào. Hãy nghe lại và nói theo prompt.",
      errors: [],
      corrected_text: expectedText,
      missing_words: expectedWords,
      strengths: [],
      improvements: ["Hãy nghe kỹ prompt và nói theo đúng nội dung"]
    };
  }
  
  const prompt = `You are an expert English speaking evaluator. Analyze the following speaking practice:

Expected text: "${expectedText}"
Spoken transcript: "${transcript}"

Provide DETAILED analysis with:
1. Score (0-10): Overall performance
2. Feedback (2-4 sentences): Specific, encouraging, actionable feedback with examples
3. Strengths (2-3 points): Specific examples of what worked well (e.g., "You pronounced 'X' clearly")
4. Improvements (2-3 points): Specific, achievable goals with actionable steps (e.g., "Work on 'th' sound in 'think' - place tongue between teeth")

Return JSON ONLY:
{
  "score": <0-10>,
  "feedback": "<detailed feedback with specific examples>",
  "strengths": ["<specific strength1>", "<strength2>"],
  "improvements": ["<specific improvement1 with steps>", "<improvement2>"]
}`;

  try {
    const response = await aiServiceClient.callOpenRouter(
      [{ role: "user", content: prompt }],
      { 
        model: "openai/gpt-4o", // Nâng cấp lên GPT-4o cho fallback analysis
        temperature: 0.7, // Tăng temperature để có phản hồi đa dạng hơn
        max_tokens: 500 // Tăng tokens để có phản hồi chi tiết hơn
      }
    );

    const content = response.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    
    // Tính missing_words (các từ KHÔNG được nói đúng) - dùng cùng logic với matchedWords
    const missingWords = expectedWords.filter(ew => {
      const cleanExpected = ew.replace(/[.,!?;:]/g, "").trim();
      if (!cleanExpected) return false;
      
      return !transcriptWords.some(tw => {
        const cleanTranscript = tw.replace(/[.,!?;:]/g, "").trim();
        if (!cleanTranscript) return false;
        
        // Exact match
        if (cleanTranscript === cleanExpected) return true;
        
        // Partial match: transcript chứa expected
        if (cleanTranscript.length >= cleanExpected.length && cleanTranscript.includes(cleanExpected)) return true;
        
        // Partial match: expected chứa transcript (>= 3 ký tự)
        if (cleanExpected.length >= cleanTranscript.length && cleanExpected.includes(cleanTranscript) && cleanTranscript.length >= 3) return true;
        
        return false;
      });
    });
    
    // Tính điểm dựa trên số từ đúng / tổng số từ (thang 100)
    const accuracyRatio = matchedWords.length / expectedWords.length;
    const baseScore = accuracyRatio * 100; // Điểm cơ bản dựa trên số từ đúng
    
    console.log(`📊 Fallback score calculation: matched=${matchedWords.length}, total=${expectedWords.length}, ratio=${accuracyRatio.toFixed(2)}, baseScore=${baseScore.toFixed(1)}`);
    
    // Nếu AI trả về score (thang 10), convert sang 100 và điều chỉnh
    const aiScore = parsed.score ? (parsed.score * 10) : null;
    
    // Điểm cuối cùng: ưu tiên baseScore (dựa trên số từ đúng), nhưng có thể điều chỉnh nhẹ bởi AI
    const finalScore = aiScore ? Math.min(Math.max(aiScore, baseScore * 0.7), baseScore) : baseScore;
    
    console.log(`📊 Fallback final score: aiScore=${aiScore}, finalScore=${finalScore.toFixed(1)}, missing_words=${missingWords.length}`);
    
    return {
      score: Math.round(finalScore), // Làm tròn điểm (thang 100)
      feedback: parsed.feedback || "Good effort!",
      errors: [],
      corrected_text: expectedText,
      missing_words: missingWords, // Các từ sai để highlight
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || []
    };
  } catch (err) {
    // Fallback: tính điểm dựa trên tỷ lệ từ đúng (thang 100)
    const accuracyRatio = matchedWords.length / expectedWords.length;
    const fallbackScore = accuracyRatio * 100; // Thang 100, không phải 10
    
    // Tính missing_words với logic nhất quán
    const missingWords = expectedWords.filter(ew => {
      const cleanExpected = ew.replace(/[.,!?;:]/g, "").trim();
      if (!cleanExpected) return false;
      
      return !transcriptWords.some(tw => {
        const cleanTranscript = tw.replace(/[.,!?;:]/g, "").trim();
        if (!cleanTranscript) return false;
        
        // Exact match
        if (cleanTranscript === cleanExpected) return true;
        
        // Partial match: transcript chứa expected
        if (cleanTranscript.length >= cleanExpected.length && cleanTranscript.includes(cleanExpected)) return true;
        
        // Partial match: expected chứa transcript (>= 3 ký tự)
        if (cleanExpected.length >= cleanTranscript.length && cleanExpected.includes(cleanTranscript) && cleanTranscript.length >= 3) return true;
        
        return false;
      });
    });
    
    console.log(`📊 Final fallback: score=${fallbackScore.toFixed(1)}, missing_words=${missingWords.length}`);
    
    return {
      score: Math.round(fallbackScore), // Thang 100 - làm tròn điểm
      feedback: `Bạn đã nói đúng ${matchedWords.length}/${expectedWords.length} từ (${Math.round(accuracyRatio * 100)}%). ${missingWords.length > 0 ? `Cần cải thiện các từ: ${missingWords.slice(0, 5).join(", ")}` : "Tuyệt vời!"}`,
      errors: [],
      corrected_text: expectedText,
      missing_words: missingWords, // Các từ sai để highlight
      strengths: matchedWords.length > 0 ? [`Đã nói đúng ${matchedWords.length}/${expectedWords.length} từ`] : [],
      improvements: missingWords.length > 0 ? [`Cần cải thiện các từ: ${missingWords.slice(0, 5).join(", ")}`] : ["Tuyệt vời! Bạn đã nói đúng tất cả các từ."]
    };
  }
}

/**
 * Phân tích tất cả các vòng và tạo tổng kết
 */
export async function analyzeAllRoundsAndSummary(sessionId) {
  // Lấy tất cả các rounds chưa được phân tích
  const rounds = await pool.query(
    `SELECT * FROM speaking_practice_rounds 
     WHERE session_id = $1 
     ORDER BY round_number`,
    [sessionId]
  );

  if (rounds.rows.length === 0) {
    throw new Error("No rounds found");
  }

  // Lấy level từ session
  const session = await pool.query(
    `SELECT level FROM speaking_practice_sessions WHERE id = $1`,
    [sessionId]
  );
  const level = session.rows[0]?.level || 1;

  // Phân tích từng round chưa được phân tích (xử lý song song để nhanh hơn)
  const roundsToProcess = rounds.rows.filter(r => {
    if (r.analysis && r.score > 0) return false;
    if (!r.audio_url) return false;
    const localPath = r.audio_url.startsWith("/uploads/")
      ? path.join(process.cwd(), r.audio_url)
      : r.audio_url;
    return fs.existsSync(localPath);
  });

  // Xử lý song song tối đa 3 rounds cùng lúc để tăng tốc
  const processRound = async (round) => {
    const audioUrl = round.audio_url;
    const localPath = audioUrl.startsWith("/uploads/")
      ? path.join(getProjectRoot(), audioUrl)
      : audioUrl;

    // Transcribe
    let transcript = null;
    try {
      const { json: transcriptJson } = await runWhisperX(localPath, {
        model: "base"
        // computeType không cần chỉ định - tự động dùng GPU với float16
      });
      transcript = transcriptJson;
    } catch (err) {
      console.error(`❌ Transcription error for round ${round.round_number}:`, err);
      return;
    }

    // Analyze với AI
    let analysis = null;
    let score = 0;
    let feedback = "";
    let errors = [];
    let correctedText = "";

    if (transcript) {
      const transcriptText =
        transcript.text ||
        (transcript.segments || [])
          .map((s) => s.text || "")
          .join(" ");

      try {
        // Lấy learner_id từ session
        const sessionInfo = await pool.query(
          `SELECT learner_id FROM speaking_practice_sessions WHERE id = $1`,
          [sessionId]
        );
        const learnerId = sessionInfo.rows[0]?.learner_id;
        
        // Sử dụng quick analysis với Python trainer
        analysis = await analyzePronunciation(
          transcriptText, 
          round.prompt, 
          level,
          round.id, // roundId
          sessionId,
          learnerId
        );
        score = Math.round(analysis.score || 0); // Làm tròn điểm
        feedback = analysis.feedback || "";
        errors = analysis.errors || [];
        correctedText = analysis.corrected_text || "";
      } catch (err) {
        console.error(`❌ AI analysis error for round ${round.round_number}:`, err);
        feedback = "Không thể phân tích. Vui lòng thử lại.";
      }
    }

    // Build word_analysis từ transcript (nếu có)
    let wordAnalysis = [];
    if (transcript && transcript.words && Array.isArray(transcript.words)) {
      wordAnalysis = transcript.words.map((w, idx) => ({
        word: w.text ?? w.word ?? "",
        start: typeof w.start === "number" ? w.start : null,
        end: typeof w.end === "number" ? w.end : null,
        confidence: typeof w.score === "number" ? w.score : w.confidence ?? null,
        wordIndex: idx
      }));
    }
    
    // Cập nhật database với kết quả (bao gồm missing_words)
    // Lưu ý: word_analysis không có trong schema, chỉ lưu trong analysis
    await pool.query(
      `UPDATE speaking_practice_rounds 
       SET transcript = $1, score = $2, analysis = $3
       WHERE id = $4`,
      [
        JSON.stringify(transcript),
        score,
        JSON.stringify({
          feedback,
          errors,
          corrected_text: correctedText,
          score,
          missing_words: analysis?.missing_words || [],
          word_analysis: wordAnalysis.length > 0 ? wordAnalysis : []
        }),
        round.id
      ]
    );
  };

  // Xử lý song song với batch size = 3
  const batchSize = 3;
  for (let i = 0; i < roundsToProcess.length; i += batchSize) {
    const batch = roundsToProcess.slice(i, i + batchSize);
    await Promise.all(batch.map(round => processRound(round)));
  }

  // Sau khi phân tích xong, tạo summary
  return await generateSummary(sessionId);
}

/**
 * Tạo tổng kết sau 10 vòng
 */
export async function generateSummary(sessionId) {
  const rounds = await pool.query(
    `SELECT * FROM speaking_practice_rounds 
     WHERE session_id = $1 
     ORDER BY round_number`,
    [sessionId]
  );

  if (rounds.rows.length === 0) {
    throw new Error("No rounds found");
  }

  // Tính điểm tổng kết: cộng tất cả điểm 10 câu, chia cho 10, làm tròn
  const totalScore = rounds.rows.reduce((sum, r) => sum + (parseFloat(r.score) || 0), 0);
  const averageScore = Math.round(totalScore / 10); // Luôn chia cho 10 (10 câu), làm tròn

  // Tạo tổng kết với AI (tối ưu cho tốc độ)
  const summaryPrompt = `Summary: ${rounds.rows.length} rounds, avg ${averageScore.toFixed(1)}/100.
Scores: ${rounds.rows.map((r, i) => `R${i+1}:${r.score}`).join(" ")}.

Return JSON only:
{"overall_feedback": "brief", "common_mistakes": ["m1"], "strengths": ["s1"], "improvements": ["i1"], "encouragement": "brief"}`;

  let summaryData = {
    overall_feedback: "Good effort! Keep practicing.",
    common_mistakes: [],
    strengths: [],
    improvements: [],
    encouragement: "You're making progress!"
  };

  try {
    const response = await aiServiceClient.callOpenRouter(
      [{ role: "user", content: summaryPrompt }],
      { 
        model: "openai/gpt-4o-mini", 
        temperature: 0.5, // Giảm temperature
        max_tokens: 400 // Giảm max_tokens
      }
    );

    let content = response.choices?.[0]?.message?.content || "{}";
    
    // Parse JSON (handle markdown code blocks if any)
    content = content.trim();
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const codeBlockMatch = content.match(codeBlockRegex);
    if (codeBlockMatch && codeBlockMatch[1]) {
      content = codeBlockMatch[1].trim();
    }
    
    // Extract JSON nếu có text trước/sau
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      content = content.substring(firstBrace, lastBrace + 1);
    }
    
    summaryData = JSON.parse(content);
  } catch (err) {
    console.error("❌ Summary generation error:", err);
    // Không log response vì có thể undefined khi error
    if (err.response) {
      console.error("Error response:", err.response);
    }
  }

  // Update session
  await pool.query(
    `UPDATE speaking_practice_sessions 
     SET status = 'completed',
         total_score = $1,
         average_score = $2,
         summary = $3,
         completed_at = NOW()
     WHERE id = $4`,
    [totalScore, Math.round(averageScore), JSON.stringify(summaryData), sessionId]
  );

  // Lưu vào practice_history để tracking tiến độ
  const sessionInfo = await pool.query(
    `SELECT learner_id, level, created_at, completed_at 
     FROM speaking_practice_sessions 
     WHERE id = $1`,
    [sessionId]
  );
  
  if (sessionInfo.rows[0]) {
    const session = sessionInfo.rows[0];
    const duration = session.completed_at && session.created_at
      ? Math.round((new Date(session.completed_at) - new Date(session.created_at)) / 60000)
      : null;
    
    // Lấy strengths và improvements từ quick evaluations
    const evaluations = await pool.query(
      `SELECT strengths, improvements FROM quick_evaluations 
       WHERE session_id = $1`,
      [sessionId]
    );
    
    const allStrengths = [];
    const allImprovements = [];
    evaluations.rows.forEach(e => {
      if (e.strengths) {
        try {
          const s = typeof e.strengths === 'string' ? JSON.parse(e.strengths) : e.strengths;
          if (Array.isArray(s)) allStrengths.push(...s);
        } catch {}
      }
      if (e.improvements) {
        try {
          const i = typeof e.improvements === 'string' ? JSON.parse(e.improvements) : e.improvements;
          if (Array.isArray(i)) allImprovements.push(...i);
        } catch {}
      }
    });
    
    // Lưu practice history - chỉ lưu điểm
    // Kiểm tra xem đã có record chưa
    const existing = await pool.query(
      `SELECT id FROM practice_history WHERE session_id = $1`,
      [sessionId]
    );
    
    if (existing.rows.length > 0) {
      // Update existing record
      await pool.query(
        `UPDATE practice_history 
         SET total_score = $1,
             average_score = $2,
             duration_minutes = $3
         WHERE session_id = $4`,
        [totalScore, Math.round(averageScore), duration, sessionId]
      );
    } else {
      // Insert new record
      await pool.query(
        `INSERT INTO practice_history 
         (learner_id, session_id, practice_type, level, total_score, average_score, duration_minutes)
         VALUES ($1, $2, 'speaking_practice', $3, $4, $5, $6)`,
        [
          session.learner_id,
          sessionId,
          session.level,
          totalScore,
          Math.round(averageScore),
          duration
        ]
      );
    }
  }

  // Parse missing_words từ analysis cho mỗi round
  const roundsWithMissingWords = rounds.rows.map(round => {
    let missingWords = [];
    if (round.analysis) {
      try {
        const analysis = typeof round.analysis === 'string' 
          ? JSON.parse(round.analysis) 
          : round.analysis;
        missingWords = analysis.missing_words || [];
      } catch (e) {
        // Ignore parse errors
      }
    }
    return {
      ...round,
      missing_words: missingWords
    };
  });

  return {
    total_score: totalScore,
    average_score: Math.round(averageScore), // Làm tròn điểm trung bình
    ...summaryData,
    rounds: roundsWithMissingWords
  };
}

export { analyzePronunciation, analyzePronunciationFallback };


