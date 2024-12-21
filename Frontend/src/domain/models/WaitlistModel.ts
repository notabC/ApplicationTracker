// src/domain/models/WaitlistModel.ts
export class WaitlistModel {
    private webhookUrl: string | undefined;
  
    constructor() {
      this.webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
    }
  
    /**
     * Sends an email to the webhook.
     * @param email The email address to send.
     */
    async sendEmailToWebhook(email: string): Promise<void> {
      if (!this.webhookUrl) {
        throw new Error('Webhook URL is not configured.');
      }
  
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: email }),
      });
    }
  }
  