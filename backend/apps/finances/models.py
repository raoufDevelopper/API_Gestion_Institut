
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Sum
from django.utils import timezone
class TimeStampedModel(models.Model):
    cree_le = models.DateTimeField(auto_now_add=True)
    modifie_le = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True
# ---------------------------------------------------------------------------
# Paramétrage — Dépenses
# ---------------------------------------------------------------------------
class CategorieDepense(models.Model):
    nom = models.CharField(max_length=80, unique=True)
    est_tresorerie = models.BooleanField(
        default=False,
        help_text=(
            "Coché pour les mouvements de trésorerie interne (ex. dépôt bancaire) : "
            "ils sortent de la caisse mais ne sont pas de vraies charges de "
            "fonctionnement, donc exclus des totaux de dépenses du tableau de bord."
        ),
    )
    class Meta:
        verbose_name = "Catégorie de dépense"
        verbose_name_plural = "Catégories de dépense"
        ordering = ["nom"]
    def __str__(self):
        return self.nom
# ---------------------------------------------------------------------------
# Paramétrage — Types de frais & Tarification
# ---------------------------------------------------------------------------
class TypePaiement(models.Model):
    code = models.SlugField(max_length=30, unique=True)
    nom = models.CharField(max_length=80)
    obligatoire_a_inscription = models.BooleanField(default=False)
    ordre = models.PositiveSmallIntegerField(default=0)
    class Meta:
        verbose_name = "Type de paiement"
        verbose_name_plural = "Types de paiement"
        ordering = ["ordre", "nom"]
    def __str__(self):
        return self.nom
class TarifQuerySet(models.QuerySet):
    def resoudre(self, type_paiement, specialite, niveau, annee_academique):
        candidats = self.filter(
            type_paiement=type_paiement, annee_academique=annee_academique, actif=True,
        )
        meilleur, meilleure_priorite = None, -1
        for tarif in candidats:
            specialites_ids = set(tarif.specialites.values_list("pk", flat=True))
            niveaux_ids = set(tarif.niveaux.values_list("pk", flat=True))
            correspond_specialite = not specialites_ids or (specialite and specialite.pk in specialites_ids)
            correspond_niveau = not niveaux_ids or (niveau and niveau.pk in niveaux_ids)
            if not (correspond_specialite and correspond_niveau):
                continue
            priorite = tarif.niveau_specificite()
            if priorite > meilleure_priorite:
                meilleure_priorite, meilleur = priorite, tarif
        return meilleur
class Tarif(models.Model):
    type_paiement = models.ForeignKey(TypePaiement, on_delete=models.PROTECT, related_name="tarifs")
    specialites = models.ManyToManyField(
        "academique.Specialite", blank=True, related_name="tarifs",
        help_text="Laisser vide = s'applique à toutes les spécialités.",
    )
    niveaux = models.ManyToManyField(
        "academique.Niveau", blank=True, related_name="tarifs",
        help_text="Laisser vide = s'applique à tous les niveaux.",
    )
    annee_academique = models.ForeignKey(
        "academique.AnneeAcademique", on_delete=models.CASCADE, related_name="tarifs", null=True, blank=True
    )
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    actif = models.BooleanField(default=True)
    objects = TarifQuerySet.as_manager()
    class Meta:
        verbose_name = "Tarif"
        ordering = ["-annee_academique", "type_paiement"]
    def __str__(self):
        return f"{self.type_paiement} · {self.decrire_portee()} · {self.annee_academique} · {self.montant}"
    def decrire_portee(self):
        specialites = list(self.specialites.all())
        niveaux = list(self.niveaux.all())
        if not specialites and not niveaux:
            return "Tout l'institut"
        partie_specialite = ", ".join(str(s) for s in specialites) if specialites else "toutes spécialités"
        partie_niveau = ", ".join(str(n) for n in niveaux) if niveaux else "tous niveaux"
        return f"{partie_specialite} · {partie_niveau}"
    def niveau_specificite(self):
        a_specialites = self.specialites.exists()
        a_niveaux = self.niveaux.exists()
        if a_specialites and a_niveaux:
            return 4
        if a_niveaux:
            return 3
        if a_specialites:
            return 2
        return 1
    def chevauche(self, autre):
        if self.niveau_specificite() != autre.niveau_specificite():
            return False
        mes_specialites = set(self.specialites.values_list("pk", flat=True))
        ses_specialites = set(autre.specialites.values_list("pk", flat=True))
        mes_niveaux = set(self.niveaux.values_list("pk", flat=True))
        ses_niveaux = set(autre.niveaux.values_list("pk", flat=True))
        chevauche_specialite = not mes_specialites or not ses_specialites or bool(mes_specialites & ses_specialites)
        chevauche_niveau = not mes_niveaux or not ses_niveaux or bool(mes_niveaux & ses_niveaux)
        return chevauche_specialite and chevauche_niveau
    def conflits(self):
        candidats = Tarif.objects.filter(
            type_paiement=self.type_paiement, annee_academique=self.annee_academique, actif=True,
        ).exclude(pk=self.pk)
        return [t for t in candidats if self.chevauche(t)]
