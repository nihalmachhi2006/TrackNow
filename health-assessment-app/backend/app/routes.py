from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from app.models import (
    AssessmentRequest, 
    AssessmentResult, 
    AssessmentHistory,
    Question
)
from app.services import calculate_health_score, get_questions
from app.database import supabase_client

router = APIRouter()

@router.get("/questions")
async def get_health_questions():
    """Get all health assessment questions"""
    return get_questions()

@router.post("/assessment", response_model=AssessmentResult)
async def submit_assessment(request: AssessmentRequest):
    """Submit health assessment and get results"""
    try:
        # Calculate health score and recommendations
        result = calculate_health_score(request.answers)
        
        # Save to Supabase if configured
        if supabase_client:
            try:
                # Prepare data for insertion
                assessment_data = {
                    "health_score": result.health_score,
                    "risk_level": result.risk_level,
                    "category_scores": result.category_scores,
                    "recommendations": [rec.dict() for rec in result.recommendations],
                    "answers": {str(k): v.dict() for k, v in request.answers.items()},
                    "created_at": datetime.utcnow().isoformat()
                }
                
                # Insert into database
                response = supabase_client.table("assessments").insert(assessment_data).execute()
                
                if response.data:
                    result.id = response.data[0].get("id")
                    result.created_at = response.data[0].get("created_at")
                    
            except Exception as db_error:
                print(f"Database error: {db_error}")
                # Continue even if database save fails
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing assessment: {str(e)}")

@router.get("/assessment/history/{user_id}", response_model=List[AssessmentHistory])
async def get_assessment_history(user_id: str, limit: int = 10):
    """Get assessment history for a user"""
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        response = supabase_client.table("assessments")\
            .select("id, health_score, risk_level, created_at")\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return response.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")

@router.get("/assessment/{assessment_id}", response_model=AssessmentResult)
async def get_assessment_by_id(assessment_id: int):
    """Get specific assessment by ID"""
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        response = supabase_client.table("assessments")\
            .select("*")\
            .eq("id", assessment_id)\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching assessment: {str(e)}")
