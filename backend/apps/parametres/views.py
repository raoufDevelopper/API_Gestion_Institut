

from datetime import datetime, time

from django.contrib.auth import update_session_auth_hash

from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes, parser_classes

from rest_framework.permissions import IsAuthenticated

from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework.response import Response

from rest_framework import status

from apps.authentification.decorators import permission_requise

from dateutil.relativedelta import relativedelta

from apps.authentification.serializers import UserSerializer

from apps.academique.models import AnneeAcademique

from apps.notes.models import Note, Deliberation

from apps.utilisateurs.models import Etudiant

from .models import ParametreInstitut, ConfigurationMatricule, Sauvegarde, ArchiveAnneeAcademique, Notification

from .serializers import ParametreInstitutSerializer, ConfigurationMatriculeSerializer, SauvegardeSerializer, ArchiveAnneeAcademiqueSerializer, NotificationSerializer









# ================= PARAMETRE INSTITUT (singleton) =================
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def parametre_institut(request):

    parametre = ParametreInstitut.get_solo()

    if request.method == 'GET':
        return Response(ParametreInstitutSerializer(parametre, context = {'request': request}).data)
    

    serializer = ParametreInstitutSerializer(parametre, data=request.data, partial=True, context = {'request': request})

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)


    if request.method == 'PATCH' and not request.user.has_perm_personnalisee('gerer_parametres'):
        return Response({'detail': "Vous n'avez pas la permission de modifier ces paramètres."}, status=status.HTTP_403_FORBIDDEN)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)










@api_view(['GET'])
@permission_classes([IsAuthenticated])
def temps_restant_abonnement(request):

    abonnement = Abonnement.objects.first()

    if not abonnement or not abonnement.date_expiration or not abonnement.date_activation:
        return Response({'actif': False, 'detail': "Aucun abonnement actif."})

    maintenant = timezone.now()


    expiration = abonnement.date_expiration
    activation = abonnement.date_activation
    
    if isinstance(expiration, datetime):
        # Datetime déjà complet (avec heure précise) → on ne le modifie surtout pas
        if timezone.is_naive(expiration):
            expiration = timezone.make_aware(expiration)
    else:
        # Simple date sans heure (ancien format) → seul ce cas justifie un repli sur 23:59:59
        expiration = timezone.make_aware(datetime.combine(expiration, time(23, 59, 59)))
    if timezone.is_naive(activation):
        activation = timezone.make_aware(activation)
    
    # Normalise : si un champ est naive (pas de tzinfo), le rendre aware dans le fuseau courant du projet
    if timezone.is_naive(expiration):
        expiration = timezone.make_aware(expiration)

    if expiration <= maintenant:
        return Response({
            'actif': False, 'expire': True,
            'date_expiration': expiration.isoformat(),
        })


    # ---- Décomposition calendaire réelle (mois civils, pas une approximation en /30) ----
    mois, jours, heures, minutes, secondes = _decomposer_duree_calendaire(maintenant, expiration)

    return Response({
        'actif': True, 'expire': False,
        'date_expiration': expiration.isoformat(),
        'date_activation': activation.isoformat(),
        'mois': mois, 'jours': jours, 'heures': heures, 'minutes': minutes, 'secondes': secondes,
        'expiration_epoch_ms': int(expiration.timestamp() * 1000),  # ancre immuable pour le frontend
    })