# ---------------------------------------------------------------------------
# Inscription
# ---------------------------------------------------------------------------
class Inscription(TimeStampedModel):
    class Statut(models.TextChoices):
        EN_ATTENTE = "EN_ATTENTE", "En attente"
        VALIDEE = "VALIDEE", "Validée"
        ANNULEE = "ANNULEE", "Annulée"
    etudiant = models.ForeignKey("utilisateurs.Etudiant", on_delete=models.CASCADE, related_name="inscriptions")
    classe = models.ForeignKey("academique.Classe", on_delete=models.PROTECT, related_name="inscriptions")
    annee_academique = models.ForeignKey(
        "academique.AnneeAcademique", on_delete=models.CASCADE, related_name="inscriptions", null=True, blank=True
    )
    date_inscription = models.DateField(default=timezone.localdate)
    statut = models.CharField(max_length=12, choices=Statut.choices, default=Statut.EN_ATTENTE)
    cree_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="inscriptions_creees",
    )
    class Meta:
        verbose_name = "Inscription"
        unique_together = ("etudiant", "annee_academique")
        ordering = ["-date_inscription"]
    def __str__(self):
        return f"{self.etudiant.nom} {self.etudiant.prenom} — {self.annee_academique}"
    def save(self, *args, **kwargs):
        est_nouvelle = self.pk is None
        super().save(*args, **kwargs)
        if est_nouvelle:
            self._appliquer_frais_obligatoires()

    def _appliquer_frais_obligatoires(self):
        for type_paiement in TypePaiement.objects.filter(obligatoire_a_inscription=True):
            tarif = Tarif.objects.resoudre(
                type_paiement=type_paiement,
                specialite=self.classe.nom,
                niveau=self.classe.niveau,
                annee_academique=self.annee_academique,
            )
            if tarif is None:
                continue
            montant_du = tarif.montant
            # Réduction bourse — uniquement sur la Scolarité
            if type_paiement.code == 'SCOLARITE' and hasattr(self.etudiant, 'bourse') and self.etudiant.bourse.active:
                reduction = self.etudiant.bourse.calculer_reduction(montant_du)
                montant_du -= reduction
            FraisInscription.objects.get_or_create(
                inscription=self, type_paiement=type_paiement,
                defaults={"montant_du": montant_du},
            )
   
    @property
    def total_du(self):
        return self.frais.aggregate(s=Sum("montant_du"))["s"] or 0
    @property
    def montant_paye(self):
        total = self.paiements.filter(statut=Paiement.Statut.VALIDE).aggregate(s=Sum("montant"))["s"]
        return total or 0
    @property
    def reste_a_payer(self):
        return max(self.total_du - self.montant_paye, 0)
    @property
    def statut_paiement(self):
        paye = self.montant_paye
        if paye <= 0:
            return "NON_PAYE"
        if paye < self.total_du:
            return "PARTIEL"
        return "PAYE"


class FraisInscription(models.Model):
    inscription = models.ForeignKey(Inscription, on_delete=models.CASCADE, related_name="frais")
    type_paiement = models.ForeignKey(TypePaiement, on_delete=models.PROTECT, related_name="frais_appliques")
    montant_du = models.DecimalField(max_digits=10, decimal_places=2)
    date_application = models.DateField(default=timezone.localdate)
    ajoute_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="frais_ajoutes",
    )
    class Meta:
        verbose_name = "Frais d'inscription"
        verbose_name_plural = "Frais d'inscription"
        unique_together = ("inscription", "type_paiement")
        ordering = ["type_paiement__ordre"]
    def __str__(self):
        return f"{self.type_paiement} — {self.inscription}"
    @property
    def montant_paye(self):
        total = self.inscription.paiements.filter(
            type_paiement=self.type_paiement, statut=Paiement.Statut.VALIDE,
        ).aggregate(s=Sum("montant"))["s"]
        return total or 0
    @property
    def reste_a_payer(self):
        return max(self.montant_du - self.montant_paye, 0)
    @property
    def statut_paiement(self):
        paye = self.montant_paye
        if paye <= 0:
            return "NON_PAYE"
        if paye < self.montant_du:
            return "PARTIEL"
        return "PAYE"
