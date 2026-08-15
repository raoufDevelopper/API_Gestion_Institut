from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
# ---------------------------------------------------------------------------
# Catégorie
# ---------------------------------------------------------------------------
class Categorie(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        ordering = ['nom']
    def __str__(self):
        return self.nom
# ---------------------------------------------------------------------------
# Livre
# ---------------------------------------------------------------------------
class Livre(models.Model):
    titre = models.CharField(max_length=200)
    auteur = models.CharField(max_length=150)
    editeur = models.CharField(max_length=150, blank=True, null=True)
    isbn = models.CharField(max_length=20, blank=True, null=True, unique=True)
    categorie = models.ForeignKey(Categorie, on_delete=models.SET_NULL, null=True, blank=True, related_name='livres')
    annee_publication = models.PositiveIntegerField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    couverture = models.ImageField(upload_to='bibliotheque/couvertures/', blank=True, null=True)
    date_ajout = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name = "Livre"
        ordering = ['titre']
    def __str__(self):
        return f"{self.titre} — {self.auteur}"
    @property
    def nb_exemplaires_total(self):
        return self.exemplaires.count()
    @property
    def nb_exemplaires_disponibles(self):
        return self.exemplaires.filter(statut='disponible').count()
# ---------------------------------------------------------------------------
# Exemplaire
# ---------------------------------------------------------------------------
class Exemplaire(models.Model):
    ETAT_CHOICES = (
        ('bon', 'Bon état'),
        ('use', 'Usé'),
        ('abime', 'Abîmé'),
        ('perdu', 'Perdu'),
    )
    STATUT_CHOICES = (
        ('disponible', 'Disponible'),
        ('emprunte', 'Emprunté'),
        ('indisponible', 'Indisponible'),
    )
    livre = models.ForeignKey(Livre, on_delete=models.CASCADE, related_name='exemplaires')
    code_exemplaire = models.CharField(max_length=30, unique=True)
    etat = models.CharField(max_length=10, choices=ETAT_CHOICES, default='bon')
    statut = models.CharField(max_length=15, choices=STATUT_CHOICES, default='disponible')
    date_ajout = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name = "Exemplaire"
        ordering = ['livre', 'code_exemplaire']
    def __str__(self):
        return f"{self.code_exemplaire} — {self.livre.titre}"
# ---------------------------------------------------------------------------
# Emprunt
# ---------------------------------------------------------------------------
class Emprunt(models.Model):
    STATUT_CHOICES = (
        ('en_cours', 'En cours'),
        ('retourne', 'Retourné'),
        ('en_retard', 'En retard'),
        ('perdu', 'Perdu'),
    )
    exemplaire = models.ForeignKey(Exemplaire, on_delete=models.PROTECT, related_name='emprunts')
    etudiant = models.ForeignKey(
        'utilisateurs.Etudiant', on_delete=models.SET_NULL, null=True, blank=True, related_name='emprunts'
    )
    personnel = models.ForeignKey(
        'utilisateurs.Personnel', on_delete=models.SET_NULL, null=True, blank=True, related_name='emprunts'
    )
    date_emprunt = models.DateField(default=timezone.localdate)
    date_retour_prevue = models.DateField()
    date_retour_reelle = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=15, choices=STATUT_CHOICES, default='en_cours')
    enregistre_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='emprunts_enregistres'
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name = "Emprunt"
        ordering = ['-date_emprunt']
    def __str__(self):
        emprunteur = self.etudiant or self.personnel
        return f"{self.exemplaire} — {emprunteur}"
    @property
    def emprunteur(self):
        return self.etudiant or self.personnel
    def clean(self):
        if not self.etudiant and not self.personnel:
            raise ValidationError("Un emprunteur (étudiant ou personnel) est requis.")
        if self.etudiant and self.personnel:
            raise ValidationError("Un emprunt ne peut avoir qu'un seul emprunteur : étudiant OU personnel.")
        if self.pk is None and self.exemplaire.statut != 'disponible':
            raise ValidationError("Cet exemplaire n'est pas disponible pour emprunt.")
        from apps.parametres.models import ParametreInstitut
        parametre = ParametreInstitut.get_solo()
        emprunteur = self.etudiant or self.personnel
        if emprunteur and self.pk is None:
            champ = 'etudiant' if self.etudiant else 'personnel'
            nb_en_cours = Emprunt.objects.filter(
                **{champ: emprunteur}, statut__in=['en_cours', 'en_retard']
            ).count()
            if nb_en_cours >= parametre.nb_emprunts_max_simultanes:
                raise ValidationError(
                    f"Nombre maximum d'emprunts simultanés atteint ({parametre.nb_emprunts_max_simultanes})."
                )
    def save(self, *args, **kwargs):
        est_nouveau = self.pk is None
        if est_nouveau and not self.date_retour_prevue:
            from apps.parametres.models import ParametreInstitut
            parametre = ParametreInstitut.get_solo()
            self.date_retour_prevue = self.date_emprunt + timezone.timedelta(days=parametre.duree_emprunt_jours)
        self.full_clean()
        super().save(*args, **kwargs)
        if est_nouveau:
            self.exemplaire.statut = 'emprunte'
            self.exemplaire.save(update_fields=['statut'])
    def retourner(self, date_retour=None):
        """Marque l'emprunt comme retourné, libère l'exemplaire, et génère une pénalité si retard."""
        if self.statut == 'retourne':
            raise ValidationError("Cet emprunt a déjà été retourné.")
        self.date_retour_reelle = date_retour or timezone.localdate()
        self.statut = 'retourne'
        self.save(update_fields=['date_retour_reelle', 'statut'])
        self.exemplaire.statut = 'disponible'
        self.exemplaire.save(update_fields=['statut'])
        if self.date_retour_reelle > self.date_retour_prevue:
            jours_retard = (self.date_retour_reelle - self.date_retour_prevue).days
            from apps.parametres.models import ParametreInstitut
            parametre = ParametreInstitut.get_solo()
            montant = jours_retard * parametre.penalite_par_jour_retard
            penalite = Penalite.objects.create(
                emprunt=self, jours_retard=jours_retard, montant=montant,
            )
            penalite._creer_frais_si_etudiant()
