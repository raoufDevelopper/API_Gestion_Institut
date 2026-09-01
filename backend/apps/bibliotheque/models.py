
from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone

# =============================================================
# NUMÉROTATION — réutilise le mécanisme déjà en place (parametres.generer_matricule)
# =============================================================
# Types à ajouter dans ConfigurationMatricule.TYPE_CHOICES (apps/parametres/models.py) :
# ('RESSOURCE', 'Ressource'), ('EXEMPLAIRE', 'Exemplaire'), ('ADHERENT', 'Adhérent'),
# ('EMPRUNT', 'Emprunt'), ('RESERVATION', 'Réservation'), ('ACQUISITION', 'Acquisition')
# =============================================================
# CATÉGORIE (hiérarchique)
# =============================================================
class Categorie(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    parent = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='sous_categories'
    )
    description = models.TextField(blank=True, null=True)
    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        ordering = ['nom']
    def __str__(self):
        if self.parent:
            return f"{self.parent} → {self.nom}"
        return self.nom


# =============================================================
# AUTEUR
# =============================================================
class Auteur(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100, blank=True, null=True)
    biographie = models.TextField(blank=True, null=True)
    nationalite = models.CharField(max_length=100, blank=True, null=True)
    photo = models.ImageField(upload_to='bibliotheque/auteurs/', blank=True, null=True)
    class Meta:
        verbose_name = "Auteur"
        ordering = ['nom', 'prenom']
    def __str__(self):
        return f"{self.nom} {self.prenom or ''}".strip()


