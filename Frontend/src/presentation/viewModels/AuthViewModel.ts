// src/presentation/viewModels/AuthViewModel.ts
import { inject, injectable } from 'inversify';
import { makeAutoObservable } from 'mobx';
import type { IAuthService } from '../../core/interfaces/auth/IAuthService';
import { SERVICE_IDENTIFIERS } from '@/di/container';

@injectable()
export class AuthViewModel {
  isLoading = false;
  error: string | null = null;

  constructor(
    @inject(SERVICE_IDENTIFIERS.AuthService) private authService: IAuthService
  ) {
    makeAutoObservable(this);
  }

  async authenticate() {
    this.isLoading = true;
    this.error = null;

    try {
      const success = await this.authService.authenticate();
      if (!success) {
        this.error = 'Authentication failed';
      }
    } catch {
      this.error = 'An error occurred during authentication';
    } finally {
      this.isLoading = false;
    }
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated;
  }

  async signOut() {
    this.isLoading = true;
    try {
      this.authService.signOut();
    } catch {
      this.error = 'An error occurred during sign out';
    } finally {
      this.isLoading = false;
    }
  }
}
