import time
import random
import os
import smtplib
from email.message import EmailMessage

OTP_STORE = {}
OTP_EXPIRY_SECONDS = 300  # 5 minutes
OTP_RESEND_DELAY_SECONDS = 120  # 2 minutes
PASSWORD_RESET_STORE = {}

def generate_otp():
    return f"{random.randint(0, 999999):06d}"

def send_real_email(to_email, otp):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM_EMAIL")

    if not smtp_host or not smtp_user or not smtp_pass or not smtp_from:
        print(f"SMTP not fully configured. Cannot send email to {to_email}. OTP is: {otp}")
        return False
        
    try:
        msg = EmailMessage()
        msg['Subject'] = 'Your OTP for AutomateLearn Registration'
        msg['From'] = smtp_from
        msg['To'] = to_email
        msg.set_content(f"Your OTP code is: {otp}\n\nThis code will expire in 5 minutes.")

        with smtplib.SMTP(str(smtp_host), int(smtp_port)) as server:
            server.starttls()
            server.login(str(smtp_user), str(smtp_pass))
            server.send_message(msg)
            print(f"Successfully sent OTP email to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_email_with_subject(to_email, subject, message):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM_EMAIL")

    if not smtp_host or not smtp_user or not smtp_pass or not smtp_from:
        print(f"SMTP not fully configured. Cannot send email to {to_email}. Message: {message}")
        return False

    try:
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = smtp_from
        msg['To'] = to_email
        msg.set_content(message)

        with smtplib.SMTP(str(smtp_host), int(smtp_port)) as server:
            server.starttls()
            server.login(str(smtp_user), str(smtp_pass))
            server.send_message(msg)
            print(f"Successfully sent email to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_otp(email, user_details):
    otp = generate_otp()
    OTP_STORE[email] = {
        'otp': otp,
        'expires_at': time.time() + OTP_EXPIRY_SECONDS,
        'user_details': user_details
    }
    
    # Send actual email
    send_real_email(email, otp)
    
    return True

def resend_otp(email):
    record = OTP_STORE.get(email)
    if not record:
        return False, "Registration session expired or does not exist."
    
    user_details = record['user_details']
    return send_otp(email, user_details), "Given"

def verify_otp(email, otp):
    record = OTP_STORE.get(email)
    if not record:
        return False, "No OTP found or registration session expired."
    
    expires_at = record.get('expires_at', 0.0)
    if time.time() > float(expires_at):
        OTP_STORE.pop(email, None)
        return False, "OTP has expired. Please request a new one."
        
    if record['otp'] != otp:
        return False, "Invalid OTP."
        
    return True, record['user_details']

def clear_otp(email):
    OTP_STORE.pop(email, None)


def _build_reset_record(email, otp):
    now = time.time()
    return {
        'email': email,
        'otp': otp,
        'expires_at': now + OTP_EXPIRY_SECONDS,
        'resend_available_at': now + OTP_RESEND_DELAY_SECONDS,
        'verified': False,
        'verified_at': None,
    }


def _send_password_reset_email(email, otp):
    return send_email_with_subject(
        email,
        'Your OTP for AutomateLearn Password Reset',
        f"Your password reset OTP is: {otp}\n\nThis OTP will expire in 5 minutes."
    )


def send_password_reset_otp(email):
    otp = generate_otp()
    PASSWORD_RESET_STORE[email] = _build_reset_record(email, otp)
    _send_password_reset_email(email, otp)
    return True


def resend_password_reset_otp(email):
    record = PASSWORD_RESET_STORE.get(email)
    if not record:
        return False, "Password reset session expired or does not exist."

    now = time.time()
    resend_available_at = float(record.get('resend_available_at', 0.0))
    if now < resend_available_at:
        seconds_left = int(resend_available_at - now)
        return False, f"Please wait {seconds_left} seconds before requesting a new OTP."

    otp = generate_otp()
    record['otp'] = otp
    record['expires_at'] = now + OTP_EXPIRY_SECONDS
    record['resend_available_at'] = now + OTP_RESEND_DELAY_SECONDS
    record['verified'] = False
    record['verified_at'] = None
    _send_password_reset_email(email, otp)
    return True, "OTP resent successfully."


def verify_password_reset_otp(email, otp):
    record = PASSWORD_RESET_STORE.get(email)
    if not record:
        return False, "No OTP found or password reset session expired."

    expires_at = float(record.get('expires_at', 0.0))
    if time.time() > expires_at:
        PASSWORD_RESET_STORE.pop(email, None)
        return False, "OTP has expired. Please request a new one."

    if str(record.get('otp', '')) != str(otp):
        return False, "Invalid OTP."

    record['verified'] = True
    record['verified_at'] = time.time()
    return True, "OTP verified successfully."


def is_password_reset_verified(email):
    record = PASSWORD_RESET_STORE.get(email)
    if not record:
        return False

    expires_at = float(record.get('expires_at', 0.0))
    if time.time() > expires_at:
        PASSWORD_RESET_STORE.pop(email, None)
        return False

    return bool(record.get('verified'))


def get_password_reset_meta(email):
    record = PASSWORD_RESET_STORE.get(email)
    if not record:
        return None

    return {
        'expires_at': record.get('expires_at'),
        'resend_available_at': record.get('resend_available_at'),
        'verified': bool(record.get('verified')),
    }


def clear_password_reset(email):
    PASSWORD_RESET_STORE.pop(email, None)
