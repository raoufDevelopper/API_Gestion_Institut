import requests

from django.conf import settings

from .models import Notification




def creer_notification(destinataire, titre, message, type_notification='info', lien=None, envoyer_email=False):
    """
    Point d'entrée unique utilisé par toutes les autres apps (via signals ou
    appel direct) pour notifier un utilisateur. Enregistre en base, et
    envoie un email via Brevo si demandé.
    """
    notification = Notification.objects.create(
        destinataire=destinataire,
        titre=titre,
        message=message,
        type_notification=type_notification,
        lien=lien,
    )
    if envoyer_email and destinataire.email:
        succes = envoyer_email_brevo(destinataire.email, titre, message)
        notification.email_envoye = succes
        notification.save(update_fields=['email_envoye'])
    return notification






def envoyer_email_brevo(destinataire_email, sujet, contenu_html):
    """Envoi d'email transactionnel via l'API Brevo."""
    api_key = getattr(settings, 'BREVO_API_KEY', None)
    if not api_key:
        return False
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        'accept': 'application/json',
        'api-key': api_key,
        'content-type': 'application/json',
    }
    payload = {
        'sender': {
            'name': getattr(settings, 'BREVO_SENDER_NAME', "IFP Perle d'Or"),
            'email': getattr(settings, 'BREVO_SENDER_EMAIL', 'no-reply@ifp.com'),
        },
        'to': [{'email': destinataire_email}],
        'subject': sujet,
        'htmlContent': f"<p>{contenu_html}</p>",
    }
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        return response.status_code in (200, 201)
    except requests.RequestException:
        return False