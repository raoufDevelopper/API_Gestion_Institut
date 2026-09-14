from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from apps.authentification.decorators import permission_requise
from apps.utilisateurs.models import Etudiant
from apps.academique.models import Matiere, Seance, AnneeAcademique
from apps.notes.models import Note, Deliberation, TypeEvaluation
from apps.notes.services import calculer_moyenne_matiere, calculer_moyenne_generale, mention
from apps.finances.models import Inscription
from apps.documents.models import Diplome, Certificat, Document
from apps.parametres.models import Notification


JOURS_CODE = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']

JOURS_LABEL = {'LUN': 'Lundi', 'MAR': 'Mardi', 'MER': 'Mercredi', 'JEU': 'Jeudi', 'VEN': 'Vendredi', 'SAM': 'Samedi', 'DIM': 'Dimanche'}



def _mon_etudiant(request):
    return get_object_or_404(Etudiant, user=request.user)

def _semestre_courant(etudiant, annee):
    """Devine le semestre le plus pertinent : celui où une délibération existe déjà, sinon S1."""
    dl = Deliberation.objects.filter(etudiant=etudiant, annee_academique=annee, periode='S2').first()
    if dl:
        return 'S2'
    return 'S1'





# ======================= ACCUEIL =======================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_etudiant')
def accueil(request):

    etu = _mon_etudiant(request)

    annee = AnneeAcademique.objects.filter(statut=True).first()

    semestre = _semestre_courant(etu, annee) if annee else 'S1'

    matieres = Matiere.objects.filter(specialite=etu.specialite, niveau=etu.niveau, statut='actif') if etu.specialite and etu.niveau else Matiere.objects.none()

    moyenne_generale = None


    if annee:
        moyenne_generale, _ = calculer_moyenne_generale(etu, annee, semestre)

    deliberation = Deliberation.objects.filter(etudiant=etu, annee_academique=annee, periode=semestre).first() if annee else None


    taux_reussite = None

    if deliberation and deliberation.credits_requis:

        taux_reussite = round((deliberation.credits_obtenus / deliberation.credits_requis) * 100, 1)


    aujourdhui = timezone.localdate()

    debut_semaine = aujourdhui - timedelta(days=aujourdhui.weekday())

    fin_semaine = debut_semaine + timedelta(days=6)


    seances_semaine = Seance.objects.none()
    if etu.classe:
        aujourdhui_local = timezone.localdate()
        debut_sem = aujourdhui_local - timedelta(days=aujourdhui_local.weekday())
        fin_sem = debut_sem + timedelta(days=6)
        seances_semaine = Seance.objects.filter(
            emploi_du_temps__classe=etu.classe, emploi_du_temps__statut='publie',
            emploi_du_temps__semaine_debut__lte=fin_sem, emploi_du_temps__semaine_fin__gte=debut_sem,
        )

    nb_documents = Diplome.objects.filter(etudiant=etu).count() + Certificat.objects.filter(etudiant=etu).count() + Document.objects.filter(concerne_etudiant=etu).count()

    inscription = Inscription.objects.filter(etudiant=etu, annee_academique=annee).first() if annee else None

    nb_paiements_attente = 1 if (inscription and inscription.statut_paiement != 'PAYE') else 0

    resultats_recents = []


    for mat in matieres[:5]:
        moy = calculer_moyenne_matiere(etu, mat, annee, semestre) if annee else None
        if moy is not None:
            resultats_recents.append({'matiere': mat.nom, 'moyenne': float(moy)})

    ma_semaine = []


    for jour_code in JOURS_CODE[:6]:
        seances_jour = seances_semaine.filter(jour=jour_code).order_by('heure_debut')
        ma_semaine.append({
            'jour': JOURS_LABEL[jour_code], 'jour_code': jour_code,
            'seances': [{
                'matiere': s.matiere.nom, 'heure_debut': s.heure_debut.strftime('%H:%M'),
                'heure_fin': s.heure_fin.strftime('%H:%M'), 'salle': s.salle.nom if s.salle else '—',
                'formateur': str(s.formateur.personnel) if s.formateur else '—',
            } for s in seances_jour],
        })

    notifications_recentes = Notification.objects.filter(destinataire=request.user).order_by('-date_creation')[:5]


    return Response({
        'etudiant': {'nom': etu.nom, 'prenom': etu.prenom, 'matricule': etu.matricule, 'statut': etu.statut, 'photo': request.build_absolute_uri(etu.photo.url) if etu.photo else None},
        'formation': {
            'specialite': str(etu.specialite) if etu.specialite else '—', 'classe': str(etu.classe) if etu.classe else '—',
            'annee_academique': annee.libelle if annee else '—', 'semestre': semestre,
        },
        'kpis': {
            'nb_matieres': matieres.count(),
            'moyenne_generale': round(float(moyenne_generale), 2) if moyenne_generale is not None else None,
            'taux_reussite': taux_reussite,
            'cours_semaine': seances_semaine.count(),
            'documents_disponibles': nb_documents,
            'paiements_en_attente': nb_paiements_attente,
        },
        'ma_semaine': ma_semaine,
        'resultats_recents': resultats_recents,
        'notifications_recentes': [{'titre': n.titre, 'message': n.message, 'date': n.date_creation.isoformat(), 'lue': n.lue} for n in notifications_recentes],
    })