# =============================================================
# ÉDITEUR
# =============================================================
class Editeur(models.Model):
    nom = models.CharField(max_length=150, unique=True)
    adresse = models.CharField(max_length=255, blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    site_web = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    class Meta:
        verbose_name = "Éditeur"
        ordering = ['nom']
    def __str__(self):
        return self.nom


# =============================================================
# RESSOURCE (le catalogue — remplace l'ancien "Livre")
# =============================================================
class TypeRessource(models.TextChoices):
    LIVRE = 'LIVRE', 'Livre'
    REVUE = 'REVUE', 'Revue / Périodique'
    MEMOIRE = 'MEMOIRE', 'Mémoire / Travail académique'
    NUMERIQUE = 'NUMERIQUE', 'Ressource numérique'
    AUTRE = 'AUTRE', 'Autre'

class Ressource(models.Model):
    numero = models.CharField(max_length=30, unique=True, blank=True)  # RES-2026-0001
    type_ressource = models.CharField(max_length=15, choices=TypeRessource.choices, default=TypeRessource.LIVRE)
    titre = models.CharField(max_length=255)
    sous_titre = models.CharField(max_length=255, blank=True, null=True)
    auteurs = models.ManyToManyField(Auteur, blank=True, related_name='ressources')
    editeur = models.ForeignKey(Editeur, on_delete=models.SET_NULL, null=True, blank=True, related_name='ressources')
    isbn_issn = models.CharField(max_length=30, blank=True, null=True)
    annee_publication = models.PositiveIntegerField(blank=True, null=True)
    edition = models.CharField(max_length=50, blank=True, null=True)
    langue = models.CharField(max_length=50, blank=True, null=True)
    categorie = models.ForeignKey(Categorie, on_delete=models.SET_NULL, null=True, blank=True, related_name='ressources')
    mots_cles = models.CharField(max_length=255, blank=True, null=True, help_text="Séparés par des virgules")
    description = models.TextField(blank=True, null=True)
    couverture = models.ImageField(upload_to='bibliotheque/couvertures/', blank=True, null=True)
    # Classification pédagogique — flexible, aucune contrainte forte
    filiere = models.ForeignKey('academique.Filiere', on_delete=models.SET_NULL, null=True, blank=True, related_name='ressources_bibliotheque')
    specialite = models.ForeignKey('academique.Specialite', on_delete=models.SET_NULL, null=True, blank=True, related_name='ressources_bibliotheque')
    # Uniquement pour les ressources numériques
    fichier_numerique = models.FileField(upload_to='bibliotheque/numerique/', blank=True, null=True)
    retiree = models.BooleanField(default=False, help_text="Ressource retirée du catalogue actif (jamais supprimée).")
    date_ajout = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name = "Ressource"
        ordering = ['titre']
    def __str__(self):
        return f"{self.numero} — {self.titre}"
    def save(self, *args, **kwargs):
        if not self.numero:
            from apps.parametres.models import generer_matricule
            self.numero = generer_matricule('RESSOURCE')
        super().save(*args, **kwargs)
    @property
    def nb_exemplaires_total(self):
        return self.exemplaires.count()
    @property
    def nb_exemplaires_disponibles(self):
        return self.exemplaires.filter(statut='DISPONIBLE').count()
    @property
    def nb_exemplaires_empruntes(self):
        return self.exemplaires.filter(statut='EMPRUNTE').count()
    @property
    def nb_exemplaires_reserves(self):
        return self.exemplaires.filter(statut='RESERVE').count()
    @property
    def nb_exemplaires_perdus(self):
        return self.exemplaires.filter(statut='PERDU').count()
    @property
    def nb_exemplaires_endommages(self):
        return self.exemplaires.filter(etat__in=['ABIME', 'TRES_ABIME']).count()


# =============================================================
# LOCALISATION (flexible : salle → rayon → étagère)
# =============================================================
class Localisation(models.Model):
    salle = models.CharField(max_length=100, blank=True, null=True)
    rayon = models.CharField(max_length=50, blank=True, null=True)
    etagere = models.CharField(max_length=50, blank=True, null=True)
    class Meta:
        verbose_name = "Localisation"
        unique_together = ('salle', 'rayon', 'etagere')
    def __str__(self):
        parts = [p for p in [self.salle, self.rayon, self.etagere] if p]
        return ' → '.join(parts) if parts else 'Non localisé'


# =============================================================
# EXEMPLAIRE
# =============================================================
class EtatPhysique(models.TextChoices):
    BON = 'BON', 'Bon'
    MOYEN = 'MOYEN', 'Moyen'
    ABIME = 'ABIME', 'Abîmé'
    TRES_ABIME = 'TRES_ABIME', 'Très abîmé'

class StatutExemplaire(models.TextChoices):
    DISPONIBLE = 'DISPONIBLE', 'Disponible'
    EMPRUNTE = 'EMPRUNTE', 'Emprunté'
    RESERVE = 'RESERVE', 'Réservé'
    PERDU = 'PERDU', 'Perdu'
    ENDOMMAGE = 'ENDOMMAGE', 'Endommagé'
    EN_REPARATION = 'EN_REPARATION', 'En réparation'
    RETIRE = 'RETIRE', 'Retiré'

class Exemplaire(models.Model):
    numero = models.CharField(max_length=30, unique=True, blank=True)  # EX-2026-0001
    ressource = models.ForeignKey(Ressource, on_delete=models.PROTECT, related_name='exemplaires')
    localisation = models.ForeignKey(Localisation, on_delete=models.SET_NULL, null=True, blank=True, related_name='exemplaires')
    etat = models.CharField(max_length=15, choices=EtatPhysique.choices, default=EtatPhysique.BON)
    statut = models.CharField(max_length=15, choices=StatutExemplaire.choices, default=StatutExemplaire.DISPONIBLE)
    date_acquisition = models.DateField(default=timezone.localdate)
    class Meta:
        verbose_name = "Exemplaire"
        ordering = ['numero']
    def __str__(self):
        return f"{self.numero} — {self.ressource.titre}"
    def save(self, *args, **kwargs):
        if not self.numero:
            from apps.parametres.models import generer_matricule
            self.numero = generer_matricule('EXEMPLAIRE')
        super().save(*args, **kwargs)
    def est_empruntable(self):
        return self.statut == StatutExemplaire.DISPONIBLE


# =============================================================
# ADHÉRENT — pont vers Etudiant / Personnel / Formateur
# =============================================================
class StatutAdherent(models.TextChoices):
    ACTIF = 'ACTIF', 'Actif'
    SUSPENDU = 'SUSPENDU', 'Suspendu'
    EXPIRE = 'EXPIRE', 'Expiré'
    DESACTIVE = 'DESACTIVE', 'Désactivé'


class Adherent(models.Model):
    numero = models.CharField(max_length=30, unique=True, blank=True)  # ADH-2026-0001
    # Un seul des trois doit être renseigné — imposé par clean()
    etudiant = models.OneToOneField(
        'utilisateurs.Etudiant', on_delete=models.CASCADE, null=True, blank=True, related_name='adherent_bibliotheque'
    )
    personnel = models.OneToOneField(
        'utilisateurs.Personnel', on_delete=models.CASCADE, null=True, blank=True, related_name='adherent_bibliotheque'
    )
    formateur = models.OneToOneField(
        'utilisateurs.Formateur', on_delete=models.CASCADE, null=True, blank=True, related_name='adherent_bibliotheque'
    )
    statut = models.CharField(max_length=15, choices=StatutAdherent.choices, default=StatutAdherent.ACTIF)
    motif_suspension = models.TextField(blank=True, null=True)
    date_inscription = models.DateField(auto_now_add=True)
    class Meta:
        verbose_name = "Adhérent"
        ordering = ['-date_inscription']
    def __str__(self):
        return f"{self.numero} — {self.personne}"
    def clean(self):
        renseignes = [self.etudiant, self.personnel, self.formateur]
        nb_renseignes = sum(1 for r in renseignes if r is not None)
        if nb_renseignes != 1:
            raise ValidationError("Un adhérent doit être lié à exactement une personne (étudiant, personnel ou formateur).")
    def save(self, *args, **kwargs):
        self.full_clean()
        if not self.numero:
            from apps.parametres.models import generer_matricule
            self.numero = generer_matricule('ADHERENT')
        super().save(*args, **kwargs)
    @property
    def personne(self):
        return self.etudiant or self.personnel or self.formateur
    @property
    def type_adherent(self):
        if self.etudiant_id:
            return 'ETUDIANT'
        if self.formateur_id:
            return 'FORMATEUR'
        if self.personnel_id:
            return 'PERSONNEL'
        return None
    def est_actif(self):
        return self.statut == StatutAdherent.ACTIF
    def nb_emprunts_en_cours(self):
        return self.emprunts.filter(statut__in=['EN_COURS', 'EN_RETARD']).count()


# =============================================================
# RÈGLES DE BIBLIOTHÈQUE (configuration, pas de valeurs en dur)
# =============================================================
class RegleBibliotheque(models.Model):
    """Une règle par type d'adhérent. Singleton par type_adherent."""
    TYPE_CHOICES = [
        ('ETUDIANT', 'Étudiant'),
        ('PERSONNEL', 'Personnel'),
        ('FORMATEUR', 'Formateur'),
    ]
    type_adherent = models.CharField(max_length=15, choices=TYPE_CHOICES, unique=True)
    nb_emprunts_max = models.PositiveIntegerField(default=3)
    duree_emprunt_jours = models.PositiveIntegerField(default=14)
    nb_renouvellements_max = models.PositiveIntegerField(default=1)
    penalite_par_jour_retard = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    penalite_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    penalite_perte = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    penalite_deterioration = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    duree_retrait_reservation_jours = models.PositiveIntegerField(
        default=2, help_text="Délai laissé à l'adhérent pour retirer un exemplaire réservé devenu disponible."
    )
    class Meta:
        verbose_name = "Règle de bibliothèque"
        verbose_name_plural = "Règles de bibliothèque"
    def __str__(self):
        return f"Règles — {self.get_type_adherent_display()}"
    @classmethod
    def pour(cls, type_adherent):
        regle, _ = cls.objects.get_or_create(
            type_adherent=type_adherent,
            defaults={'nb_emprunts_max': 3, 'duree_emprunt_jours': 14}
        )
        return regle


# =============================================================
# EMPRUNT
# =============================================================
class StatutEmprunt(models.TextChoices):
    EN_COURS = 'EN_COURS', 'En cours'
    RETOURNE = 'RETOURNE', 'Retourné'
    EN_RETARD = 'EN_RETARD', 'En retard'
    PERDU = 'PERDU', 'Perdu'
    ANNULE = 'ANNULE', 'Annulé'

class Emprunt(models.Model):
    numero = models.CharField(max_length=30, unique=True, blank=True)  # EMP-2026-0001
    adherent = models.ForeignKey(Adherent, on_delete=models.PROTECT, related_name='emprunts')
    exemplaire = models.ForeignKey(Exemplaire, on_delete=models.PROTECT, related_name='emprunts')
    date_emprunt = models.DateField(default=timezone.localdate)
    date_retour_prevue = models.DateField()
    date_retour_reelle = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=15, choices=StatutEmprunt.choices, default=StatutEmprunt.EN_COURS)
    nb_renouvellements = models.PositiveIntegerField(default=0)
    observations = models.TextField(blank=True, null=True)
    enregistre_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='emprunts_enregistres'
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name = "Emprunt"
        ordering = ['-date_emprunt']
    def __str__(self):
        return f"{self.numero} — {self.exemplaire} — {self.adherent}"
    def save(self, *args, **kwargs):
        if not self.numero:
            from apps.parametres.models import generer_matricule
            self.numero = generer_matricule('EMPRUNT')
        super().save(*args, **kwargs)
    @property
    def jours_de_retard(self):
        """Calculé dynamiquement, jamais stocké."""
        if self.date_retour_reelle:
            reference = self.date_retour_reelle
        elif self.statut in (StatutEmprunt.EN_COURS, StatutEmprunt.EN_RETARD):
            reference = timezone.localdate()
        else:
            return 0
        delta = (reference - self.date_retour_prevue).days
        return max(delta, 0)
    @property
    def est_en_retard(self):
        return self.statut in (StatutEmprunt.EN_COURS, StatutEmprunt.EN_RETARD) and self.jours_de_retard > 0


