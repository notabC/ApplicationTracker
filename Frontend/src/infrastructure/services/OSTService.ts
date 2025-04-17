import { injectable } from 'inversify';
import { ApiClient } from '../api/apiClient';
import { IOSTService } from '@/domain/interfaces/IOSTService';
import { 
  ResumeUploadRequest, 
  ResumeAnalysisResponse, 
  QuestionSubmissionRequest, 
  UserProfileResponse, 
  ResumeProcessingUpdate 
} from '@/domain/models/OSTUserModels';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class OSTService implements IOSTService {
  private ws: WebSocket | null = null;
  private wsUrl: string = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')
                          .replace(/^http/, 'ws') + '/api/ost';

  async uploadResume(data: ResumeUploadRequest): Promise<ResumeAnalysisResponse> {
    try {
      const response = await ApiClient.post<ResumeAnalysisResponse>('/api/ost/resume/upload', data);
      return response;
    } catch (error) {
      console.error("Error uploading resume:", error);
      // Provide a default or error structure if needed
      throw new Error("Failed to upload resume");
    }
  }

  async submitPreferences(data: QuestionSubmissionRequest): Promise<UserProfileResponse> {
    try {
      const response = await ApiClient.post<UserProfileResponse>('/api/ost/profile/create', data);
      return response;
    } catch (error) {
      console.error("Error submitting preferences:", error);
      throw new Error("Failed to create profile");
    }
  }

  async getUserProfile(userId: string): Promise<UserProfileResponse | null> {
    try {
      const response = await ApiClient.get<UserProfileResponse>(`/api/ost/profile/${userId}`);
      return response;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null; // User profile not found
      }
      console.error("Error fetching user profile:", error);
      throw new Error("Failed to fetch profile");
    }
  }

  connectResumeProcessingSocket(
    clientId: string,
    onMessage: (update: ResumeProcessingUpdate) => void,
    onError: (error: Event) => void,
    onClose: () => void
  ): () => void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn("WebSocket already connected.");
      // Potentially close existing connection or return existing disconnect function
      // For simplicity, we'll close the old one and start anew
      this.ws.close();
    }

    const fullWsUrl = `${this.wsUrl}/ws/onboarding/${clientId || uuidv4()}`;
    console.log("Connecting to WebSocket:", fullWsUrl);
    this.ws = new WebSocket(fullWsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const update: ResumeProcessingUpdate = JSON.parse(event.data);
        onMessage(update);
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
        // Optionally call onError or handle differently
      }
    };

    this.ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      onError(error);
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      this.ws = null;
      onClose();
    };

    // Return a function to disconnect
    const disconnect = () => {
      if (this.ws) {
        console.log("Closing WebSocket connection manually.");
        this.ws.close();
        this.ws = null;
      }
    };
    return disconnect;
  }

  sendResumeDataViaSocket(data: ResumeUploadRequest): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected. Cannot send data.");
      // Handle error: maybe try reconnecting or throw an error
      throw new Error("WebSocket not connected");
    }
  }
} 