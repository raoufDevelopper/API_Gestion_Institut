from rest_framework import serializers

from apps.academique.models import Classe, Filiere, Niveau, Specialite

from apps.authentification.models import Role, User

from apps.authentification.serializers import UserSerializer

from apps.authentification.models import User

from .models import SEXE_CHOICES, Etudiant, Personnel, Formateur



class EtudiantSerializer(serializers.ModelSerializer):
    matricule = serializers.CharField(read_only=True)
    specialite_code = serializers.CharField(source='specialite.code', read_only=True)
    niveau_nom = serializers.CharField(source='niveau.nom', read_only=True)
    classe_str = serializers.CharField(source='classe.__str__', read_only=True)

    class Meta:
        model = Etudiant
        fields = '__all__' 

    def validate_user(self, value):
        qs = Etudiant.objects.filter(user=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Cet utilisateur est déjà lié à un profil étudiant.")
        return value







class PersonnelSerializer(serializers.ModelSerializer):
    matricule = serializers.CharField(read_only=True)
    class Meta:
        model = Personnel
        fields = '__all__'
    def validate_user(self, value):
        qs = Personnel.objects.filter(user=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Cet utilisateur est déjà lié à un profil personnel.")
        return value


    






class FormateurSerializer(serializers.ModelSerializer):
    personnel_nom = serializers.CharField(source='personnel.nom', read_only=True)
    personnel_prenom = serializers.CharField(source='personnel.prenom', read_only=True)
    filiere_codes = serializers.StringRelatedField(source='filiere', many=True, read_only=True)
    specialite_codes = serializers.StringRelatedField(source='specialite', many=True, read_only=True)
    class Meta:
        model = Formateur
        fields = '__all__'
    def validate_personnel(self, value):
        qs = Formateur.objects.filter(personnel=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ce personnel est déjà enregistré comme formateur.")
        return value













class EtudiantCompletSerializer(serializers.Serializer):

    STATUT_CHOICES = [
        ('ACTIF', 'Actif'),
        ('ABANDON', 'Abandon'),
        ('DIPLOME', 'Diplômé'),
        ('EXCLU', 'Exclu'),
        ('DEMISSIONNAIRE', 'Démissionnaire'),
    ]

    # Compte utilisateur — optionnel si user_existant fourni
    user_existant = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)


    nom = serializers.CharField()
    prenom = serializers.CharField()
    sexe = serializers.ChoiceField(choices=SEXE_CHOICES)
    date_naissance = serializers.DateField()
    email_perso = serializers.EmailField(required=False, allow_null=True, source='email_etudiant')
    adresse = serializers.CharField(required=False, allow_blank=True)
    telephone = serializers.CharField(required=False, allow_blank=True)
    photo = serializers.ImageField(required=False, allow_null=True)
    cni = serializers.FileField(required=False, allow_null=True)
    diplome = serializers.FileField(required=False, allow_null=True)
    acte_naissance = serializers.FileField(required=False, allow_null=True)
    nom_tuteur = serializers.CharField(required=False, allow_blank=True)
    telephone_tuteur = serializers.CharField(required=False, allow_blank=True)
    specialite = serializers.PrimaryKeyRelatedField(queryset=Specialite.objects.all(), required=False, allow_null=True)
    niveau = serializers.PrimaryKeyRelatedField(queryset=Niveau.objects.all(), required=False, allow_null=True)
    classe = serializers.PrimaryKeyRelatedField(queryset=Classe.objects.all(), required=False, allow_null=True)
    statut = serializers.ChoiceField(choices=STATUT_CHOICES, default='ACTIF')

    def validate(self, data):
        user_existant = data.get('user_existant')
        if user_existant:
            if Etudiant.objects.filter(user=user_existant).exists():
                raise serializers.ValidationError("Cet utilisateur est déjà lié à un profil étudiant.")
        else:
            if not data.get('username'):
                raise serializers.ValidationError({'username': "Requis pour créer un nouveau compte."})
            if not data.get('email'):
                raise serializers.ValidationError({'email': "Requis pour créer un nouveau compte."})
            if not data.get('password'):
                raise serializers.ValidationError({'password': "Requis pour créer un nouveau compte."})
            if User.objects.filter(username=data['username']).exists():
                raise serializers.ValidationError({'username': "Ce nom d'utilisateur est déjà pris."})
            if User.objects.filter(email=data['email']).exists():
                raise serializers.ValidationError({'email': "Cet email est déjà utilisé."})
        return data

    def create(self, validated_data):
        from apps.authentification.models import Role
        user_existant = validated_data.pop('user_existant', None)
        username = validated_data.pop('username', None)
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)
        if user_existant:
            user = user_existant
            if not user.role or user.role.nom != 'Étudiant':
                role_etudiant, _ = Role.objects.get_or_create(nom='Étudiant')
                user.role = role_etudiant
            user.is_active = True
            user.save()
        else:
            role_etudiant, _ = Role.objects.get_or_create(nom='Étudiant')
            user = User.objects.create(username=username, email=email, role=role_etudiant, is_active=True)
            user.set_password(password)
            user.save()
        etudiant_data = {**validated_data}
        if 'email_etudiant' in etudiant_data:
            etudiant_data['email'] = etudiant_data.pop('email_etudiant')
        return Etudiant.objects.create(user=user, **etudiant_data)












class PersonnelCompletSerializer(serializers.Serializer):

    STATUT_CHOICES = [
        ('ACTIF', 'Actif'),
        ('INACTIF', 'Inactif'),
        ('SUSPENDU', 'Suspendu'),
        ('ENCONGE', 'En congé'),
        ('RETRAITE', 'Retraité')
    ]

    user_existant = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.exclude(nom='Étudiant'), required=False, allow_null=True)
    nom = serializers.CharField()
    prenom = serializers.CharField()
    sexe = serializers.ChoiceField(choices=SEXE_CHOICES)
    date_naissance = serializers.DateField()
    date_embauche = serializers.DateField()
    email_perso = serializers.EmailField(required=False, allow_null=True, source='email_personnel')
    adresse = serializers.CharField(required=False, allow_blank=True)
    telephone = serializers.CharField(required=False, allow_blank=True)
    photo = serializers.ImageField(required=False, allow_null=True)
    cni = serializers.FileField(required=False, allow_null=True)
    diplome = serializers.FileField(required=False, allow_null=True)
    motivation = serializers.FileField(required=False, allow_null=True)
    recommandation = serializers.FileField(required=False, allow_null=True)
    salaire = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    poste = serializers.CharField(required=False, allow_blank=True)
    fonction = serializers.CharField(required=False, allow_blank=True)
    statut = serializers.ChoiceField(choices=STATUT_CHOICES, default='ACTIF')
    def validate(self, data):
        user_existant = data.get('user_existant')
        if user_existant:
            if Personnel.objects.filter(user=user_existant).exists():
                raise serializers.ValidationError("Cet utilisateur est déjà lié à un profil personnel.")
        else:
            if not data.get('username'):
                raise serializers.ValidationError({'username': "Requis pour créer un nouveau compte."})
            if not data.get('email'):
                raise serializers.ValidationError({'email': "Requis pour créer un nouveau compte."})
            if not data.get('password'):
                raise serializers.ValidationError({'password': "Requis pour créer un nouveau compte."})
            if not data.get('role'):
                raise serializers.ValidationError({'role': "Requis pour créer un nouveau compte."})
            if User.objects.filter(username=data['username']).exists():
                raise serializers.ValidationError({'username': "Ce nom d'utilisateur est déjà pris."})
            if User.objects.filter(email=data['email']).exists():
                raise serializers.ValidationError({'email': "Cet email est déjà utilisé."})
        return data
    def create(self, validated_data):
        user_existant = validated_data.pop('user_existant', None)
        username = validated_data.pop('username', None)
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)
        role = validated_data.pop('role', None)
        if user_existant:
            user = user_existant
            if role:
                user.role = role
            user.is_active = True
            user.save()
        else:
            user = User.objects.create(username=username, email=email, role=role, is_active=True)
            user.set_password(password)
            user.save()
        personnel_data = {**validated_data}
        if 'email_personnel' in personnel_data:
            personnel_data['email'] = personnel_data.pop('email_personnel')
        return Personnel.objects.create(user=user, **personnel_data)

    