def valider_nouvel_emprunt(adherent, exemplaire):
    """
    Centralise toutes les règles du §18 du cahier des charges.
    Lève ValidationError avec un message explicite si une règle est violée.
    """
    if not adherent.est_actif():
        raise ValidationError(f"L'adhérent est {adherent.get_statut_display().lower()} : impossible d'enregistrer un nouvel emprunt.")
    regle = RegleBibliotheque.pour(adherent.type_adherent)
    if adherent.nb_emprunts_en_cours() >= regle.nb_emprunts_max:
        raise ValidationError(f"Limite d'emprunts atteinte ({regle.nb_emprunts_max} maximum pour ce type d'adhérent).")
    if not exemplaire.est_empruntable():
        raise ValidationError(f"Cet exemplaire n'est pas disponible (statut actuel : {exemplaire.get_statut_display()}).")
    return regle


# =============================================================
# RÉSERVATION
# =============================================================
class StatutReservation(models.TextChoices):
    EN_ATTENTE = 'EN_ATTENTE', 'En attente'
    DISPONIBLE = 'DISPONIBLE', 'Disponible'
    RETIREE = 'RETIREE', 'Retirée'
    EXPIREE = 'EXPIREE', 'Expirée'
    ANNULEE = 'ANNULEE', 'Annulée'
    TERMINEE = 'TERMINEE', 'Terminée'

