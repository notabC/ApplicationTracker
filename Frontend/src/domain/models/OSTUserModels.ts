export interface ResumeUploadRequest {
  file_content: string; // Base64 encoded PDF
  file_name: string;
}

export interface ResumeAnalysisResponse {
  job_field: string;
  suggested_questions: Array<{ variable: string; question: string }>;
}

export interface UserPreference {
  variable: string;
  question: string;
  response?: string | number; // User's answer
}

export interface QuestionSubmissionRequest {
  job_field: string;
  user_data: Array<{
    question_type: string; // Corresponds to 'variable' in UserPreference
    question: string;
    response: number;
    data_type: string;
  }>;
}

export interface UserProfileResponse {
  user_id: string;
  job_field: string;
  experience_level?: string;
  preferences: Record<string, number>; // e.g., { "min_salary": 90000, "work_life_balance_weight": 4.5 }
  created_at?: string;
  error?: string;
}

export type ResumeProcessingUpdate = 
  | { type: 'status'; status: string; step?: string; message: string }
  | { type: 'error'; message: string }
  | { type: 'analysis_complete'; job_field: string; questions: UserPreference[] }
  | { type: 'next_question'; variable: string; question: string; question_text?: string }
  | { type: 'followup_question'; variable: string; question: string; question_text?: string }
  | { type: 'interpretation_result'; variable: string; interpreted_value: any; confidence: number; reasoning?: string }
  | { type: 'profile_created'; profile: UserProfileResponse };

export interface OSTOnboardingState {
  step: 'idle' | 'uploading' | 'analyzing' | 'questioning' | 'submitting' | 'completed' | 'error';
  resumeFile?: File;
  resumeFileName?: string;
  jobField?: string;
  questions: UserPreference[];
  currentQuestionIndex: number;
  processingUpdates: string[];
  errorMessage?: string;
  createdProfile?: UserProfileResponse;
  isModalOpen: boolean;
}

// Represents a message in the chat interface
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
} 