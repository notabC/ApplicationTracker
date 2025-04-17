from typing import Dict, List, Any, Optional, TypedDict
from datetime import datetime

class BaseWorkflowState(TypedDict):
    """
    Base workflow state class that all workflow states should extend.
    Provides common fields needed across all workflow types.
    """
    workflow_id: str
    session_id: str
    started_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]
    error: Optional[str]

class OnboardingWorkflowState(BaseWorkflowState):
    """
    State specific to the onboarding workflow that processes resumes
    and collects user preferences through interactive questioning.
    """
    # Resume processing state
    resume_text: Optional[str]
    job_field: Optional[str]
    
    # Questions and responses
    questions: List[Dict[str, Any]]  # Each dict has 'variable' and 'question' fields
    current_question_index: int
    user_data: List[Dict[str, Any]]  # Final processed responses
    conversation_history: List[Dict[str, Any]]  # Raw Q&A history
    current_responses: List[str]  # Responses to current question
    
    # Control variables
    current_variable: Optional[str]
    current_followup_count: int
    confidence_threshold: float
    max_followups: int
    
    # Schema information
    variable_schema_map: Dict[str, Dict[str, Any]]
    
    # Result
    ost_profile: Optional[Dict[str, Any]]
    ost_preferences: Optional[Dict[str, Any]]
    user_id: Optional[str]

def create_initial_onboarding_state(session_id: str, workflow_id: str = "onboarding") -> OnboardingWorkflowState:
    """
    Create an initial state for the onboarding workflow with default values.
    
    Args:
        session_id: Unique identifier for the session
        workflow_id: Identifier for the workflow type
        
    Returns:
        An initialized OnboardingWorkflowState
    """
    now = datetime.now()
    
    return {
        # Base fields
        "workflow_id": workflow_id,
        "session_id": session_id,
        "started_at": now,
        "updated_at": now,
        "metadata": {},
        "error": None,
        
        # Resume processing
        "resume_text": None,
        "job_field": None,
        
        # Questions and responses
        "questions": [],
        "current_question_index": -1,
        "user_data": [],
        "conversation_history": [],
        "current_responses": [],
        
        # Control variables
        "current_variable": None,
        "current_followup_count": 0,
        "confidence_threshold": 0.7,
        "max_followups": 2,
        
        # Schema information
        "variable_schema_map": {},
        
        # Result
        "ost_profile": None,
        "ost_preferences": None,
        "user_id": None
    } 