class Reservation(models.Model):
    numero = models.CharField(max_length=30, unique=True, blank=True)  # RSV-2026-0001
    adherent = models.ForeignKey(Adherent, on_delete=models.PROTECT, related_name='reservations')
    ressource = models.ForeignKey(Ressource, on_delete=models.PROTECT, related_name='reservations')
    date_reservation = models.DateTimeField(auto_now_add=True)
    date_expiration = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=15, choices=StatutReservation.choices, default=StatutReservation.EN_ATTENTE)
    class Meta:
        verbose_name = "Réservation"
        ordering = ['date_reservation']
    def __str__(self):
        return f"{self.numero} — {self.ressource} — {self.adherent}"
    def clean(self):
        if self.pk is None:
            doublon = Reservation.objects.filter(
                adherent=self.adherent, ressource=self.ressource,
                statut__in=[StatutReservation.EN_ATTENTE, StatutReservation.DISPONIBLE],
            ).exists()
            if doublon:
                raise ValidationError("Cet adhérent a déjà une réservation active pour cette ressource.")
    def save(self, *args, **kwargs):
        self.full_clean()
        if not self.numero:
            from apps.parametres.models import generer_matricule
            self.numero = generer_matricule('RESERVATION')
        super().save(*args, **kwargs)
    @property
    def position_file(self):
        """Position parmi les réservations en attente pour cette ressource, par ordre d'arrivée."""
        return list(
            Reservation.objects.filter(
                ressource=self.ressource, statut=StatutReservation.EN_ATTENTE
            ).order_by('date_reservation').values_list('id', flat=True)
        ).index(self.id) + 1 if self.statut == StatutReservation.EN_ATTENTE else None


