// src/presentation/viewModels/WaitlistViewModel.ts
import { makeAutoObservable } from 'mobx';
import { WaitlistModel } from '@/domain/models/WaitlistModel';

export class WaitlistViewModel {
  email: string = '';
  isLoading: boolean = false;
  isFormVisible: boolean = false;
  error: string | null = null;

  private waitlistModel: WaitlistModel;

  constructor() {
    this.waitlistModel = new WaitlistModel();
    makeAutoObservable(this);
  }

  /**
   * Toggles the visibility of the waitlist form.
   */
  toggleFormVisibility(): void {
    this.isFormVisible = !this.isFormVisible;
  }

  /**
   * Handles email input changes.
   * @param email The updated email.
   */
  setEmail(email: string): void {
    this.email = email;
  }

  /**
   * Submits the email to the webhook.
   */
  async submit(): Promise<void> {
    if (!this.email) {
      this.error = 'Email is required.';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      await this.waitlistModel.sendEmailToWebhook(this.email);
      this.email = '';
      this.isFormVisible = false;
    } catch (err) {
      console.error('Error sending email:', err);
      this.error = 'Failed to join the waitlist. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