# ---------------------------------------------------------------------------
# Reservation
# ---------------------------------------------------------------------------
class Reservation(models.Model):
    STATUT_CHOICES = (
        ('en_attente', 'En attente'),
        ('disponible', 'Disponible (à récupérer)'),
        ('annulee', 'Annulée'),
        ('honoree', 'Honorée'),
    )
    livre = models.ForeignKey(Livre, on_delete=models.CASCADE, related_name='reservations')
    etudiant = models.ForeignKey(
        'utilisateurs.Etudiant', on_delete=models.SET_NULL, null=True, blank=True, related_name='reservations'
    )
    personnel = models.ForeignKey(
        'utilisateurs.Personnel', on_delete=models.SET_NULL, null=True, blank=True, related_name='reservations'
    )
    date_reservation = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=15, choices=STATUT_CHOICES, default='en_attente')
    class Meta:
        verbose_name = "Réservation"
        ordering = ['date_reservation']
    def __str__(self):
        emprunteur = self.etudiant or self.personnel
        return f"{self.livre} — {emprunteur}"
    def clean(self):
        if not self.etudiant and not self.personnel:
            raise ValidationError("Un réservataire (étudiant ou personnel) est requis.")
        if self.etudiant and self.personnel:
            raise ValidationError("Une réservation ne peut avoir qu'un seul réservataire.")
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
# ---------------------------------------------------------------------------
# Penalite
# ---------------------------------------------------------------------------
class Penalite(models.Model):
    emprunt = models.OneToOneField(Emprunt, on_delete=models.CASCADE, related_name='penalite')
    jours_retard = models.PositiveIntegerField()
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    payee = models.BooleanField(default=False)
    date_paiement = models.DateField(null=True, blank=True)
    # Renseigné uniquement pour un emprunteur étudiant : relie la pénalité
    # à un vrai frais dans sa comptabilité (finances), pour qu'elle
    # apparaisse parmi ses frais à payer.
    frais_inscription = models.OneToOneField(
        'finances.FraisInscription', on_delete=models.SET_NULL, null=True, blank=True, related_name='penalite_bibliotheque'
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name = "Pénalité"
        ordering = ['-date_creation']
    def __str__(self):
        return f"Pénalité — {self.emprunt.emprunteur} — {self.montant}"
    def _creer_frais_si_etudiant(self):
        """
        Si l'emprunteur est un étudiant, crée un FraisInscription lié à son
        inscription en cours pour que la pénalité apparaisse dans ses frais
        à payer. Pour le personnel (pas d'inscription), ne fait rien : la
        pénalité reste autonome et est réglée directement (voir payer_penalite).
        """
        etudiant = self.emprunt.etudiant
        if not etudiant:
            return
        from apps.finances.models import Inscription, TypePaiement, FraisInscription
        inscription = Inscription.objects.filter(
            etudiant=etudiant, statut=Inscription.Statut.VALIDEE
        ).order_by('-annee_academique').first()
        if not inscription:
            return  # pas d'inscription active : la pénalité reste hors comptabilité
        type_paiement, _ = TypePaiement.objects.get_or_create(
            code='PENALITE_BIBLIOTHEQUE',
            defaults={'nom': 'Pénalité bibliothèque', 'obligatoire_a_inscription': False, 'ordre': 99}
        )
        frais = FraisInscription.objects.create(
            inscription=inscription,
            type_paiement=type_paiement,
            montant_du=self.montant,
        )
        self.frais_inscription = frais
        self.save(update_fields=['frais_inscription'])
    def marquer_payee(self):
        self.payee = True
        self.date_paiement = timezone.localdate()
        self.save(update_fields=['payee', 'date_paiement'])