import smtplib

EMAIL_ADDRESS = "donotreply@trackwise.pro"
EMAIL_PASSWORD = "2TipztBDRM5j"

with smtplib.SMTP("smtp.zoho.eu", 587) as server:
    server.starttls()
    server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
    print("Login successful!")
