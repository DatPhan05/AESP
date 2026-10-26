// Progress Analytics Service - Learner progress tracking and AI recommendations
import pool from "../config/db.js";

/**
 * Lấy progress analytics cho learner
 * Bao gồm: speaking practice stats, challenge stats, AI recommendations
 * @param {number} learnerId - ID của learner
 * @param {string} [authToken] - Authorization token để forward cho AI Service
 */
export async function getProgressAnalytics(learnerId, authToken = null) {
  try {
    // 1. Speaking Practice Statistics
    const speakingStats = await getSpeakingPracticeStats(learnerId);
    
    // 2. Challenge Statistics
    const challengeStats = await getChallengeStats(learnerId);
    
    // 3. Overall Progress
    const overallProgress = calculateOverallProgress(speakingStats, challengeStats);
    
    // 4. AI Recommendations (sử dụng AI Service để đánh giá và đưa ra gợi ý)
    const aiRecommendations = await generateAIRecommendations(
      learnerId,
      speakingStats,
      challengeStats,
      overallProgress,
      authToken
    );
    
    return {
      speaking_practice: speakingStats,
      challenges: challengeStats,
      overall: overallProgress,
      recommendations: aiRecommendations,
      generated_at: new Date().toISOString()
    };
  } catch (err) {
    console.error("❌ getProgressAnalytics error:", err);
    throw err;
  }
}

/**
 * Lấy thống kê speaking practice
 */
async function getSpeakingPracticeStats(learnerId) {
  try {
    const learnerRes = await pool.query(
      `SELECT id, user_id, target_level, daily_goal_minutes, streak_count FROM learners WHERE id = $1`,
      [learnerId]
    );
    const learner = learnerRes.rows[0] || {};
    const userId = learner.user_id || learnerId;

    const roundsRes = await pool.query(
      `SELECT COUNT(*) as count, AVG(score) as avg_score, SUM(score) as total_score 
       FROM speaking_rounds 
       WHERE learner_id = $1`,
      [userId]
    );

    const totalCount = parseInt(roundsRes.rows[0]?.count || 0);
    const avgScore = parseFloat(roundsRes.rows[0]?.avg_score || 0);
    const totalScore = parseFloat(roundsRes.rows[0]?.total_score || 0);

    return {
      total_sessions: totalCount,
      completed_sessions: totalCount,
      average_score: avgScore,
      total_score: totalScore,
      streak_days: learner.streak_count || 0,
      target_level: learner.target_level || "B1",
      daily_goal_minutes: learner.daily_goal_minutes || 20,
      score_rate: avgScore / 100,
      score_by_level: [],
      improvement_trend: {
        recent_7_days: avgScore,
        previous_7_days: avgScore,
        improvement: 0,
        is_improving: true
      }
    };
  } catch (err) {
    console.error("❌ getSpeakingPracticeStats fallback error:", err.message);
    return {
      total_sessions: 0,
      completed_sessions: 0,
      average_score: 0,
      total_score: 0,
      streak_days: 0,
      score_rate: 0,
      score_by_level: [],
      improvement_trend: {
        recent_7_days: 0,
        previous_7_days: 0,
        improvement: 0,
        is_improving: false
      }
    };
  }
}

/**
 * Lấy thống kê challenges
 */
async function getChallengeStats(learnerId) {
  try {
    const totalChallenges = await pool.query(
      `SELECT COUNT(*) as count FROM learner_challenges WHERE learner_id = $1`,
      [learnerId]
    );
    const totalCount = parseInt(totalChallenges.rows[0]?.count || 0);

    return {
      total_challenges: totalCount,
      graded_challenges: 0,
      average_final_score: 0,
      average_pronunciation: 0,
      average_fluency: 0,
      total_score: 0,
      score_rate: 0,
      recent_challenges: [],
      improvement_trend: {
        recent_avg: 0,
        previous_avg: 0,
        improvement: 0,
        is_improving: false
      }
    };
  } catch (err) {
    console.error("❌ getChallengeStats fallback error:", err.message);
    return {
      total_challenges: 0,
      graded_challenges: 0,
      average_final_score: 0,
      average_pronunciation: 0,
      average_fluency: 0,
      total_score: 0,
      score_rate: 0,
      recent_challenges: [],
      improvement_trend: {
        recent_avg: 0,
        previous_avg: 0,
        improvement: 0,
        is_improving: false
      }
    };
  }
}

/**
 * Tính overall progress
 */
