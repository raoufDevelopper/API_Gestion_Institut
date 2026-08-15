from django.db import models

from django.urls import reverse

from django.core.exceptions import ValidationError




# ---------- CHOIX COMMUNS ----------
STATUT_CHOICES = (
    ('actif', 'Actif'),
    ('inactif', 'Inactif'),
    ('suspendu', 'Suspendu'),
)





# ---------- NIVEAU ----------
class Niveau(models.Model):

    CYCLE_CHOICES = (
        ('bts', 'BTS'),
        ('licence', 'LICENCE'),
        ('master', 'MASTER'),
        ('doctorat', 'DOCTORAT'),
        ('plus', 'PLUS'),
    )

    code = models.CharField(max_length=20, unique=True)

    nom = models.CharField(max_length=50, unique=True)

    cycle = models.CharField(max_length=10, choices=CYCLE_CHOICES)

    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nom']
        verbose_name = "Niveau"
        verbose_name_plural = "Niveaux"

    def __str__(self):
        return self.code


    





# ---------- FILIERE ----------
class Filiere(models.Model):

    code = models.CharField(max_length=20, unique=True)

    nom = models.CharField(max_length=50, unique=True)

    responsable = models.ForeignKey('utilisateurs.Personnel', on_delete=models.SET_NULL, null=True, blank=True,related_name='filieres_responsable')

    date_creation = models.DateTimeField(auto_now_add=True)

    description = models.TextField(blank=True, null=True)

    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default='actif')

    class Meta:
        ordering = ['nom']
        verbose_name = "Filière"
        verbose_name_plural = "Filières"

    def __str__(self):
        return self.nom
    
    




    
# ---------- SPECIALITE ----------
class Specialite(models.Model):

    filiere = models.ForeignKey(Filiere, on_delete=models.PROTECT, related_name='specialites')

    code = models.CharField(max_length=20, unique=True)

    nom = models.CharField(max_length=50, unique=True)

    date_creation = models.DateTimeField(auto_now_add=True)

    description = models.TextField(blank=True, null=True)

    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default='actif')

    class Meta:
        ordering = ['nom']
        verbose_name = "Spécialité"
        verbose_name_plural = "Spécialités"

    def __str__(self):
        return self.code
    
    





# ---------- TYPE SALLE ----------
class TypeSalle(models.Model):

    code = models.CharField(max_length=20, unique=True)

    libelle = models.CharField(max_length=50, unique=True)

    date_creation = models.DateTimeField(auto_now_add=True)

    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['libelle']
        verbose_name = "Type de salle"
        verbose_name_plural = "Types de salle"

    def __str__(self):
        return self.libelle




# ---------- SALLE ----------
class Salle(models.Model):

    STATUT_CHOICES = (
        ('disponible', 'Disponible'),
        ('indisponible', 'Indisponible'),
        ('construction', 'En construction'),
        ('maintenance', 'En maintenance'),
        ('fermee', 'Fermée'),
    )

    code = models.CharField(max_length=20, unique=True)

    nom = models.CharField(max_length=50, unique=True)

    type_salle = models.ForeignKey(TypeSalle, on_delete=models.PROTECT, related_name='salles')

    capacite = models.PositiveIntegerField(default=0)

    localisation = models.CharField(max_length=50)

    equipements = models.TextField(blank=True)

    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='disponible')

    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nom']
        verbose_name = "Salle"
        verbose_name_plural = "Salles"

    def __str__(self):
        return self.nom

    







    
