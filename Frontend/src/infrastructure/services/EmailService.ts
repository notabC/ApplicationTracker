// src/core/services/EmailService.ts
import { injectable } from "inversify";
import { Email, IEmailService } from "../../domain/interfaces/IEmailService";
import { makeObservable, observable, action } from 'mobx';
import { ApiClient } from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

@injectable()
export class EmailService implements IEmailService {
  @observable
  private emails: Email[] = [];

  constructor() {
    makeObservable(this);
    this.loadEmails();
  }

  @action
  private async loadEmails(): Promise<void> {
    try {
      this.emails = await ApiClient.get<Email[]>(API_ENDPOINTS.EMAIL.BASE);
    } catch (error) {
      console.error('Failed to load emails:', error);
      this.emails = [];
    }
  }

  @action
  async getEmails(): Promise<Email[]> {
    await this.loadEmails();
    return this.emails;
  }

  @action
  async addEmails(emails: Email[]): Promise<void> {
    const createdEmails = await Promise.all(
      emails.map(email => ApiClient.post<Email>(API_ENDPOINTS.EMAIL.BASE, email))
    );
    this.emails.push(...createdEmails);
  }

  @action
  async markAsProcessed(emailIds: string[]): Promise<void> {
    await ApiClient.post(API_ENDPOINTS.EMAIL.PROCESS, { email_ids: emailIds });
    this.emails = this.emails.map(email => ({
      ...email,
      processed: email.processed || emailIds.includes(email.id)
    }));
  }

  @action
  async resetAllEmails(): Promise<void> {
    try {
      // POST /api/emails/reset/all
      await ApiClient.delete(API_ENDPOINTS.EMAIL.RESET);
      this.emails = []; // Clear in-memory emails if desired
    } catch (error) {
      console.error('Failed to reset emails:', error);
      throw error;
    }
  }
}