from decimal import Decimal

from django.db import models

from django.core.exceptions import ValidationError

from django.core.validators import MinValueValidator, MaxValueValidator





class TypeEvaluation(models.Model):
    code = models.CharField(max_length=10, unique=True)
    libelle = models.CharField(max_length=100)
    poids = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal("1.00"),
        help_text="Poids dans le calcul de la moyenne (ex: 0.40 pour 40%). "
                   "La somme des poids actifs doit faire 1.00.",
    )
    ordre = models.PositiveIntegerField(default=0)
    actif = models.BooleanField(default=True)
    class Meta:
        ordering = ["ordre", "code"]
        verbose_name = "Type d'évaluation"
        verbose_name_plural = "Types d'évaluation"
    def __str__(self):
        return self.libelle















class Note(models.Model):
    SEMESTRE_CHOICES = [
        ("S1", "Semestre 1"),
        ("S2", "Semestre 2"),
    ]
    etudiant = models.ForeignKey(
        'utilisateurs.Etudiant', on_delete=models.CASCADE, related_name="notes",
    )
    matiere = models.ForeignKey(
        'academique.Matiere', on_delete=models.CASCADE, related_name="notes",
    )
    annee_academique = models.ForeignKey(
        'academique.AnneeAcademique', on_delete=models.CASCADE, related_name="notes",
    )
    semestre = models.CharField(max_length=2, choices=SEMESTRE_CHOICES)
    type_evaluation = models.ForeignKey(
        TypeEvaluation, on_delete=models.PROTECT, related_name="notes",
    )
    valeur = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(20)],
    )
    formateur = models.ForeignKey(
        'utilisateurs.Formateur', on_delete=models.SET_NULL,
        related_name="notes_saisies", null=True, blank=True,
    )
    date_saisie = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    class Meta:
        unique_together = ("etudiant", "matiere", "annee_academique", "semestre", "type_evaluation")
        ordering = ["etudiant", "matiere", "semestre"]
        verbose_name = "Note"
        verbose_name_plural = "Notes"
    def __str__(self):
        return f"{self.etudiant} — {self.matiere} ({self.type_evaluation}) : {self.valeur}/20"
    def clean(self):
        if self.valeur is not None and (self.valeur < 0 or self.valeur > 20):
            raise ValidationError("La note doit être comprise entre 0 et 20.")
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)














class Deliberation(models.Model):
    """
    Résultat officiel de la délibération d'un étudiant pour un semestre
    ou pour l'année complète. Les valeurs numériques (moyenne, crédits,
    matières non validées) sont figées au moment du calcul.
    """
    PERIODE_CHOICES = [
        ("S1", "Semestre 1"),
        ("S2", "Semestre 2"),
        ("ANNEE", "Année complète"),
    ]
    DECISION_CHOICES = [
        ("ADMIS", "Admis"),
        ("RATTRAPAGE", "Rattrapage"),
        ("REDOUBLANT", "Redoublant"),
        ("INCOMPLET", "Incomplet (notes manquantes)"),
    ]
    etudiant = models.ForeignKey(
        'utilisateurs.Etudiant', on_delete=models.CASCADE, related_name="deliberations",
    )
    annee_academique = models.ForeignKey(
        'academique.AnneeAcademique', on_delete=models.CASCADE, related_name="deliberations",
    )
    periode = models.CharField(max_length=5, choices=PERIODE_CHOICES)
    moyenne_generale = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    credits_obtenus = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    credits_requis = models.DecimalField(
        max_digits=6, decimal_places=2,
        help_text="Valeur figée au moment du calcul (copie du paramètre institut à cet instant).",
    )
    seuil_admission = models.DecimalField(
        max_digits=4, decimal_places=2,
        help_text="Note d'admission minimale utilisée pour ce calcul (figée elle aussi).",
    )
    decision = models.CharField(max_length=12, choices=DECISION_CHOICES)
    matieres_non_validees = models.JSONField(
        default=list, blank=True,
        help_text="Liste figée des matières à rattraper : nom, moyenne obtenue, coefficient.",
    )
    verrouillee = models.BooleanField(
        default=False,
        help_text="Une délibération verrouillée ne peut plus être recalculée automatiquement.",
    )
    date_calcul = models.DateTimeField(auto_now=True)
    date_premiere_deliberation = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ("etudiant", "annee_academique", "periode")
        ordering = ["etudiant"]
        verbose_name = "Délibération"
        verbose_name_plural = "Délibérations"
    def __str__(self):
        return f"{self.etudiant} — {self.get_periode_display()} — {self.get_decision_display()}"