from datetime import timedelta

from django.shortcuts import get_object_or_404

from django.utils import timezone

from django.db.models import Avg, Count

from rest_framework.decorators import api_view, permission_classes

from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response

from rest_framework import status

from apps.authentification.decorators import permission_requise

from apps.utilisateurs.models import Formateur, Etudiant

from apps.academique.models import Seance, AnneeAcademique, Classe, Matiere

from apps.notes.models import Note, Deliberation, TypeEvaluation

from apps.notes.services import calculer_moyenne_matiere, mention





JOURS_CODE = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']

JOURS_LABEL = {'LUN': 'Lundi', 'MAR': 'Mardi', 'MER': 'Mercredi', 'JEU': 'Jeudi', 'VEN': 'Vendredi', 'SAM': 'Samedi', 'DIM': 'Dimanche'}



def _mon_formateur(request):
    return get_object_or_404(Formateur, personnel__user=request.user)



def _combos_actuels(formateur, annee):
    """Classes/matières ACTUELLEMENT enseignées (année active, emploi publié) — pour l'écriture (saisie)."""
    seances = Seance.objects.filter(
        formateur=formateur, emploi_du_temps__annee_academique=annee, emploi_du_temps__statut='publie',
    ).select_related('matiere', 'emploi_du_temps__classe')
    combos = {}
    for s in seances:
        cle = (s.emploi_du_temps.classe_id, s.matiere_id)
        combos[cle] = {'classe_id': s.emploi_du_temps.classe_id, 'classe_str': str(s.emploi_du_temps.classe), 'matiere_id': s.matiere_id, 'matiere_nom': s.matiere.nom}
    return list(combos.values())
def _combos_historique(formateur):
    """Classes/matières déjà enseignées un jour, toutes années confondues — pour la lecture (consultation)."""
    seances = Seance.objects.filter(formateur=formateur).select_related('matiere', 'emploi_du_temps__classe', 'emploi_du_temps__annee_academique')
    combos = {}
    for s in seances:
        cle = (s.emploi_du_temps.classe_id, s.matiere_id)
        if cle not in combos:
            combos[cle] = {'classe_id': s.emploi_du_temps.classe_id, 'classe_str': str(s.emploi_du_temps.classe), 'matiere_id': s.matiere_id, 'matiere_nom': s.matiere.nom}
    return list(combos.values())
def _periode_verrouillee(etudiant, annee, semestre):
    return Deliberation.objects.filter(etudiant=etudiant, annee_academique=annee, periode=semestre).exists()




# ======================= ACCUEIL =======================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def accueil(request):
    formateur = _mon_formateur(request)
    annee = AnneeAcademique.objects.filter(statut=True).first()
    aujourdhui = timezone.localdate()
    debut_semaine = aujourdhui - timedelta(days=aujourdhui.weekday())
    fin_semaine = debut_semaine + timedelta(days=6)
    seances_semaine = Seance.objects.filter(
        formateur=formateur, emploi_du_temps__statut='publie',
        emploi_du_temps__semaine_debut__lte=fin_semaine, emploi_du_temps__semaine_fin__gte=debut_semaine,
    ) if annee else Seance.objects.none()
    combos = _combos_actuels(formateur, annee) if annee else []
    classes_ids = {c['classe_id'] for c in combos}
    matieres_ids = {c['matiere_id'] for c in combos}
    nb_etudiants = Etudiant.objects.filter(classe_id__in=classes_ids, statut='ACTIF').distinct().count() if classes_ids else 0
    # Notes en attente : étudiants sans note pour au moins un type d'évaluation actif, sur ses combos
    types_actifs = list(TypeEvaluation.objects.filter(actif=True))
    semestre_courant = 'S2' if Deliberation.objects.filter(annee_academique=annee, periode='S2').exists() else 'S1'
    nb_attente = 0
    if annee:
        for c in combos:
            etudiants_classe = Etudiant.objects.filter(classe_id=c['classe_id'], statut='ACTIF')
            for etu in etudiants_classe:
                nb_notes = Note.objects.filter(etudiant=etu, matiere_id=c['matiere_id'], annee_academique=annee, semestre=semestre_courant).count()
                if nb_notes < len(types_actifs):
                    nb_attente += 1
    moyennes = []
    for c in combos:
        for etu in Etudiant.objects.filter(classe_id=c['classe_id'], statut='ACTIF'):
            moy = calculer_moyenne_matiere(etu, Matiere.objects.get(pk=c['matiere_id']), annee, semestre_courant) if annee else None
            if moy is not None:
                moyennes.append(float(moy))
    moyenne_generale = round(sum(moyennes) / len(moyennes), 2) if moyennes else None
    # Cours d'aujourd'hui
    code_jour = JOURS_CODE[aujourdhui.weekday()]
    seances_jour = seances_semaine.filter(jour=code_jour).select_related('matiere', 'emploi_du_temps__classe', 'salle').order_by('heure_debut')
    return Response({
        'formateur': {'nom': formateur.personnel.nom, 'prenom': formateur.personnel.prenom, 'photo': request.build_absolute_uri(formateur.personnel.photo.url) if formateur.personnel.photo else None},
        'kpis': {
            'seances_semaine': seances_semaine.count(),
            'nb_classes': len(classes_ids),
            'nb_matieres': len(matieres_ids),
            'nb_etudiants': nb_etudiants,
            'notes_en_attente': nb_attente,
            'moyenne_generale': moyenne_generale,
        },
        'cours_aujourdhui': [{
            'matiere': s.matiere.nom, 'classe': str(s.emploi_du_temps.classe),
            'heure_debut': s.heure_debut.strftime('%H:%M'), 'heure_fin': s.heure_fin.strftime('%H:%M'),
            'salle': s.salle.nom if s.salle else '—',
        } for s in seances_jour],
    })








