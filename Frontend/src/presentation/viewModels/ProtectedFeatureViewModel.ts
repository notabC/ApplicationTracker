// src/presentation/viewModels/ProtectedFeatureViewModel.ts
import { injectable, inject } from 'inversify';
import { makeAutoObservable } from 'mobx';
import type { IAuthService } from '../../core/interfaces/auth/IAuthService';
import { SERVICE_IDENTIFIERS } from '../../core/constants/identifiers';

@injectable()
export class ProtectedFeatureViewModel {
  showAuthModal = false;

  constructor(
    @inject(SERVICE_IDENTIFIERS.AuthService)
    private authService: IAuthService
  ) {
    makeAutoObservable(this);
    this.checkAuth();
  }

  private checkAuth() {
    if (!this.authService.isAuthenticated) {
      this.showAuthModal = true;
    }
  }

  closeAuthModal() {
    this.showAuthModal = false;
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated;
  }

  get isAuthenticating() {
    return this.authService.isAuthenticating;
  }
}