# ======================= PLANNING =======================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_etudiant')
def planning(request):
    etu = _mon_etudiant(request)
    offset = int(request.GET.get('semaine_offset', 0))
    aujourdhui = timezone.localdate()
    debut_semaine = aujourdhui - timedelta(days=aujourdhui.weekday()) + timedelta(weeks=offset)
    fin_semaine = debut_semaine + timedelta(days=6)
    seances = Seance.objects.none()
    if etu.classe:
        seances = Seance.objects.filter(
            emploi_du_temps__classe=etu.classe,
            emploi_du_temps__statut='publie',
            emploi_du_temps__semaine_debut__lte=fin_semaine,
            emploi_du_temps__semaine_fin__gte=debut_semaine,
        ).select_related('matiere', 'salle', 'formateur__personnel')
    jours = []
    for i, jour_code in enumerate(JOURS_CODE[:6]):
        date_jour = debut_semaine + timedelta(days=i)
        seances_jour = seances.filter(jour=jour_code).order_by('heure_debut')
        jours.append({
            'jour': JOURS_LABEL[jour_code], 'date': date_jour.isoformat(),
            'seances': [{
                'matiere': s.matiere.nom, 'heure_debut': s.heure_debut.strftime('%H:%M'), 'heure_fin': s.heure_fin.strftime('%H:%M'),
                'salle': s.salle.nom if s.salle else '—', 'formateur': str(s.formateur.personnel) if s.formateur else '—',
                'type_seance': s.type_seance,
            } for s in seances_jour],
        })
    return Response({'debut_semaine': debut_semaine.isoformat(), 'fin_semaine': fin_semaine.isoformat(), 'jours': jours})















# ======================= RÉSULTATS =======================
def _matieres_etudiant(etu):
    """Repli sur la spécialité/niveau de la classe si l'étudiant n'a pas ces champs renseignés directement."""
    specialite = etu.specialite or (etu.classe.specialite if etu.classe else None)
    niveau = etu.niveau or (etu.classe.niveau if etu.classe else None)
    if not specialite or not niveau:
        return Matiere.objects.none()
    return Matiere.objects.filter(specialite=specialite, niveau=niveau, statut='actif')
def _moyenne_matiere_periode(etu, mat, annee, periode):
    if periode in ('S1', 'S2'):
        return calculer_moyenne_matiere(etu, mat, annee, periode)
    # ANNEE : moyenne des deux semestres disponibles
    m1 = calculer_moyenne_matiere(etu, mat, annee, 'S1')
    m2 = calculer_moyenne_matiere(etu, mat, annee, 'S2')
    valeurs = [float(m) for m in (m1, m2) if m is not None]
    return round(sum(valeurs) / len(valeurs), 2) if valeurs else None