class FormateurCompletSerializer(serializers.Serializer):

    STATUT_CHOICES = [
        ('ACTIF', 'Actif'),
        ('INACTIF', 'Inactif'),
        ('SUSPENDU', 'Suspendu'),
        ('ENCONGE', 'En congé'),
        ('RETRAITE', 'Retraité')
    ]

    user_existant = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    nom = serializers.CharField()
    prenom = serializers.CharField()
    sexe = serializers.ChoiceField(choices=SEXE_CHOICES)
    date_naissance = serializers.DateField()
    date_embauche = serializers.DateField()
    email_perso = serializers.EmailField(required=False, allow_null=True, source='email_personnel')
    adresse = serializers.CharField(required=False, allow_blank=True)
    telephone = serializers.CharField(required=False, allow_blank=True)
    photo = serializers.ImageField(required=False, allow_null=True)
    cni = serializers.FileField(required=False, allow_null=True)
    diplome = serializers.FileField(required=False, allow_null=True)
    motivation = serializers.FileField(required=False, allow_null=True)
    recommandation = serializers.FileField(required=False, allow_null=True)
    salaire = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    poste = serializers.CharField(required=False, allow_blank=True)
    fonction = serializers.CharField(required=False, allow_blank=True)
    statut = serializers.ChoiceField(choices=STATUT_CHOICES, default='ACTIF')
    type_contrat = serializers.ChoiceField(choices=Formateur.TYPE_CONTRAT_CHOICES)
    filiere = serializers.PrimaryKeyRelatedField(queryset=Filiere.objects.all(), many=True, required=False)
    specialite = serializers.PrimaryKeyRelatedField(queryset=Specialite.objects.all(), many=True, required=False)
    def validate(self, data):
        user_existant = data.get('user_existant')
        if user_existant:
            if Personnel.objects.filter(user=user_existant).exists():
                raise serializers.ValidationError("Cet utilisateur est déjà lié à un profil personnel.")
        else:
            if not data.get('username'):
                raise serializers.ValidationError({'username': "Requis pour créer un nouveau compte."})
            if not data.get('email'):
                raise serializers.ValidationError({'email': "Requis pour créer un nouveau compte."})
            if not data.get('password'):
                raise serializers.ValidationError({'password': "Requis pour créer un nouveau compte."})
            if User.objects.filter(username=data['username']).exists():
                raise serializers.ValidationError({'username': "Ce nom d'utilisateur est déjà pris."})
            if User.objects.filter(email=data['email']).exists():
                raise serializers.ValidationError({'email': "Cet email est déjà utilisé."})
        return data
    def create(self, validated_data):
        from apps.authentification.models import Role
        user_existant = validated_data.pop('user_existant', None)
        username = validated_data.pop('username', None)
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)
        role_formateur, _ = Role.objects.get_or_create(nom='Formateur')
        if user_existant:
            user = user_existant
            user.role = role_formateur
            user.is_active = True
            user.save()
        else:
            user = User.objects.create(username=username, email=email, role=role_formateur, is_active=True)
            user.set_password(password)
            user.save()
        type_contrat = validated_data.pop('type_contrat')
        filieres = validated_data.pop('filiere', [])
        specialites = validated_data.pop('specialite', [])
        personnel_data = {**validated_data}
        if 'email_personnel' in personnel_data:
            personnel_data['email'] = personnel_data.pop('email_personnel')
        personnel = Personnel.objects.create(user=user, **personnel_data)
        formateur = Formateur.objects.create(personnel=personnel, type_contrat=type_contrat)
        formateur.filiere.set(filieres) 
        formateur.specialite.set(specialites)
        return formateur