# ======================= PLANNING =======================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def planning(request):
    formateur = _mon_formateur(request)
    offset = int(request.GET.get('semaine_offset', 0))
    aujourdhui = timezone.localdate()
    debut_semaine = aujourdhui - timedelta(days=aujourdhui.weekday()) + timedelta(weeks=offset)
    fin_semaine = debut_semaine + timedelta(days=6)
    seances = Seance.objects.filter(
        formateur=formateur, emploi_du_temps__statut='publie',
        emploi_du_temps__semaine_debut__lte=fin_semaine, emploi_du_temps__semaine_fin__gte=debut_semaine,
    ).select_related('matiere', 'salle', 'emploi_du_temps__classe')
    jours = []
    for i, jour_code in enumerate(JOURS_CODE[:6]):
        date_jour = debut_semaine + timedelta(days=i)
        seances_jour = seances.filter(jour=jour_code).order_by('heure_debut')
        jours.append({
            'jour': JOURS_LABEL[jour_code], 'date': date_jour.isoformat(),
            'seances': [{
                'matiere': s.matiere.nom, 'classe': str(s.emploi_du_temps.classe),
                'heure_debut': s.heure_debut.strftime('%H:%M'), 'heure_fin': s.heure_fin.strftime('%H:%M'),
                'salle': s.salle.nom if s.salle else '—', 'type_seance': s.type_seance,
            } for s in seances_jour],
        })
    return Response({'debut_semaine': debut_semaine.isoformat(), 'fin_semaine': fin_semaine.isoformat(), 'jours': jours})









# ======================= MES CLASSES & MATIÈRES =======================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def mes_classes_matieres(request):
    formateur = _mon_formateur(request)
    annee = AnneeAcademique.objects.filter(statut=True).first()
    combos = _combos_actuels(formateur, annee) if annee else []
    resultat = []
    for c in combos:
        effectif = Etudiant.objects.filter(classe_id=c['classe_id'], statut='ACTIF').count()
        resultat.append({**c, 'effectif': effectif})
    return Response(resultat)






