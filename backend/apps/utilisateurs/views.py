from rest_framework.decorators import api_view, permission_classes, parser_classes

from rest_framework.permissions import IsAuthenticated

from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework.response import Response

from rest_framework import status

from apps.authentification.models import User

from apps.authentification.serializers import UserSerializer

from apps.authentification.decorators import permission_requise

from .models import Etudiant, Personnel, Formateur

from .serializers import EtudiantSerializer, PersonnelSerializer, FormateurSerializer

from django.template.loader import render_to_string

from django.http import HttpResponse

from django.utils import timezone

from weasyprint import HTML




# ---------- UTILISATEURS DISPONIBLES (pour les selects) ----------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def utilisateurs_disponibles_etudiant(request):
    """Users sans profil Étudiant ni Personnel - pour le select de création."""
    exclus = list(Etudiant.objects.values_list('user_id', flat=True)) + \
             list(Personnel.objects.values_list('user_id', flat=True))
    users = User.objects.exclude(id__in=exclus)
    return Response(UserSerializer(users, many=True).data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def utilisateurs_disponibles_personnel(request):
    exclus = list(Etudiant.objects.values_list('user_id', flat=True)) + \
             list(Personnel.objects.values_list('user_id', flat=True))
    users = User.objects.exclude(id__in=exclus)
    return Response(UserSerializer(users, many=True).data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def personnel_disponible_formateur(request):
    """Personnel n'ayant pas encore de profil Formateur - pour le select."""
    exclus = Formateur.objects.values_list('personnel_id', flat=True)
    personnel = Personnel.objects.exclude(id__in=exclus)
    return Response(PersonnelSerializer(personnel, many=True).data)












# ---------- ETUDIANTS ----------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
@permission_requise('gerer_etudiants')
def liste_creer_etudiants(request):
    if request.method == 'GET':
        etudiants = Etudiant.objects.all()
        return Response(EtudiantSerializer(etudiants, many=True).data)
    serializer = EtudiantSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
@permission_requise('gerer_etudiants')
def detail_etudiant(request, pk):
    try:
        etudiant = Etudiant.objects.get(pk=pk)
    except Etudiant.DoesNotExist:
        return Response({'detail': 'Étudiant introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(EtudiantSerializer(etudiant).data)
    if request.method == 'PATCH':
        serializer = EtudiantSerializer(etudiant, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    etudiant.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)













# ---------- PERSONNEL ----------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
@permission_requise('gerer_personnel')
def liste_creer_personnel(request):
    if request.method == 'GET':
        personnel = Personnel.objects.all()
        return Response(PersonnelSerializer(personnel, many=True).data)
    serializer = PersonnelSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
@permission_requise('gerer_personnel')
def detail_personnel(request, pk):
    try:
        personnel = Personnel.objects.get(pk=pk)
    except Personnel.DoesNotExist:
        return Response({'detail': 'Personnel introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(PersonnelSerializer(personnel).data)
    if request.method == 'PATCH':
        serializer = PersonnelSerializer(personnel, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    personnel.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)













# ---------- FORMATEURS ----------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_formateurs')
def liste_creer_formateurs(request):
    if request.method == 'GET':
        formateurs = Formateur.objects.all()
        return Response(FormateurSerializer(formateurs, many=True).data)
    serializer = FormateurSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_formateurs')
def detail_formateur(request, pk):
    try:
        formateur = Formateur.objects.get(pk=pk)
    except Formateur.DoesNotExist:
        return Response({'detail': 'Formateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(FormateurSerializer(formateur).data)
    if request.method == 'PATCH':
        serializer = FormateurSerializer(formateur, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    formateur.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)



















#export PDF
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_etudiants')
def export_fiche_etudiant_pdf(request, pk):
    try:
        etudiant = Etudiant.objects.get(pk=pk)
    except Etudiant.DoesNotExist:
        return Response({'detail': 'Étudiant introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    documents = []
    if etudiant.cni:
        documents.append("Carte Nationale d'Identité")
    if etudiant.diplome:
        documents.append("Diplôme")
    if etudiant.acte_naissance:
        documents.append("Acte de naissance")
    contexte = {
        'type_fiche': 'Étudiant',
        'nom': etudiant.nom,
        'prenom': etudiant.prenom,
        'matricule': etudiant.matricule,
        'statut': etudiant.get_statut_display(),
        'photo_url': request.build_absolute_uri(etudiant.photo.url) if etudiant.photo else None,
        'sexe': etudiant.get_sexe_display(),
        'date_naissance': etudiant.date_naissance.strftime('%d/%m/%Y'),
        'telephone': etudiant.telephone,
        'email': etudiant.email,
        'adresse': etudiant.adresse,
        'specialite': etudiant.specialite,
        'date_inscription': etudiant.date_inscription.strftime('%d/%m/%Y'),
        'nom_tuteur': etudiant.nom_tuteur,
        'telephone_tuteur': etudiant.telephone_tuteur,
        'documents': documents,
        'date_generation': timezone.now().strftime('%d/%m/%Y à %H:%M'),
    }
    html_string = render_to_string('utilisateurs/fiche_pdf.html', contexte)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="fiche_etudiant_{etudiant.matricule}.pdf"'
    return response











@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_personnel')
def export_fiche_personnel_pdf(request, pk):
    try:
        personnel = Personnel.objects.get(pk=pk)
    except Personnel.DoesNotExist:
        return Response({'detail': 'Personnel introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    documents = []
    if personnel.cni:
        documents.append("Carte Nationale d'Identité")
    if personnel.diplome:
        documents.append("Diplôme")
    if personnel.motivation:
        documents.append("Lettre de motivation")
    if personnel.recommandation:
        documents.append("Lettre de recommandation")
    contexte = {
        'type_fiche': 'Personnel',
        'nom': personnel.nom,
        'prenom': personnel.prenom,
        'matricule': personnel.matricule,
        'statut': personnel.get_statut_display(),
        'photo_url': request.build_absolute_uri(personnel.photo.url) if personnel.photo else None,
        'sexe': personnel.get_sexe_display(),
        'date_naissance': personnel.date_naissance.strftime('%d/%m/%Y'),
        'telephone': personnel.telephone,
        'email': personnel.email,
        'adresse': personnel.adresse,
        'poste': personnel.poste,
        'fonction': personnel.fonction,
        'date_embauche': personnel.date_embauche.strftime('%d/%m/%Y'),
        'documents': documents,
        'date_generation': timezone.now().strftime('%d/%m/%Y à %H:%M'),
    }
    html_string = render_to_string('utilisateurs/fiche_pdf.html', contexte)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="fiche_personnel_{personnel.matricule}.pdf"'
    return response












@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_formateurs')
def export_fiche_formateur_pdf(request, pk):
    try:
        formateur = Formateur.objects.get(pk=pk)
    except Formateur.DoesNotExist:
        return Response({'detail': 'Formateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    personnel = formateur.personnel
    documents = []
    if personnel.cni:
        documents.append("Carte Nationale d'Identité")
    if personnel.diplome:
        documents.append("Diplôme")
    if personnel.motivation:
        documents.append("Lettre de motivation")
    if personnel.recommandation:
        documents.append("Lettre de recommandation")
    contexte = {
        'type_fiche': 'Formateur',
        'nom': personnel.nom,
        'prenom': personnel.prenom,
        'matricule': personnel.matricule,
        'statut': personnel.get_statut_display(),
        'photo_url': request.build_absolute_uri(personnel.photo.url) if personnel.photo else None,
        'sexe': personnel.get_sexe_display(),
        'date_naissance': personnel.date_naissance.strftime('%d/%m/%Y'),
        'telephone': personnel.telephone,
        'email': personnel.email,
        'adresse': personnel.adresse,
        'poste': personnel.poste,
        'fonction': personnel.fonction,
        'date_embauche': personnel.date_embauche.strftime('%d/%m/%Y'),
        'type_contrat': formateur.get_type_contrat_display(),
        'filiere': formateur.filiere,
        'specialite': formateur.specialite,
        'documents': documents,
        'date_generation': timezone.now().strftime('%d/%m/%Y à %H:%M'),
    }
    html_string = render_to_string('utilisateurs/fiche_pdf.html', contexte)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="fiche_formateur_{personnel.matricule}.pdf"'
    return response
