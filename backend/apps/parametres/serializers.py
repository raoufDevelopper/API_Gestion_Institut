from rest_framework import serializers

from .models import Abonnement, ParametreInstitut, ConfigurationMatricule, Sauvegarde, ArchiveAnneeAcademique, Notification



class ParametreInstitutSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParametreInstitut
        fields = '__all__'


class ConfigurationMatriculeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfigurationMatricule
        fields = '__all__'
        read_only_fields = ['compteur']



class SauvegardeSerializer(serializers.ModelSerializer):
    declenchee_par_nom = serializers.CharField(source='declenchee_par.username', read_only=True)
    class Meta:
        model = Sauvegarde
        fields = '__all__'
        read_only_fields = ['fichier', 'nom_fichier', 'taille_octets', 'statut', 'message_erreur']



class ArchiveAnneeAcademiqueSerializer(serializers.ModelSerializer):
    annee_academique_libelle = serializers.CharField(source='annee_academique.libelle', read_only=True)
    archivee_par_nom = serializers.CharField(source='archivee_par.username', read_only=True)
    class Meta:
        model = ArchiveAnneeAcademique
        fields = '__all__'



class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['destinataire', 'email_envoye', 'date_creation']










class AbonnementSerializer(serializers.ModelSerializer):
    est_actif = serializers.BooleanField(read_only=True)
    jours_restants = serializers.IntegerField(read_only=True)
    class Meta:
        model = Abonnement
        fields = ['date_expiration', 'date_derniere_activation', 'est_actif', 'jours_restants']