# ======================= SAISIE DE NOTES (scopée) =======================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def contexte_saisie(request):
    """Étudiants + notes existantes pour un couple (classe, matière) — vérifie le scope avant tout."""
    formateur = _mon_formateur(request)
    classe_id = request.GET.get('classe')
    matiere_id = request.GET.get('matiere')
    annee_id = request.GET.get('annee_academique')
    semestre = request.GET.get('semestre')
    type_evaluation_id = request.GET.get('type_evaluation')
    if not all([classe_id, matiere_id, annee_id, semestre, type_evaluation_id]):
        return Response({'detail': 'Paramètres manquants.'}, status=status.HTTP_400_BAD_REQUEST)
    combo_valide = Seance.objects.filter(
        formateur=formateur, emploi_du_temps__classe_id=classe_id, matiere_id=matiere_id,
        emploi_du_temps__annee_academique_id=annee_id,
    ).exists()
    if not combo_valide:
        return Response({'detail': "Vous n'enseignez pas cette matière à cette classe."}, status=status.HTTP_403_FORBIDDEN)
    annee = get_object_or_404(AnneeAcademique, pk=annee_id)
    etudiants = Etudiant.objects.filter(classe_id=classe_id, statut='ACTIF').order_by('nom', 'prenom')
    resultat = []
    for etu in etudiants:
        note = Note.objects.filter(etudiant=etu, matiere_id=matiere_id, annee_academique=annee, semestre=semestre, type_evaluation_id=type_evaluation_id).first()
        resultat.append({
            'etudiant_id': etu.id, 'matricule': etu.matricule, 'nom': etu.nom, 'prenom': etu.prenom,
            'valeur': str(note.valeur) if note else None,
            'verrouille': _periode_verrouillee(etu, annee, semestre),
        })
    return Response(resultat)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def enregistrer_notes(request):
    formateur = _mon_formateur(request)
    classe_id = request.data.get('classe')
    matiere_id = request.data.get('matiere')
    annee_id = request.data.get('annee_academique')
    semestre = request.data.get('semestre')
    type_evaluation_id = request.data.get('type_evaluation')
    notes_data = request.data.get('notes', [])
    combo_valide = Seance.objects.filter(
        formateur=formateur, emploi_du_temps__classe_id=classe_id, matiere_id=matiere_id,
        emploi_du_temps__annee_academique_id=annee_id,
    ).exists()
    if not combo_valide:
        return Response({'detail': "Vous n'enseignez pas cette matière à cette classe."}, status=status.HTTP_403_FORBIDDEN)
    annee = get_object_or_404(AnneeAcademique, pk=annee_id)
    nb_enregistrees = 0
    erreurs = []
    for item in notes_data:
        etudiant = Etudiant.objects.filter(pk=item['etudiant_id'], classe_id=classe_id).first()
        if not etudiant:
            continue
        if _periode_verrouillee(etudiant, annee, semestre):
            erreurs.append(f"{etudiant.nom} {etudiant.prenom} : période verrouillée (délibération déjà effectuée).")
            continue
        valeur = item.get('valeur')
        if valeur in (None, ''):
            Note.objects.filter(etudiant=etudiant, matiere_id=matiere_id, annee_academique=annee, semestre=semestre, type_evaluation_id=type_evaluation_id).delete()
            continue
        Note.objects.update_or_create(
            etudiant=etudiant, matiere_id=matiere_id, annee_academique=annee, semestre=semestre, type_evaluation_id=type_evaluation_id,
            defaults={'valeur': valeur},
        )
        nb_enregistrees += 1
    return Response({'nb_enregistrees': nb_enregistrees, 'erreurs': erreurs})
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def combos_pour_saisie(request):
    """Alimente les selects du modal de saisie — année active uniquement."""
    formateur = _mon_formateur(request)
    annee = AnneeAcademique.objects.filter(statut=True).first()
    return Response({
        'combos': _combos_actuels(formateur, annee) if annee else [],
        'annees_academiques': list(AnneeAcademique.objects.values('id', 'libelle')),
        'types_evaluation': list(TypeEvaluation.objects.filter(actif=True).values('id', 'code', 'libelle')),
    })








# ======================= CONSULTATION (historique complet, lecture) =======================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def combos_pour_consultation(request):
    formateur = _mon_formateur(request)
    return Response({
        'combos': _combos_historique(formateur),
        'annees_academiques': list(AnneeAcademique.objects.values('id', 'libelle')),
    })
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def consultation(request):
    formateur = _mon_formateur(request)
    classe_id = request.GET.get('classe')
    matiere_id = request.GET.get('matiere')
    annee_id = request.GET.get('annee_academique')
    semestre = request.GET.get('semestre')
    combo_valide = Seance.objects.filter(formateur=formateur, emploi_du_temps__classe_id=classe_id, matiere_id=matiere_id).exists()
    if not combo_valide:
        return Response({'detail': "Vous n'avez jamais enseigné cette matière à cette classe."}, status=status.HTTP_403_FORBIDDEN)
    annee = get_object_or_404(AnneeAcademique, pk=annee_id)
    matiere = get_object_or_404(Matiere, pk=matiere_id)
    types_actifs = list(TypeEvaluation.objects.filter(actif=True))
    etudiants = Etudiant.objects.filter(classe_id=classe_id, statut='ACTIF').order_by('nom', 'prenom')
    lignes = []
    for etu in etudiants:
        notes_par_type = {n.type_evaluation_id: n.valeur for n in Note.objects.filter(etudiant=etu, matiere=matiere, annee_academique=annee, semestre=semestre)}
        moy = calculer_moyenne_matiere(etu, matiere, annee, semestre)
        lignes.append({
            'etudiant_id': etu.id, 'matricule': etu.matricule, 'nom': etu.nom, 'prenom': etu.prenom,
            'notes_par_type': [{'code': t.code, 'valeur': str(notes_par_type.get(t.id)) if notes_par_type.get(t.id) is not None else None} for t in types_actifs],
            'moyenne': float(moy) if moy is not None else None,
        })
    return Response({'lignes': lignes, 'types_evaluation': [{'code': t.code, 'libelle': t.libelle} for t in types_actifs]})










