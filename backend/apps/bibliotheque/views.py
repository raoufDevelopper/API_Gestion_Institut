from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q, Count
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.authentification.decorators import permission_requise
from .models import Categorie, Auteur, Editeur, Ressource, Localisation, Exemplaire, Adherent, RegleBibliotheque, Emprunt, StatutEmprunt, Reservation, StatutReservation, Penalite, TypePenalite, Inventaire, LigneInventaire, Fournisseur, Acquisition, LigneAcquisition, StatutExemplaire, valider_nouvel_emprunt, traiter_retour_exemplaire
from .serializers import CategorieSerializer, AuteurSerializer, EditeurSerializer, LocalisationSerializer, RessourceListeSerializer, RessourceDetailSerializer, RessourceCreationSerializer, ExemplaireSerializer, CreationExemplairesEnMasseSerializer, AdherentSerializer, RegleBibliothequeSerializer, EmpruntSerializer, NouvelEmpruntSerializer, RetourEmpruntSerializer, ReservationSerializer, PenaliteSerializer, InventaireSerializer, InventaireDetailSerializer, LigneInventaireSerializer, FournisseurSerializer, AcquisitionSerializer, LigneAcquisitionSerializer




# ================= VUE D'ENSEMBLE =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_ressources')
def vue_ensemble(request):
    kpis = {
        'ressources': Ressource.objects.filter(retiree=False).count(),
        'exemplaires': Exemplaire.objects.count(),
        'emprunts_en_cours': Emprunt.objects.filter(statut__in=['EN_COURS', 'EN_RETARD']).count(),
        'retards': sum(1 for e in Emprunt.objects.filter(statut__in=['EN_COURS', 'EN_RETARD']) if e.est_en_retard),
        'adherents': Adherent.objects.filter(statut='ACTIF').count(),
        'reservations': Reservation.objects.filter(statut__in=['EN_ATTENTE', 'DISPONIBLE']).count(),
        'acquisitions_annee': Acquisition.objects.filter(date_acquisition__year=timezone.now().year).count(),
    }
    dernier_inventaire = Inventaire.objects.order_by('-date_inventaire').first()
    kpis['dernier_inventaire'] = dernier_inventaire.date_inventaire.isoformat() if dernier_inventaire else None
    kpis['dernier_inventaire_total'] = dernier_inventaire.nb_exemplaires_verifies if dernier_inventaire else 0
    activites = []
    for e in Emprunt.objects.select_related('adherent', 'exemplaire__ressource').order_by('-date_creation')[:3]:
        activites.append({'texte': f"{e.adherent.personne} a emprunté {e.exemplaire.ressource.titre}", 'date': e.date_creation})
    for r in Reservation.objects.select_related('adherent', 'ressource').order_by('-date_reservation')[:2]:
        activites.append({'texte': f"{r.adherent.personne} a réservé {r.ressource.titre}", 'date': r.date_reservation})
    activites.sort(key=lambda x: x['date'], reverse=True)
    activites = activites[:5]
    for a in activites:
        a['date'] = a['date'].isoformat()
    return Response({'kpis': kpis, 'activites_recentes': activites})
















# ================= CATÉGORIE =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_categories')
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
@permission_requise('gerer_bibliotheque_categories')
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














# ================= AUTEUR =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_auteurs')
def liste_creer_auteurs(request):
    if request.method == 'GET':
        auteurs = Auteur.objects.all()
        return Response(AuteurSerializer(auteurs, many=True, context={'request': request}).data)
    serializer = AuteurSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_auteurs')
