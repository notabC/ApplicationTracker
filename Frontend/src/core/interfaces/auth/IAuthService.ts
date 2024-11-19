export interface IAuthService {
    isAuthenticated: boolean;
    userEmail: string | null;
    isAuthenticating: boolean;
    checkAuthentication(): Promise<void>;
    authenticate(): Promise<boolean>;
    signOut(): void;
  }