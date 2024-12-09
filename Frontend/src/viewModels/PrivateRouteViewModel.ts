// src/presentation/viewModels/PrivateRouteViewModel.ts
import { makeAutoObservable, runInAction } from 'mobx';
import { AuthService } from '@/core/services/AuthService';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/di/container';

@injectable()
export class PrivateRouteViewModel {
  isLoading = true;
  isAuthenticated = false;
  private authChecked = false;

  constructor(
    @inject(SERVICE_IDENTIFIERS.AuthService) private authService: AuthService,
  ) {
    makeAutoObservable(this);
  }

  async initialize() {
    if (!this.authChecked) {
      await this.checkAuth();
    }
  }

  private async checkAuth() {
    this.isLoading = true;
    try {
      await this.authService.checkAuthentication();
      runInAction(() => {
        this.isAuthenticated = this.authService.isAuthenticated;
        this.authChecked = true;
      });
    } catch (error) {
      console.error('Authentication check failed:', error);
      runInAction(() => {
        this.authService.isAuthenticated = false;
        this.isAuthenticated = false;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}