# ---------------------------------------------------------------------------
# Paiement
# ---------------------------------------------------------------------------
class Paiement(TimeStampedModel):
    class ModePaiement(models.TextChoices):
        ESPECES = "ESPECES", "Espèces"
        CHEQUE = "CHEQUE", "Chèque"
        VIREMENT = "VIREMENT", "Virement"
        MOBILE = "MOBILE", "Mobile Money"
    class Statut(models.TextChoices):
        VALIDE = "VALIDE", "Validé"
        ANNULE = "ANNULE", "Annulé"
        REMBOURSE = "REMBOURSE", "Remboursé"
    inscription = models.ForeignKey(Inscription, on_delete=models.CASCADE, related_name="paiements")
    type_paiement = models.ForeignKey(TypePaiement, on_delete=models.PROTECT, related_name="paiements")
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date_paiement = models.DateField(default=timezone.localdate)
    mode_paiement = models.CharField(max_length=10, choices=ModePaiement.choices)
    numero_recu = models.CharField(max_length=20, unique=True, blank=True)
    caisse_session = models.ForeignKey(
        "CaisseSession", on_delete=models.PROTECT, null=True, blank=True, related_name="paiements",
    )
    enregistre_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="paiements_enregistres",
    )
    statut = models.CharField(max_length=10, choices=Statut.choices, default=Statut.VALIDE)
    class Meta:
        verbose_name = "Paiement"
        ordering = ["-date_paiement", "-id"]
    def __str__(self):
        return self.numero_recu
    def clean(self):
        if self.mode_paiement == self.ModePaiement.ESPECES and not self.caisse_session_id:
            raise ValidationError("Une session de caisse ouverte est requise pour un paiement en espèces.")
        if self.caisse_session_id and self.caisse_session.statut != CaisseSession.Statut.OUVERTE:
            raise ValidationError("Impossible d'ajouter un mouvement à une session de caisse déjà fermée.")
        if self.montant is not None and self.montant <= 0:
            raise ValidationError("Le montant doit être strictement positif.")
        if self.type_paiement_id and not FraisInscription.objects.filter(
            inscription=self.inscription, type_paiement=self.type_paiement,
        ).exists():
            raise ValidationError(
                "Ce type de frais n'a pas été appliqué à cette inscription."
            )
    def _generer_numero_recu(self):
        annee = (self.date_paiement or timezone.localdate()).year
        prefixe = f"REC-{annee}-"
        dernier = Paiement.objects.filter(numero_recu__startswith=prefixe).order_by("-numero_recu").first()
        seq = int(dernier.numero_recu.split("-")[-1]) + 1 if dernier else 1
        return f"{prefixe}{seq:04d}"
    def save(self, *args, **kwargs):
        if not self.numero_recu:
            self.numero_recu = self._generer_numero_recu()
        self.clean()
        super().save(*args, **kwargs)
