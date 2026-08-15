import subprocess
import os
from datetime import datetime
from django.db import models
from django.conf import settings
from django.utils import timezone



# ============================================================
# PARAMETRE INSTITUT (singleton)
# ============================================================
class ParametreInstitut(models.Model):
    TYPE_ETABLISSEMENT_CHOICES = (
        ('public', 'Public'),
        ('prive', 'Privé'),
        ('semi_public', 'Semi-public'),
    )
    # ---- 1. Informations générales ----
    nom = models.CharField(max_length=200, default="IFP Perle d'Or")
    sigle = models.CharField(max_length=50, blank=True, null=True)
    slogan = models.CharField(max_length=200, blank=True, null=True)
    type_etablissement = models.CharField(max_length=20, choices=TYPE_ETABLISSEMENT_CHOICES, default='prive')
    directeur_general = models.CharField(max_length=150, blank=True, null=True)
    date_creation_institut = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    # ---- 2. Identité visuelle ----
    logo = models.ImageField(upload_to='institut/logo/', blank=True, null=True)
    favicon = models.ImageField(upload_to='institut/favicon/', blank=True, null=True)
    couleur_primaire = models.CharField(max_length=7, default='#1e3a8a')
    couleur_secondaire = models.CharField(max_length=7, default='#f59e0b')
    # ---- 3. Contact & adresse ----
    telephone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    site_web = models.URLField(blank=True, null=True)
    adresse = models.CharField(max_length=255, blank=True, null=True)
    ville = models.CharField(max_length=100, blank=True, null=True)
    pays = models.CharField(max_length=100, blank=True, null=True)
    boite_postale = models.CharField(max_length=50, blank=True, null=True)
    # ---- 4. Informations légales ----
    numero_agrement = models.CharField(max_length=100, blank=True, null=True)
    numero_rccm = models.CharField(max_length=100, blank=True, null=True)
    numero_contribuable = models.CharField(max_length=100, blank=True, null=True)
    representant_legal = models.CharField(max_length=150, blank=True, null=True)
    # ---- 5. Paramètres académiques ----
    note_admission_minimale = models.DecimalField(max_digits=4, decimal_places=2, default=10.00)
    credits_requis_semestre = models.PositiveIntegerField(default=30)
    credits_requis_annee = models.PositiveIntegerField(default=60)
    date_modification = models.DateTimeField(auto_now=True)
    # ---- Bibliothèque ----
    duree_emprunt_jours = models.PositiveIntegerField(default=14)
    nb_emprunts_max_simultanes = models.PositiveIntegerField(default=3)
    penalite_par_jour_retard = models.DecimalField(max_digits=10, decimal_places=2, default=100)
    # ---- Réduction bourse (scolarité) ----
    TYPE_REDUCTION_CHOICES = (
        ('pourcentage', 'Pourcentage'),
        ('montant_fixe', 'Montant fixe'),
    )
    type_reduction_bourse_defaut = models.CharField(
        max_length=15, choices=TYPE_REDUCTION_CHOICES, default='pourcentage'
    )
    valeur_reduction_bourse_defaut = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text="Si pourcentage : entrer un nombre entre 0 et 100. Si montant fixe : entrer une somme."
    )
    class Meta:
        verbose_name = "Paramètre de l'institut"
        verbose_name_plural = "Paramètres de l'institut"
    def __str__(self):
        return self.nom
    def save(self, *args, **kwargs):
        self.pk = 1  # force le singleton : toujours la même ligne
        super().save(*args, **kwargs)
    def delete(self, *args, **kwargs):
        pass  # empêche la suppression du singleton
    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj











# ============================================================
# CONFIGURATION MATRICULE (déplacé depuis utilisateurs)
# ============================================================
class ConfigurationMatricule(models.Model):
    TYPE_CHOICES = [
        ('ETUDIANT', 'Étudiant'),
        ('PERSONNEL', 'Personnel'),
        ('DIPLOME', 'Diplôme'),
        ('CERTIFICAT', 'Certificat'),
    ]
    type_profil = models.CharField(max_length=20, choices=TYPE_CHOICES, unique=True)
    prefixe = models.CharField(max_length=10, default='MAT')
    inclure_annee = models.BooleanField(default=True)
    nombre_chiffres = models.PositiveIntegerField(default=4)
    separateur = models.CharField(max_length=3, default='-')
    compteur = models.PositiveIntegerField(default=0)
    def __str__(self):
        return f"Format {self.type_profil}"
    def generer_matricule(self):
        self.compteur += 1
        self.save()
        numero = str(self.compteur).zfill(self.nombre_chiffres)
        parts = [self.prefixe]
        if self.inclure_annee:
            parts.append(str(timezone.now().year))
        parts.append(numero)
        return self.separateur.join(parts)
    
def generer_matricule(type_profil):
    prefixes_defaut = {
        'ETUDIANT': 'ETU', 'PERSONNEL': 'PER',
        'DIPLOME': 'DIP', 'CERTIFICAT': 'CERT',
    }
    config, _ = ConfigurationMatricule.objects.get_or_create(
        type_profil=type_profil,
        defaults={'prefixe': prefixes_defaut.get(type_profil, 'MAT')}
    )
    return config.generer_matricule()














# ============================================================
# SAUVEGARDE
# ============================================================
class Sauvegarde(models.Model):
    TYPE_CHOICES = (
        ('manuelle', 'Manuelle'),
        ('automatique', 'Automatique'),
    )
    STATUT_CHOICES = (
        ('en_cours', 'En cours'),
        ('reussie', 'Réussie'),
        ('echouee', 'Échouée'),
    )
    fichier = models.FileField(upload_to='sauvegardes/', blank=True, null=True)
    nom_fichier = models.CharField(max_length=255, blank=True, null=True)
    taille_octets = models.BigIntegerField(blank=True, null=True)
    type_sauvegarde = models.CharField(max_length=20, choices=TYPE_CHOICES, default='manuelle')
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_cours')
    declenchee_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='sauvegardes'
    )
    message_erreur = models.TextField(blank=True, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['-date_creation']
        verbose_name = "Sauvegarde"
        verbose_name_plural = "Sauvegardes"
    def __str__(self):
        return f"Sauvegarde du {self.date_creation.strftime('%d/%m/%Y %H:%M')} ({self.statut})"
    def executer(self):
        """Lance pg_dump et enregistre le fichier résultant."""
        db = settings.DATABASES['default']
        horodatage = datetime.now().strftime('%Y%m%d_%H%M%S')
        nom_fichier = f"backup_ifp_{horodatage}.sql"
        chemin_temp = os.path.join(settings.MEDIA_ROOT, 'sauvegardes', nom_fichier)
        os.makedirs(os.path.dirname(chemin_temp), exist_ok=True)
        commande = [
            'pg_dump',
            '-h', db.get('HOST', 'localhost'),
            '-p', str(db.get('PORT', 5432)),
            '-U', db.get('USER'),
            '-F', 'c',  # format custom (compressé)
            '-f', chemin_temp,
            db.get('NAME'),
        ]
        env = os.environ.copy()
        env['PGPASSWORD'] = db.get('PASSWORD', '')
        try:
            subprocess.run(commande, env=env, check=True, capture_output=True, text=True)
            self.fichier.name = f'sauvegardes/{nom_fichier}'
            self.nom_fichier = nom_fichier
            self.taille_octets = os.path.getsize(chemin_temp)
            self.statut = 'reussie'
        except subprocess.CalledProcessError as e:
            self.statut = 'echouee'
            self.message_erreur = e.stderr
        except FileNotFoundError:
            self.statut = 'echouee'
            self.message_erreur = "pg_dump introuvable sur le serveur."
        self.save()
        return self.statut == 'reussie'


















# ============================================================
# ARCHIVE (années académiques)
# ============================================================
class ArchiveAnneeAcademique(models.Model):
    annee_academique = models.OneToOneField(
        'academique.AnneeAcademique', on_delete=models.CASCADE, related_name='archive'
    )
    nb_etudiants = models.PositiveIntegerField(default=0)
    nb_notes = models.PositiveIntegerField(default=0)
    nb_deliberations = models.PositiveIntegerField(default=0)
    nb_admis = models.PositiveIntegerField(default=0)
    nb_redoublants = models.PositiveIntegerField(default=0)
    archivee_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='archives_realisees'
    )
    date_archivage = models.DateTimeField(auto_now_add=True)
    notes_archivage = models.TextField(blank=True, null=True)
    class Meta:
        ordering = ['-date_archivage']
        verbose_name = "Archive d'année académique"
        verbose_name_plural = "Archives d'années académiques"
    def __str__(self):
        return f"Archive {self.annee_academique}"



