def _notes_matiere_periode(etu, mat, annee, periode):
    """Renvoie la liste des notes (avec tag semestre) pour la période choisie."""
    semestres = ['S1', 'S2'] if periode == 'ANNEE' else [periode]
    notes = Note.objects.filter(etudiant=etu, matiere=mat, annee_academique=annee, semestre__in=semestres).select_related('type_evaluation')
    return [{'type_code': n.type_evaluation.code, 'type_libelle': n.type_evaluation.libelle, 'valeur': float(n.valeur), 'semestre': n.semestre} for n in notes]
def _infos_identite(etu, request):
    return {
        'nom': etu.nom, 'prenom': etu.prenom, 'matricule': etu.matricule, 'statut': etu.statut,
        'sexe': etu.sexe, 'date_naissance': etu.date_naissance, 'telephone': etu.telephone,
        'email': etu.email, 'adresse': etu.adresse,
        'photo': request.build_absolute_uri(etu.photo.url) if etu.photo else None,
        'classe': str(etu.classe) if etu.classe else '—',
        'specialite': str(etu.specialite) if etu.specialite else '—',
        'filiere': str(etu.specialite.filiere) if etu.specialite and etu.specialite.filiere else '—',
        'niveau': str(etu.niveau) if etu.niveau else '—',
    }



@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_etudiant')
def mes_resultats_complet(request):
    etu = _mon_etudiant(request)
    annee_id = request.GET.get('annee_academique')
    periode = request.GET.get('periode', 'S1')  # 'S1', 'S2' ou 'ANNEE'
    annee = AnneeAcademique.objects.filter(pk=annee_id).first() if annee_id else AnneeAcademique.objects.filter(statut=True).first()
    if not annee:
        return Response({'detail': 'Aucune année académique active.'}, status=status.HTTP_404_NOT_FOUND)
    matieres = _matieres_etudiant(etu)
    matieres_data = []
    evaluations_toutes = []
    moyennes_matieres = []
    for mat in matieres:
        moy = _moyenne_matiere_periode(etu, mat, annee, periode)
        derniere_seance = Seance.objects.filter(matiere=mat, emploi_du_temps__classe=etu.classe).select_related('formateur__personnel').order_by('-id').first()
        enseignant = str(derniere_seance.formateur.personnel) if derniere_seance and derniere_seance.formateur else '—'
        statut = 'en_attente'
        if moy is not None:
            statut = 'validee' if moy >= 10 else 'non_validee'
        notes_mat = _notes_matiere_periode(etu, mat, annee, periode)
        matieres_data.append({
            'id': mat.id, 'nom': mat.nom, 'coefficient': mat.coefficient, 'credit': mat.credit,
            'enseignant': enseignant, 'moyenne': moy, 'statut': statut, 'evaluations': notes_mat,
        })
        if moy is not None:
            moyennes_matieres.append(moy)
        for n in notes_mat:
            evaluations_toutes.append({'matiere': mat.nom, 'evaluation': n['type_libelle'], 'valeur': n['valeur'], 'semestre': n['semestre']})
    # ---- Délibération : source officielle des KPI généraux ----
    deliberation = Deliberation.objects.filter(etudiant=etu, annee_academique=annee, periode=periode).first()
    rang, effectif, moyenne_classe = None, None, None
    if etu.classe:
        dl_classe = Deliberation.objects.filter(
            etudiant__classe=etu.classe, annee_academique=annee, periode=periode
        ).exclude(moyenne_generale__isnull=True).order_by('-moyenne_generale')
        effectif = dl_classe.count()
        ids = list(dl_classe.values_list('etudiant_id', flat=True))
        if etu.id in ids:
            rang = ids.index(etu.id) + 1
        if effectif:
            moyenne_classe = round(sum(float(m) for m in dl_classe.values_list('moyenne_generale', flat=True)) / effectif, 2)
    taux_reussite = round((sum(1 for m in moyennes_matieres if m >= 10) / len(moyennes_matieres)) * 100, 1) if moyennes_matieres else None
    decision = deliberation.decision if deliberation else 'EN_ATTENTE'
    statut_semestre = {'ADMIS': 'valide', 'RATTRAPAGE': 'attention', 'REDOUBLANT': 'refuse', 'EN_ATTENTE': 'attente'}.get(decision, 'attente')
    total_coef = sum(m['coefficient'] for m in matieres_data) or 1
    repartition = [{'matiere': m['nom'], 'pourcentage': round((m['coefficient'] / total_coef) * 100, 1)} for m in matieres_data]
    evolution = [{'label': f"Éval. {i + 1}", 'valeur': e['valeur']} for i, e in enumerate(evaluations_toutes)][-12:]
    return Response({
        'etudiant': _infos_identite(etu, request),
        'annee_academique': annee.libelle, 'periode': periode,
        'kpis': {
            'moyenne_generale': float(deliberation.moyenne_generale) if deliberation and deliberation.moyenne_generale is not None else None,
            'nb_matieres': matieres.count(),
            'taux_reussite': taux_reussite,
            'rang': rang, 'effectif': effectif, 'moyenne_classe': moyenne_classe,
        },
        'statut_semestre': statut_semestre,
        'decision': decision,
        'credits_obtenus': deliberation.credits_obtenus if deliberation else None,
        'credits_requis': deliberation.credits_requis if deliberation else None,
        'matieres_non_validees': (deliberation.matieres_non_validees or []) if deliberation else [],
        'matieres': matieres_data,
        'evaluations': evaluations_toutes,
        'evolution': evolution,
        'repartition_matieres': repartition,
        'moyenne_plus_elevee': max(moyennes_matieres) if moyennes_matieres else None,
        'moyenne_plus_faible': min(moyennes_matieres) if moyennes_matieres else None,
    })



