from django.conf import settings

from django.db import models

from django.utils import timezone



# ---------------------------------------------------------------------------
# Diplôme
# ---------------------------------------------------------------------------
class Diplome(models.Model):
    STATUT_CHOICES = (
        ('valide', 'Valide'),
        ('revoque', 'Révoqué'),
    )
    etudiant = models.ForeignKey('utilisateurs.Etudiant', on_delete=models.CASCADE, related_name='diplomes')
    deliberation = models.OneToOneField(
        'notes.Deliberation', on_delete=models.PROTECT, related_name='diplome'
    )
    numero_diplome = models.CharField(max_length=30, unique=True, blank=True)
    mention = models.CharField(max_length=50, blank=True, null=True)
    date_obtention = models.DateField(default=timezone.localdate)
    fichier = models.FileField(upload_to='documents/diplomes/', blank=True, null=True)
    signe_par = models.ForeignKey(
        'utilisateurs.Personnel', on_delete=models.SET_NULL, null=True, blank=True, related_name='diplomes_signes'
    )
    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default='valide')
    motif_revocation = models.TextField(blank=True, null=True)
    genere_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='diplomes_generes'
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name = "Diplôme"
        ordering = ['-date_obtention']
    def __str__(self):
        return f"{self.numero_diplome} — {self.etudiant}"
    def save(self, *args, **kwargs):
        if not self.numero_diplome:
            from apps.parametres.models import generer_matricule
            self.numero_diplome = generer_matricule('DIPLOME')
        super().save(*args, **kwargs)










# ---------------------------------------------------------------------------
# Certificat
# ---------------------------------------------------------------------------
class TypeCertificat(models.Model):
    code = models.SlugField(max_length=30, unique=True)
    nom = models.CharField(max_length=100)
    auto_generable = models.BooleanField(
        default=False,
        help_text="Si coché, l'étudiant peut générer ce certificat lui-même en libre-service."
    )
    class Meta:
        verbose_name = "Type de certificat"
        verbose_name_plural = "Types de certificat"
        ordering = ['nom']
    def __str__(self):
        return self.nom
class Certificat(models.Model):
    type_certificat = models.ForeignKey(TypeCertificat, on_delete=models.PROTECT, related_name='certificats')
    etudiant = models.ForeignKey('utilisateurs.Etudiant', on_delete=models.CASCADE, related_name='certificats')
    numero = models.CharField(max_length=30, unique=True, blank=True)
    date_emission = models.DateField(default=timezone.localdate)
    fichier = models.FileField(upload_to='documents/certificats/', blank=True, null=True)
    genere_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='certificats_generes'
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name = "Certificat"
        ordering = ['-date_emission']
    def __str__(self):
        return f"{self.numero} — {self.type_certificat} — {self.etudiant}"
    def save(self, *args, **kwargs):
        if not self.numero:
            from apps.parametres.models import generer_matricule
            self.numero = generer_matricule('CERTIFICAT')
        super().save(*args, **kwargs)









# ---------------------------------------------------------------------------
# Document (catégorie fourre-tout)
# ---------------------------------------------------------------------------
class Document(models.Model):
    titre = models.CharField(max_length=200)
    categorie = models.CharField(max_length=100, blank=True, null=True)
    fichier = models.FileField(upload_to='documents/autres/')
    concerne_etudiant = models.ForeignKey(
        'utilisateurs.Etudiant', on_delete=models.SET_NULL, null=True, blank=True, related_name='documents'
    )
    concerne_personnel = models.ForeignKey(
        'utilisateurs.Personnel', on_delete=models.SET_NULL, null=True, blank=True, related_name='documents'
    )
    ajoute_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents_ajoutes'
    )
    date_ajout = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name = "Document"
        ordering = ['-date_ajout']
    def __str__(self):
        return self.titre