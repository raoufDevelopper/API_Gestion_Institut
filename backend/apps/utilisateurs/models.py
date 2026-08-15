from django.db import models

from django.utils import timezone

from apps.authentification.models import User

from apps.parametres.models import generer_matricule





# ---------- CHOIX COMMUNS ----------
SEXE_CHOICES = [
    ('M', 'Masculin'), 
    ('F', 'Féminin')
]








# ---------- ETUDIANT ----------
class Etudiant(models.Model):

    STATUT_CHOICES = [
        ('ACTIF', 'Actif'),
        ('ABANDON', 'Abandon'),
        ('DIPLOME', 'Diplômé'),
        ('EXCLU', 'Exclu'),
        ('DEMISSIONNAIRE', 'Démissionnaire'),
    ]

    #infos user
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='etudiant')

    matricule = models.CharField(max_length=30, unique=True, blank=True)


    #infos personnelles
    nom = models.CharField(max_length=100)

    prenom = models.CharField(max_length=100)

    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES)

    date_naissance = models.DateField()

    email = models.EmailField(blank=True, null=True)

    adresse = models.CharField(max_length=255, blank=True, null=True)

    telephone = models.CharField(max_length=20, blank=True, null=True)


    # Documents / fichiers
    cni = models.FileField(upload_to='etudiants/cni/', blank=True, null=True)

    diplome = models.FileField(upload_to='etudiants/diplomes/', blank=True, null=True)

    acte_naissance = models.FileField(upload_to='etudiants/actes_naissance/', blank=True, null=True)

    photo = models.ImageField(upload_to='etudiants/photos/', blank=True, null=True)


    # Tuteur
    nom_tuteur = models.CharField(max_length=100, blank=True, null=True)

    telephone_tuteur = models.CharField(max_length=20, blank=True, null=True)


    # Académique (texte en attendant l'app academique)
    specialite = models.ForeignKey('academique.Specialite', on_delete=models.SET_NULL, null=True, blank=True, related_name='etudiants')
    
    niveau = models.ForeignKey('academique.Niveau', on_delete=models.SET_NULL, null=True, blank=True, related_name='etudiants')

    classe = models.ForeignKey('academique.Classe', on_delete=models.SET_NULL, null=True, blank=True, related_name='etudiants')

    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='ACTIF')

    date_inscription = models.DateField(auto_now_add=True)


    class Meta:
        ordering = ['nom', 'prenom']

    def __str__(self):
        return f"{self.matricule} - {self.nom} {self.prenom}"

    def save(self, *args, **kwargs):
        if not self.matricule:
            self.matricule = generer_matricule('ETUDIANT')
        super().save(*args, **kwargs)












# ---------- PERSONNEL ----------
class Personnel(models.Model):

    STATUT_CHOICES = [
        ('ACTIF', 'Actif'),
        ('INACTIF', 'Inactif'),
        ('SUSPENDU', 'Suspendu'),
        ('ENCONGE', 'En congé'),
        ('RETRAITE', 'Retraité')
    ]

    #infos user
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='personnel')

    matricule = models.CharField(max_length=30, unique=True, blank=True)


    #infos personnelles
    nom = models.CharField(max_length=100)

    prenom = models.CharField(max_length=100)

    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES)

    date_naissance = models.DateField()

    date_embauche = models.DateField()

    email = models.EmailField(blank=True, null=True)

    adresse = models.CharField(max_length=255, blank=True, null=True)

    telephone = models.CharField(max_length=20, blank=True, null=True)


    # Documents / fichiers
    cni = models.FileField(upload_to='personnel/cni/', blank=True, null=True)

    diplome = models.FileField(upload_to='personnel/diplomes/', blank=True, null=True)

    motivation = models.FileField(upload_to='personnel/motivations/', blank=True, null=True)

    recommandation = models.FileField(upload_to='personnel/recommandations/', blank=True, null=True)

    photo = models.ImageField(upload_to='personnel/photos/', blank=True, null=True)


    #infos administratives
    salaire = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    poste = models.CharField(max_length=100, blank=True, null=True)

    fonction = models.CharField(max_length=100, blank=True, null=True)

    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='ACTIF')


    class Meta:
        ordering = ['nom', 'prenom']

    def __str__(self):
        return f"{self.nom} {self.prenom}"

    def save(self, *args, **kwargs):
        if not self.matricule:
            self.matricule = generer_matricule('PERSONNEL')
        super().save(*args, **kwargs)












# ---------- FORMATEUR ----------
class Formateur(models.Model):

    TYPE_CONTRAT_CHOICES = [
        ('PERMANENT', 'Permanent'),
        ('VACATAIRE', 'Vacataire'),
    ]

    personnel = models.OneToOneField(Personnel, on_delete=models.CASCADE, related_name='formateur')

    type_contrat = models.CharField(max_length=20, choices=TYPE_CONTRAT_CHOICES)

    filiere = models.CharField(max_length=150, blank=True, null=True)

    specialite = models.CharField(max_length=150, blank=True, null=True)

    def __str__(self):
        return self.personnel
    