@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_etudiant')
def mon_releve_complet(request):
    """Données pour la page 'Mon relevé' — même logique de calcul que mes_resultats_complet,
    reformatée pour l'affichage type document officiel."""
    etu = _mon_etudiant(request)
    annee_id = request.GET.get('annee_academique')
    periode = request.GET.get('periode', 'S1')
    annee = AnneeAcademique.objects.filter(pk=annee_id).first() if annee_id else AnneeAcademique.objects.filter(statut=True).first()
    if not annee:
        return Response({'detail': 'Aucune année académique active.'}, status=status.HTTP_404_NOT_FOUND)
    matieres = _matieres_etudiant(etu)
    matieres_data = []
    moyennes_matieres = []
    for mat in matieres:
        moy = _moyenne_matiere_periode(etu, mat, annee, periode)
        statut = 'en_attente'
        if moy is not None:
            statut = 'validee' if moy >= 10 else 'non_validee'
        matieres_data.append({'matiere': mat.nom, 'coefficient': mat.coefficient, 'moyenne': moy, 'statut': statut})
        if moy is not None:
            moyennes_matieres.append(moy)
    deliberation = Deliberation.objects.filter(etudiant=etu, annee_academique=annee, periode=periode).first()
    rang, effectif = None, None
    if etu.classe:
        dl_classe = Deliberation.objects.filter(
            etudiant__classe=etu.classe, annee_academique=annee, periode=periode
        ).exclude(moyenne_generale__isnull=True).order_by('-moyenne_generale')
        effectif = dl_classe.count()
        ids = list(dl_classe.values_list('etudiant_id', flat=True))
        if etu.id in ids:
            rang = ids.index(etu.id) + 1
    decision = deliberation.decision if deliberation else 'EN_ATTENTE'
    non_validees = (deliberation.matieres_non_validees or []) if deliberation else []
    decision_label = {'ADMIS': 'SEMESTRE VALIDÉ', 'RATTRAPAGE': 'RATTRAPAGE', 'REDOUBLANT': 'NON VALIDÉ', 'EN_ATTENTE': 'EN ATTENTE'}.get(decision, 'EN ATTENTE')
    decision_sous_texte = 'Toutes les matières sont validées.' if decision == 'ADMIS' else (f"Matière(s) non validée(s) : {', '.join(non_validees)}" if non_validees else '')
    taux_reussite = round((sum(1 for m in moyennes_matieres if m >= 10) / len(moyennes_matieres)) * 100, 1) if moyennes_matieres else None
    return Response({
        'etudiant': _infos_identite(etu, request),
        'annee_academique': annee.libelle, 'periode': periode,
        'numero_releve': f"RN-{annee.libelle}-{etu.matricule}",
        'matieres': matieres_data,
        'kpis': {
            'moyenne_generale': float(deliberation.moyenne_generale) if deliberation and deliberation.moyenne_generale is not None else None,
            'nb_matieres': matieres.count(), 'taux_reussite': taux_reussite,
            'rang': rang, 'effectif': effectif,
        },
        'moyenne_plus_elevee': max(moyennes_matieres) if moyennes_matieres else None,
        'moyenne_plus_faible': min(moyennes_matieres) if moyennes_matieres else None,
        'decision': decision, 'decision_label': decision_label, 'decision_sous_texte': decision_sous_texte,
    })