# ---------- MATIERE ----------
class Matiere(models.Model):

    SEMESTRES_CHOICES = (
        ('S1', 'Semestre 1'),
        ('S2', 'Semestre 2'),
    )

    STATUT_CHOICES = (
        ('actif', 'Actif'),
        ('inactif', 'Inactif'),
        ('suspendu', 'Suspendu'),
    )

    code = models.CharField(max_length=20, unique=True)

    nom = models.CharField(max_length=50, unique=True)

    specialite = models.ManyToManyField(Specialite, blank=True, related_name='matieres')

    niveau = models.ManyToManyField(Niveau, blank=True, related_name='matieres')

    description = models.TextField(blank=True, null=True)

    coefficient = models.PositiveIntegerField(default=1)

    volume_horaire = models.PositiveIntegerField(default=1)

    credit = models.PositiveIntegerField(default=1)

    semestre = models.CharField(max_length=2, choices=SEMESTRES_CHOICES)

    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default='actif')

    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nom']
        verbose_name = "Matière"
        verbose_name_plural = "Matières"

    def __str__(self):
        return self.nom




    
    




    
# ---------- ANNEE ACADEMIQUE ----------
class AnneeAcademique(models.Model):

    libelle = models.CharField(max_length=20, unique=True)  # ex: "2025-2026"

    date_debut = models.DateField()

    date_fin = models.DateField()

    statut = models.BooleanField(default=True)  # True = année en cours / active

    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_debut']
        verbose_name = "Année académique"
        verbose_name_plural = "Années académiques"

    def __str__(self):
        return self.libelle

    def clean(self):
        if self.date_debut and self.date_fin and self.date_debut >= self.date_fin:
            raise ValidationError("La date de début doit être antérieure à la date de fin.")



        
    




    
# ---------- CLASSE ----------
class Classe(models.Model):

    specialite = models.ForeignKey(Specialite, on_delete=models.CASCADE, related_name="classe", null = True, blank = True)

    niveau = models.ForeignKey(Niveau, on_delete=models.CASCADE, related_name="classe", null=True, blank=True)

    filiere = models.ForeignKey(Filiere, on_delete=models.CASCADE, related_name="classe", null=True, blank=True)

    effectif = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["specialite"]
        verbose_name = "Classe"
        verbose_name_plural = "Classes"

    def __str__(self):
        return f"{self.specialite.code} - {self.niveau}"



    
    




    
# ---------- EMPLOI DU TEMPS ----------
class EmploiDuTemps(models.Model):

    STATUT_CHOICES = [
        ("brouillon", "Brouillon"),
        ("publie", "Publié"),
        ("archive", "Archivé"),
    ]

    SEMESTRES_CHOICES = (
        ('S1', 'Semestre 1'),
        ('S2', 'Semestre 2'),
    )

    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, related_name="emplois_du_temps")

    semestre = models.CharField(max_length=2, choices=SEMESTRES_CHOICES, default='S1')

    annee_academique = models.ForeignKey(AnneeAcademique, on_delete=models.CASCADE, related_name="emplois_du_temps", null=True, blank=True)

    titre = models.CharField(max_length=150, blank=True)

    semaine_debut = models.DateField(null=True)

    semaine_fin = models.DateField(null=True)

    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default="brouillon")

    date_creation = models.DateTimeField(auto_now_add=True)

    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date_modification"]
        verbose_name = "Emploi du temps"
        verbose_name_plural = "Emplois du temps"

    def __str__(self):
        return self.titre or f"EDT {self.classe} - {self.semestre}"

    def get_absolute_url(self):
        return reverse("academique:emploi_detail", args=[self.pk])
    
    def clean(self):
        if self.semaine_debut and self.semaine_fin and self.semaine_debut >= self.semaine_fin:
            raise ValidationError("La semaine de début doit être antérieure à la semaine de fin.")

    @property
    def nom_affiche(self):
        return self.titre or f"{self.classe} — {self.semestre}"
    




    




    
