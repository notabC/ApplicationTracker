// src/viewModels/ResetPasswordViewModel.ts
import { makeAutoObservable, runInAction } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/di/container';
import { AuthService } from '@/infrastructure/services/AuthService';

@injectable()
export class ResetPasswordViewModel {
  resetToken = '';
  newPassword = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    @inject(SERVICE_IDENTIFIERS.AuthService) private authService: AuthService,
  ) {
    makeAutoObservable(this);
  }

  setResetToken(value: string) {
    this.resetToken = value;
  }

  setNewPassword(value: string) {
    this.newPassword = value;
  }

  async submit() {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    const success = await this.authService.resetPassword(this.resetToken, this.newPassword);
    runInAction(() => {
      this.isLoading = false;
      if (success) {
        this.successMessage = 'Password has been reset successfully. Please log in with your new password.';
      } else {
        this.errorMessage = 'Unable to reset password. Invalid or expired token.';
      }
    });
  }
}