function calculateOverallProgress(speakingStats, challengeStats) {
  const speakingWeight = 0.6; // Speaking practice chiếm 60%
  const challengeWeight = 0.4; // Challenges chiếm 40%
  
  const overallScore = (
    speakingStats.average_score * speakingWeight +
    challengeStats.average_final_score * challengeWeight
  );
  
  const overallScoreRate = overallScore / 100; // 0.0 - 1.0 (thang 100)
  
  // Tính tổng số lần luyện tập
  const totalPracticeCount = speakingStats.completed_sessions + challengeStats.graded_challenges;
  
  return {
    overall_score: overallScore,
    overall_score_rate: overallScoreRate,
    total_practice_count: totalPracticeCount,
    speaking_practice_count: speakingStats.completed_sessions,
    challenge_count: challengeStats.graded_challenges,
    is_active: totalPracticeCount > 0
  };
}

/**
 * Generate AI recommendations sử dụng AI Service
 * @param {number} learnerId - ID của learner
 * @param {object} speakingStats - Thống kê speaking practice
 * @param {object} challengeStats - Thống kê challenges
 * @param {object} overallProgress - Tổng quan tiến độ
 * @param {string} [authToken] - Authorization token để forward cho AI Service
 */
async function generateAIRecommendations(learnerId, speakingStats, challengeStats, overallProgress, authToken = null) {
  try {
    // Tạo prompt cho AI để đánh giá và đưa ra gợi ý
    const analysisPrompt = `Bạn là giáo viên tiếng Anh chuyên nghiệp. Hãy phân tích tiến độ học tập của học viên và đưa ra gợi ý cải thiện.

THỐNG KÊ LUYỆN NÓI:
- Tổng số lần luyện: ${speakingStats.total_sessions}
- Số lần hoàn thành: ${speakingStats.completed_sessions}
- Điểm trung bình: ${speakingStats.average_score.toFixed(2)}/100
- Tỷ lệ điểm: ${(speakingStats.score_rate * 100).toFixed(1)}%
- Xu hướng: ${speakingStats.improvement_trend.is_improving ? 'Đang cải thiện' : 'Cần cải thiện'} (${speakingStats.improvement_trend.improvement > 0 ? '+' : ''}${speakingStats.improvement_trend.improvement.toFixed(2)} điểm)

THỐNG KÊ CHALLENGES:
- Tổng số challenges: ${challengeStats.total_challenges}
- Số challenges đã chấm: ${challengeStats.graded_challenges}
- Điểm trung bình: ${challengeStats.average_final_score.toFixed(2)}/100
- Phát âm: ${challengeStats.average_pronunciation.toFixed(2)}/100
- Độ trôi chảy: ${challengeStats.average_fluency.toFixed(2)}/100
- Tỷ lệ điểm: ${(challengeStats.score_rate * 100).toFixed(1)}%
- Xu hướng: ${challengeStats.improvement_trend.is_improving ? 'Đang cải thiện' : 'Cần cải thiện'} (${challengeStats.improvement_trend.improvement > 0 ? '+' : ''}${challengeStats.improvement_trend.improvement.toFixed(2)} điểm)

TỔNG QUAN:
- Điểm tổng thể: ${overallProgress.overall_score.toFixed(2)}/100
- Tổng số lần luyện tập: ${overallProgress.total_practice_count}

Hãy đưa ra:
1. Đánh giá tổng quan (2-3 câu)
2. Điểm mạnh (3-5 điểm)
3. Cần cải thiện (3-5 điểm)
4. Gợi ý cụ thể để cải thiện (3-5 gợi ý)

Trả về JSON:
{
  "overall_assessment": "string",
  "strengths": ["string"],
  "improvements_needed": ["string"],
  "recommendations": ["string"],
  "priority_areas": ["string"] // Các lĩnh vực cần ưu tiên
}`;

    // Gọi AI Service để phân tích
    try {
      // Prepare headers with auth token if available
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = authToken;
      }
      
      // Gọi qua API Gateway với internal endpoint (không cần auth)
      const response = await fetch(`http://localhost:${process.env.API_GATEWAY_PORT || 4000}/api/ai/internal/assistant/conversation`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          message: analysisPrompt,
          history: []
        })
      });
      
      if (!response.ok) {
        throw new Error(`AI Service error: ${response.status}`);
      }
      
      const aiResponse = await response.json();
      const responseText = aiResponse.response || aiResponse.message || "";
      
      // Parse response
      let recommendations = {
        overall_assessment: "Đang phân tích tiến độ học tập...",
        strengths: [],
        improvements_needed: [],
        recommendations: [],
        priority_areas: []
      };
      
      if (responseText) {
        try {
          // Try to parse as JSON
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            recommendations = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback: extract information from text
            recommendations.overall_assessment = responseText.substring(0, 200);
          }
        } catch (e) {
          // Fallback: use text as assessment
          recommendations.overall_assessment = responseText.substring(0, 300);
        }
      }
      
      // Thêm recommendations dựa trên data nếu AI không trả về đủ
      if (recommendations.recommendations.length === 0) {
        recommendations.recommendations = generateDefaultRecommendations(
          speakingStats,
          challengeStats,
          overallProgress
        );
      }
      
      return recommendations;
    } catch (err) {
      console.error("❌ Error calling AI Service:", err);
      // Fallback to default recommendations
      return {
        overall_assessment: "Hệ thống đang phân tích tiến độ của bạn. Hãy tiếp tục luyện tập để nhận được đánh giá chi tiết.",
        strengths: [],
        improvements_needed: [],
        recommendations: generateDefaultRecommendations(speakingStats, challengeStats, overallProgress),
        priority_areas: []
      };
    }
  } catch (err) {
    console.error("❌ generateAIRecommendations error:", err);
    // Fallback to default recommendations
    return {
      overall_assessment: "Hệ thống đang phân tích tiến độ của bạn. Hãy tiếp tục luyện tập để nhận được đánh giá chi tiết.",
      strengths: [],
      improvements_needed: [],
      recommendations: generateDefaultRecommendations(speakingStats, challengeStats, overallProgress),
      priority_areas: []
    };
  }
}

