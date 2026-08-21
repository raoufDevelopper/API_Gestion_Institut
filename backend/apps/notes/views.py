from decimal import Decimal, InvalidOperation

from django.template.loader import render_to_string

from django.http import HttpResponse

from django.utils import timezone

from weasyprint import HTML

from rest_framework.decorators import api_view, permission_classes

from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response

from rest_framework import status

from apps.authentification.decorators import permission_requise

from apps.utilisateurs.models import Etudiant, Formateur

from apps.academique.models import Matiere, AnneeAcademique, Classe

from .models import TypeEvaluation, Note, Deliberation

from .serializers import TypeEvaluationSerializer, NoteSerializer, DeliberationSerializer

from .services import calculer_moyenne_matiere, calculer_deliberation_etudiant, construire_releves












# ================= TYPE EVALUATION =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_notes')
def liste_creer_types_evaluation(request):
    if request.method == 'GET':
        types_evaluation = TypeEvaluation.objects.all()
        return Response(TypeEvaluationSerializer(types_evaluation, many=True).data)
    serializer = TypeEvaluationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_notes')
def detail_type_evaluation(request, pk):
    try:
        type_evaluation = TypeEvaluation.objects.get(pk=pk)
    except TypeEvaluation.DoesNotExist:
        return Response({'detail': "Type d'évaluation introuvable."}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(TypeEvaluationSerializer(type_evaluation).data)
    if request.method == 'PATCH':
        serializer = TypeEvaluationSerializer(type_evaluation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    type_evaluation.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

















# ================= 1. SAISIE DES NOTES =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_notes')
def contexte_saisie_notes(request):
    """
    Renvoie la liste des étudiants d'une classe + leur note existante
    (si elle existe déjà) pour le contexte demandé, afin de pré-remplir
    le formulaire de saisie côté React.
    """
    classe_id = request.GET.get('classe')
    matiere_id = request.GET.get('matiere')
    annee_academique_id = request.GET.get('annee_academique')
    semestre = request.GET.get('semestre')
    type_evaluation_id = request.GET.get('type_evaluation')
    if not all([classe_id, matiere_id, annee_academique_id, semestre, type_evaluation_id]):
        return Response({'detail': 'Paramètres manquants.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        classe = Classe.objects.get(pk=classe_id)
        matiere = Matiere.objects.get(pk=matiere_id)
        annee_academique = AnneeAcademique.objects.get(pk=annee_academique_id)
        type_evaluation = TypeEvaluation.objects.get(pk=type_evaluation_id)
    except (Classe.DoesNotExist, Matiere.DoesNotExist, AnneeAcademique.DoesNotExist, TypeEvaluation.DoesNotExist):
        return Response({'detail': 'Contexte invalide.'}, status=status.HTTP_404_NOT_FOUND)
    etudiants = Etudiant.objects.filter(classe=classe, statut='ACTIF').order_by('nom', 'prenom')
    notes_existantes = {
        note.etudiant_id: str(note.valeur)
        for note in Note.objects.filter(
            matiere=matiere,
            annee_academique=annee_academique,
            semestre=semestre,
            type_evaluation=type_evaluation,
            etudiant__in=etudiants,
        )
    }
    resultat = [
        {
            'etudiant_id': etudiant.id,
            'matricule': etudiant.matricule,
            'nom': etudiant.nom,
            'prenom': etudiant.prenom,
            'valeur': notes_existantes.get(etudiant.id),
        }
        for etudiant in etudiants
    ]
    return Response(resultat)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_notes')
def saisir_notes(request):
    """
    Enregistrement en masse des notes d'une classe pour un contexte précis.
    Body attendu :
    {
        "matiere": id, "annee_academique": id, "semestre": "S1",
        "type_evaluation": id,
        "notes": [{"etudiant_id": 1, "valeur": 14.5}, {"etudiant_id": 2, "valeur": null}, ...]
    }
    """
    matiere_id = request.data.get('matiere')
    annee_academique_id = request.data.get('annee_academique')
    semestre = request.data.get('semestre')
    type_evaluation_id = request.data.get('type_evaluation')
    lignes = request.data.get('notes', [])
    if not all([matiere_id, annee_academique_id, semestre, type_evaluation_id]):
        return Response({'detail': 'Paramètres manquants.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        matiere = Matiere.objects.get(pk=matiere_id)
        annee_academique = AnneeAcademique.objects.get(pk=annee_academique_id)
        type_evaluation = TypeEvaluation.objects.get(pk=type_evaluation_id)
    except (Matiere.DoesNotExist, AnneeAcademique.DoesNotExist, TypeEvaluation.DoesNotExist):
        return Response({'detail': 'Contexte invalide.'}, status=status.HTTP_404_NOT_FOUND)
    formateur = None
    try:
        formateur = request.user.personnel.formateur
    except (AttributeError, Formateur.DoesNotExist):
        formateur = None
    nb_enregistrees = 0
    erreurs = []
    for ligne in lignes:
        etudiant_id = ligne.get('etudiant_id')
        valeur_brute = ligne.get('valeur')
        if not etudiant_id:
            continue
        if valeur_brute is None or valeur_brute == '':
            Note.objects.filter(
                etudiant_id=etudiant_id,
                matiere=matiere,
                annee_academique=annee_academique,
                semestre=semestre,
                type_evaluation=type_evaluation,
            ).delete()
            continue
        try:
            valeur = Decimal(str(valeur_brute))
        except InvalidOperation:
            erreurs.append(f"Valeur invalide pour l'étudiant {etudiant_id}.")
            continue
        try:
            note, _ = Note.objects.update_or_create(
                etudiant_id=etudiant_id,
                matiere=matiere,
                annee_academique=annee_academique,
                semestre=semestre,
                type_evaluation=type_evaluation,
                defaults={'valeur': valeur, 'formateur': formateur},
            )
            nb_enregistrees += 1
        except Exception as e:
            erreurs.append(f"Étudiant {etudiant_id} : {str(e)}")
    return Response({
        'nb_enregistrees': nb_enregistrees,
        'erreurs': erreurs,
    }, status=status.HTTP_200_OK)


















# ================= 2. CONSULTATION DES NOTES =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_notes')
def consultation_notes(request):
    classe_id = request.GET.get('classe')
    matiere_id = request.GET.get('matiere')
    annee_academique_id = request.GET.get('annee_academique')
    semestre = request.GET.get('semestre')
    if not all([classe_id, matiere_id, annee_academique_id, semestre]):
        return Response({'detail': 'Paramètres manquants.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        classe = Classe.objects.get(pk=classe_id)
        matiere = Matiere.objects.get(pk=matiere_id)
        annee_academique = AnneeAcademique.objects.get(pk=annee_academique_id)
    except (Classe.DoesNotExist, Matiere.DoesNotExist, AnneeAcademique.DoesNotExist):
        return Response({'detail': 'Contexte invalide.'}, status=status.HTTP_404_NOT_FOUND)
    etudiants = Etudiant.objects.filter(classe=classe, statut='ACTIF').order_by('nom', 'prenom')
    types_actifs = list(TypeEvaluation.objects.filter(actif=True))
    lignes = []
    for etudiant in etudiants:
        notes_par_type = {
            note.type_evaluation_id: str(note.valeur)
            for note in Note.objects.filter(
                etudiant=etudiant, matiere=matiere,
                annee_academique=annee_academique, semestre=semestre,
            )
        }
        moyenne = calculer_moyenne_matiere(etudiant, matiere, annee_academique, semestre)
        lignes.append({
            'etudiant_id': etudiant.id,
            'matricule': etudiant.matricule,
            'nom': etudiant.nom,
            'prenom': etudiant.prenom,
            'notes_par_type': [
                {
                    'type_evaluation_id': t.id,
                    'type_evaluation_libelle': t.libelle,
                    'valeur': notes_par_type.get(t.id),
                }
                for t in types_actifs
            ],
            'moyenne': str(moyenne) if moyenne is not None else None,
        })
    return Response(lignes)





















# ================= 3. RELEVÉ DES NOTES =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_notes')
def releve_notes(request):
    classe_id = request.GET.get('classe')
    annee_academique_id = request.GET.get('annee_academique')
    periode = request.GET.get('periode')
    etudiant_id = request.GET.get('etudiant')
    if not all([classe_id, annee_academique_id, periode]):
        return Response({'detail': 'Paramètres manquants.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        classe = Classe.objects.get(pk=classe_id)
        annee_academique = AnneeAcademique.objects.get(pk=annee_academique_id)
    except (Classe.DoesNotExist, AnneeAcademique.DoesNotExist):
        return Response({'detail': 'Contexte invalide.'}, status=status.HTTP_404_NOT_FOUND)
    etudiant_choisi = None
    if etudiant_id:
        try:
            etudiant_choisi = Etudiant.objects.get(pk=etudiant_id)
        except Etudiant.DoesNotExist:
            return Response({'detail': 'Étudiant introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    releves = construire_releves(classe, annee_academique, periode, etudiant_choisi)
    resultat = []
    for r in releves:
        resultat.append({
            'etudiant_id': r['etudiant'].id,
            'matricule': r['etudiant'].matricule,
            'nom': r['etudiant'].nom,
            'prenom': r['etudiant'].prenom,
            'details_semestres': [
                {
                    'semestre': d['semestre'],
                    'moyenne_generale': str(d['moyenne_generale']) if d['moyenne_generale'] is not None else None,
                    'mention': d['mention'],
                    'detail_matieres': [
                        {
                            'matiere': ligne['matiere'].nom,
                            'coefficient': ligne['coefficient'],
                            'moyenne': str(ligne['moyenne']) if ligne['moyenne'] is not None else None,
                            'moyenne_ponderee': str(ligne['moyenne_ponderee']) if ligne['moyenne_ponderee'] is not None else None,
                        }
                        for ligne in d['detail_matieres']
                    ],
                }
                for d in r['details_semestres']
            ],
            'moyenne_annuelle': str(r['moyenne_annuelle']) if r['moyenne_annuelle'] is not None else None,
            'mention_annuelle': r['mention_annuelle'],
        })
    return Response(resultat)





@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_notes')
def releve_notes_pdf(request):
    classe_id = request.GET.get('classe')
    annee_academique_id = request.GET.get('annee_academique')
    periode = request.GET.get('periode')
    etudiant_id = request.GET.get('etudiant')
    if not all([classe_id, annee_academique_id, periode]):
        return Response({'detail': 'Paramètres manquants.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        classe = Classe.objects.get(pk=classe_id)
        annee_academique = AnneeAcademique.objects.get(pk=annee_academique_id)
    except (Classe.DoesNotExist, AnneeAcademique.DoesNotExist):
        return Response({'detail': 'Contexte invalide.'}, status=status.HTTP_404_NOT_FOUND)
    etudiant_choisi = None
    if etudiant_id:
        try:
            etudiant_choisi = Etudiant.objects.get(pk=etudiant_id)
        except Etudiant.DoesNotExist:
            return Response({'detail': 'Étudiant introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    releves = construire_releves(classe, annee_academique, periode, etudiant_choisi)
    html_string = render_to_string('notes/releve_pdf.html', {
        'releves': releves,
        'classe': classe,
        'annee_academique': annee_academique,
        'periode': periode,
        'types_actifs': TypeEvaluation.objects.filter(actif=True),
        'date_generation': timezone.now().strftime('%d/%m/%Y à %H:%M'),
    })
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
    response = HttpResponse(pdf_file, content_type='application/pdf')
    nom_fichier = f"releve_notes_{classe}.pdf".replace(" ", "_")
    response['Content-Disposition'] = f'attachment; filename="{nom_fichier}"'
    return response


























# ================= 4. DÉLIBÉRATION =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_notes')
def deliberation(request):
    classe_id = request.GET.get('classe') or request.data.get('classe')
    annee_academique_id = request.GET.get('annee_academique') or request.data.get('annee_academique')
    periode = request.GET.get('periode') or request.data.get('periode')
    if not all([classe_id, annee_academique_id, periode]):
        return Response({'detail': 'Paramètres manquants.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        classe = Classe.objects.get(pk=classe_id)
        annee_academique = AnneeAcademique.objects.get(pk=annee_academique_id)
    except (Classe.DoesNotExist, AnneeAcademique.DoesNotExist):
        return Response({'detail': 'Contexte invalide.'}, status=status.HTTP_404_NOT_FOUND)
    etudiants = Etudiant.objects.filter(classe=classe, statut='ACTIF').order_by('nom', 'prenom')
    if request.method == 'POST':
        nb_calculees = 0
        nb_verrouillees_ignorees = 0
        for etudiant in etudiants:
            deliberation_existante = Deliberation.objects.filter(
                etudiant=etudiant, annee_academique=annee_academique, periode=periode,
            ).first()
            if deliberation_existante and deliberation_existante.verrouillee:
                nb_verrouillees_ignorees += 1
                continue
            resultat = calculer_deliberation_etudiant(etudiant, annee_academique, periode)
            Deliberation.objects.update_or_create(
                etudiant=etudiant, annee_academique=annee_academique, periode=periode,
                defaults={
                    'moyenne_generale': resultat['moyenne_generale'],
                    'credits_obtenus': resultat['credits_obtenus'],
                    'credits_requis': resultat['credits_requis'],
                    'seuil_admission': resultat['seuil_admission'],
                    'decision': resultat['decision'],
                    'matieres_non_validees': resultat['matieres_non_validees'],
                },
            )
            nb_calculees += 1
    resultats = Deliberation.objects.filter(
        etudiant__in=etudiants, annee_academique=annee_academique, periode=periode,
    ).select_related('etudiant').order_by('etudiant__nom', 'etudiant__prenom')
    return Response(DeliberationSerializer(resultats, many=True).data)






@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_notes')
def deliberation_verrouiller(request, pk):
    try:
        deliberation_obj = Deliberation.objects.get(pk=pk)
    except Deliberation.DoesNotExist:
        return Response({'detail': 'Délibération introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    deliberation_obj.verrouillee = not deliberation_obj.verrouillee
    deliberation_obj.save(update_fields=['verrouillee'])
    return Response(DeliberationSerializer(deliberation_obj).data)






@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_notes')
def deliberation_pdf(request):
    classe_id = request.GET.get('classe')
    annee_academique_id = request.GET.get('annee_academique')
    periode = request.GET.get('periode')
    if not all([classe_id, annee_academique_id, periode]):
        return Response({'detail': 'Paramètres manquants.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        classe = Classe.objects.get(pk=classe_id)
        annee_academique = AnneeAcademique.objects.get(pk=annee_academique_id)
    except (Classe.DoesNotExist, AnneeAcademique.DoesNotExist):
        return Response({'detail': 'Contexte invalide.'}, status=status.HTTP_404_NOT_FOUND)
    etudiants = Etudiant.objects.filter(classe=classe, statut='ACTIF')
    resultats = list(
        Deliberation.objects.filter(
            etudiant__in=etudiants, annee_academique=annee_academique, periode=periode,
        ).select_related('etudiant').order_by('etudiant__nom', 'etudiant__prenom')
    )
    recapitulatif = {
        'admis': sum(1 for r in resultats if r.decision == 'ADMIS'),
        'rattrapage': sum(1 for r in resultats if r.decision == 'RATTRAPAGE'),
        'redoublant': sum(1 for r in resultats if r.decision == 'REDOUBLANT'),
        'incomplet': sum(1 for r in resultats if r.decision == 'INCOMPLET'),
    }
    html_string = render_to_string('notes/deliberation_pdf.html', {
        'resultats': resultats,
        'classe': classe,
        'annee_academique': annee_academique,
        'periode': periode,
        'recapitulatif': recapitulatif,
        'date_generation': timezone.now().strftime('%d/%m/%Y à %H:%M'),
    })
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
    response = HttpResponse(pdf_file, content_type='application/pdf')
    nom_fichier = f"pv_deliberation_{classe}.pdf".replace(" ", "_")
    response['Content-Disposition'] = f'attachment; filename="{nom_fichier}"'
    return response



























# ================= (correction ponctuelle) =================
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_notes')
def detail_note(request, pk):
    try:
        note = Note.objects.get(pk=pk)
    except Note.DoesNotExist:
        return Response({'detail': 'Note introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(NoteSerializer(note).data)
    if request.method == 'PATCH':
        serializer = NoteSerializer(note, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    note.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)