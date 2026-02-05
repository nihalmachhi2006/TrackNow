from typing import Dict, List
from app.models import AssessmentResult, Recommendation, Answer
from datetime import datetime

QUESTIONS_DATA = [
    {
        "id": 1,
        "question": "How many hours do you sleep on average per night?",
        "category": "Sleep",
        "options": [
            {"value": "less_than_5", "label": "Less than 5 hours", "score": 3},
            {"value": "5_to_6", "label": "5-6 hours", "score": 2},
            {"value": "7_to_8", "label": "7-8 hours", "score": 0},
            {"value": "more_than_8", "label": "More than 8 hours", "score": 1}
        ]
    },
    {
        "id": 2,
        "question": "How often do you exercise per week?",
        "category": "Exercise",
        "options": [
            {"value": "never", "label": "Never", "score": 3},
            {"value": "1_to_2", "label": "1-2 times", "score": 2},
            {"value": "3_to_4", "label": "3-4 times", "score": 1},
            {"value": "5_or_more", "label": "5 or more times", "score": 0}
        ]
    },
    {
        "id": 3,
        "question": "How would you rate your stress level?",
        "category": "Stress",
        "options": [
            {"value": "very_high", "label": "Very High", "score": 3},
            {"value": "high", "label": "High", "score": 2},
            {"value": "moderate", "label": "Moderate", "score": 1},
            {"value": "low", "label": "Low", "score": 0}
        ]
    },
    {
        "id": 4,
        "question": "How many servings of fruits and vegetables do you eat daily?",
        "category": "Nutrition",
        "options": [
            {"value": "none", "label": "None or rarely", "score": 3},
            {"value": "1_to_2", "label": "1-2 servings", "score": 2},
            {"value": "3_to_4", "label": "3-4 servings", "score": 1},
            {"value": "5_or_more", "label": "5 or more servings", "score": 0}
        ]
    },
    {
        "id": 5,
        "question": "Do you have any existing health conditions?",
        "category": "Medical",
        "options": [
            {"value": "multiple", "label": "Multiple conditions", "score": 3},
            {"value": "one", "label": "One condition", "score": 2},
            {"value": "none_managed", "label": "None, but family history", "score": 1},
            {"value": "none", "label": "None", "score": 0}
        ]
    }
]

def calculate_health_score(answers: Dict[int, Answer]) -> AssessmentResult:
    """Calculate health score and generate recommendations based on answers"""
    
    # Calculate total score
    total_score = sum(answer.score for answer in answers.values())
    max_score = len(QUESTIONS_DATA) * 3  # Maximum possible score
    
    # Convert to percentage (inverse - higher is better)
    health_score = ((max_score - total_score) / max_score) * 100
    
    # Calculate category scores
    category_scores = {}
    for question in QUESTIONS_DATA:
        question_id = question["id"]
        category = question["category"]
        
        if question_id in answers:
            answer_score = answers[question_id].score
            # Inverse scoring for category (0 is best, 3 is worst)
            category_score = ((3 - answer_score) / 3) * 100
            category_scores[category] = round(category_score, 2)
    
    # Determine risk level
    if health_score >= 75:
        risk_level = "Low"
    elif health_score >= 50:
        risk_level = "Moderate"
    else:
        risk_level = "High"
    
    # Generate recommendations
    recommendations = generate_recommendations(health_score, category_scores, answers)
    
    return AssessmentResult(
        health_score=round(health_score, 2),
        risk_level=risk_level,
        category_scores=category_scores,
        recommendations=recommendations
    )

def generate_recommendations(
    health_score: float, 
    category_scores: Dict[str, float],
    answers: Dict[int, Answer]
) -> List[Recommendation]:
    """Generate personalized recommendations based on assessment results"""
    
    recommendations = []
    
    # Check each category and provide specific recommendations
    if category_scores.get("Sleep", 100) < 70:
        recommendations.append(Recommendation(
            title="Improve Sleep Quality",
            description="Aim for 7-8 hours of quality sleep each night. Establish a consistent bedtime routine, avoid screens before bed, and create a comfortable sleep environment."
        ))
    
    if category_scores.get("Exercise", 100) < 70:
        recommendations.append(Recommendation(
            title="Increase Physical Activity",
            description="Try to exercise at least 3-4 times per week. Start with 30 minutes of moderate activity like brisk walking, swimming, or cycling."
        ))
    
    if category_scores.get("Stress", 100) < 70:
        recommendations.append(Recommendation(
            title="Manage Stress Effectively",
            description="Practice stress-reduction techniques such as meditation, deep breathing exercises, or yoga. Consider talking to a mental health professional if stress feels overwhelming."
        ))
    
    if category_scores.get("Nutrition", 100) < 70:
        recommendations.append(Recommendation(
            title="Improve Nutritional Intake",
            description="Aim for at least 5 servings of fruits and vegetables daily. Include a variety of colorful produce, whole grains, and lean proteins in your diet."
        ))
    
    if category_scores.get("Medical", 100) < 70:
        recommendations.append(Recommendation(
            title="Regular Health Monitoring",
            description="Schedule regular check-ups with your healthcare provider. Stay on top of any existing conditions and discuss family health history with your doctor."
        ))
    
    # Add general recommendations based on overall score
    if health_score >= 75:
        if len(recommendations) == 0:
            recommendations.append(Recommendation(
                title="Maintain Your Excellent Routine",
                description="You're doing great! Keep up your healthy habits and continue with regular health screenings."
            ))
    elif health_score >= 50:
        recommendations.append(Recommendation(
            title="Stay Hydrated",
            description="Drink at least 8 glasses of water daily. Proper hydration supports all bodily functions and can improve energy levels."
        ))
    else:
        recommendations.insert(0, Recommendation(
            title="Consult a Healthcare Provider",
            description="Consider scheduling a comprehensive health evaluation with your doctor to discuss areas of concern and develop a personalized health improvement plan."
        ))
    
    # Limit to top 5 recommendations
    return recommendations[:5]

def get_questions():
    """Return all health assessment questions"""
    return {"questions": QUESTIONS_DATA}