def detail_auteur(request, pk):
    try:
        auteur = Auteur.objects.get(pk=pk)
    except Auteur.DoesNotExist:
        return Response({'detail': 'Auteur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        ressources = RessourceListeSerializer(auteur.ressources.all(), many=True).data
        data = AuteurSerializer(auteur, context={'request': request}).data
        data['ressources'] = ressources
        return Response(data)
    if request.method == 'PATCH':
        serializer = AuteurSerializer(auteur, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    auteur.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

















# ================= ÉDITEUR =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_editeurs')
def liste_creer_editeurs(request):
    if request.method == 'GET':
        editeurs = Editeur.objects.all()
        return Response(EditeurSerializer(editeurs, many=True).data)
    serializer = EditeurSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_editeurs')
def detail_editeur(request, pk):
    try:
        editeur = Editeur.objects.get(pk=pk)
    except Editeur.DoesNotExist:
        return Response({'detail': 'Éditeur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(EditeurSerializer(editeur).data)
    if request.method == 'PATCH':
        serializer = EditeurSerializer(editeur, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    editeur.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)















# ================= LOCALISATION =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_exemplaires')
def liste_creer_localisations(request):
    if request.method == 'GET':
        return Response(LocalisationSerializer(Localisation.objects.all(), many=True).data)
    serializer = LocalisationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)













# ================= RESSOURCE (catalogue) =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_ressources')
def liste_creer_ressources(request):
    if request.method == 'GET':
        ressources = Ressource.objects.filter(retiree=False).prefetch_related('auteurs', 'exemplaires').select_related('editeur', 'categorie')
        q = request.GET.get('q', '').strip()
        if q:
            ressources = ressources.filter(
                Q(titre__icontains=q) | Q(isbn_issn__icontains=q) | Q(auteurs__nom__icontains=q) |
                Q(editeur__nom__icontains=q) | Q(mots_cles__icontains=q) | Q(numero__icontains=q) |
                Q(description__icontains=q)
            ).distinct()
        type_ressource = request.GET.get('type')
        if type_ressource:
            ressources = ressources.filter(type_ressource=type_ressource)
        categorie = request.GET.get('categorie')
        if categorie:
            ressources = ressources.filter(categorie_id=categorie)
        filiere = request.GET.get('filiere')
        if filiere:
            ressources = ressources.filter(filiere_id=filiere)
        specialite = request.GET.get('specialite')
        if specialite:
            ressources = ressources.filter(specialite_id=specialite)
        annee = request.GET.get('annee')
        if annee:
            ressources = ressources.filter(annee_publication=annee)
        disponibilite = request.GET.get('disponibilite')
        if disponibilite == 'disponible':
            ressources = [r for r in ressources if r.nb_exemplaires_disponibles > 0]
        elif disponibilite == 'indisponible':
            ressources = [r for r in ressources if r.nb_exemplaires_disponibles == 0]
        return Response(RessourceListeSerializer(ressources, many=True, context={'request': request}).data)
    serializer = RessourceCreationSerializer(data=request.data)
    if serializer.is_valid():
        ressource = serializer.save()
        return Response(RessourceDetailSerializer(ressource, context={'request': request}).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_ressources')
def detail_ressource(request, pk):
    try:
        ressource = Ressource.objects.get(pk=pk)
    except Ressource.DoesNotExist:
        return Response({'detail': 'Ressource introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        data = RessourceDetailSerializer(ressource, context={'request': request}).data
        data['exemplaires'] = ExemplaireSerializer(ressource.exemplaires.all(), many=True, context={'request': request}).data
        return Response(data)
    if request.method == 'PATCH':
        serializer = RessourceCreationSerializer(ressource, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(RessourceDetailSerializer(ressource, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if ressource.exemplaires.exclude(statut=StatutExemplaire.DISPONIBLE).exists() or Emprunt.objects.filter(exemplaire__ressource=ressource).exists():
        ressource.retiree = True
        ressource.save(update_fields=['retiree'])
        return Response({'detail': 'Ressource retirée du catalogue (historique préservé).'}, status=status.HTTP_200_OK)
    ressource.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)














# ================= EXEMPLAIRE =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_exemplaires')
def liste_creer_exemplaires(request):
    if request.method == 'GET':
        exemplaires = Exemplaire.objects.select_related('ressource', 'localisation').all()
        q = request.GET.get('q', '').strip()
        if q:
            exemplaires = exemplaires.filter(Q(numero__icontains=q) | Q(ressource__titre__icontains=q))
        statut = request.GET.get('statut')
        if statut:
            exemplaires = exemplaires.filter(statut=statut)
        localisation = request.GET.get('localisation')
        if localisation:
            exemplaires = exemplaires.filter(localisation_id=localisation)
        etat = request.GET.get('etat')
        if etat:
            exemplaires = exemplaires.filter(etat=etat)
        ressource = request.GET.get('ressource')
        if ressource:
            exemplaires = exemplaires.filter(ressource_id=ressource)
        return Response(ExemplaireSerializer(exemplaires, many=True, context={'request': request}).data)
    serializer = ExemplaireSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_exemplaires')
def creer_exemplaires_en_masse(request):
    serializer = CreationExemplairesEnMasseSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = serializer.validated_data
    crees = []
    for _ in range(data['quantite']):
        exemplaire = Exemplaire.objects.create(
            ressource=data['ressource'], localisation=data.get('localisation'), etat=data['etat'],
        )
        crees.append(exemplaire)
    return Response(ExemplaireSerializer(crees, many=True, context={'request': request}).data, status=status.HTTP_201_CREATED)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_exemplaires')
def detail_exemplaire(request, pk):
    try:
        exemplaire = Exemplaire.objects.get(pk=pk)
    except Exemplaire.DoesNotExist:
        return Response({'detail': 'Exemplaire introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(ExemplaireSerializer(exemplaire, context={'request': request}).data)
    if request.method == 'PATCH':
        serializer = ExemplaireSerializer(exemplaire, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if Emprunt.objects.filter(exemplaire=exemplaire).exists():
        exemplaire.statut = StatutExemplaire.RETIRE
        exemplaire.save(update_fields=['statut'])
        return Response({'detail': 'Exemplaire retiré (historique préservé).'}, status=status.HTTP_200_OK)
    exemplaire.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
















# ================= ADHÉRENT =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_adherents')
def liste_creer_adherents(request):
    if request.method == 'GET':
        adherents = Adherent.objects.select_related('etudiant', 'personnel', 'formateur').all()
        q = request.GET.get('q', '').strip()
        if q:
            adherents = adherents.filter(
                Q(numero__icontains=q) | Q(etudiant__nom__icontains=q) |
                Q(personnel__nom__icontains=q) | Q(formateur__personnel__nom__icontains=q)
            )
        type_filtre = request.GET.get('type')
        if type_filtre == 'ETUDIANT':
            adherents = adherents.filter(etudiant__isnull=False)
        elif type_filtre == 'PERSONNEL':
            adherents = adherents.filter(personnel__isnull=False, formateur__isnull=True)
        elif type_filtre == 'FORMATEUR':
            adherents = adherents.filter(formateur__isnull=False)
        statut = request.GET.get('statut')
        if statut:
            adherents = adherents.filter(statut=statut)
        return Response(AdherentSerializer(adherents, many=True).data)
    serializer = AdherentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_adherents')
def detail_adherent(request, pk):
    try:
        adherent = Adherent.objects.get(pk=pk)
    except Adherent.DoesNotExist:
        return Response({'detail': 'Adhérent introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        data = AdherentSerializer(adherent).data
        data['historique_emprunts'] = EmpruntSerializer(adherent.emprunts.order_by('-date_emprunt')[:20], many=True).data
        return Response(data)
    if request.method == 'PATCH':
        serializer = AdherentSerializer(adherent, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if adherent.emprunts.exists():
        adherent.statut = 'DESACTIVE'
        adherent.save(update_fields=['statut'])
        return Response({'detail': 'Adhérent désactivé (historique préservé).'}, status=status.HTTP_200_OK)
    adherent.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

















# ================= RÈGLES DE BIBLIOTHÈQUE =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_parametres')
def liste_regles(request):
    for type_adherent, _ in RegleBibliotheque.TYPE_CHOICES:
        RegleBibliotheque.pour(type_adherent)
    return Response(RegleBibliothequeSerializer(RegleBibliotheque.objects.all(), many=True).data)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_parametres')
def modifier_regle(request, pk):
    try:
        regle = RegleBibliotheque.objects.get(pk=pk)
    except RegleBibliotheque.DoesNotExist:
        return Response({'detail': 'Règle introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = RegleBibliothequeSerializer(regle, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

















# ================= EMPRUNT =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_emprunts')
def liste_emprunts(request):
    emprunts = Emprunt.objects.select_related('adherent', 'exemplaire__ressource').all()
    statut = request.GET.get('statut')
    if statut == 'EN_COURS':
        emprunts = emprunts.filter(statut__in=['EN_COURS', 'EN_RETARD'])
    elif statut:
        emprunts = emprunts.filter(statut=statut)
    q = request.GET.get('q', '').strip()
    if q:
        emprunts = emprunts.filter(
            Q(numero__icontains=q) | Q(exemplaire__ressource__titre__icontains=q) |
            Q(adherent__etudiant__nom__icontains=q) | Q(adherent__personnel__nom__icontains=q)
        )
    type_adherent = request.GET.get('type_adherent')
    if type_adherent == 'ETUDIANT':
        emprunts = emprunts.filter(adherent__etudiant__isnull=False)
    elif type_adherent == 'FORMATEUR':
        emprunts = emprunts.filter(adherent__formateur__isnull=False)
    elif type_adherent == 'PERSONNEL':
        emprunts = emprunts.filter(adherent__personnel__isnull=False, adherent__formateur__isnull=True)
    return Response(EmpruntSerializer(emprunts, many=True).data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_emprunts')
def enregistrer_emprunt(request):
    serializer = NouvelEmpruntSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    adherent = serializer.validated_data['adherent']
    exemplaire = serializer.validated_data['exemplaire']
    try:
        regle = valider_nouvel_emprunt(adherent, exemplaire)
    except DjangoValidationError as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    date_emprunt = timezone.localdate()
    emprunt = Emprunt.objects.create(
        adherent=adherent, exemplaire=exemplaire, date_emprunt=date_emprunt,
        date_retour_prevue=date_emprunt + timezone.timedelta(days=regle.duree_emprunt_jours),
        observations=serializer.validated_data.get('observations', ''),
        enregistre_par=request.user,
    )
    exemplaire.statut = StatutExemplaire.EMPRUNTE
    exemplaire.save(update_fields=['statut'])
    return Response(EmpruntSerializer(emprunt).data, status=status.HTTP_201_CREATED)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_emprunts')
def retourner_emprunt(request, pk):
    try:
        emprunt = Emprunt.objects.select_related('exemplaire', 'adherent').get(pk=pk)
    except Emprunt.DoesNotExist:
        return Response({'detail': 'Emprunt introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if emprunt.statut in ('RETOURNE', 'ANNULE'):
        return Response({'detail': 'Cet emprunt a déjà été clôturé.'}, status=status.HTTP_400_BAD_REQUEST)
    serializer = RetourEmpruntSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    etat_retour = serializer.validated_data['etat_retour']
    exemplaire = emprunt.exemplaire
    jours_retard = emprunt.jours_de_retard
    emprunt.date_retour_reelle = timezone.localdate()
    emprunt.observations = (emprunt.observations or '') + '\n' + serializer.validated_data.get('observations', '')
    if etat_retour == 'PERDU':
        emprunt.statut = StatutEmprunt.PERDU
        exemplaire.statut = StatutExemplaire.PERDU
        exemplaire.save(update_fields=['statut'])
        regle = RegleBibliotheque.pour(emprunt.adherent.type_adherent)
        if regle.penalite_perte:
            Penalite.objects.create(emprunt=emprunt, type_penalite=TypePenalite.PERTE, montant=regle.penalite_perte)
    else:
        emprunt.statut = StatutEmprunt.RETOURNE
        if etat_retour in ('ABIME', 'TRES_ABIME'):
            exemplaire.etat = etat_retour
            exemplaire.save(update_fields=['etat'])
            regle = RegleBibliotheque.pour(emprunt.adherent.type_adherent)
            if regle.penalite_deterioration:
                Penalite.objects.create(emprunt=emprunt, type_penalite=TypePenalite.DETERIORATION, montant=regle.penalite_deterioration)
        else:
            exemplaire.etat = etat_retour
        traiter_retour_exemplaire(exemplaire)
        if jours_retard > 0:
            regle = RegleBibliotheque.pour(emprunt.adherent.type_adherent)
            if regle.penalite_par_jour_retard:
                montant = jours_retard * regle.penalite_par_jour_retard
                if regle.penalite_max:
                    montant = min(montant, regle.penalite_max)
                Penalite.objects.create(emprunt=emprunt, type_penalite=TypePenalite.RETARD, montant=montant)
    emprunt.save()
    return Response(EmpruntSerializer(emprunt).data)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_emprunts')
def liste_retards(request):
    emprunts = Emprunt.objects.filter(statut__in=['EN_COURS', 'EN_RETARD']).select_related('adherent', 'exemplaire__ressource')
    en_retard = [e for e in emprunts if e.est_en_retard]
    q = request.GET.get('q', '').strip()
    if q:
        en_retard = [e for e in en_retard if q.lower() in str(e.adherent.personne).lower() or q.lower() in e.exemplaire.ressource.titre.lower()]
    return Response(EmpruntSerializer(en_retard, many=True).data)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_emprunts')
def historique_emprunts(request):
    emprunts = Emprunt.objects.select_related('adherent', 'exemplaire__ressource').all()
    q = request.GET.get('q', '').strip()
    if q:
        emprunts = emprunts.filter(
            Q(numero__icontains=q) | Q(exemplaire__ressource__titre__icontains=q) |
            Q(adherent__etudiant__nom__icontains=q) | Q(adherent__personnel__nom__icontains=q)
        )
    periode = request.GET.get('periode')
    if periode == 'mois':
        emprunts = emprunts.filter(date_emprunt__month=timezone.now().month, date_emprunt__year=timezone.now().year)
    statut = request.GET.get('statut')
    if statut:
        emprunts = emprunts.filter(statut=statut)
    return Response(EmpruntSerializer(emprunts, many=True).data)





















# ================= RÉSERVATION =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_reservations')
def liste_creer_reservations(request):
    if request.method == 'GET':
        reservations = Reservation.objects.select_related('adherent', 'ressource').all()
        statut = request.GET.get('statut')
        if statut:
            reservations = reservations.filter(statut=statut)
        q = request.GET.get('q', '').strip()
        if q:
            reservations = reservations.filter(Q(ressource__titre__icontains=q) | Q(numero__icontains=q))
        return Response(ReservationSerializer(reservations, many=True).data)
    serializer = ReservationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            reservation = serializer.save()
        except DjangoValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_reservations')
def annuler_reservation(request, pk):
    try:
        reservation = Reservation.objects.get(pk=pk)
    except Reservation.DoesNotExist:
        return Response({'detail': 'Réservation introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    reservation.statut = StatutReservation.ANNULEE
    reservation.save(update_fields=['statut'])
    return Response(ReservationSerializer(reservation).data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_reservations')
def relancer_reservations(request):
    """Envoie un rappel (notification) à tous les adhérents ayant une réservation 'DISPONIBLE'."""
    from apps.parametres.services import creer_notification
    reservations = Reservation.objects.filter(statut=StatutReservation.DISPONIBLE).select_related('adherent', 'ressource')
    nb_envoyes = 0
    for r in reservations:
        user = getattr(r.adherent.personne, 'user', None)
        if user:
            creer_notification(
                destinataire=user, titre="Ouvrage disponible",
                message=f"« {r.ressource.titre} » est disponible. Merci de passer le récupérer avant le {r.date_expiration}.",
                type_notification='info', envoyer_email=True,
            )
            nb_envoyes += 1
    return Response({'detail': f'{nb_envoyes} rappel(s) envoyé(s).'})






















# ================= PÉNALITÉ =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_emprunts')
def liste_penalites(request):
    penalites = Penalite.objects.select_related('emprunt__adherent').all()
    payee = request.GET.get('payee')
    if payee in ('true', 'false'):
        penalites = penalites.filter(payee=(payee == 'true'))
    return Response(PenaliteSerializer(penalites, many=True).data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_emprunts')
def payer_penalite(request, pk):
    try:
        penalite = Penalite.objects.get(pk=pk)
    except Penalite.DoesNotExist:
        return Response({'detail': 'Pénalité introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if penalite.payee:
        return Response({'detail': 'Déjà payée.'}, status=status.HTTP_400_BAD_REQUEST)
    penalite.marquer_payee()
    return Response(PenaliteSerializer(penalite).data)






















# ================= INVENTAIRE =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_inventaire')
def liste_creer_inventaires(request):
    if request.method == 'GET':
        return Response(InventaireSerializer(Inventaire.objects.all(), many=True).data)
    zone = request.data.get('zone_concernee', '')
    exemplaires = Exemplaire.objects.exclude(statut=StatutExemplaire.RETIRE)
    if zone:
        exemplaires = exemplaires.filter(localisation__salle__icontains=zone)
    inventaire = Inventaire.objects.create(
        zone_concernee=zone, responsable=request.user, observations=request.data.get('observations', ''),
    )
    LigneInventaire.objects.bulk_create([
        LigneInventaire(inventaire=inventaire, exemplaire=ex) for ex in exemplaires
    ])
    return Response(InventaireSerializer(inventaire).data, status=status.HTTP_201_CREATED)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_inventaire')
def detail_inventaire(request, pk):
    try:
        inventaire = Inventaire.objects.get(pk=pk)
    except Inventaire.DoesNotExist:
        return Response({'detail': 'Inventaire introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(InventaireDetailSerializer(inventaire).data)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_inventaire')
def modifier_ligne_inventaire(request, pk):
    try:
        ligne = LigneInventaire.objects.get(pk=pk)
    except LigneInventaire.DoesNotExist:
        return Response({'detail': 'Ligne introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = LigneInventaireSerializer(ligne, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_inventaire')
def cloturer_inventaire(request, pk):
    try:
        inventaire = Inventaire.objects.get(pk=pk)
    except Inventaire.DoesNotExist:
        return Response({'detail': 'Inventaire introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    inventaire.statut = 'TERMINE'
    inventaire.save(update_fields=['statut'])
    return Response(InventaireSerializer(inventaire).data)



















# ================= FOURNISSEUR =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_fournisseurs')
def liste_creer_fournisseurs(request):
    if request.method == 'GET':
        return Response(FournisseurSerializer(Fournisseur.objects.all(), many=True).data)
    serializer = FournisseurSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_fournisseurs')
def detail_fournisseur(request, pk):
    try:
        fournisseur = Fournisseur.objects.get(pk=pk)
    except Fournisseur.DoesNotExist:
        return Response({'detail': 'Fournisseur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(FournisseurSerializer(fournisseur).data)
    if request.method == 'PATCH':
        serializer = FournisseurSerializer(fournisseur, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    fournisseur.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

















# ================= ACQUISITION =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_acquisitions')
def liste_creer_acquisitions(request):
    if request.method == 'GET':
        return Response(AcquisitionSerializer(Acquisition.objects.select_related('fournisseur').all(), many=True).data)
    lignes_data = request.data.pop('lignes', []) if hasattr(request.data, 'pop') else request.data.get('lignes', [])
    acquisition_data = {k: v for k, v in request.data.items() if k != 'lignes'}
    serializer = AcquisitionSerializer(data=acquisition_data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    acquisition = serializer.save(enregistre_par=request.user)
    for ligne in lignes_data:
        LigneAcquisition.objects.create(
            acquisition=acquisition, ressource_id=ligne['ressource'],
            quantite=ligne.get('quantite', 1), prix_unitaire=ligne.get('prix_unitaire'),
        )
    return Response(AcquisitionSerializer(acquisition).data, status=status.HTTP_201_CREATED)
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_acquisitions')
def detail_acquisition(request, pk):
    try:
        acquisition = Acquisition.objects.get(pk=pk)
    except Acquisition.DoesNotExist:
        return Response({'detail': 'Acquisition introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(AcquisitionSerializer(acquisition).data)
    serializer = AcquisitionSerializer(acquisition, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_bibliotheque_acquisitions')
def reception_acquisition(request, pk):
    """Marque l'acquisition comme reçue et génère automatiquement les exemplaires correspondants."""
    try:
        acquisition = Acquisition.objects.get(pk=pk)
    except Acquisition.DoesNotExist:
        return Response({'detail': 'Acquisition introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    for ligne in acquisition.lignes.all():
        for _ in range(ligne.quantite):
            Exemplaire.objects.create(ressource=ligne.ressource)
    acquisition.statut = 'RECUE'
    acquisition.save(update_fields=['statut'])
    return Response(AcquisitionSerializer(acquisition).data)

