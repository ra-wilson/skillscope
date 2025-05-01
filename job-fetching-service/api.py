from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.skill_extractor import SkillExtractor

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

skill_extractor = SkillExtractor()

@app.get("/api/skills/statistics")
async def get_skill_statistics():
    """Get skill statistics for visualization."""
    try:
        stats = skill_extractor.get_skill_statistics()
        return {
            "status": "success",
            "data": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/skills/categories")
async def get_skill_categories():
    """Get predefined skill categories."""
    try:
        categories = list(skill_extractor.skill_keywords.keys())
        return {
            "status": "success",
            "data": categories
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 