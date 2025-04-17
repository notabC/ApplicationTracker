import { injectable, inject } from 'inversify';
import { makeObservable, observable, action, computed } from 'mobx';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';
import { IOSTService } from '@/domain/interfaces/IOSTService';
import { 
  OSTOnboardingState, 
  UserPreference, 
  ResumeProcessingUpdate, 
  UserProfileResponse, 
  QuestionSubmissionRequest,
  ChatMessage
} from '@/domain/models/OSTUserModels';
import { v4 as uuidv4 } from 'uuid';
import { ReasoningService, ReasoningStep, ReasoningResult } from '@/infrastructure/services/ReasoningService';

/**
 * State interface for the OST onboarding view model
 */
export interface OSTOnboardingState {
  isModalOpen: boolean;
  step: 'idle' | 'uploading' | 'analyzing' | 'questioning' | 'submitting' | 'completed' | 'error';
  resumeFileName: string | null;
  errorMessage: string | null;
  processingUpdates: string[];
  currentQuestionIndex: number;
  createdProfile: any | null;
  isAwaitingAnswer: boolean;
}

@injectable()
export class OSTOnboardingViewModel {
  @observable state: OSTOnboardingState = {
    step: 'idle',
    resumeFile: undefined,
    resumeFileName: undefined,
    jobField: undefined,
    questions: [],
    currentQuestionIndex: -1, // Start at -1 until questions are loaded
    processingUpdates: [],
    errorMessage: undefined,
    createdProfile: undefined,
    isModalOpen: false,
    isAwaitingAnswer: false,
  };

  @observable chatMessages: ChatMessage[] = [];

  private disconnectWebSocket: (() => void) | null = null;
  private isWebSocketConnected: boolean = false; // Track connection status
  private currentSessionId: string | null = null;
  private currentVariableBeingAnswered: string | null = null; // Track variable for follow-ups
  private variableToQuestionMap: Record<string, string> = {};

  // Add reasoning properties
  @observable public reasoningActive: boolean = false;
  @observable public reasoningSteps: ReasoningStep[] = [];
  @observable public reasoningResult: ReasoningResult | null = null;
  @observable public reasoningError: string | null = null;

  constructor(
    @inject(SERVICE_IDENTIFIERS.OSTService) private ostService: IOSTService,
    @inject(SERVICE_IDENTIFIERS.ReasoningService) private reasoningService: ReasoningService
  ) {
    makeObservable(this);
    this.resetState();
    
    // Set up event handlers for reasoning service
    this.reasoningService.setEventHandlers({
      onReasoningStep: this.handleReasoningStep.bind(this),
      onReasoningComplete: this.handleReasoningComplete.bind(this),
      onError: this.handleReasoningError.bind(this)
    });
  }

  @action
  openModal = () => {
    console.log("Opening OST onboarding modal");
    this.state.isModalOpen = true;
    this.resetState();
    this.addChatMessage({
      id: uuidv4(),
      sender: 'ai',
      text: 'Welcome! To help optimize your job search, please upload your resume (PDF).',
      timestamp: new Date()
    });
    this.state.step = 'idle';
    this.state.isAwaitingAnswer = false;
  }

  @action
  closeModal = () => {
    this.state.isModalOpen = false;
    this.closeWebSocketConnection();
    this.resetState(); // Reset state fully on close
    this.stopReasoning();
  }

  @action
  private closeWebSocketConnection = () => {
    if (this.disconnectWebSocket) {
      this.disconnectWebSocket();
      this.disconnectWebSocket = null;
    }
    this.isWebSocketConnected = false;
  }

  @action
  resetState = () => {
    this.state = {
      step: 'idle',
      resumeFile: undefined,
      resumeFileName: undefined,
      jobField: undefined,
      questions: [],
      currentQuestionIndex: -1,
      processingUpdates: [],
      errorMessage: undefined,
      createdProfile: undefined,
      isModalOpen: this.state.isModalOpen, // Retain modal open state
      isAwaitingAnswer: false,
    };
    this.chatMessages = [];
    this.currentSessionId = null;
    this.currentVariableBeingAnswered = null;
    this.variableToQuestionMap = {};
    this.closeWebSocketConnection();
    this.reasoningActive = false;
    this.reasoningSteps = [];
    this.reasoningResult = null;
    this.reasoningError = null;
  }

