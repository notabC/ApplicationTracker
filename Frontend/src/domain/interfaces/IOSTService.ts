import { 
  ResumeUploadRequest, 
  ResumeAnalysisResponse, 
  QuestionSubmissionRequest, 
  UserProfileResponse, 
  ResumeProcessingUpdate 
} from '../models/OSTUserModels';

export interface IOSTService {
  /**
   * Uploads a resume file to the backend for analysis.
   * @param data The resume file content and name.
   * @returns The analysis result containing job field and suggested questions.
   */
  uploadResume(data: ResumeUploadRequest): Promise<ResumeAnalysisResponse>;

  /**
   * Submits the user's answers to the onboarding questions to create a profile.
   * @param data The job field and user responses.
   * @returns The created user profile information.
   */
  submitPreferences(data: QuestionSubmissionRequest): Promise<UserProfileResponse>;

  /**
   * Fetches a user profile by their ID.
   * @param userId The ID of the user.
   * @returns The user profile data or null if not found.
   */
  getUserProfile(userId: string): Promise<UserProfileResponse | null>;

  /**
   * Establishes a WebSocket connection to receive resume processing updates.
   * @param clientId A unique identifier for the client connection.
   * @param onMessage Callback function to handle incoming messages.
   * @param onError Callback function to handle errors.
   * @param onClose Callback function for when the connection closes.
   * @returns A function to close the WebSocket connection.
   */
  connectResumeProcessingSocket(
    clientId: string,
    onMessage: (update: ResumeProcessingUpdate) => void,
    onError: (error: Event) => void,
    onClose: () => void
  ): () => void; // Returns a disconnect function

  /**
   * Sends data through the established WebSocket connection.
   * @param data The data to send (e.g., resume upload request).
   */
  sendResumeDataViaSocket(data: ResumeUploadRequest): void;
} 