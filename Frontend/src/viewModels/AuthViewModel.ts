// src/presentation/viewModels/AuthViewModel.ts
import { makeAutoObservable } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/di/container';
import type { IAuthService } from '@/domain/interfaces/IAuthService';
import { AuthModel } from '@/domain/models/AuthModel';

@injectable()
export class AuthViewModel {
  private model: AuthModel;
  privacyAccepted = false;

  constructor(
    @inject(SERVICE_IDENTIFIERS.AuthService) private authService: IAuthService
  ) {
    // Create the model instance directly without DI injection
    this.model = new AuthModel(this.authService);
    makeAutoObservable(this);
  }

  get isLoading(): boolean {
    return this.model.isLoading;
  }

  get error(): string | null {
    return this.model.error;
  }

  get isAuthenticated(): boolean {
    return this.model.isAuthenticated;
  }

  get canSignIn(): boolean {
    return this.privacyAccepted && !this.model.isLoading;
  }

  setPrivacyAccepted(accepted: boolean): void {
    this.privacyAccepted = accepted;
  }

  async authenticate(): Promise<void> {
    if (!this.privacyAccepted) {
      // Additional UI-level logic: user must accept privacy before signing in
      this.model.error = 'You must accept the privacy policy before signing in.';
      return;
    }

    await this.model.authenticate();
  }

  async signOut(): Promise<void> {
    await this.model.signOut();
  }
}