  @action
  setResumeFile = (file: File | null) => {
    if (this.state.step !== 'idle') return; // Only allow upload in idle state

    if (file && file.type === 'application/pdf') {
      this.state.resumeFile = file;
      this.state.resumeFileName = file.name;
      this.state.errorMessage = undefined;
      this.addChatMessage({
        id: uuidv4(),
        sender: 'system',
        text: `Selected resume: ${file.name}`,
        timestamp: new Date()
      });
      this.startResumeProcessing(file);
    } else {
      this.state.resumeFile = undefined;
      this.state.resumeFileName = undefined;
      this.state.errorMessage = 'Please select a valid PDF file.';
      this.addChatMessage({
        id: uuidv4(),
        sender: 'system',
        text: 'Invalid file type. Please upload a PDF.',
        timestamp: new Date()
      });
    }
  }

  @action
  private startResumeProcessing = async (file: File) => {
    this.state.step = 'uploading';
    this.addChatMessage({
      id: uuidv4(),
      sender: 'ai',
      text: 'Connecting to analysis service...',
      timestamp: new Date()
    });

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Content = (reader.result as string).split(',')[1];
        const requestData = { type: "start_with_resume", file_content: base64Content, file_name: file.name };

        // Close existing WebSocket if open
        this.closeWebSocketConnection();

        // Establish WebSocket connection
        this.currentSessionId = uuidv4(); // Generate unique session ID
        this.disconnectWebSocket = this.ostService.connectResumeProcessingSocket(
          this.currentSessionId,
          this.handleWebSocketMessage,
          this.handleWebSocketError,
          this.handleWebSocketClose
        );
        
        // Mark as connected (will be confirmed in onOpen handler in the service)
        this.isWebSocketConnected = true;

        // Send start message with resume data via WebSocket
        // Small delay to increase chance socket is open
        setTimeout(() => {
            try {
                this.ostService.sendResumeDataViaSocket(requestData);
                this.updateStep('analyzing');
                this.addChatMessage({
                  id: uuidv4(),
                  sender: 'system',
                  text: 'Resume sent for analysis.',
                  timestamp: new Date()
                });
            } catch (error) {
                console.error("Error sending resume data:", error);
                this.handleConnectionError('Failed to establish analysis connection.');
            }
        }, 500); 
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        this.handleConnectionError('Error reading resume file.');
      };
    } catch (error: any) {
      console.error("Error preparing resume for upload:", error);
      this.handleConnectionError(`Error processing resume: ${error.message}`);
    }
  }

  @action
  private updateStep = (step: string) => {
    this.state.step = step;
  }

  @action
  private handleConnectionError = (errorMessage: string) => {
    this.state.step = 'error';
    this.state.errorMessage = errorMessage;
    this.addChatMessage({
      id: uuidv4(),
      sender: 'system',
      text: `Error: ${errorMessage}`,
      timestamp: new Date()
    });
    this.closeWebSocketConnection();
  }

  @action
  private handleWebSocketMessage = (update: ResumeProcessingUpdate) => {
    try {
      console.log('Received WebSocket message:', update);

      if (!update.type) {
        console.error('Received message without type:', update);
        return;
      }

      switch (update.type) {
        case 'status':
          // Status updates during resume processing and other operations
          this.updateStep('processing');
          this.state.processingUpdates.push(update.message);
          
          // Disable input during processing steps
          this.state.isAwaitingAnswer = false;
          
          console.log(`Status update: ${update.message}`);
          break;

        case 'analysis_complete':
          // Resume analysis is complete, we have job field and questions
          if (update.job_field && update.questions) {
            this.updateJobFieldAndQuestions(update.job_field, update.questions);
            this.addChatMessage({
              id: uuidv4(),
              sender: 'ai',
              text: `I see you're interested in ${update.job_field}. Let me ask you a few questions to complete your profile.`,
              timestamp: new Date()
            });
          } else {
            console.error('Received analysis_complete without job_field or questions:', update);
            this.handleConnectionError('Resume analysis failed. Please try again.');
          }
          break;

        case 'next_question':
          // Moving to a new question
          if (update.variable && (update.question_text || update.question)) {
            this.handleNextQuestion(update.variable, update.question_text || update.question);
          } else {
            console.error('Received next_question without variable or question text:', update);
          }
          break;

        case 'followup_question':
          // Asking for clarification on the same variable
          if (update.variable && (update.question_text || update.question)) {
            this.handleFollowupQuestion(update.variable, update.question_text || update.question);
          } else {
            console.error('Received followup_question without variable or question text:', update);
          }
          break;

        case 'interpretation_result':
          // Backend is telling us how it interpreted an answer
          if (update.variable && update.interpreted_value !== undefined) {
            // Store the response in our questions array
            const questionIndex = this.state.questions.findIndex(q => q.variable === update.variable);
            if (questionIndex !== -1) {
              this.state.questions[questionIndex].response = update.interpreted_value;
            }
            
            // Check for low confidence - we should expect a follow-up if confidence is low
            // Usually the backend will send a followup_question right after this message
            if (update.confidence !== undefined && update.confidence < 0.7) {
              // Include reasoning if available
              let message = `I understood that as: "${update.interpreted_value}" (low confidence)`;
              if (update.reasoning) {
                message += `\nReasoning: ${update.reasoning}`;
              }
              this.addChatMessage({
                id: uuidv4(),
                sender: 'system',
                text: message,
                timestamp: new Date()
              });
              console.log(`Low confidence (${update.confidence}) for ${update.variable}: ${update.interpreted_value}`);
            } else {
              // High confidence - show interpretation if needed for complex values
              if (typeof update.interpreted_value === 'object' || 
                  update.interpreted_value.toString().length > 30) {
                this.addChatMessage({
                  id: uuidv4(),
                  sender: 'system',
                  text: `Understood: ${JSON.stringify(update.interpreted_value)}`,
                  timestamp: new Date()
                });
              } else if (update.reasoning) {
                // Show reasoning for high confidence responses too
                const interpretedValue = update.variable === 'min_salary' && !isNaN(update.interpreted_value) 
                  ? this.formatCurrency(update.interpreted_value)
                  : update.interpreted_value;
                this.addChatMessage({
                  id: uuidv4(),
                  sender: 'system',
                  text: `I understood your answer as: ${interpretedValue}\nReasoning: ${update.reasoning}`,
                  timestamp: new Date()
                });
              }
              console.log(`Interpreted ${update.variable} as: ${update.interpreted_value} (confidence: ${update.confidence})`);
            }
          } else {
            console.error('Received interpretation_result without variable or interpreted_value:', update);
          }
          break;

        case 'profile_created':
          // Final step - profile has been created
          if (update.profile) {
            this.handleProfileCreated(update.profile);
          } else {
            console.error('Received profile_created without profile data:', update);
          }
          break;

        case 'error':
          // Error from the server
          const errorMessage = update.message || 'An error occurred during processing';
          this.handleConnectionError(errorMessage);
          break;

        default:
          console.warn(`Unknown message type: ${update.type}`, update);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.handleConnectionError('Failed to process server message');
    }
  }

  @action
  private updateJobFieldAndQuestions = (jobField: string, questions: any[]) => {
    // Store job field and all available questions
    this.state.jobField = jobField;
    this.state.questions = questions.map((q: any) => ({ ...q, response: undefined }));
    
    // Create a mapping of variable names to questions for easier lookup
    this.variableToQuestionMap = questions.reduce((map, q) => {
      map[q.variable] = q.question;
      return map;
    }, {} as Record<string, string>);
    
    // Clear any previous processing updates
    this.state.processingUpdates = []; 
    
    // Debug info
    console.log(`Job field set to ${jobField}, received ${questions.length} questions`);
  }

  @action
  private handleNextQuestion = (variable: string, questionText: string) => {
    // Moving to a new question - this happens after completing the previous question
    // or when starting the first question
    
    this.updateStep('questioning');
    
    // Track which variable we're answering now (used when submitting the answer)
    this.currentVariableBeingAnswered = variable;
    
    // Find and update the current question index
    const questionIndex = this.state.questions.findIndex(q => q.variable === variable);
    if (questionIndex !== -1) {
      this.state.currentQuestionIndex = questionIndex;
    } else {
      console.warn(`Question for variable ${variable} not found in questions array`);
    }
    
    // Show the question to the user
    this.addChatMessage({
      id: uuidv4(),
      sender: 'ai',
      text: questionText,
      timestamp: new Date()
    });
    
    // Enable the input field for the user to answer
    this.state.isAwaitingAnswer = true;
    
    console.log(`Now asking question about ${variable}: ${questionText}`);
  }

  @action
  private handleFollowupQuestion = (variable: string, questionText: string) => {
    // We're asking a follow-up about the same variable (confidence was too low)
    this.updateStep('questioning');
    
    // Same variable as before (should match this.currentVariableBeingAnswered)
    // If they don't match, something's wrong with the backend state
    if (variable !== this.currentVariableBeingAnswered) {
      console.warn(`Follow-up question variable (${variable}) doesn't match current variable (${this.currentVariableBeingAnswered})`);
      this.currentVariableBeingAnswered = variable;
    }
    
    // Display the follow-up with an indicator that it's a follow-up
    this.addChatMessage({
      id: uuidv4(),
      sender: 'ai',
      text: `(Follow-up) ${questionText}`,
      timestamp: new Date()
    });
    
    // Enable input for user to provide a better answer
    this.state.isAwaitingAnswer = true;
    
    console.log(`Asking follow-up about ${variable}: ${questionText}`);
  }

  @action
  private handleProfileCreated = (profile: any) => {
    // The backend has created a profile from all the answers
    this.updateStep('completed');
    
    // Store the created profile
    this.state.createdProfile = profile;
    
    // Show success message with the user ID
    this.addChatMessage({
      id: uuidv4(),
      sender: 'ai',
      text: `✅ Profile created successfully! Your User ID is: ${profile.user_id}`,
      timestamp: new Date()
    });
    this.addChatMessage({
      id: uuidv4(),
      sender: 'ai',
      text: `You can use this ID for job evaluations in the future.`,
      timestamp: new Date()
    });
    
    // Display preference summary
    if (profile.preferences) {
      const preferences = Object.entries(profile.preferences)
        .filter(([key]) => !['user_id', 'field', '_id'].includes(key))
        .map(([key, value]) => `${key}: ${value}`);
      
      if (preferences.length > 0) {
        this.addChatMessage({
          id: uuidv4(),
          sender: 'system',
          text: `Preferences saved:\n${preferences.join('\n')}`,
          timestamp: new Date()
        });
      }
    }
    
    // Disable input - we're done
    this.state.isAwaitingAnswer = false;
    
    // Close WebSocket connection
    this.closeWebSocketConnection();
    
    console.log(`Profile created with ID ${profile.user_id} for field ${profile.job_field}`);
  }

  @action
  private handleWebSocketError = (error: Event) => {
    console.error("WebSocket Error:", error);
    // Avoid setting state if modal is already closed or process completed/errored
    if (this.state.isModalOpen && this.state.step !== 'completed' && this.state.step !== 'error') {
      this.state.step = 'error';
      this.state.errorMessage = 'WebSocket connection error.';
      this.addChatMessage({
        id: uuidv4(),
        sender: 'system',
        text: `Error: ${this.state.errorMessage}`,
        timestamp: new Date()
      });
      this.state.isAwaitingAnswer = false;
    }
    this.isWebSocketConnected = false;
    this.disconnectWebSocket = null; // Ensure disconnect function is cleared
  }
  
  @action
  private handleWebSocketClose = () => {
      console.log("WebSocket connection closed.");
       // Avoid setting state if modal is already closed or process completed/errored
       if (this.state.isModalOpen && this.state.step !== 'completed' && this.state.step !== 'error') {
          this.state.step = 'error';
          this.state.errorMessage = 'Connection closed unexpectedly.';
          this.addChatMessage({
            id: uuidv4(),
            sender: 'system',
            text: `Error: ${this.state.errorMessage}`,
            timestamp: new Date()
          });
          this.state.isAwaitingAnswer = false;
       }
      this.isWebSocketConnected = false;
      this.disconnectWebSocket = null; // Ensure disconnect function is cleared
  }

  /**
   * Add a chat message to the conversation
   */
  @action
  public addChatMessage(message: ChatMessage): void {
    this.chatMessages.push(message);
  }

  @action
  submitAnswer = (answer: string) => {
    if (!this.isWebSocketConnected || !this.state.isAwaitingAnswer) {
      console.warn('Cannot submit answer: either WebSocket is not connected or not awaiting an answer');
      return;
    }

    // Show the user's message in chat
    this.addChatMessage({
      id: uuidv4(),
      sender: 'user',
      text: answer,
      timestamp: new Date()
    });
    console.log(`Submitting answer for variable: ${this.currentVariableBeingAnswered}`);

    // Prepare message for backend
    const message = {
      type: 'answer',
      variable: this.currentVariableBeingAnswered,
      answer_text: answer
    };

    // Send answer to backend
    try {
      this.ostService.sendResumeDataViaSocket(message);
      
      // Disable input until the next question arrives
      this.state.isAwaitingAnswer = false;
      
      // Add to conversation history for context
      if (this.state.currentQuestionIndex >= 0) {
        const currentQuestion = this.state.questions[this.state.currentQuestionIndex];
        if (currentQuestion) {
          // Store the raw answer text temporarily, will be updated by interpretation_result
          currentQuestion.response = answer;
        }
      }
    } catch (error) {
      console.error('Error sending answer via WebSocket:', error);
      this.handleConnectionError('Failed to send your answer. Please try again.');
    }
  }

  @computed
  get currentQuestion(): UserPreference | null {
    // This computed property might be less relevant now as the backend drives the questions
    if (this.state.step === 'questioning' && this.state.currentQuestionIndex >= 0 && this.state.currentQuestionIndex < this.state.questions.length) {
      return this.state.questions[this.state.currentQuestionIndex];
    }
    return null;
  }

  private formatCurrency(value: number): string {
    try {
      // Format as currency based on likely locale
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        maximumFractionDigits: 0 
      }).format(value);
    } catch (error) {
      // Fallback to basic formatting if Intl API fails
      return `$${value.toLocaleString()}`;
    }
  }

  /**
   * Start a reasoning session with the ReAct reasoner
   */
  @action
  public async startReasoning(query: string): Promise<void> {
    this.reasoningActive = true;
    this.reasoningSteps = [];
    this.reasoningResult = null;
    this.reasoningError = null;
    
    try {
      // Connect to the reasoning service if not already connected
      if (!this.reasoningService.isConnected()) {
        await this.reasoningService.connect();
      }
      
      // Add a user message to the chat
      this.addChatMessage({
        id: uuidv4(),
        sender: 'user',
        text: query,
        timestamp: new Date()
      });
      
      // Add a system message about thinking
      this.addChatMessage({
        id: uuidv4(),
        sender: 'system',
        text: "I'm thinking about this step by step...",
        timestamp: new Date()
      });
      
      // Send the query to the reasoning service
      this.reasoningService.sendQuery(query, "You are an AI assistant helping with job search questions.");
      
    } catch (error) {
      console.error('Failed to start reasoning:', error);
      this.reasoningActive = false;
      this.reasoningError = 'Failed to connect to reasoning service';
      
      // Add error message to chat
      this.addChatMessage({
        id: uuidv4(),
        sender: 'system',
        text: `Error: ${this.reasoningError}`,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Handle a reasoning step update from the ReAct reasoner
   */
  @action
  private handleReasoningStep(step: ReasoningStep): void {
    // Add the step to our collection
    this.reasoningSteps.push(step);
    
    // For non-final steps, update the "thinking" message with the step information
    if (!step.is_final && this.chatMessages.length > 0) {
      const lastSystemMessage = [...this.chatMessages].reverse()
        .find(msg => msg.sender === 'system' && msg.text.includes("I'm thinking"));
      
      if (lastSystemMessage) {
        // Update the last system message with the current thought
        lastSystemMessage.text = `Thought: ${step.thought}\n\n` +
          `Action: ${step.action.name}\n` +
          `Observation: ${step.observation}`;
      }
    }
  }
  
  /**
   * Handle reasoning completion from the ReAct reasoner
   */
  @action
  private handleReasoningComplete(result: ReasoningResult): void {
    this.reasoningActive = false;
    this.reasoningResult = result;
    
    // Add the answer to the chat as an AI message
    if (result.answer) {
      this.addChatMessage({
        id: uuidv4(),
        sender: 'ai',
        text: result.answer,
        timestamp: new Date()
      });
    } else {
      this.addChatMessage({
        id: uuidv4(),
        sender: 'ai',
        text: "I'm sorry, I couldn't find a clear answer to your question.",
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Handle reasoning error from the ReAct reasoner
   */
  @action
  private handleReasoningError(error: string): void {
    this.reasoningActive = false;
    this.reasoningError = error;
    
    // Add error message to chat
    this.addChatMessage({
      id: uuidv4(),
      sender: 'system',
      text: `Error during reasoning: ${error}`,
      timestamp: new Date()
    });
  }
  
  /**
   * Stop reasoning and clean up
   */
  @action
  public stopReasoning(): void {
    this.reasoningActive = false;
    this.reasoningService.close();
  }
} 