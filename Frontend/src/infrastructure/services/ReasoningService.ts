
/**
 * Types for reasoning service interactions
 */
export interface ReasoningStep {
  iteration: number;
  thought: string;
  action: {
    name: string;
    input: any;
  };
  observation: string;
  is_final: boolean;
  error?: string;
}

export interface ReasoningResult {
  answer: string;
  iterations: number;
  stopping_reason: string;
}

export interface ReasoningMessage {
  type: string;
  session_id?: string;
  message?: string;
  step?: ReasoningStep;
  result?: ReasoningResult;
  error?: string;
  count?: number;
}

export interface ReasoningServiceEventHandlers {
  onSessionCreated?: (sessionId: string) => void;
  onProcessing?: (message: string) => void;
  onReasoningStep?: (step: ReasoningStep) => void;
  onReasoningComplete?: (result: ReasoningResult) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

/**
 * Service for interacting with the ReAct reasoning backend via WebSocket
 */
export class ReasoningService {
  private socket: WebSocket | null = null;
  private sessionId: string | null = null;
  private eventHandlers: ReasoningServiceEventHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  
  /**
   * Check if the service is connected to the WebSocket
   */
  public isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN && !!this.sessionId;
  }
  
  /**
   * Connect to the reasoning WebSocket API
   */
  public connect(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws');
        const wsUrl = `${baseUrl}/reasoning/ws/reasoning`;
        
        console.log(`Connecting to reasoning WebSocket at: ${wsUrl}`);
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
          console.log('Reasoning WebSocket connection established');
        };
        
        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        
        this.socket.onerror = (error) => {
          console.error('Reasoning WebSocket error:', error);
          this.handleError('WebSocket connection error');
          reject(error);
        };
        
        this.socket.onclose = () => {
          console.log('Reasoning WebSocket connection closed');
          this.sessionId = null;
          if (this.eventHandlers.onClose) {
            this.eventHandlers.onClose();
          }
          
          // Attempt to reconnect
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
              this.connect()
                .then(sessionId => {
                  console.log(`Reconnected with session ID: ${sessionId}`);
                })
                .catch(error => {
                  console.error('Failed to reconnect:', error);
                });
            }, 2000 * this.reconnectAttempts);
          }
        };
        
        // Set a timeout for the initial connection
        const connectionTimeout = setTimeout(() => {
          if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);
        
        // Wait for the session ID before resolving
        this.eventHandlers.onSessionCreated = (sessionId) => {
          clearTimeout(connectionTimeout);
          this.reconnectAttempts = 0;
          resolve(sessionId);
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Send a reasoning query to the server
   */
  public sendQuery(query: string, context: string = ''): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.handleError('WebSocket not connected');
      return;
    }
    
    if (!this.sessionId) {
      this.handleError('No active session');
      return;
    }
    
    const message = {
      type: 'query',
      session_id: this.sessionId,
      query,
      context
    };
    
    this.socket.send(JSON.stringify(message));
  }
  
  /**
   * Close the WebSocket connection
   */
  public close(): void {
    if (this.socket) {
      const message = {
        type: 'close',
        session_id: this.sessionId
      };
      
      try {
        this.socket.send(JSON.stringify(message));
      } catch (e) {
        console.warn('Error sending close message:', e);
      }
      
      this.socket.close();
      this.socket = null;
      this.sessionId = null;
    }
  }
  
  /**
   * Set event handlers for WebSocket events
   */
  public setEventHandlers(handlers: ReasoningServiceEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }
  
  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const message: ReasoningMessage = JSON.parse(data);
      
      switch (message.type) {
        case 'session_created':
          if (message.session_id) {
            this.sessionId = message.session_id;
            console.log(`Reasoning session created: ${this.sessionId}`);
            if (this.eventHandlers.onSessionCreated) {
              this.eventHandlers.onSessionCreated(this.sessionId);
            }
          }
          break;
          
        case 'processing':
          if (message.message && this.eventHandlers.onProcessing) {
            this.eventHandlers.onProcessing(message.message);
          }
          break;
          
        case 'reasoning_step':
          if (message.step && this.eventHandlers.onReasoningStep) {
            this.eventHandlers.onReasoningStep(message.step);
          }
          break;
          
        case 'reasoning_complete':
          if (message.result && this.eventHandlers.onReasoningComplete) {
            this.eventHandlers.onReasoningComplete(message.result);
          }
          break;
          
        case 'error':
          if (message.error) {
            this.handleError(message.error);
          }
          break;
          
        case 'session_closed':
          console.log(`Reasoning session closed: ${message.session_id}`);
          this.sessionId = null;
          if (this.eventHandlers.onClose) {
            this.eventHandlers.onClose();
          }
          break;
          
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      this.handleError('Failed to parse server message');
    }
  }
  
  /**
   * Handle errors from the WebSocket or server
   */
  private handleError(error: string): void {
    console.error('Reasoning service error:', error);
    if (this.eventHandlers.onError) {
      this.eventHandlers.onError(error);
    }
  }
} 