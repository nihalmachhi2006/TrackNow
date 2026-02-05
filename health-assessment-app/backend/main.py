from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
import uvicorn

app = FastAPI(
    title="Health Assessment API",
    description="API for health risk assessment and recommendations",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api", tags=["assessments"])

@app.get("/")
async def root():
    return {
        "message": "Health Assessment API",
        "version": "1.0.0",
        "endpoints": {
            "questions": "/api/questions",
            "submit_assessment": "/api/assessment",
            "get_history": "/api/assessment/history/{user_id}",
            "get_assessment": "/api/assessment/{assessment_id}"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0",reload=True)

    # ,port=8000
