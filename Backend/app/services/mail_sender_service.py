# app/services/mail_sender_service.py

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

class MailSenderService:
    @staticmethod
    def send_email(to_address: str, subject: str, body: str):
        if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
            raise ValueError("Email credentials not set")

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = to_address

        text_part = MIMEText(body, "plain")
        msg.attach(text_part)

        # Using smtp.zoho.eu with TLS on port 587 as tested successfully
        with smtplib.SMTP("smtp.zoho.eu", 587) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)

    @staticmethod
    def send_password_reset_email(to_address: str, reset_token: str):
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        reset_link = f"{frontend_url}/reset-password?reset_token={reset_token}"
        subject = "Password Reset Request"
        body = (
            f"Hello,\n\nWe received a request to reset your password. "
            f"Click the link below to reset:\n{reset_link}\n\n"
            f"If you didn't request this, please ignore this email."
        )
        MailSenderService.send_email(to_address, subject, body)
