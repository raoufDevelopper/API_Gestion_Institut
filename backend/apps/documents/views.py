from django.template.loader import render_to_string

from django.core.files.base import ContentFile

from django.http import HttpResponse, FileResponse

from django.utils import timezone

from weasyprint import HTML

from rest_framework.decorators import api_view, permission_classes, parser_classes

from rest_framework.permissions import IsAuthenticated

from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework.response import Response

from rest_framework import status

from apps.authentification.decorators import permission_requise

from apps.utilisateurs.models import Etudiant

from apps.finances.models import Inscription

from apps.notes.services import mention as calculer_mention

from .models import Diplome, TypeCertificat, Certificat, Document

from .serializers import DiplomeSerializer, TypeCertificatSerializer, CertificatSerializer, DocumentSerializer













# ================= DIPLOME =================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_documents')
def liste_creer_diplomes(request):
    if request.method == 'GET':
        diplomes = Diplome.objects.select_related('etudiant', 'deliberation').all()
        return Response(DiplomeSerializer(diplomes, many=True).data)
    serializer = DiplomeSerializer(data=request.data)
    if serializer.is_valid():
        deliberation = serializer.validated_data['deliberation']
        diplome = serializer.save(
            genere_par=request.user,
            mention=calculer_mention(deliberation.moyenne_generale),
        )
        html_string = render_to_string('documents/diplome_pdf.html', {
            'diplome': diplome,
            'date_generation': timezone.now().strftime('%d/%m/%Y à %H:%M'),
        })
        pdf_bytes = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
        diplome.fichier.save(f'diplome_{diplome.numero_diplome}.pdf', ContentFile(pdf_bytes), save=True)
        return Response(DiplomeSerializer(diplome).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_documents')
def detail_diplome(request, pk):
    try:
        diplome = Diplome.objects.select_related('etudiant', 'deliberation').get(pk=pk)
    except Diplome.DoesNotExist:
        return Response({'detail': 'Diplôme introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(DiplomeSerializer(diplome).data)
    if request.method == 'PATCH':
        serializer = DiplomeSerializer(diplome, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    diplome.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_documents')
def revoquer_diplome(request, pk):
    try:
        diplome = Diplome.objects.get(pk=pk)
    except Diplome.DoesNotExist:
        return Response({'detail': 'Diplôme introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    motif = request.data.get('motif_revocation', '')
    if not motif:
        return Response({'detail': 'Un motif de révocation est requis.'}, status=status.HTTP_400_BAD_REQUEST)
    diplome.statut = 'revoque'
    diplome.motif_revocation = motif
    diplome.save(update_fields=['statut', 'motif_revocation'])
    return Response(DiplomeSerializer(diplome).data)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_documents')
def telecharger_diplome(request, pk):
    try:
        diplome = Diplome.objects.get(pk=pk)
    except Diplome.DoesNotExist:
        return Response({'detail': 'Diplôme introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if not diplome.fichier:
        return Response({'detail': 'Aucun fichier disponible.'}, status=status.HTTP_404_NOT_FOUND)
    return FileResponse(diplome.fichier.open('rb'), as_attachment=True, filename=f"diplome_{diplome.numero_diplome}.pdf")










# ================= TYPE CERTIFICAT =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_documents')
def liste_creer_types_certificat(request):
    if request.method == 'GET':
        types_certificat = TypeCertificat.objects.all()
        return Response(TypeCertificatSerializer(types_certificat, many=True).data)
    serializer = TypeCertificatSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_documents')
def detail_type_certificat(request, pk):
    try:
        type_certificat = TypeCertificat.objects.get(pk=pk)
    except TypeCertificat.DoesNotExist:
        return Response({'detail': 'Type de certificat introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(TypeCertificatSerializer(type_certificat).data)
    if request.method == 'PATCH':
        serializer = TypeCertificatSerializer(type_certificat, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    type_certificat.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)














# ================= CERTIFICAT =================
def _generer_certificat_pdf(certificat, request):
    html_string = render_to_string('documents/certificat_pdf.html', {
        'certificat': certificat,
        'date_generation': timezone.now().strftime('%d/%m/%Y à %H:%M'),
    })
    pdf_bytes = HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()
    certificat.fichier.save(f'certificat_{certificat.numero}.pdf', ContentFile(pdf_bytes), save=True)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_documents')
def liste_creer_certificats(request):
    if request.method == 'GET':
        certificats = Certificat.objects.select_related('etudiant', 'type_certificat').all()
        return Response(CertificatSerializer(certificats, many=True).data)
    serializer = CertificatSerializer(data=request.data)
    if serializer.is_valid():
        certificat = serializer.save(genere_par=request.user)
        _generer_certificat_pdf(certificat, request)
        return Response(CertificatSerializer(certificat).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
@permission_requise('gerer_documents')
def detail_certificat(request, pk):
    try:
        certificat = Certificat.objects.select_related('etudiant', 'type_certificat').get(pk=pk)
    except Certificat.DoesNotExist:
        return Response({'detail': 'Certificat introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(CertificatSerializer(certificat).data)
    certificat.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def auto_generer_certificat(request):
    """
    Libre-service : l'étudiant connecté génère lui-même un certificat dont
    le type est marqué `auto_generable=True`, à condition d'avoir une
    inscription valide sur l'année académique en cours.
    """
    try:
        etudiant = request.user.etudiant
    except (AttributeError, Etudiant.DoesNotExist):
        return Response({'detail': "Seul un étudiant peut générer ce document."}, status=status.HTTP_403_FORBIDDEN)
    type_certificat_id = request.data.get('type_certificat')
    try:
        type_certificat = TypeCertificat.objects.get(pk=type_certificat_id)
    except TypeCertificat.DoesNotExist:
        return Response({'detail': 'Type de certificat introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if not type_certificat.auto_generable:
        return Response(
            {'detail': "Ce type de certificat n'est pas disponible en libre-service."},
            status=status.HTTP_403_FORBIDDEN
        )
    inscription_active = Inscription.objects.filter(
        etudiant=etudiant, statut=Inscription.Statut.VALIDEE
    ).order_by('-annee_academique').first()
    if not inscription_active:
        return Response(
            {'detail': "Aucune inscription validée trouvée pour générer ce document."},
            status=status.HTTP_400_BAD_REQUEST
        )
    certificat = Certificat.objects.create(
        type_certificat=type_certificat, etudiant=etudiant, genere_par=request.user,
    )
    _generer_certificat_pdf(certificat, request)
    return Response(CertificatSerializer(certificat).data, status=status.HTTP_201_CREATED)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def telecharger_certificat(request, pk):
    try:
        certificat = Certificat.objects.get(pk=pk)
    except Certificat.DoesNotExist:
        return Response({'detail': 'Certificat introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if not request.user.is_superuser:
        try:
            if certificat.etudiant != request.user.etudiant:
                return Response({'detail': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)
        except AttributeError:
            return Response({'detail': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)
    if not certificat.fichier:
        return Response({'detail': 'Aucun fichier disponible.'}, status=status.HTTP_404_NOT_FOUND)
    return FileResponse(certificat.fichier.open('rb'), as_attachment=True, filename=f"certificat_{certificat.numero}.pdf")









# ================= DOCUMENT =================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
@permission_requise('gerer_documents')
def liste_creer_documents(request):
    if request.method == 'GET':
        documents = Document.objects.all()
        etudiant_id = request.GET.get('etudiant')
        if etudiant_id:
            documents = documents.filter(concerne_etudiant_id=etudiant_id)
        personnel_id = request.GET.get('personnel')
        if personnel_id:
            documents = documents.filter(concerne_personnel_id=personnel_id)
        return Response(DocumentSerializer(documents, many=True).data)
    serializer = DocumentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(ajoute_par=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
@permission_requise('gerer_documents')
def detail_document(request, pk):
    try:
        document = Document.objects.get(pk=pk)
    except Document.DoesNotExist:
        return Response({'detail': 'Document introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(DocumentSerializer(document).data)
    if request.method == 'PATCH':
        serializer = DocumentSerializer(document, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    document.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