def traiter_retour_exemplaire(exemplaire):
    """
    Appelée après chaque retour : propose l'exemplaire au 1er de la file
    d'attente s'il existe une réservation active sur la ressource (§23).
    """
    reservation = Reservation.objects.filter(
        ressource=exemplaire.ressource, statut=StatutReservation.EN_ATTENTE
    ).order_by('date_reservation').first()
    if reservation:
        regle = RegleBibliotheque.pour(reservation.adherent.type_adherent)
        reservation.statut = StatutReservation.DISPONIBLE
        reservation.date_expiration = timezone.localdate() + timezone.timedelta(days=regle.duree_retrait_reservation_jours)
        reservation.save(update_fields=['statut', 'date_expiration'])
        exemplaire.statut = StatutExemplaire.RESERVE
        exemplaire.save(update_fields=['statut'])
        return reservation
    exemplaire.statut = StatutExemplaire.DISPONIBLE
    exemplaire.save(update_fields=['statut'])
    return None


# =============================================================
# PÉNALITÉ
# =============================================================
class TypePenalite(models.TextChoices):
    RETARD = 'RETARD', 'Retard'
    PERTE = 'PERTE', 'Perte'
    DETERIORATION = 'DETERIORATION', 'Détérioration'

class Penalite(models.Model):
    emprunt = models.ForeignKey(Emprunt, on_delete=models.CASCADE, related_name='penalites')
    type_penalite = models.CharField(max_length=15, choices=TypePenalite.choices)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    payee = models.BooleanField(default=False)
    date_paiement = models.DateField(null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name = "Pénalité"
        ordering = ['-date_creation']
    def __str__(self):
        return f"Pénalité {self.get_type_penalite_display()} — {self.montant} — {self.emprunt}"
    def marquer_payee(self):
        self.payee = True
        self.date_paiement = timezone.localdate()
        self.save(update_fields=['payee', 'date_paiement'])


# =============================================================
# INVENTAIRE
# =============================================================
class StatutInventaire(models.TextChoices):
    EN_COURS = 'EN_COURS', 'En cours'
    TERMINE = 'TERMINE', 'Terminé'

class Inventaire(models.Model):
    date_inventaire = models.DateField(default=timezone.localdate)
    responsable = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='inventaires'
    )
    zone_concernee = models.CharField(max_length=150, blank=True, null=True, help_text="Ex: Rayon A, Bibliothèque entière...")
    statut = models.CharField(max_length=15, choices=StatutInventaire.choices, default=StatutInventaire.EN_COURS)
    observations = models.TextField(blank=True, null=True)
    class Meta:
        verbose_name = "Inventaire"
        ordering = ['-date_inventaire']
    def __str__(self):
        return f"Inventaire du {self.date_inventaire}"
    @property
    def nb_exemplaires_theoriques(self):
        return self.lignes.count()
    @property
    def nb_exemplaires_verifies(self):
        return self.lignes.exclude(statut_constate='A_VERIFIER').count()
    @property
    def nb_anomalies(self):
        return self.lignes.filter(statut_constate__in=['INTROUVABLE', 'ENDOMMAGE', 'INCOHERENT']).count()