def _decomposer_duree_calendaire(debut, fin):
    """Décompose l'intervalle [debut, fin] en mois civils réels + reste en jours/heures/min/sec."""

    mois = (fin.year - debut.year) * 12 + (fin.month - debut.month)

    # Ajuste si le jour du mois de fin n'est pas encore atteint (ex: 15 jan → 10 mars = 1 mois, pas 2)
    date_test = debut.replace(year=debut.year + (debut.month - 1 + mois) // 12, month=(debut.month - 1 + mois) % 12 + 1)

    try:
        date_test = date_test.replace(day=min(debut.day, 28))  # simplifié pour éviter les erreurs de fin de mois

    except ValueError:
        pass

    if date_test > fin:
        mois -= 1


    # Point de départ = debut + mois entiers, puis reste en jours/h/min/sec
    point_apres_mois = debut + relativedelta(months = mois)

    reste = fin - point_apres_mois

    secondes_totales = int(reste.total_seconds())

    jours = secondes_totales // 86400

    heures = (secondes_totales % 86400) // 3600

    minutes = (secondes_totales % 3600) // 60

    secondes = secondes_totales % 60

    return max(mois, 0), max(jours, 0), heures, minutes, secondes

    









# ================= CONFIGURATION MATRICULE =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_parametres')
def liste_creer_configuration_matricule(request):
    if request.method == 'GET':
        configs = ConfigurationMatricule.objects.all()
        return Response(ConfigurationMatriculeSerializer(configs, many=True).data)
    serializer = ConfigurationMatriculeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_parametres')
def detail_configuration_matricule(request, pk):
    try:
        config = ConfigurationMatricule.objects.get(pk=pk)
    except ConfigurationMatricule.DoesNotExist:
        return Response({'detail': 'Configuration introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(ConfigurationMatriculeSerializer(config).data)
    serializer = ConfigurationMatriculeSerializer(config, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)











# ================= SAUVEGARDE =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_sauvegardes')
def liste_sauvegardes(request):
    sauvegardes = Sauvegarde.objects.all()
    return Response(SauvegardeSerializer(sauvegardes, many=True).data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_sauvegardes')
def lancer_sauvegarde(request):
    sauvegarde = Sauvegarde.objects.create(
        type_sauvegarde='manuelle',
        declenchee_par=request.user,
    )
    succes = sauvegarde.executer()
    if succes:
        return Response(SauvegardeSerializer(sauvegarde).data, status=status.HTTP_201_CREATED)
    return Response(SauvegardeSerializer(sauvegarde).data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_sauvegardes')
def telecharger_sauvegarde(request, pk):
    from django.http import FileResponse
    try:
        sauvegarde = Sauvegarde.objects.get(pk=pk)
    except Sauvegarde.DoesNotExist:
        return Response({'detail': 'Sauvegarde introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if not sauvegarde.fichier:
        return Response({'detail': 'Aucun fichier disponible.'}, status=status.HTTP_404_NOT_FOUND)
    return FileResponse(sauvegarde.fichier.open('rb'), as_attachment=True, filename=sauvegarde.nom_fichier)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_sauvegardes')
def supprimer_sauvegarde(request, pk):
    try:
        sauvegarde = Sauvegarde.objects.get(pk=pk)
    except Sauvegarde.DoesNotExist:
        return Response({'detail': 'Sauvegarde introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if sauvegarde.fichier:
        sauvegarde.fichier.delete(save=False)
    sauvegarde.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)










# ================= ARCHIVE (années académiques) =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_archives')
def liste_archives(request):
    archives = ArchiveAnneeAcademique.objects.all()
    return Response(ArchiveAnneeAcademiqueSerializer(archives, many=True).data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_archives')
def archiver_annee_academique(request, pk):
    try:
        annee = AnneeAcademique.objects.get(pk=pk)
    except AnneeAcademique.DoesNotExist:
        return Response({'detail': 'Année académique introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if hasattr(annee, 'archive'):
        return Response({'detail': 'Cette année académique est déjà archivée.'}, status=status.HTTP_400_BAD_REQUEST)
    nb_notes = Note.objects.filter(annee_academique=annee).count()
    deliberations = Deliberation.objects.filter(annee_academique=annee)
    archive = ArchiveAnneeAcademique.objects.create(
        annee_academique=annee,
        nb_etudiants=Etudiant.objects.filter(statut='ACTIF').count(),
        nb_notes=nb_notes,
        nb_deliberations=deliberations.count(),
        nb_admis=deliberations.filter(decision='ADMIS').count(),
        nb_redoublants=deliberations.filter(decision='REDOUBLANT').count(),
        archivee_par=request.user,
        notes_archivage=request.data.get('notes_archivage', ''),
    )
    annee.statut = False
    annee.save(update_fields=['statut'])
    return Response(ArchiveAnneeAcademiqueSerializer(archive).data, status=status.HTTP_201_CREATED)











# ================= NOTIFICATIONS =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_notifications(request):
    notifications = Notification.objects.filter(destinataire=request.user)
    return Response(NotificationSerializer(notifications, many=True).data)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def marquer_notification_lue(request, pk):
    try:
        notification = Notification.objects.get(pk=pk, destinataire=request.user)
    except Notification.DoesNotExist:
        return Response({'detail': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    notification.lue = True
    notification.save(update_fields=['lue'])
    return Response(NotificationSerializer(notification).data)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def marquer_toutes_notifications_lues(request):
    Notification.objects.filter(destinataire=request.user, lue=False).update(lue=True)
    return Response({'detail': 'Toutes les notifications ont été marquées comme lues.'})
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def supprimer_notification(request, pk):
    try:
        notification = Notification.objects.get(pk=pk, destinataire=request.user)
    except Notification.DoesNotExist:
        return Response({'detail': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    notification.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_lecture_notification(request, pk):
    try:
        notification = Notification.objects.get(pk=pk, destinataire=request.user)
    except Notification.DoesNotExist:
        return Response({'detail': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    notification.lue = not notification.lue
    notification.save(update_fields=['lue'])
    return Response(NotificationSerializer(notification).data)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def effacer_notifications_lues(request):
    Notification.objects.filter(destinataire=request.user, lue=True).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)










# ================= PROFIL (utilisateur connecté) =================
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def mon_profil(request):
    user = request.user
    if request.method == 'GET':
        return Response(UserSerializer(user).data)
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        if 'password' in request.data:
            update_session_auth_hash(request, user)
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)









from .models import Abonnement
from .serializers import AbonnementSerializer
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def statut_abonnement(request):
    abonnement = Abonnement.get_solo()
    return Response(AbonnementSerializer(abonnement).data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activer_abonnement(request):
    code = request.data.get('code', '').strip().upper()
    if not code:
        return Response({'detail': 'Un code est requis.'}, status=status.HTTP_400_BAD_REQUEST)
    abonnement = Abonnement.get_solo()
    succes, message = abonnement.activer_avec_code(code)
    if succes:
        return Response({'detail': message, **AbonnementSerializer(abonnement).data})
    return Response({'detail': message}, status=status.HTTP_400_BAD_REQUEST)


