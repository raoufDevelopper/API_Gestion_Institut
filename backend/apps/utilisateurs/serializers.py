from rest_framework import serializers

from apps.academique.models import Classe, Niveau, Specialite

from apps.authentification.models import Role, User

from apps.authentification.serializers import UserSerializer

from apps.authentification.models import User

from .models import SEXE_CHOICES, Etudiant, Personnel, Formateur



class EtudiantSerializer(serializers.ModelSerializer):
    matricule = serializers.CharField(read_only=True)
    specialite_nom = serializers.CharField(source='specialite.nom', read_only=True)
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

    # Compte utilisateur
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    # Informations personnelles (mêmes champs que EtudiantSerializer, sans 'user')
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


    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value
    def create(self, validated_data):
        from apps.authentification.models import Role
        role_etudiant, _ = Role.objects.get_or_create(nom='Étudiant')
        user = User.objects.create(
            username=validated_data.pop('username'),
            email=validated_data.pop('email'),
            role=role_etudiant,
            is_active=True,
        )
        user.set_password(validated_data.pop('password'))
        user.save()
        etudiant_data = {**validated_data}
        if 'email_etudiant' in etudiant_data:
            etudiant_data['email'] = etudiant_data.pop('email_etudiant')
        etudiant = Etudiant.objects.create(user=user, **etudiant_data)
        return etudiant




    


class PersonnelCompletSerializer(serializers.Serializer):

    STATUT_CHOICES = [
        ('ACTIF', 'Actif'),
        ('INACTIF', 'Inactif'),
        ('SUSPENDU', 'Suspendu'),
        ('ENCONGE', 'En congé'),
        ('RETRAITE', 'Retraité')
    ]

    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.exclude(nom='Étudiant'))
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

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value
    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data.pop('username'),
            email=validated_data.pop('email'),
            role=validated_data.pop('role'),
            is_active=True,
        )
        user.set_password(validated_data.pop('password'))
        user.save()
        personnel_data = {**validated_data}
        if 'email_personnel' in personnel_data:
            personnel_data['email'] = personnel_data.pop('email_personnel')
        personnel = Personnel.objects.create(user=user, **personnel_data)
        return personnel






class FormateurCompletSerializer(serializers.Serializer):

    STATUT_CHOICES = [
        ('ACTIF', 'Actif'),
        ('INACTIF', 'Inactif'),
        ('SUSPENDU', 'Suspendu'),
        ('ENCONGE', 'En congé'),
        ('RETRAITE', 'Retraité')
    ]

    # Compte utilisateur
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    # Compte personnel
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

    # Informations formateur
    type_contrat = serializers.ChoiceField(choices=Formateur.TYPE_CONTRAT_CHOICES)
    filiere = serializers.CharField(required=False, allow_blank=True)
    specialite = serializers.CharField(required=False, allow_blank=True)



    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value
    def create(self, validated_data):
        from apps.authentification.models import Role
        role_formateur, _ = Role.objects.get_or_create(nom='Formateur')
        user = User.objects.create(
            username=validated_data.pop('username'),
            email=validated_data.pop('email'),
            role=role_formateur,
            is_active=True,
        )
        user.set_password(validated_data.pop('password'))
        user.save()
        type_contrat = validated_data.pop('type_contrat')
        filiere = validated_data.pop('filiere', '')
        specialite = validated_data.pop('specialite', '')
        personnel_data = {**validated_data}
        if 'email_personnel' in personnel_data:
            personnel_data['email'] = personnel_data.pop('email_personnel')
        personnel = Personnel.objects.create(user=user, **personnel_data)
        formateur = Formateur.objects.create(
            personnel=personnel, type_contrat=type_contrat, filiere=filiere, specialite=specialite,
        )
        return formateur


    