# ---------------------------------------------------------------------------
# Dépense
# ---------------------------------------------------------------------------
class Depense(TimeStampedModel):
    class ModePaiement(models.TextChoices):
        ESPECES = "ESPECES", "Espèces"
        CHEQUE = "CHEQUE", "Chèque"
        VIREMENT = "VIREMENT", "Virement"
    class Statut(models.TextChoices):
        EN_ATTENTE = "EN_ATTENTE", "En attente"
        APPROUVEE = "APPROUVEE", "Approuvée"
        REJETEE = "REJETEE", "Rejetée"
        PAYEE = "PAYEE", "Payée"
    categorie = models.ForeignKey(CategorieDepense, on_delete=models.PROTECT, related_name="depenses")
    libelle = models.CharField(max_length=200)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date_depense = models.DateField(default=timezone.localdate)
    mode_paiement = models.CharField(max_length=10, choices=ModePaiement.choices)
    caisse_session = models.ForeignKey(
        "CaisseSession", on_delete=models.PROTECT, null=True, blank=True, related_name="depenses",
    )
    justificatif = models.FileField(upload_to="depenses/justificatifs/%Y/%m/", blank=True, null=True)
    statut = models.CharField(max_length=10, choices=Statut.choices, default=Statut.EN_ATTENTE)
    demande_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="depenses_demandees",
    )
    approuve_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="depenses_approuvees",
    )
    class Meta:
        verbose_name = "Dépense"
        ordering = ["-date_depense", "-id"]
    def __str__(self):
        return self.libelle
    def clean(self):
        if self.mode_paiement == self.ModePaiement.ESPECES and not self.caisse_session_id:
            raise ValidationError("Une session de caisse ouverte est requise pour une dépense réglée en espèces.")
        if self.caisse_session_id and self.caisse_session.statut != CaisseSession.Statut.OUVERTE:
            raise ValidationError("Impossible d'ajouter un mouvement à une session de caisse déjà fermée.")
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
# ---------------------------------------------------------------------------
# Caisse — session journalière
# ---------------------------------------------------------------------------
class CaisseSession(models.Model):
    class Statut(models.TextChoices):
        OUVERTE = "OUVERTE", "Ouverte"
        FERMEE = "FERMEE", "Fermée"
    date_session = models.DateField(unique=True, default=timezone.localdate)
    heure_ouverture = models.TimeField(default=timezone.localtime)
    heure_fermeture = models.TimeField(null=True, blank=True)
    solde_ouverture = models.DecimalField(max_digits=10, decimal_places=2)
    solde_reel_fermeture = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ouverte_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="sessions_ouvertes",
    )
    fermee_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="sessions_fermees",
    )
    statut = models.CharField(max_length=8, choices=Statut.choices, default=Statut.OUVERTE)
    observation = models.TextField(blank=True, help_text="Justification en cas d'écart de caisse.")
    class Meta:
        verbose_name = "Session de caisse"
        ordering = ["-date_session"]
    def __str__(self):
        return f"Caisse du {self.date_session:%d/%m/%Y}"
    @property
    def total_encaisse_especes(self):
        total = self.paiements.filter(
            mode_paiement=Paiement.ModePaiement.ESPECES, statut=Paiement.Statut.VALIDE,
        ).aggregate(s=Sum("montant"))["s"]
        return total or 0
    @property
    def total_depense_especes(self):
        total = self.depenses.filter(mode_paiement=Depense.ModePaiement.ESPECES).aggregate(s=Sum("montant"))["s"]
        return total or 0
    @property
    def solde_theorique(self):
        return self.solde_ouverture + self.total_encaisse_especes - self.total_depense_especes
    @property
    def ecart(self):
        if self.solde_reel_fermeture is None:
            return None
        return self.solde_reel_fermeture - self.solde_theorique
    def fermer(self, solde_reel, user, observation=""):
        if self.statut != self.Statut.OUVERTE:
            raise ValidationError("Cette session est déjà fermée.")
        self.solde_reel_fermeture = solde_reel
        self.fermee_par = user
        self.observation = observation
        self.heure_fermeture = timezone.localtime().time()
        self.statut = self.Statut.FERMEE
        self.save()
###### Bourse
class Bourse(models.Model):
    TYPE_REDUCTION_CHOICES = (
        ('pourcentage', 'Pourcentage'),
        ('montant_fixe', 'Montant fixe'),
    )
    etudiant = models.OneToOneField(
        'utilisateurs.Etudiant', on_delete=models.CASCADE, related_name='bourse'
    )
    organisme = models.CharField(max_length=150, blank=True, null=True)
    reference = models.CharField(max_length=100, blank=True, null=True)
    justificatif = models.FileField(upload_to='bourses/justificatifs/', blank=True, null=True)
    # Si laissé vide, hérite du paramètre global au moment du calcul
    type_reduction = models.CharField(
        max_length=15, choices=TYPE_REDUCTION_CHOICES, blank=True, null=True,
        help_text="Laisser vide pour utiliser le réglage par défaut de l'institut."
    )
    valeur_reduction = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True,
        help_text="Laisser vide pour utiliser le réglage par défaut de l'institut."
    )
    date_attribution = models.DateField(default=timezone.localdate)
    active = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name = "Bourse"
        ordering = ['-date_creation']
    def __str__(self):
        return f"Bourse — {self.etudiant}"
    def calculer_reduction(self, montant_scolarite):
        """Retourne le montant de réduction à appliquer sur la scolarité."""
        from apps.parametres.models import ParametreInstitut
        if not self.active:
            return 0
        parametre = ParametreInstitut.get_solo()
        type_reduction = self.type_reduction or parametre.type_reduction_bourse_defaut
        valeur = self.valeur_reduction if self.valeur_reduction is not None else parametre.valeur_reduction_bourse_defaut
        if type_reduction == 'pourcentage':
            reduction = montant_scolarite * (valeur / 100)
        else:
            reduction = valeur
        return min(reduction, montant_scolarite)  # jamais plus que le montant dû