@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_etudiant')
def mon_classement_classe(request):
    etu = _mon_etudiant(request)
    annee_id = request.GET.get('annee_academique')
    periode = request.GET.get('periode', 'S1')
    annee = AnneeAcademique.objects.filter(pk=annee_id).first() if annee_id else AnneeAcademique.objects.filter(statut=True).first()
    if not annee or not etu.classe:
        return Response([])
    dl_classe = Deliberation.objects.filter(
        etudiant__classe=etu.classe, annee_academique=annee, periode=periode
    ).exclude(moyenne_generale__isnull=True).select_related('etudiant').order_by('-moyenne_generale')
    return Response([{
        'rang': i + 1, 'nom': f"{d.etudiant.nom} {d.etudiant.prenom}",
        'moyenne': float(d.moyenne_generale), 'moi': d.etudiant_id == etu.id,
    } for i, d in enumerate(dl_classe)])




@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_etudiant')
def filtres_resultats(request):
    return Response({
        'annees_academiques': list(AnneeAcademique.objects.values('id', 'libelle')),
    })














# ======================= FORMATION =======================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_etudiant')
def formation(request):
    etu = _mon_etudiant(request)
    matieres = Matiere.objects.filter(specialite=etu.specialite, niveau=etu.niveau, statut='actif') if etu.specialite and etu.niveau else Matiere.objects.none()
    detail_matieres = []
    for mat in matieres:
        derniere_seance = Seance.objects.filter(matiere=mat, emploi_du_temps__classe=etu.classe).select_related('formateur__personnel').order_by('-id').first()
        detail_matieres.append({
            'matiere': mat.nom, 'coefficient': mat.coefficient, 'volume_horaire': mat.volume_horaire,
            'enseignant': str(derniere_seance.formateur.personnel) if derniere_seance and derniere_seance.formateur else '—',
        })
    return Response({
        'filiere': str(etu.specialite.filiere) if etu.specialite and etu.specialite.filiere else '—',
        'specialite': str(etu.specialite) if etu.specialite else '—',
        'classe': str(etu.classe) if etu.classe else '—',
        'niveau': str(etu.niveau) if etu.niveau else '—',
        'statut': etu.statut,
        'matieres': detail_matieres,
    })


















# ======================= FINANCES =======================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_etudiant')
def finances(request):
    etu = _mon_etudiant(request)
    annee_id = request.GET.get('annee_academique')  # 'toutes' ou un id
    inscriptions = Inscription.objects.filter(etudiant=etu).select_related('annee_academique').order_by('-annee_academique__date_debut')
    if annee_id and annee_id != 'toutes':
        inscriptions = inscriptions.filter(annee_academique_id=annee_id)
    if not inscriptions.exists():
        return Response({'inscriptions': [], 'annees_disponibles': []})
    annees_disponibles = list(Inscription.objects.filter(etudiant=etu).values('annee_academique__id', 'annee_academique__libelle').distinct())
    resultat = []
    for inscription in inscriptions:
        resultat.append({
            'annee_academique': inscription.annee_academique.libelle,
            'annee_academique_id': inscription.annee_academique_id,
            'total_du': str(inscription.total_du), 'montant_paye': str(inscription.montant_paye),
            'reste_a_payer': str(inscription.reste_a_payer), 'statut_paiement': inscription.statut_paiement,
            'frais': [{'type': f.type_paiement.nom, 'du': str(f.montant_du), 'paye': str(f.montant_paye), 'statut': f.statut_paiement} for f in inscription.frais.all()],
            'paiements': [{'numero_recu': p.numero_recu, 'type': p.type_paiement.nom, 'date': p.date_paiement.isoformat(), 'montant': str(p.montant), 'mode': p.mode_paiement, 'statut': p.statut} for p in inscription.paiements.order_by('-date_paiement')],
        })
    return Response({
        'inscriptions': resultat,
        'annees_disponibles': [{'id': a['annee_academique__id'], 'libelle': a['annee_academique__libelle']} for a in annees_disponibles],
    })
