# ---------- SEANCE ----------
class Seance(models.Model):

    TYPE_CHOICES = [
        ("CM", "Cours Magistral"),
        ("TD", "Travaux Dirigés"),
        ("TP", "Travaux Pratiques"),
        ("EX", "Examen"),
    ]

    JOUR_CHOICES = [
        ("LUN", "Lundi"),
        ("MAR", "Mardi"),
        ("MER", "Mercredi"),
        ("JEU", "Jeudi"),
        ("VEN", "Vendredi"),
        ("SAM", "Samedi"),
        ("DIM", "Dimanche"),
    ]

    emploi_du_temps = models.ForeignKey(EmploiDuTemps, on_delete=models.CASCADE, related_name="seances", null=True, blank=True)

    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name="seances", null=True, blank=True)

    formateur = models.ForeignKey('utilisateurs.Formateur', on_delete=models.CASCADE, related_name="seances", null=True, blank=True)

    salle = models.ForeignKey(Salle, on_delete=models.CASCADE, related_name="seances", null=True, blank=True)

    type_seance = models.CharField(max_length=2, choices=TYPE_CHOICES, default="CM")

    jour = models.CharField(max_length=3, choices=JOUR_CHOICES, default='LUN')

    heure_debut = models.TimeField()

    heure_fin = models.TimeField()

    class Meta:
        ordering = ["jour", "heure_debut"]
        verbose_name = "Séance"
        verbose_name_plural = "Séances"

    def __str__(self):
        return f"{self.matiere} ({self.get_jour_display()} {self.heure_debut}-{self.heure_fin})"



    def clean(self):

        # 1. Vérifier que l'heure de fin est après l'heure de début
        if self.heure_debut and self.heure_fin and self.heure_debut >= self.heure_fin:
            raise ValidationError("L'heure de fin doit être postérieure à l'heure de début.")


        # 2. Vérifier les chevauchements sur le même jour
        chevauchements = Seance.objects.filter(jour=self.jour).exclude(pk=self.pk)

        for seance in chevauchements:
            chevauche = self.heure_debut < seance.heure_fin and self.heure_fin > seance.heure_debut

            if not chevauche:
                continue

            # Conflit de salle
            if self.salle_id and seance.salle_id == self.salle_id:
                raise ValidationError(
                    f"Conflit de salle : {self.salle} est déjà occupée le {self.get_jour_display()} "
                    f"de {seance.heure_debut} à {seance.heure_fin}."
                )

            # Conflit de formateur
            if self.formateur_id and seance.formateur_id == self.formateur_id:
                raise ValidationError(
                    f"Conflit de formateur : {self.formateur} a déjà une séance le {self.get_jour_display()} "
                    f"de {seance.heure_debut} à {seance.heure_fin}."
                )

            # Conflit de classe (via emploi_du_temps -> classe)
            if self.emploi_du_temps_id and seance.emploi_du_temps_id:
                if self.emploi_du_temps.classe_id == seance.emploi_du_temps.classe_id:
                    raise ValidationError(
                        f"Conflit de classe : cette classe a déjà une séance le {self.get_jour_display()} "
                        f"de {seance.heure_debut} à {seance.heure_fin}."
                    )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)




    




    
# ---------- SANCTION ----------
class Sanction(models.Model):

    GRAVITE_CHOICES = (
        ('faible', 'Faible'),
        ('moyen', 'Moyen'),
        ('grave', 'Grave'),
        ('tres_grave', 'Très grave'),
    )

    TYPE_CHOICES = (
        ('avertissement', 'Avertissement'),
        ('blame', 'Blâme'),
        ('exclusion_tem', 'Exclusion temporaire'),
        ('exclusion_def', 'Exclusion définitive'),
    )

    code = models.CharField(max_length=20, unique=True)

    nom = models.CharField(max_length=50, unique=True)

    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='avertissement')

    gravite = models.CharField(max_length=20, choices=GRAVITE_CHOICES, default='grave')

    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default='actif')

    date_creation = models.DateTimeField(auto_now_add=True)

    entree_en_vigueur = models.DateTimeField()

    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['nom']
        verbose_name = "Sanction"
        verbose_name_plural = "Sanctions"

    def __str__(self):
        return self.nom
    