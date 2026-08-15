from django.core.exceptions import ValidationError as DjangoValidationError
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.utils import timezone
from weasyprint import HTML
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.authentification.decorators import permission_requise
from .models import Categorie, Livre, Exemplaire, Emprunt, Reservation, Penalite
from .serializers import (
    CategorieSerializer, LivreSerializer, ExemplaireSerializer,
    EmpruntSerializer, ReservationSerializer, PenaliteSerializer
)
# ================= CATEGORIE =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def liste_creer_categories(request):
    if request.method == 'GET':
        categories = Categorie.objects.all()
        return Response(CategorieSerializer(categories, many=True).data)
    serializer = CategorieSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def detail_categorie(request, pk):
    try:
        categorie = Categorie.objects.get(pk=pk)
    except Categorie.DoesNotExist:
        return Response({'detail': 'Catégorie introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(CategorieSerializer(categorie).data)
    if request.method == 'PATCH':
        serializer = CategorieSerializer(categorie, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    categorie.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
# ================= LIVRE =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def liste_creer_livres(request):
    if request.method == 'GET':
        livres = Livre.objects.select_related('categorie').all()
        q = request.GET.get('q', '').strip()
        if q:
            from django.db.models import Q
            livres = livres.filter(Q(titre__icontains=q) | Q(auteur__icontains=q) | Q(isbn__icontains=q))
        return Response(LivreSerializer(livres, many=True).data)
    serializer = LivreSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def detail_livre(request, pk):
    try:
        livre = Livre.objects.select_related('categorie').get(pk=pk)
    except Livre.DoesNotExist:
        return Response({'detail': 'Livre introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(LivreSerializer(livre).data)
    if request.method == 'PATCH':
        serializer = LivreSerializer(livre, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    livre.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
# ================= EXEMPLAIRE =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def liste_creer_exemplaires(request):
    if request.method == 'GET':
        exemplaires = Exemplaire.objects.select_related('livre').all()
        livre_id = request.GET.get('livre')
        if livre_id:
            exemplaires = exemplaires.filter(livre_id=livre_id)
        return Response(ExemplaireSerializer(exemplaires, many=True).data)
    serializer = ExemplaireSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def detail_exemplaire(request, pk):
    try:
        exemplaire = Exemplaire.objects.select_related('livre').get(pk=pk)
    except Exemplaire.DoesNotExist:
        return Response({'detail': 'Exemplaire introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(ExemplaireSerializer(exemplaire).data)
    if request.method == 'PATCH':
        serializer = ExemplaireSerializer(exemplaire, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    exemplaire.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
# ================= EMPRUNT =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def liste_creer_emprunts(request):
    if request.method == 'GET':
        emprunts = Emprunt.objects.select_related('exemplaire__livre', 'etudiant', 'personnel').all()
        statut_filtre = request.GET.get('statut')
        if statut_filtre:
            emprunts = emprunts.filter(statut=statut_filtre)
        return Response(EmpruntSerializer(emprunts, many=True).data)
    serializer = EmpruntSerializer(data=request.data)
    if serializer.is_valid():
        try:
            emprunt = serializer.save(enregistre_par=request.user)
        except DjangoValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(EmpruntSerializer(emprunt).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def detail_emprunt(request, pk):
    try:
        emprunt = Emprunt.objects.select_related('exemplaire__livre', 'etudiant', 'personnel').get(pk=pk)
    except Emprunt.DoesNotExist:
        return Response({'detail': 'Emprunt introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(EmpruntSerializer(emprunt).data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def retourner_emprunt(request, pk):
    try:
        emprunt = Emprunt.objects.get(pk=pk)
    except Emprunt.DoesNotExist:
        return Response({'detail': 'Emprunt introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    try:
        emprunt.retourner()
    except DjangoValidationError as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(EmpruntSerializer(emprunt).data)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def liste_emprunts_en_retard(request):
    aujourd_hui = timezone.localdate()
    emprunts = Emprunt.objects.select_related('exemplaire__livre', 'etudiant', 'personnel').filter(
        statut='en_cours', date_retour_prevue__lt=aujourd_hui
    )
    return Response(EmpruntSerializer(emprunts, many=True).data)
# ================= RESERVATION =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def liste_creer_reservations(request):
    if request.method == 'GET':
        reservations = Reservation.objects.select_related('livre', 'etudiant', 'personnel').all()
        return Response(ReservationSerializer(reservations, many=True).data)
    serializer = ReservationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def detail_reservation(request, pk):
    try:
        reservation = Reservation.objects.select_related('livre', 'etudiant', 'personnel').get(pk=pk)
    except Reservation.DoesNotExist:
        return Response({'detail': 'Réservation introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(ReservationSerializer(reservation).data)
    if request.method == 'PATCH':
        serializer = ReservationSerializer(reservation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    reservation.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
# ================= PENALITE =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def liste_penalites(request):
    penalites = Penalite.objects.select_related('emprunt__etudiant', 'emprunt__personnel').all()
    payee_filtre = request.GET.get('payee')
    if payee_filtre in ('true', 'false'):
        penalites = penalites.filter(payee=(payee_filtre == 'true'))
    return Response(PenaliteSerializer(penalites, many=True).data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def payer_penalite(request, pk):
    """
    Règle une pénalité :
    - Si l'emprunteur est un étudiant AVEC un FraisInscription lié : crée un
      vrai Paiement dans finances (historique comptable complet), puis
      synchronise le statut de la Penalite.
    - Sinon (personnel, ou étudiant sans inscription active) : marque
      simplement la Penalite comme payée, sans mouvement financier formel.
    """
    try:
        penalite = Penalite.objects.select_related('emprunt__etudiant', 'frais_inscription__inscription').get(pk=pk)
    except Penalite.DoesNotExist:
        return Response({'detail': 'Pénalité introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if penalite.payee:
        return Response({'detail': 'Cette pénalité est déjà payée.'}, status=status.HTTP_400_BAD_REQUEST)
    if penalite.frais_inscription:
        from apps.finances.models import Paiement
        mode_paiement = request.data.get('mode_paiement')
        caisse_session_id = request.data.get('caisse_session')
        if not mode_paiement:
            return Response({'detail': 'Le mode de paiement est requis.'}, status=status.HTTP_400_BAD_REQUEST)
        paiement = Paiement(
            inscription=penalite.frais_inscription.inscription,
            type_paiement=penalite.frais_inscription.type_paiement,
            montant=penalite.montant,
            mode_paiement=mode_paiement,
            caisse_session_id=caisse_session_id,
            enregistre_par=request.user,
        )
        try:
            paiement.save()
        except DjangoValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    penalite.marquer_payee()
    return Response(PenaliteSerializer(penalite).data)
# ================= EXPORTS PDF =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def recu_emprunt_pdf(request, pk):
    try:
        emprunt = Emprunt.objects.select_related('exemplaire__livre', 'etudiant', 'personnel').get(pk=pk)
    except Emprunt.DoesNotExist:
        return Response({'detail': 'Emprunt introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    html_string = render_to_string('bibliotheque/recu_emprunt_pdf.html', {
        'emprunt': emprunt,
        'date_generation': timezone.now().strftime('%d/%m/%Y à %H:%M'),
    })
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="emprunt_{emprunt.pk}.pdf"'
    return response
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_bibliotheque')
def liste_retards_pdf(request):
    aujourd_hui = timezone.localdate()
    emprunts = Emprunt.objects.select_related('exemplaire__livre', 'etudiant', 'personnel').filter(
        statut='en_cours', date_retour_prevue__lt=aujourd_hui
    )
    html_string = render_to_string('bibliotheque/liste_retards_pdf.html', {
        'emprunts': emprunts,
        'aujourd_hui': aujourd_hui,
        'date_generation': timezone.now().strftime('%d/%m/%Y à %H:%M'),
    })
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="retards_{aujourd_hui}.pdf"'
    return response