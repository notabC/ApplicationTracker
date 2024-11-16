from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import applications, workflow, email
from .database import init_db, close_db

app = FastAPI(title="Job Tracker API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
app.include_router(workflow.router, prefix="/api/workflow", tags=["workflow"])
app.include_router(email.router, prefix="/api/email", tags=["email"])

@app.on_event("startup")
async def startup():
    await init_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()