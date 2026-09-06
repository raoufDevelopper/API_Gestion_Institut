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

from django.db.models import Count




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

        filieres = Filiere.objects.select_related('responsable').all()

        kpis = {
            'total': Filiere.objects.count(),
            'actif': Filiere.objects.filter(statut='actif').count(),
            'inactif': Filiere.objects.filter(statut='inactif').count(),
            'suspendu': Filiere.objects.filter(statut='suspendu').count(),
        }

        statut = request.GET.get('statut')
        if statut:
            filieres = filieres.filter(statut=statut)

        return Response({
            'resultats': FiliereSerializer(filieres, many=True, context={'request': request}).data,
            'kpis': kpis,
        })

    serializer = FiliereSerializer(data=request.data, context={'request': request})


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

        specialites = Specialite.objects.select_related('filiere').all()

        kpis = {
            'total': Specialite.objects.count(),
            'actif': Specialite.objects.filter(statut='actif').count(),
            'inactif': Specialite.objects.filter(statut='inactif').count(),
            'suspendu': Specialite.objects.filter(statut='suspendu').count(),
        }

        statut = request.GET.get('statut')
        if statut:
            specialites = specialites.filter(statut=statut)
        

        return Response({
            'resultats': SpecialiteSerializer(specialites, many=True, context={'request': request}).data,
            'kpis': kpis,
        })

    serializer = SpecialiteSerializer(data=request.data, context={'request': request})


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

        salles = Salle.objects.select_related('type_salle').all()

        kpis = {
            'total': Salle.objects.count(),
            'disponible': Salle.objects.filter(statut='disponible').count(),
            'indisponible': Salle.objects.filter(statut='indisponible').count(),
            'maintenance': Salle.objects.filter(statut='maintenance').count(),
        }

        statut = request.GET.get('statut')
        if statut:
            salles = salles.filter(statut=statut)

        return Response({
            'resultats': SalleSerializer(salles, many=True, context={'request': request}).data,
            'kpis': kpis,
        })

    serializer = SalleSerializer(data=request.data, context={'request': request})
    

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

        matieres = Matiere.objects.prefetch_related('specialite', 'niveau').all()

        kpis = {
            'total': Matiere.objects.count(),
            'actif': Matiere.objects.filter(statut='actif').count(),
            'inactif': Matiere.objects.filter(statut='inactif').count(),
            'suspendu': Matiere.objects.filter(statut='suspendu').count(),
        }

        statut = request.GET.get('statut')

        if statut:
            matieres = matieres.filter(statut=statut)

        return Response({
            'resultats': MatiereSerializer(matieres, many=True, context={'request': request}).data,
            'kpis': kpis,
        })

    serializer = MatiereSerializer(data=request.data, context={'request': request})


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

        kpis = {
            'total': AnneeAcademique.objects.count(),
            'active': AnneeAcademique.objects.filter(statut=True).count(),
            'archivee': AnneeAcademique.objects.filter(statut=False).count(),
        }

        return Response({
            'resultats': AnneeAcademiqueSerializer(annees, many=True, context={'request': request}).data,
            'kpis': kpis,
        })

    serializer = AnneeAcademiqueSerializer(data=request.data, context={'request': request})


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

        emplois = EmploiDuTemps.objects.select_related('classe', 'annee_academique').annotate(nb_seances=Count('seances'))

        kpis = {
            'total': EmploiDuTemps.objects.count(),
            'brouillon': EmploiDuTemps.objects.filter(statut='brouillon').count(),
            'publie': EmploiDuTemps.objects.filter(statut='publie').count(),
            'archive': EmploiDuTemps.objects.filter(statut='archive').count(),
        }

        return Response({
            'resultats': EmploiDuTempsSerializer(emplois, many=True, context={'request': request}).data,
            'kpis': kpis,
        })


    serializer = EmploiDuTempsSerializer(data=request.data, context={'request': request})

    if serializer.is_valid():
        try:
            emploi = serializer.save()

        except DjangoValidationError as e:
            return Response({'detail': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(EmploiDuTempsSerializer(emploi, context={'request': request}).data, status=status.HTTP_201_CREATED)

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

        serializer = EmploiDuTempsSerializer(emploi, data=request.data, partial=True, context={'request': request})

        if serializer.is_valid():
            try:
                serializer.save()

            except DjangoValidationError as e:
                return Response({'detail': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    emploi.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_emplois_du_temps')
def dupliquer_emploi_du_temps(request, pk):

    try:
        original = EmploiDuTemps.objects.get(pk=pk)

    except EmploiDuTemps.DoesNotExist:
        return Response({'detail': 'Emploi du temps introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    nouvelle_semaine_debut = None

    nouvelle_semaine_fin = None


    if original.semaine_debut and original.semaine_fin:

        from datetime import timedelta

        nouvelle_semaine_debut = original.semaine_debut + timedelta(days=7)

        nouvelle_semaine_fin = original.semaine_fin + timedelta(days=7)


    copie = EmploiDuTemps.objects.create(
        classe=original.classe,
        semestre=original.semestre,
        annee_academique=original.annee_academique,
        titre=f"{original.titre} (copie)" if original.titre else '',
        semaine_debut=nouvelle_semaine_debut,
        semaine_fin=nouvelle_semaine_fin,
        statut='brouillon',
    )

    erreurs = []

    for seance in original.seances.all():

        try:
            Seance.objects.create(
                emploi_du_temps=copie,
                matiere=seance.matiere,
                formateur=seance.formateur,
                salle=seance.salle,
                type_seance=seance.type_seance,
                jour=seance.jour,
                heure_debut=seance.heure_debut,
                heure_fin=seance.heure_fin,
            )

        except DjangoValidationError:
            erreurs.append(f"{seance.matiere} ({seance.get_jour_display()}) — conflit détecté, non dupliquée.")

    reponse = EmploiDuTempsSerializer(copie, context={'request': request}).data

    if erreurs:
        reponse['avertissements'] = erreurs

    return Response(reponse, status=status.HTTP_201_CREATED)

# ================= EMPLOI DU TEMPS =================


    





    




    
# ================= SEANCE =================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_seances')
def liste_creer_seances(request):

    if request.method == 'GET':

        seances = Seance.objects.select_related('matiere', 'formateur__personnel', 'salle').all()

        emploi_id = request.GET.get('emploi_du_temps')

        if emploi_id:
            seances = seances.filter(emploi_du_temps_id=emploi_id)

        return Response(SeanceSerializer(seances, many=True, context={'request': request}).data)

    serializer = SeanceSerializer(data=request.data, context={'request': request})


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
    
        kpis = {
            'total': Sanction.objects.count(),
            'actif': Sanction.objects.filter(statut='actif').count(),
            'inactif': Sanction.objects.filter(statut='inactif').count(),
            'suspendu': Sanction.objects.filter(statut='suspendu').count(),
        }

        return Response({
            'resultats': SanctionSerializer(sanctions, many=True, context={'request': request}).data,
            'kpis': kpis,
        })

    serializer = SanctionSerializer(data=request.data, context={'request': request})


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