/**
 * Generate default recommendations dựa trên data
 */
function generateDefaultRecommendations(speakingStats, challengeStats, overallProgress) {
  const recommendations = [];
  
  // Recommendations dựa trên speaking practice
  if (speakingStats.average_score < 7) {
    recommendations.push("Tăng cường luyện nói để cải thiện điểm số. Mục tiêu: đạt 70/100 trở lên.");
  }
  
  if (speakingStats.completed_sessions < 10) {
    recommendations.push(`Bạn đã hoàn thành ${speakingStats.completed_sessions} bài luyện nói. Hãy luyện tập thêm để cải thiện kỹ năng.`);
  }
  
  // Recommendations dựa trên challenges
  if (challengeStats.average_final_score < 7) {
    recommendations.push("Tập trung vào challenges để cải thiện điểm số. Mentor sẽ đánh giá chi tiết hơn.");
  }
  
  if (challengeStats.average_pronunciation < challengeStats.average_fluency) {
    recommendations.push("Cần cải thiện phát âm. Hãy luyện tập phát âm các từ khó thường xuyên hơn.");
  } else if (challengeStats.average_fluency < challengeStats.average_pronunciation) {
    recommendations.push("Cần cải thiện độ trôi chảy. Hãy luyện tập nói liên tục và tự nhiên hơn.");
  }
  
  // Overall recommendations
  if (overallProgress.overall_score < 7) {
    recommendations.push("Điểm tổng thể còn thấp. Hãy luyện tập đều đặn mỗi ngày để cải thiện.");
  }
  
  if (!speakingStats.improvement_trend.is_improving && !challengeStats.improvement_trend.is_improving) {
    recommendations.push("Tiến độ chưa cải thiện. Hãy xem lại các lỗi và tập trung vào các điểm yếu.");
  }
  
  return recommendations;
}

/**
 * Lưu challenge evaluation để AI học
 * Được gọi khi mentor chấm challenge
 */
export async function learnFromChallengeEvaluation(
  learnerId,
  challengeId,
  submissionId,
  scores,
  feedback
) {
  try {
    // Lưu vào assistant_ai_training để AI học cách đánh giá challenge
    await pool.query(
      `INSERT INTO assistant_ai_training 
       (task_type, input_data, expected_output, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (task_type, md5(input_data::text)) DO NOTHING`,
      [
        'challenge_evaluation',
        JSON.stringify({
          learner_id: learnerId,
          challenge_id: challengeId,
          submission_id: submissionId
        }),
        JSON.stringify({
          final_score: scores.final_score,
          pronunciation_score: scores.pronunciation_score,
          fluency_score: scores.fluency_score,
          feedback: feedback
        })
      ]
    );
    
    // Cũng gọi AI Service để học từ mentor feedback
    if (feedback) {
      try {
        // Gọi qua API Gateway thay vì trực tiếp đến AI Service
        await fetch(`http://localhost:${process.env.API_GATEWAY_PORT || 4000}/api/ai/mentor/learn-feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feedback,
            scores,
            context: {
              learner_id: learnerId,
              challenge_id: challengeId,
              submission_id: submissionId
            }
          })
        }).catch(err => {
          console.warn("⚠️ Failed to notify AI Service about mentor feedback:", err);
        });
      } catch (err) {
        console.warn("⚠️ Failed to learn from mentor feedback:", err);
      }
    }
    
    console.log(`✅ Saved challenge evaluation for AI learning: challenge ${challengeId}, learner ${learnerId}`);
  } catch (err) {
    console.error("❌ learnFromChallengeEvaluation error:", err);
  }
}

