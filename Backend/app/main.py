from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from .routers import applications, workflow, email
from .database import init_db

app = FastAPI(title="Job Tracker API",
             root_path="/api")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(applications.router, prefix="/applications", tags=["applications"])
app.include_router(workflow.router, prefix="/workflow", tags=["workflow"])
app.include_router(email.router, prefix="/email", tags=["email"])

@app.on_event("startup")
async def startup():
    await init_db()

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to Job Tracker API"}

# Handler for AWS Lambda/Vercel
handler = Mangum(app)