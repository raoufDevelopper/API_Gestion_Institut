from django.db.models import Q, Sum
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.utils import timezone
from weasyprint import HTML
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.authentification.decorators import permission_requise
from apps.academique.models import Specialite, Niveau
from .models import (
    Bourse, CategorieDepense, TypePaiement, Tarif, Inscription, FraisInscription,
    Paiement, Depense, CaisseSession,
)
from .serializers import (
    BourseSerializer, CategorieDepenseSerializer, TypePaiementSerializer, TarifSerializer,
    InscriptionSerializer, FraisInscriptionSerializer, PaiementSerializer,
    DepenseSerializer, CaisseSessionSerializer,
)








# ================= TABLEAU DE BORD =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_finances')
def dashboard(request):
    total_encaisse = Paiement.objects.filter(statut=Paiement.Statut.VALIDE).aggregate(s=Sum("montant"))["s"] or 0
    depenses_operationnelles = Depense.objects.exclude(categorie__est_tresorerie=True)
    total_dep_payees = depenses_operationnelles.filter(statut=Depense.Statut.PAYEE).aggregate(s=Sum("montant"))["s"] or 0
    total_dep_attente = depenses_operationnelles.filter(statut=Depense.Statut.EN_ATTENTE).aggregate(s=Sum("montant"))["s"] or 0
    session_ouverte = CaisseSession.objects.filter(statut=CaisseSession.Statut.OUVERTE).first()
    impayes = sum(
        1 for i in Inscription.objects.exclude(statut=Inscription.Statut.ANNULEE)
        if i.statut_paiement != "PAYE"
    )
    return Response({
        'total_encaisse': str(total_encaisse),
        'total_dep_payees': str(total_dep_payees),
        'total_dep_attente': str(total_dep_attente),
        'session_ouverte': CaisseSessionSerializer(session_ouverte).data if session_ouverte else None,
        'solde_caisse_actuel': str(session_ouverte.solde_theorique) if session_ouverte else '0',
        'impayes': impayes,
        'derniers_paiements': PaiementSerializer(
            Paiement.objects.select_related('inscription__etudiant', 'type_paiement').order_by('-date_paiement', '-id')[:5],
            many=True
        ).data,
        'dernieres_depenses': DepenseSerializer(
            Depense.objects.select_related('categorie').order_by('-date_depense', '-id')[:5],
            many=True
        ).data,
    })
# ================= CATEGORIE DEPENSE =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_depenses')
def liste_creer_categories_depense(request):
    if request.method == 'GET':
        categories = CategorieDepense.objects.all()
        return Response(CategorieDepenseSerializer(categories, many=True).data)
    serializer = CategorieDepenseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_depenses')
