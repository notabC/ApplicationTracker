export interface IAuthService {
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
  isAuthenticating: boolean;
  checkAuthentication(): Promise<void>;
  authenticate(): Promise<boolean>;
  signOut(): Promise<void>;
}