# ============================================================
# NOTIFICATION
# ============================================================
class Notification(models.Model):
    TYPE_CHOICES = (
        ('info', 'Information'),
        ('succes', 'Succès'),
        ('avertissement', 'Avertissement'),
        ('erreur', 'Erreur'),
    )
    destinataire = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )
    titre = models.CharField(max_length=200)
    message = models.TextField()
    type_notification = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    lien = models.CharField(max_length=255, blank=True, null=True, help_text="Chemin frontend à ouvrir au clic")
    lue = models.BooleanField(default=False)
    email_envoye = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['-date_creation']
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
    def __str__(self):
        return f"{self.titre} → {self.destinataire}"
    



















import hmac
import hashlib
from django.conf import settings
class Abonnement(models.Model):
    date_expiration = models.DateField(null=True, blank=True)
    date_derniere_activation = models.DateTimeField(null=True, blank=True)
    dernier_code_utilise = models.CharField(max_length=25, blank=True, null=True)
    class Meta:
        verbose_name = "Abonnement"
    def __str__(self):
        return f"Abonnement — expire le {self.date_expiration}"
    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)
    def delete(self, *args, **kwargs):
        pass
    @classmethod
    def get_solo(cls):
        obj, cree = cls.objects.get_or_create(pk=1)
        if cree and not obj.date_expiration:
            # À la toute première utilisation, aligne par défaut sur la fin
            # de l'année académique active, si elle existe.
            from apps.academique.models import AnneeAcademique
            annee_active = AnneeAcademique.objects.filter(statut=True).order_by('-date_fin').first()
            if annee_active:
                obj.date_expiration = annee_active.date_fin
                obj.save(update_fields=['date_expiration'])
        return obj
    @property
    def est_actif(self):
        if not self.date_expiration:
            return False
        return timezone.localdate() <= self.date_expiration
    @property
    def jours_restants(self):
        if not self.date_expiration:
            return 0
        delta = (self.date_expiration - timezone.localdate()).days
        return max(delta, 0)
    def activer_avec_code(self, code):
        """
        Vérifie et applique un code d'activation de 25 caractères.
        Retourne (succes: bool, message: str).
        """
        if len(code) != 25:
            return False, "Format de code invalide."
        institut_code = code[:5]
        date_encodee = code[5:11]
        signature_fournie = code[11:]
        if institut_code != settings.INSTITUT_LICENCE_CODE:
            return False, "Ce code n'est pas destiné à cet institut."
        payload = institut_code + date_encodee
        signature_attendue = hmac.new(
            settings.LICENCE_SECRET_KEY.encode(), payload.encode(), hashlib.sha256
        ).hexdigest()[:14].upper()
        if not hmac.compare_digest(signature_fournie.upper(), signature_attendue):
            return False, "Code invalide ou falsifié."
        try:
            date_expiration = datetime.strptime(date_encodee, '%y%m%d').date()
        except ValueError:
            return False, "Code corrompu (date illisible)."
        # On ne recule jamais l'expiration : on prend la plus tardive entre
        # l'actuelle et celle du code (utile si le code est réutilisé par erreur).
        nouvelle_expiration = max(date_expiration, self.date_expiration or date_expiration)
        self.date_expiration = nouvelle_expiration
        self.date_derniere_activation = timezone.now()
        self.dernier_code_utilise = code
        self.save(update_fields=['date_expiration', 'date_derniere_activation', 'dernier_code_utilise'])
        return True, f"Abonnement activé jusqu'au {nouvelle_expiration.strftime('%d/%m/%Y')}."