def detail_categorie_depense(request, pk):
    try:
        categorie = CategorieDepense.objects.get(pk=pk)
    except CategorieDepense.DoesNotExist:
        return Response({'detail': 'Catégorie introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(CategorieDepenseSerializer(categorie).data)
    if request.method == 'PATCH':
        serializer = CategorieDepenseSerializer(categorie, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    categorie.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)



# ================= TYPE PAIEMENT =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_tarifs')
def liste_creer_types_paiement(request):
    if request.method == 'GET':
        types_paiement = TypePaiement.objects.all()
        return Response(TypePaiementSerializer(types_paiement, many=True).data)
    serializer = TypePaiementSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_tarifs')
def detail_type_paiement(request, pk):
    try:
        type_paiement = TypePaiement.objects.get(pk=pk)
    except TypePaiement.DoesNotExist:
        return Response({'detail': 'Type de paiement introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(TypePaiementSerializer(type_paiement).data)
    if request.method == 'PATCH':
        serializer = TypePaiementSerializer(type_paiement, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    type_paiement.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)



# ================= TARIF =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_tarifs')
def liste_creer_tarifs(request):
    if request.method == 'GET':
        tarifs = Tarif.objects.all()
        return Response(TarifSerializer(tarifs, many=True).data)
    serializer = TarifSerializer(data=request.data)
    if serializer.is_valid():
        tarif = serializer.save()
        conflits = tarif.conflits()
        reponse = serializer.data
        if conflits:
            reponse['avertissement'] = (
                f"Ce tarif chevauche {len(conflits)} autre(s) tarif(s) de même portée "
                f"pour ce type/année : {', '.join(str(c) for c in conflits)}."
            )
        return Response(reponse, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_tarifs')
def detail_tarif(request, pk):
    try:
        tarif = Tarif.objects.get(pk=pk)
    except Tarif.DoesNotExist:
        return Response({'detail': 'Tarif introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(TarifSerializer(tarif).data)
    if request.method == 'PATCH':
        serializer = TarifSerializer(tarif, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    tarif.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_tarifs')
def simulateur_tarif(request):
    """Retourne le tarif qui s'appliquerait pour une combinaison donnée, et pourquoi."""
    type_paiement_id = request.GET.get('type_paiement')
    specialite_id = request.GET.get('specialite')
    niveau_id = request.GET.get('niveau')
    annee_academique_id = request.GET.get('annee_academique')
    if not all([type_paiement_id, specialite_id, niveau_id, annee_academique_id]):
        return Response({'detail': 'Paramètres manquants.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        type_paiement = TypePaiement.objects.get(pk=type_paiement_id)
        specialite = Specialite.objects.get(pk=specialite_id)
        niveau = Niveau.objects.get(pk=niveau_id)
    except (TypePaiement.DoesNotExist, Specialite.DoesNotExist, Niveau.DoesNotExist):
        return Response({'detail': 'Contexte invalide.'}, status=status.HTTP_404_NOT_FOUND)
    from apps.academique.models import AnneeAcademique
    try:
        annee_academique = AnneeAcademique.objects.get(pk=annee_academique_id)
    except AnneeAcademique.DoesNotExist:
        return Response({'detail': 'Année académique introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    tarif = Tarif.objects.resoudre(
        type_paiement=type_paiement, specialite=specialite, niveau=niveau, annee_academique=annee_academique,
    )
    if tarif is None:
        return Response({'trouve': False})
    return Response({'trouve': True, 'montant': str(tarif.montant), 'portee': tarif.decrire_portee()})



# ================= INSCRIPTION =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_inscriptions')
def liste_creer_inscriptions(request):
    if request.method == 'GET':
        inscriptions = Inscription.objects.select_related('etudiant', 'classe').all()
        q = request.GET.get('q', '').strip()
        if q:
            inscriptions = inscriptions.filter(
                Q(etudiant__nom__icontains=q) | Q(etudiant__prenom__icontains=q)
            )
        statut_paiement_filtre = request.GET.get('statut_paiement', '')
        if statut_paiement_filtre in ('PAYE', 'PARTIEL', 'NON_PAYE'):
            inscriptions = [i for i in inscriptions if i.statut_paiement == statut_paiement_filtre]
        return Response(InscriptionSerializer(inscriptions, many=True).data)
    serializer = InscriptionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(cree_par=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_inscriptions')
def detail_inscription(request, pk):
    try:
        inscription = Inscription.objects.select_related('etudiant', 'classe').get(pk=pk)
    except Inscription.DoesNotExist:
        return Response({'detail': 'Inscription introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(InscriptionSerializer(inscription).data)
    if request.method == 'PATCH':
        serializer = InscriptionSerializer(inscription, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    inscription.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_inscriptions')
def frais_ajouter(request, inscription_pk):
    try:
        inscription = Inscription.objects.get(pk=inscription_pk)
    except Inscription.DoesNotExist:
        return Response({'detail': 'Inscription introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    type_paiement_id = request.data.get('type_paiement')
    if inscription.frais.filter(type_paiement_id=type_paiement_id).exists():
        return Response(
            {'detail': 'Ce type de frais est déjà appliqué à cette inscription.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    serializer = FraisInscriptionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(inscription=inscription, ajoute_par=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_inscriptions')
def tarif_suggere(request):
    type_paiement_id = request.GET.get('type_paiement')
    inscription_id = request.GET.get('inscription')
    try:
        type_paiement = TypePaiement.objects.get(pk=type_paiement_id)
        inscription = Inscription.objects.select_related('classe').get(pk=inscription_id)
    except (TypePaiement.DoesNotExist, Inscription.DoesNotExist):
        return Response({'detail': 'Contexte invalide.'}, status=status.HTTP_404_NOT_FOUND)
    tarif = Tarif.objects.resoudre(
        type_paiement=type_paiement,
        specialite=inscription.classe.nom,
        niveau=inscription.classe.niveau,
        annee_academique=inscription.annee_academique,
    )
    if tarif is None:
        return Response({'trouve': False})
    return Response({'trouve': True, 'montant': str(tarif.montant), 'portee': tarif.decrire_portee()})
# ================= PAIEMENT =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_paiements')
def liste_creer_paiements(request):
    if request.method == 'GET':
        paiements = Paiement.objects.select_related('inscription__etudiant', 'caisse_session', 'type_paiement').all()
        q = request.GET.get('q', '').strip()
        if q:
            paiements = paiements.filter(Q(numero_recu__icontains=q) | Q(inscription__etudiant__nom__icontains=q))
        mode_filtre = request.GET.get('mode', '')
        if mode_filtre in Paiement.ModePaiement.values:
            paiements = paiements.filter(mode_paiement=mode_filtre)
        return Response(PaiementSerializer(paiements, many=True).data)
    serializer = PaiementSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(enregistre_par=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_paiements')
def detail_paiement(request, pk):
    try:
        paiement = Paiement.objects.select_related('inscription__etudiant', 'caisse_session', 'type_paiement').get(pk=pk)
    except Paiement.DoesNotExist:
        return Response({'detail': 'Paiement introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(PaiementSerializer(paiement).data)
    if request.method == 'PATCH':
        serializer = PaiementSerializer(paiement, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    paiement.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
# ================= DEPENSE =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_depenses')
def liste_creer_depenses(request):
    if request.method == 'GET':
        depenses = Depense.objects.select_related('categorie', 'caisse_session').all()
        q = request.GET.get('q', '').strip()
        if q:
            depenses = depenses.filter(Q(libelle__icontains=q) | Q(categorie__nom__icontains=q))
        categorie_filtre = request.GET.get('categorie', '')
        if categorie_filtre:
            depenses = depenses.filter(categorie_id=categorie_filtre)
        return Response(DepenseSerializer(depenses, many=True).data)
    serializer = DepenseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(demande_par=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_depenses')
def detail_depense(request, pk):
    try:
        depense = Depense.objects.select_related('categorie').get(pk=pk)
    except Depense.DoesNotExist:
        return Response({'detail': 'Dépense introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(DepenseSerializer(depense).data)
    if request.method == 'PATCH':
        serializer = DepenseSerializer(depense, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    depense.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
# ================= CAISSE =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_caisse')
def liste_ouvrir_caisse(request):
    if request.method == 'GET':
        sessions = CaisseSession.objects.all()
        return Response(CaisseSessionSerializer(sessions, many=True).data)
    if CaisseSession.objects.filter(statut=CaisseSession.Statut.OUVERTE).exists():
        return Response({'detail': 'Une session de caisse est déjà ouverte.'}, status=status.HTTP_400_BAD_REQUEST)
    serializer = CaisseSessionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(ouverte_par=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_caisse')
def detail_caisse(request, pk):
    try:
        session = CaisseSession.objects.get(pk=pk)
    except CaisseSession.DoesNotExist:
        return Response({'detail': 'Session introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    mouvements_paiements = session.paiements.filter(
        mode_paiement=Paiement.ModePaiement.ESPECES, statut=Paiement.Statut.VALIDE
    ).select_related('inscription__etudiant', 'type_paiement')
    mouvements_depenses = session.depenses.filter(mode_paiement=Depense.ModePaiement.ESPECES).select_related('categorie')
    return Response({
        'session': CaisseSessionSerializer(session).data,
        'mouvements_paiements': PaiementSerializer(mouvements_paiements, many=True).data,
        'mouvements_depenses': DepenseSerializer(mouvements_depenses, many=True).data,
        'nb_mouvements': mouvements_paiements.count() + mouvements_depenses.count(),
    })
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_caisse')
def fermer_caisse(request, pk):
    try:
        session = CaisseSession.objects.get(pk=pk, statut=CaisseSession.Statut.OUVERTE)
    except CaisseSession.DoesNotExist:
        return Response({'detail': 'Session ouverte introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    solde_reel = request.data.get('solde_reel_fermeture')
    observation = request.data.get('observation', '')
    if solde_reel is None:
        return Response({'detail': 'Le solde réel est requis.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        session.fermer(solde_reel=solde_reel, user=request.user, observation=observation)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(CaisseSessionSerializer(session).data)



# ================= EXPORTS PDF =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_inscriptions')
def fiche_inscription_pdf(request, pk):
    try:
        inscription = Inscription.objects.select_related('etudiant', 'classe').prefetch_related(
            'frais__type_paiement', 'paiements__type_paiement'
        ).get(pk=pk)
    except Inscription.DoesNotExist:
        return Response({'detail': 'Inscription introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    html_string = render_to_string('finances/fiche_inscription_pdf.html', {
        'inscription': inscription,
        'date_generation': timezone.now().strftime('%d/%m/%Y à %H:%M'),
    })
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="fiche_inscription_{inscription.etudiant.matricule}.pdf"'
    return response
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_paiements')
def recu_paiement_pdf(request, pk):
    try:
        paiement = Paiement.objects.select_related('inscription__etudiant', 'type_paiement').get(pk=pk)
    except Paiement.DoesNotExist:
        return Response({'detail': 'Paiement introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    html_string = render_to_string('finances/recu_paiement_pdf.html', {
        'paiement': paiement,
        'date_generation': timezone.now().strftime('%d/%m/%Y à %H:%M'),
    })
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="recu_{paiement.numero_recu}.pdf"'
    return response
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_depenses')
def bon_depense_pdf(request, pk):
    try:
        depense = Depense.objects.select_related('categorie').get(pk=pk)
    except Depense.DoesNotExist:
        return Response({'detail': 'Dépense introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    html_string = render_to_string('finances/bon_depense_pdf.html', {
        'depense': depense,
        'date_generation': timezone.now().strftime('%d/%m/%Y à %H:%M'),
    })
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="bon_depense_{depense.pk}.pdf"'
    return response
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_caisse')
def rapport_caisse_pdf(request, pk):
    try:
        session = CaisseSession.objects.get(pk=pk)
    except CaisseSession.DoesNotExist:
        return Response({'detail': 'Session introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    mouvements_paiements = session.paiements.filter(
        mode_paiement=Paiement.ModePaiement.ESPECES, statut=Paiement.Statut.VALIDE
    ).select_related('inscription__etudiant', 'type_paiement')
    mouvements_depenses = session.depenses.filter(mode_paiement=Depense.ModePaiement.ESPECES).select_related('categorie')
    html_string = render_to_string('finances/rapport_caisse_pdf.html', {
        'session': session,
        'mouvements_paiements': mouvements_paiements,
        'mouvements_depenses': mouvements_depenses,
        'date_generation': timezone.now().strftime('%d/%m/%Y à %H:%M'),
    })
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="rapport_caisse_{session.date_session}.pdf"'
    return response

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bourses')
def liste_creer_bourses(request):
    if request.method == 'GET':
        bourses = Bourse.objects.select_related('etudiant').all()
        return Response(BourseSerializer(bourses, many=True).data)
    serializer = BourseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bourses')
def detail_bourse(request, pk):
    try:
        bourse = Bourse.objects.get(pk=pk)
    except Bourse.DoesNotExist:
        return Response({'detail': 'Bourse introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(BourseSerializer(bourse).data)
    if request.method == 'PATCH':
        serializer = BourseSerializer(bourse, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    bourse.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