class StatutConstateInventaire(models.TextChoices):
    PRESENT = 'PRESENT', 'Présent'
    INTROUVABLE = 'INTROUVABLE', 'Introuvable'
    ENDOMMAGE = 'ENDOMMAGE', 'Endommagé'
    INCOHERENT = 'INCOHERENT', 'Incohérent'
    A_VERIFIER = 'A_VERIFIER', 'À vérifier'

class LigneInventaire(models.Model):
    inventaire = models.ForeignKey(Inventaire, on_delete=models.CASCADE, related_name='lignes')
    exemplaire = models.ForeignKey(Exemplaire, on_delete=models.PROTECT, related_name='lignes_inventaire')
    statut_constate = models.CharField(max_length=15, choices=StatutConstateInventaire.choices, default=StatutConstateInventaire.A_VERIFIER)
    observation = models.TextField(blank=True, null=True)
    class Meta:
        verbose_name = "Ligne d'inventaire"
        unique_together = ('inventaire', 'exemplaire')
    def __str__(self):
        return f"{self.exemplaire} — {self.get_statut_constate_display()}"


# =============================================================
# FOURNISSEUR
# =============================================================
class Fournisseur(models.Model):
    nom = models.CharField(max_length=150, unique=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    adresse = models.CharField(max_length=255, blank=True, null=True)
    personne_contact = models.CharField(max_length=150, blank=True, null=True)
    observations = models.TextField(blank=True, null=True)
    class Meta:
        verbose_name = "Fournisseur"
        ordering = ['nom']
    def __str__(self):
        return self.nom


# =============================================================
# ACQUISITION
# =============================================================
class StatutAcquisition(models.TextChoices):
    EN_PREPARATION = 'EN_PREPARATION', 'En préparation'
    COMMANDEE = 'COMMANDEE', 'Commandée'
    RECUE = 'RECUE', 'Reçue'
    PARTIELLEMENT_RECUE = 'PARTIELLEMENT_RECUE', 'Partiellement reçue'
    ANNULEE = 'ANNULEE', 'Annulée'

class Acquisition(models.Model):
    numero = models.CharField(max_length=30, unique=True, blank=True)  # ACQ-2026-0001
    date_acquisition = models.DateField(default=timezone.localdate)
    fournisseur = models.ForeignKey(Fournisseur, on_delete=models.SET_NULL, null=True, blank=True, related_name='acquisitions')
    reference = models.CharField(max_length=100, blank=True, null=True)
    montant = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    statut = models.CharField(max_length=25, choices=StatutAcquisition.choices, default=StatutAcquisition.EN_PREPARATION)
    enregistre_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='acquisitions_enregistrees'
    )
    observations = models.TextField(blank=True, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name = "Acquisition"
        ordering = ['-date_acquisition']
    def __str__(self):
        return f"{self.numero} — {self.fournisseur or 'Fournisseur non précisé'}"
    def save(self, *args, **kwargs):
        if not self.numero:
            from apps.parametres.models import generer_matricule
            self.numero = generer_matricule('ACQUISITION')
        super().save(*args, **kwargs)


class LigneAcquisition(models.Model):
    acquisition = models.ForeignKey(Acquisition, on_delete=models.CASCADE, related_name='lignes')
    ressource = models.ForeignKey(Ressource, on_delete=models.PROTECT, related_name='lignes_acquisition')
    quantite = models.PositiveIntegerField(default=1)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    class Meta:
        verbose_name = "Ligne d'acquisition"
    def __str__(self):
        return f"{self.quantite} × {self.ressource.titre}"