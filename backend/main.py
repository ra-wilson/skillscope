from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import skills

app = FastAPI(title="Job Insights API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(skills.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Job Insights API"} 