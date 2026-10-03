from django.conf import settings
from twilio.rest import Client


class SMSServiceError(Exception):
    """Raised when an SMS cannot be sent."""


def send_sos_sms(contact, sos_event):
    """
    Send an SOS SMS to one emergency contact.
    """

    account_sid = getattr(settings, "TWILIO_ACCOUNT_SID", "")
    auth_token = getattr(settings, "TWILIO_AUTH_TOKEN", "")
    from_number = getattr(settings, "TWILIO_PHONE_NUMBER", "")

    if not account_sid or not auth_token or not from_number:
        raise SMSServiceError(
            "Twilio SMS configuration is incomplete."
        )

    # EmergencyContact currently stores digits only.
    # Add India's +91 prefix for 10-digit Indian numbers.
    phone = contact.phone.strip()

    if len(phone) == 10:
        phone = f"+91{phone}"
    elif not phone.startswith("+"):
        phone = f"+{phone}"

    latitude = sos_event.latitude
    longitude = sos_event.longitude

    location_url = (
        f"https://www.google.com/maps?q={latitude},{longitude}"
    )

    triggered_at = sos_event.triggered_at.strftime(
        "%d %b %Y, %I:%M %p"
    )

    user_name = (
        sos_event.user.get_full_name()
        or sos_event.user.username
        or "A MusafirAI user"
    )

    message_body = (
        f"MUSAFIRAI SOS ALERT\n"
        f"{user_name} may need help.\n"
        f"Location: {location_url}\n"
        f"Time: {triggered_at}\n"
        f"Please contact them immediately."
    )

    try:
        client = Client(account_sid, auth_token)

        message = client.messages.create(
            body=message_body,
            from_=from_number,
            to=phone,
        )

        return message.sid

    except Exception as exc:
        raise SMSServiceError(
            f"Unable to send SOS SMS: {exc}"
        ) from exc