# ======================= MES ÉTUDIANTS =======================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def mes_etudiants(request):
    formateur = _mon_formateur(request)
    matiere_id = request.GET.get('matiere')
    annee = AnneeAcademique.objects.filter(statut=True).first()
    combos = _combos_actuels(formateur, annee) if annee else []
    if matiere_id:
        combos = [c for c in combos if str(c['matiere_id']) == str(matiere_id)]
    resultat = []
    vus = set()
    for c in combos:
        for etu in Etudiant.objects.filter(classe_id=c['classe_id'], statut='ACTIF'):
            if (etu.id, c['matiere_id']) in vus:
                continue
            vus.add((etu.id, c['matiere_id']))
            mat = Matiere.objects.get(pk=c['matiere_id'])
            moy_s1 = calculer_moyenne_matiere(etu, mat, annee, 'S1') if annee else None
            moy_s2 = calculer_moyenne_matiere(etu, mat, annee, 'S2') if annee else None
            moys = [float(m) for m in (moy_s1, moy_s2) if m is not None]
            moy_annee = round(sum(moys) / len(moys), 2) if moys else None
            resultat.append({
                'etudiant_id': etu.id, 'nom': etu.nom, 'prenom': etu.prenom, 'matricule': etu.matricule,
                'statut': etu.statut, 'photo': request.build_absolute_uri(etu.photo.url) if etu.photo else None,
                'classe': c['classe_str'], 'matiere': mat.nom,
                'moyenne_s1': float(moy_s1) if moy_s1 is not None else None,
                'moyenne_s2': float(moy_s2) if moy_s2 is not None else None,
                'moyenne_annee': moy_annee,
            })
    return Response(resultat)










# ======================= RÉSULTATS DE MES MATIÈRES (dashboard) =======================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def resultats_matieres(request):
    formateur = _mon_formateur(request)
    annee = AnneeAcademique.objects.filter(statut=True).first()
    combos = _combos_actuels(formateur, annee) if annee else []
    par_matiere = {}
    evolution_par_matiere = {}
    for c in combos:
        mat = Matiere.objects.get(pk=c['matiere_id'])
        moyennes_par_annee = []
        for a in AnneeAcademique.objects.order_by('date_debut'):
            moys = []
            for sem in ['S1', 'S2']:
                for etu in Etudiant.objects.filter(classe_id=c['classe_id']):
                    m = calculer_moyenne_matiere(etu, mat, a, sem)
                    if m is not None:
                        moys.append(float(m))
            if moys:
                moyennes_par_annee.append({'annee': a.libelle, 'moyenne': round(sum(moys) / len(moys), 2)})
        if mat.id not in par_matiere:
            toutes_moys = []
            for etu in Etudiant.objects.filter(classe_id=c['classe_id'], statut='ACTIF'):
                for sem in ['S1', 'S2']:
                    m = calculer_moyenne_matiere(etu, mat, annee, sem) if annee else None
                    if m is not None:
                        toutes_moys.append(float(m))
            par_matiere[mat.id] = {'matiere': mat.nom, 'moyenne': round(sum(toutes_moys) / len(toutes_moys), 2) if toutes_moys else None}
            evolution_par_matiere[mat.id] = {'matiere': mat.nom, 'points': moyennes_par_annee}
    return Response({
        'resultats_par_matiere': list(par_matiere.values()),
        'evolution': list(evolution_par_matiere.values()),
    })









