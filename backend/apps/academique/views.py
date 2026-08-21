from rest_framework.decorators import api_view, permission_classes

from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response

from rest_framework import status

from django.core.exceptions import ValidationError as DjangoValidationError

from apps.authentification.decorators import permission_requise

from .models import Niveau, Filiere, Specialite, TypeSalle, Salle, Matiere, AnneeAcademique, Classe, EmploiDuTemps, Seance, Sanction

from .serializers import NiveauSerializer, FiliereSerializer, SpecialiteSerializer, TypeSalleSerializer, SalleSerializer, MatiereSerializer, AnneeAcademiqueSerializer, ClasseSerializer, EmploiDuTempsSerializer, SeanceSerializer, SanctionSerializer

from django.template.loader import render_to_string

from django.http import HttpResponse

from django.utils import timezone

from weasyprint import HTML






# ================= NIVEAU =================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_niveaux')
def liste_creer_niveaux(request):

    if request.method == 'GET':

        niveaux = Niveau.objects.all()

        return Response(NiveauSerializer(niveaux, many=True).data)

    serializer = NiveauSerializer(data=request.data)


    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_niveaux')
def detail_niveau(request, pk):

    try:
        niveau = Niveau.objects.get(pk=pk)

    except Niveau.DoesNotExist:
        return Response({'detail': 'Niveau introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(NiveauSerializer(niveau).data)


    if request.method == 'PATCH':

        serializer = NiveauSerializer(niveau, data=request.data, partial=True)

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    niveau.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)

# ================= NIVEAU =================

    




    




    
# ================= FILIERE =================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_filieres')
def liste_creer_filieres(request):

    if request.method == 'GET':

        filieres = Filiere.objects.all()

        return Response(FiliereSerializer(filieres, many=True).data)

    serializer = FiliereSerializer(data=request.data)


    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_filieres')
def detail_filiere(request, pk):

    try:
        filiere = Filiere.objects.get(pk=pk)

    except Filiere.DoesNotExist:
        return Response({'detail': 'Filière introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(FiliereSerializer(filiere).data)


    if request.method == 'PATCH':

        serializer = FiliereSerializer(filiere, data=request.data, partial=True)

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    filiere.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)

# ================= FILIERE =================

    
    








    
# ================= SPECIALITE =================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_specialites')
def liste_creer_specialites(request):

    if request.method == 'GET':

        specialites = Specialite.objects.all()

        return Response(SpecialiteSerializer(specialites, many=True).data)

    serializer = SpecialiteSerializer(data=request.data)


    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_specialites')
def detail_specialite(request, pk):

    try:
        specialite = Specialite.objects.get(pk=pk)

    except Specialite.DoesNotExist:
        return Response({'detail': 'Spécialité introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(SpecialiteSerializer(specialite).data)


    if request.method == 'PATCH':

        serializer = SpecialiteSerializer(specialite, data=request.data, partial=True)

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    specialite.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)

# ================= SPECIALITE =================

    
    








    
# ================= TYPE SALLE =================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_salles')
def liste_creer_types_salle(request):

    if request.method == 'GET':

        types_salle = TypeSalle.objects.all()

        return Response(TypeSalleSerializer(types_salle, many=True).data)

    serializer = TypeSalleSerializer(data=request.data)


    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_salles')
def detail_type_salle(request, pk):

    try:
        type_salle = TypeSalle.objects.get(pk=pk)

    except TypeSalle.DoesNotExist:
        return Response({'detail': 'Type de salle introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(TypeSalleSerializer(type_salle).data)


    if request.method == 'PATCH':

        serializer = TypeSalleSerializer(type_salle, data=request.data, partial=True)

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    type_salle.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)

# ================= TYPE SALLE =================




    








# ================= SALLE =================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_salles')
def liste_creer_salles(request):

    if request.method == 'GET':

        salles = Salle.objects.all()

        return Response(SalleSerializer(salles, many=True).data)

    serializer = SalleSerializer(data=request.data)


    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_salles')
def detail_salle(request, pk):

    try:
        salle = Salle.objects.get(pk=pk)

    except Salle.DoesNotExist:
        return Response({'detail': 'Salle introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(SalleSerializer(salle).data)


    if request.method == 'PATCH':

        serializer = SalleSerializer(salle, data=request.data, partial=True)

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    salle.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)

# ================= SALLE =================
    







    




    
# ================= MATIERE =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_matieres')
def liste_creer_matieres(request):

    if request.method == 'GET':

        matieres = Matiere.objects.all()

        return Response(MatiereSerializer(matieres, many=True).data)

    serializer = MatiereSerializer(data=request.data)


    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_matieres')
def detail_matiere(request, pk):

    try:
        matiere = Matiere.objects.get(pk=pk)

    except Matiere.DoesNotExist:
        return Response({'detail': 'Matière introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(MatiereSerializer(matiere).data)
    

    if request.method == 'PATCH':

        serializer = MatiereSerializer(matiere, data=request.data, partial=True)

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    matiere.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)

# ================= MATIERE =================


    





    





    
# ================= ANNEE ACADEMIQUE =================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_annees_academiques')
def liste_creer_annees_academiques(request):

    if request.method == 'GET':

        annees = AnneeAcademique.objects.all()

        return Response(AnneeAcademiqueSerializer(annees, many=True).data)

    serializer = AnneeAcademiqueSerializer(data=request.data)


    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_annees_academiques')
def detail_annee_academique(request, pk):

    try:
        annee = AnneeAcademique.objects.get(pk=pk)

    except AnneeAcademique.DoesNotExist:
        return Response({'detail': 'Année académique introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(AnneeAcademiqueSerializer(annee).data)


    if request.method == 'PATCH':

        serializer = AnneeAcademiqueSerializer(annee, data=request.data, partial=True)

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    annee.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)

# ================= ANNEE ACADEMIQUE =================


    




    




    
# ================= CLASSE =================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_classes')
def liste_creer_classes(request):

    if request.method == 'GET':

        classes = Classe.objects.all()

        return Response(ClasseSerializer(classes, many=True).data)

    serializer = ClasseSerializer(data=request.data)


    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_classes')
def detail_classe(request, pk):

    try:
        classe = Classe.objects.get(pk=pk)

    except Classe.DoesNotExist:
        return Response({'detail': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(ClasseSerializer(classe).data)


    if request.method == 'PATCH':

        serializer = ClasseSerializer(classe, data=request.data, partial=True)

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    classe.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)

# ================= CLASSE =================



    





    




    
# ================= EMPLOI DU TEMPS =================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_emplois_du_temps')
def liste_creer_emplois_du_temps(request):

    if request.method == 'GET':

        emplois = EmploiDuTemps.objects.all()

        return Response(EmploiDuTempsSerializer(emplois, many=True).data)

    serializer = EmploiDuTempsSerializer(data=request.data)


    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_emplois_du_temps')
def detail_emploi_du_temps(request, pk):

    try:
        emploi = EmploiDuTemps.objects.get(pk=pk)

    except EmploiDuTemps.DoesNotExist:
        return Response({'detail': 'Emploi du temps introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(EmploiDuTempsSerializer(emploi).data)


    if request.method == 'PATCH':

        serializer = EmploiDuTempsSerializer(emploi, data=request.data, partial=True)

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    emploi.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)

# ================= EMPLOI DU TEMPS =================


    





    




    
# ================= SEANCE =================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_seances')
def liste_creer_seances(request):

    if request.method == 'GET':

        seances = Seance.objects.all()

        return Response(SeanceSerializer(seances, many=True).data)

    serializer = SeanceSerializer(data=request.data)


    if serializer.is_valid():

        try:
            serializer.save()

        except DjangoValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_seances')
def detail_seance(request, pk):

    try:
        seance = Seance.objects.get(pk=pk)

    except Seance.DoesNotExist:
        return Response({'detail': 'Séance introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(SeanceSerializer(seance).data)


    if request.method == 'PATCH':

        serializer = SeanceSerializer(seance, data=request.data, partial=True)

        if serializer.is_valid():

            try:
                serializer.save()

            except DjangoValidationError as e:
                return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    seance.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)

# ================= SEANCE =================




    





    



# ================= SANCTION =================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_sanctions')
def liste_creer_sanctions(request):

    if request.method == 'GET':

        sanctions = Sanction.objects.all()

        return Response(SanctionSerializer(sanctions, many=True).data)

    serializer = SanctionSerializer(data=request.data)


    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_sanctions')
def detail_sanction(request, pk):

    try:
        sanction = Sanction.objects.get(pk=pk)

    except Sanction.DoesNotExist:
        return Response({'detail': 'Sanction introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(SanctionSerializer(sanction).data)


    if request.method == 'PATCH':

        serializer = SanctionSerializer(sanction, data=request.data, partial=True)

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    sanction.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)

# ================= SANCTION =================




















#export PDF

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_emplois_du_temps')
def export_emploi_du_temps_pdf(request, pk):

    try:
        emploi = EmploiDuTemps.objects.get(pk=pk)

    except EmploiDuTemps.DoesNotExist:
        return Response({'detail': 'Emploi du temps introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    jours_ordre = [
        ('LUN', 'Lundi'), ('MAR', 'Mardi'), ('MER', 'Mercredi'), ('JEU', 'Jeudi'),
        ('VEN', 'Vendredi'), ('SAM', 'Samedi'), ('DIM', 'Dimanche'),
    ]

    seances_toutes = emploi.seances.all().order_by('heure_debut')

    jours = []


    for code, nom in jours_ordre:

        seances_jour = [s for s in seances_toutes if s.jour == code]

        seances_formatees = []

        for s in seances_jour:

            seances_formatees.append({

                'heure_debut': s.heure_debut.strftime('%Hh%M'),

                'heure_fin': s.heure_fin.strftime('%Hh%M'),

                'matiere': s.matiere.nom if s.matiere else '—',

                'formateur': str(s.formateur) if s.formateur else '—',

                'salle': s.salle.nom if s.salle else '—',

                'type_seance': s.get_type_seance_display(),

            })


        jours.append((code, nom, seances_formatees))


    contexte = {
        'nom_affiche': emploi.nom_affiche,
        'classe': str(emploi.classe),
        'semestre': emploi.get_semestre_display(),
        'annee_academique': str(emploi.annee_academique) if emploi.annee_academique else None,
        'semaine_debut': emploi.semaine_debut.strftime('%d/%m/%Y') if emploi.semaine_debut else None,
        'semaine_fin': emploi.semaine_fin.strftime('%d/%m/%Y') if emploi.semaine_fin else None,
        'jours': jours,
        'date_generation': timezone.now().strftime('%d/%m/%Y à %H:%M'),
    }

    html_string = render_to_string('academique/emploi_du_temps_pdf.html', contexte)

    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')

    response['Content-Disposition'] = f'attachment; filename="emploi_du_temps_{emploi.pk}.pdf"'

    return response
