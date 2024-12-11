// src/presentation/viewModels/PrivateRouteViewModel.ts
import { makeAutoObservable, runInAction } from 'mobx';
import { AuthService } from '@/infrastructure/services/AuthService';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/di/container';

@injectable()
export class PrivateRouteViewModel {
  isLoading = true;
  isAuthenticated = false;
  private authChecked = false;

  // Form fields moved into VM
  showRegister = false;
  loginEmail = '';
  loginPassword = '';
  registerName = '';
  registerEmail = '';
  registerPassword = '';

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

  // Methods for toggling and setting form fields
  setShowRegister(value: boolean) {
    this.showRegister = value;
  }

  setLoginEmail(value: string) {
    this.loginEmail = value;
  }

  setLoginPassword(value: string) {
    this.loginPassword = value;
  }

  setRegisterName(value: string) {
    this.registerName = value;
  }

  setRegisterEmail(value: string) {
    this.registerEmail = value;
  }

  setRegisterPassword(value: string) {
    this.registerPassword = value;
  }

  async login(): Promise<boolean> {
    const success = await this.authService.login(this.loginEmail, this.loginPassword);
    if (success) {
      await this.authService.checkAuthentication();
      runInAction(() => {
        this.isAuthenticated = this.authService.isAuthenticated;
      });
    }
    return success && this.authService.isAuthenticated;
  }

  async register(): Promise<boolean> {
    const success = await this.authService.register(this.registerEmail, this.registerPassword, this.registerName);
    return success;
  }

  async signOut() {
    await this.authService.signOut();
    runInAction(() => {
      this.isAuthenticated = false;
    });
  }

  // Optionally a method to reset form fields after successful actions
  resetFormFields() {
    this.loginEmail = '';
    this.loginPassword = '';
    this.registerName = '';
    this.registerEmail = '';
    this.registerPassword = '';
  }
}