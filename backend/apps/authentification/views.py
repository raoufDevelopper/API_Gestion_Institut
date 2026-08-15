from rest_framework.decorators import api_view, permission_classes, parser_classes

from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework.response import Response

from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate

from .models import User, Role, Permission

from .serializers import UserSerializer, RoleSerializer, PermissionSerializer

from django.contrib.auth.password_validation import validate_password

from .decorators import permission_requise




# ---------- AUTHENTIFICATION ----------
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):

    email = request.data.get('email')

    password = request.data.get('password')

    try:
        user_obj = User.objects.get(email=email)

    except User.DoesNotExist:
        return Response({"detail': 'Cet utilisateur n'existe pas."}, status=status.HTTP_401_UNAUTHORIZED)

    if not user_obj.is_active:
        return Response({'detail': 'Votre compte est en attente de validation par un administrateur.'}, status=status.HTTP_403_FORBIDDEN)

    user = authenticate(email=user_obj.email, password=password)

    if user is None:
        return Response({'detail': 'Echec de connexion.'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)

    permissions = list(user.role.permissions.values_list('code', flat=True)) if user.role else []

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role.nom if user.role else None,
            'permissions': permissions,
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user
    permissions = list(user.role.permissions.values_list('code', flat=True)) if user.role else []
    serializer = UserSerializer(user)
    data = serializer.data
    data['permissions'] = permissions
    return Response(data)












@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def register_view(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password1 = request.data.get('password1')
    password2 = request.data.get('password2')
    role_nom = request.data.get('role')  # "Formateur" ou "Étudiant"
    photo_profil = request.FILES.get('photo_profil')
    if not all([username, email, password1, password2, role_nom]):
        return Response({'detail': 'Tous les champs obligatoires doivent être renseignés.'}, status=status.HTTP_400_BAD_REQUEST)
    if password1 != password2:
        return Response({'detail': 'Les mots de passe ne correspondent pas.'}, status=status.HTTP_400_BAD_REQUEST)
    if role_nom not in ('Formateur', 'Étudiant'):
        return Response({'detail': 'Rôle invalide.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({'detail': 'Cet email est déjà utilisé.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'detail': "Ce nom d'utilisateur est déjà pris."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        validate_password(password1)
    except Exception as e:
        return Response({'detail': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
    role = Role.objects.filter(nom=role_nom).first()
    user = User(
        username=username,
        email=email,
        role=role,
        is_active=False,  # en attente de validation par un administrateur
    )
    user.set_password(password1)
    if photo_profil:
        user.photo_profil = photo_profil
    user.save()
    return Response(
        {'detail': "Votre compte a été créé et est en attente de validation par un administrateur."},
        status=status.HTTP_201_CREATED
    )















# ---------- UTILISATEURS ----------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def liste_creer_utilisateurs(request):
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def detail_utilisateur(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'detail': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(UserSerializer(user).data)
    if request.method == 'PATCH':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)












# ---------- ROLES ----------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def liste_creer_roles(request):
    if request.method == 'GET':
        roles = Role.objects.all()
        return Response(RoleSerializer(roles, many=True).data)
    serializer = RoleSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def detail_role(request, pk):
    try:
        role = Role.objects.get(pk=pk)
    except Role.DoesNotExist:
        return Response({'detail': 'Rôle introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(RoleSerializer(role).data)
    if request.method == 'PATCH':
        serializer = RoleSerializer(role, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    role.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)











# ---------- PERMISSIONS ----------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def liste_creer_permissions(request):
    if request.method == 'GET':
        permissions = Permission.objects.all()
        return Response(PermissionSerializer(permissions, many=True).data)
    serializer = PermissionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def detail_permission(request, pk):
    try:
        permission = Permission.objects.get(pk=pk)
    except Permission.DoesNotExist:
        return Response({'detail': 'Permission introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(PermissionSerializer(permission).data)
    if request.method == 'PATCH':
        serializer = PermissionSerializer(permission, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    permission.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)