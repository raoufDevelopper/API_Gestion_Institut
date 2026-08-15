from django.http import JsonResponse
from .models import Abonnement
CHEMINS_TOUJOURS_AUTORISES = [
    '/admin/',
    '/api/auth/',
    '/api/parametres/abonnement/',
]
class BlocageAbonnementMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    def __call__(self, request):
        if request.method == 'OPTIONS':
            return self.get_response(request)
        chemin_autorise = any(request.path.startswith(prefixe) for prefixe in CHEMINS_TOUJOURS_AUTORISES)
        if not chemin_autorise and request.path.startswith('/api/'):
            abonnement = Abonnement.get_solo()
            if not abonnement.est_actif:
                return JsonResponse(
                    {
                        'detail': "Abonnement expiré. Veuillez renouveler votre abonnement pour continuer à utiliser l'application.",
                        'code_erreur': 'ABONNEMENT_EXPIRE',
                        'date_expiration': abonnement.date_expiration.isoformat() if abonnement.date_expiration else None,
                    },
                    status=402,  # Payment Required — code HTTP sémantiquement adapté
                )
        return self.get_response(request)