# ======================= COMPTE =======================
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def mon_compte(request):
    user = request.user
    if request.method == 'GET':
        return Response({'username': user.username, 'email': user.email, 'photo_profil': request.build_absolute_uri(user.photo_profil.url) if user.photo_profil else None})
    if 'username' in request.data:
        user.username = request.data['username']
    if 'email' in request.data:
        user.email = request.data['email']
    if 'photo_profil' in request.FILES:
        user.photo_profil = request.FILES['photo_profil']
    user.save()
    return Response({'username': user.username, 'email': user.email, 'photo_profil': request.build_absolute_uri(user.photo_profil.url) if user.photo_profil else None})
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def changer_mot_de_passe(request):
    user = request.user
    if not user.check_password(request.data.get('ancien_mot_de_passe')):
        return Response({'detail': 'Ancien mot de passe incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
    nouveau = request.data.get('nouveau_mot_de_passe')
    if not nouveau or len(nouveau) < 8:
        return Response({'detail': '8 caractères minimum.'}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(nouveau)
    user.save()
    return Response({'detail': 'Mot de passe modifié.'})







@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def detail_etudiant(request, pk):
    formateur = _mon_formateur(request)
    matiere_id = request.GET.get('matiere')
    etu = get_object_or_404(Etudiant, pk=pk)
    seances_communes = Seance.objects.filter(formateur=formateur, emploi_du_temps__classe=etu.classe)
    if matiere_id:
        seances_communes = seances_communes.filter(matiere_id=matiere_id)
    if not seances_communes.exists():
        return Response({'detail': "Vous n'enseignez pas à cet étudiant."}, status=status.HTTP_403_FORBIDDEN)
    annee = AnneeAcademique.objects.filter(statut=True).first()
    matieres_enseignees = list(Seance.objects.filter(formateur=formateur, emploi_du_temps__classe=etu.classe).values_list('matiere', flat=True).distinct())
    mat_id = matiere_id or (matieres_enseignees[0] if matieres_enseignees else None)
    resultats = []
    matiere_nom = None
    if mat_id:
        mat = Matiere.objects.get(pk=mat_id)
        matiere_nom = mat.nom
        moys = []
        for sem in ['S1', 'S2']:
            moy = calculer_moyenne_matiere(etu, mat, annee, sem) if annee else None
            notes = Note.objects.filter(etudiant=etu, matiere=mat, annee_academique=annee, semestre=sem).select_related('type_evaluation') if annee else []
            resultats.append({
                'semestre': sem, 'moyenne': float(moy) if moy is not None else None,
                'evaluations': [{'type': n.type_evaluation.libelle, 'valeur': float(n.valeur)} for n in notes],
            })
            if moy is not None:
                moys.append(float(moy))
        moyenne_annee = round(sum(moys) / len(moys), 2) if moys else None
    else:
        moyenne_annee = None
    return Response({
        'etudiant': {
            'nom': etu.nom, 'prenom': etu.prenom, 'matricule': etu.matricule, 'statut': etu.statut,
            'photo': request.build_absolute_uri(etu.photo.url) if etu.photo else None,
            'classe': str(etu.classe) if etu.classe else '—',
        },
        'matiere': matiere_nom, 'moyenne_annee': moyenne_annee,
        'resultats_semestres': resultats,
    })














@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def mon_dossier(request):
    formateur = _mon_formateur(request)
    personnel = formateur.personnel
    annee = AnneeAcademique.objects.filter(statut=True).first()
    combos = _combos_actuels(formateur, annee) if annee else []
    return Response({
        'nom': personnel.nom, 
        'prenom': personnel.prenom, 
        'sexe': personnel.sexe,
        'date_naissance': personnel.date_naissance, 
        'date_embauche': personnel.date_embauche,
        'telephone': personnel.telephone, 
        'email': personnel.email, 
        'adresse': personnel.adresse,
        'photo': request.build_absolute_uri(personnel.photo.url) if personnel.photo else None,
        'matricule': personnel.matricule, 
        'statut': personnel.statut,
        'poste': personnel.poste, 
        'salaire': personnel.salaire, 
        'fonction': personnel.fonction,
        'type_contrat': formateur.type_contrat,
        'filieres': list(formateur.filiere.values_list('nom', flat=True)),
        'specialites': list(formateur.specialite.values_list('code', flat=True)),
        'nb_classes_actuelles': len({c['classe_id'] for c in combos}),
        'nb_matieres_actuelles': len({c['matiere_id'] for c in combos}),
    })







@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def mes_emplois_du_temps(request):
    formateur = _mon_formateur(request)
    annee = AnneeAcademique.objects.filter(statut=True).first()
    edt_ids = Seance.objects.filter(formateur=formateur, emploi_du_temps__annee_academique=annee, emploi_du_temps__statut='publie').values_list('emploi_du_temps', flat=True).distinct() if annee else []
    from apps.academique.models import EmploiDuTemps
    edts = EmploiDuTemps.objects.filter(id__in=edt_ids)
    return Response([{'id': e.id, 'classe': str(e.classe), 'titre': e.nom_affiche} for e in edts])




@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('voir_espace_enseignant')
def telecharger_mon_planning(request, edt_id):
    formateur = _mon_formateur(request)
    existe = Seance.objects.filter(formateur=formateur, emploi_du_temps_id=edt_id).exists()
    if not existe:
        return Response({'detail': "Vous n'êtes pas affecté à cet emploi du temps."}, status=status.HTTP_403_FORBIDDEN)
    from apps.academique.views import export_emploi_du_temps_pdf
    return export_emploi_du_temps_pdf(request._request, edt_id)