# ======================= DOCUMENTS =======================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_etudiant')
def documents(request):
    etu = _mon_etudiant(request)
    diplomes = Diplome.objects.filter(etudiant=etu)
    certificats = Certificat.objects.filter(etudiant=etu)
    docs = Document.objects.filter(concerne_etudiant=etu)
    resultat = []
    for d in diplomes:
        resultat.append({'titre': f"Diplôme {d.numero_diplome}", 'categorie': 'Diplôme', 'date': d.date_obtention.isoformat(), 'statut': d.statut, 'fichier': request.build_absolute_uri(d.fichier.url) if d.fichier else None})
    for c in certificats:
        resultat.append({'titre': f"Certificat {c.numero}", 'categorie': 'Certificat', 'date': c.date_emission.isoformat(), 'statut': 'valide', 'fichier': request.build_absolute_uri(c.fichier.url) if c.fichier else None})
    for doc in docs:
        resultat.append({'titre': doc.titre, 'categorie': doc.categorie or 'Autre', 'date': doc.date_ajout.date().isoformat(), 'statut': 'disponible', 'fichier': request.build_absolute_uri(doc.fichier.url) if doc.fichier else None})
    resultat.sort(key=lambda x: x['date'], reverse=True)
    return Response(resultat)















# ======================= DOSSIER (lecture seule) =======================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_etudiant')
def dossier(request):
    etu = _mon_etudiant(request)
    return Response({
        'nom': etu.nom, 'prenom': etu.prenom, 'sexe': etu.sexe, 'date_naissance': etu.date_naissance,
        'matricule': etu.matricule, 'telephone': etu.telephone, 'email': etu.email, 'adresse': etu.adresse,
        'nom_tuteur': etu.nom_tuteur, 'telephone_tuteur': etu.telephone_tuteur,
        'photo': request.build_absolute_uri(etu.photo.url) if etu.photo else None,
        'specialite': str(etu.specialite) if etu.specialite else '—', 'classe': str(etu.classe) if etu.classe else '—',
        'niveau': str(etu.niveau) if etu.niveau else '—', 'statut': etu.statut,
        'annee_academique': AnneeAcademique.objects.filter(statut=True).first().libelle if AnneeAcademique.objects.filter(statut=True).exists() else '—',
    })















# ======================= MON COMPTE =======================
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_etudiant')
@parser_classes([MultiPartParser, FormParser])
def mon_compte(request):
    user = request.user
    if request.method == 'GET':
        return Response({
            'username': user.username, 'email': user.email,
            'photo_profil': request.build_absolute_uri(user.photo_profil.url) if user.photo_profil else None,
        })
    if 'username' in request.data:
        user.username = request.data['username']
    if 'email' in request.data:
        user.email = request.data['email']
    if 'photo_profil' in request.FILES:
        user.photo_profil = request.FILES['photo_profil']
    user.save()
    return Response({
        'username': user.username, 'email': user.email,
        'photo_profil': request.build_absolute_uri(user.photo_profil.url) if user.photo_profil else None,
    })





@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_etudiant')
def changer_mot_de_passe(request):
    user = request.user
    ancien = request.data.get('ancien_mot_de_passe')
    nouveau = request.data.get('nouveau_mot_de_passe')
    if not user.check_password(ancien):
        return Response({'detail': 'Ancien mot de passe incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
    if not nouveau or len(nouveau) < 8:
        return Response({'detail': 'Le nouveau mot de passe doit contenir au moins 8 caractères.'}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(nouveau)
    user.save()
    return Response({'detail': 'Mot de passe modifié avec succès.'})



