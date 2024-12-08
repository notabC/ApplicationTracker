// src/domain/models/AuthModel.ts
import { makeAutoObservable } from 'mobx';
import type { IAuthService } from '@/core/interfaces/auth/IAuthService';

export class AuthModel {
  isLoading = false;
  error: string | null = null;

  constructor(private authService: IAuthService) {
    makeAutoObservable(this);
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  async authenticate(): Promise<void> {
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

  async signOut(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    try {
      await this.authService.signOut();
    } catch {
      this.error = 'An error occurred during sign out';
    } finally {
      this.isLoading = false;
    }
  }
}