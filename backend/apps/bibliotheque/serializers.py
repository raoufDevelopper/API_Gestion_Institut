
from rest_framework import serializers
from .models import (
    Categorie, Auteur, Editeur, Ressource, Localisation, Exemplaire,
    Adherent, RegleBibliotheque, Emprunt, Reservation, Penalite,
    Inventaire, LigneInventaire, Fournisseur, Acquisition, LigneAcquisition,
)
# ---------------------------------------------------------------------------
# Catégorie / Auteur / Éditeur
# ---------------------------------------------------------------------------
class CategorieSerializer(serializers.ModelSerializer):
    parent_str = serializers.CharField(source='parent.__str__', read_only=True)
    class Meta:
        model = Categorie
        fields = '__all__'
class AuteurSerializer(serializers.ModelSerializer):
    nb_ressources = serializers.IntegerField(source='ressources.count', read_only=True)
    class Meta:
        model = Auteur
        fields = '__all__'
class EditeurSerializer(serializers.ModelSerializer):
    nb_ressources = serializers.IntegerField(source='ressources.count', read_only=True)
    class Meta:
        model = Editeur
        fields = '__all__'
class LocalisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Localisation
        fields = '__all__'
# ---------------------------------------------------------------------------
# Ressource
# ---------------------------------------------------------------------------
class RessourceListeSerializer(serializers.ModelSerializer):
    """Champs essentiels pour les listes/le catalogue."""
    auteurs_str = serializers.StringRelatedField(source='auteurs', many=True, read_only=True)
    editeur_str = serializers.CharField(source='editeur.__str__', read_only=True)
    categorie_str = serializers.CharField(source='categorie.__str__', read_only=True)
    nb_exemplaires_total = serializers.IntegerField(read_only=True)
    nb_exemplaires_disponibles = serializers.IntegerField(read_only=True)
    class Meta:
        model = Ressource
        fields = [
            'id', 'numero', 'type_ressource', 'titre', 'sous_titre',
            'auteurs_str', 'editeur_str', 'isbn_issn', 'categorie_str',
            'annee_publication', 'couverture',
            'nb_exemplaires_total', 'nb_exemplaires_disponibles',
        ]
class RessourceDetailSerializer(serializers.ModelSerializer):
    """Champs complets pour la fiche détail."""
    auteurs_str = serializers.StringRelatedField(source='auteurs', many=True, read_only=True)
    editeur_str = serializers.CharField(source='editeur.__str__', read_only=True)
    categorie_str = serializers.CharField(source='categorie.__str__', read_only=True)
    filiere_str = serializers.CharField(source='filiere.__str__', read_only=True)
    specialite_str = serializers.CharField(source='specialite.__str__', read_only=True)
    nb_exemplaires_total = serializers.IntegerField(read_only=True)
    nb_exemplaires_disponibles = serializers.IntegerField(read_only=True)
    nb_exemplaires_empruntes = serializers.IntegerField(read_only=True)
    nb_exemplaires_reserves = serializers.IntegerField(read_only=True)
    nb_exemplaires_perdus = serializers.IntegerField(read_only=True)
    nb_exemplaires_endommages = serializers.IntegerField(read_only=True)
    class Meta:
        model = Ressource
        fields = '__all__'
        read_only_fields = ['numero']
class RessourceCreationSerializer(serializers.ModelSerializer):
    """Pour la création/modification : auteurs en écriture (liste d'ID)."""
    class Meta:
        model = Ressource
        fields = '__all__'
        read_only_fields = ['numero']
# ---------------------------------------------------------------------------
# Exemplaire
# ---------------------------------------------------------------------------
class ExemplaireSerializer(serializers.ModelSerializer):
    ressource_str = serializers.CharField(source='ressource.__str__', read_only=True)
    ressource_titre = serializers.CharField(source='ressource.titre', read_only=True)
    localisation_str = serializers.CharField(source='localisation.__str__', read_only=True)
    numero = serializers.CharField(read_only=True)
    class Meta:
        model = Exemplaire
        fields = '__all__'
class CreationExemplairesEnMasseSerializer(serializers.Serializer):
    """Pour créer plusieurs exemplaires d'une ressource en une fois (§9 du cahier des charges)."""
    ressource = serializers.PrimaryKeyRelatedField(queryset=Ressource.objects.all())
    quantite = serializers.IntegerField(min_value=1, max_value=100)
    localisation = serializers.PrimaryKeyRelatedField(queryset=Localisation.objects.all(), required=False, allow_null=True)
    etat = serializers.ChoiceField(choices=Exemplaire._meta.get_field('etat').choices, default='BON')
# ---------------------------------------------------------------------------
# Adhérent
# ---------------------------------------------------------------------------
class AdherentSerializer(serializers.ModelSerializer):
    personne_str = serializers.SerializerMethodField()
    type_adherent = serializers.CharField(read_only=True)
    nb_emprunts_en_cours = serializers.SerializerMethodField()
    numero = serializers.CharField(read_only=True)
    class Meta:
        model = Adherent
        fields = '__all__'
    def get_personne_str(self, obj):
        return str(obj.personne) if obj.personne else '—'
    def get_nb_emprunts_en_cours(self, obj):
        return obj.nb_emprunts_en_cours()
class RegleBibliothequeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegleBibliotheque
        fields = '__all__'
# ---------------------------------------------------------------------------
# Emprunt
# ---------------------------------------------------------------------------
class EmpruntSerializer(serializers.ModelSerializer):
    adherent_str = serializers.SerializerMethodField()
    exemplaire_str = serializers.CharField(source='exemplaire.__str__', read_only=True)
    ressource_str = serializers.CharField(source='exemplaire.ressource.titre', read_only=True)
    type_adherent = serializers.CharField(source='adherent.type_adherent', read_only=True)
    jours_de_retard = serializers.IntegerField(read_only=True)
    est_en_retard = serializers.BooleanField(read_only=True)
    numero = serializers.CharField(read_only=True)
    enregistre_par_nom = serializers.CharField(source='enregistre_par.username', read_only=True)
    class Meta:
        model = Emprunt
        fields = '__all__'
        read_only_fields = ['enregistre_par']
    def get_adherent_str(self, obj):
        return str(obj.adherent.personne) if obj.adherent.personne else '—'
class NouvelEmpruntSerializer(serializers.Serializer):
    """Entrée simplifiée pour créer un emprunt — applique valider_nouvel_emprunt()."""
    adherent = serializers.PrimaryKeyRelatedField(queryset=Adherent.objects.all())
    exemplaire = serializers.PrimaryKeyRelatedField(queryset=Exemplaire.objects.all())
    observations = serializers.CharField(required=False, allow_blank=True)
class RetourEmpruntSerializer(serializers.Serializer):
    etat_retour = serializers.ChoiceField(choices=[
        ('BON', 'Bon'), ('ABIME', 'Abîmé'), ('TRES_ABIME', 'Très abîmé'), ('PERDU', 'Perdu'),
    ])
    observations = serializers.CharField(required=False, allow_blank=True)
# ---------------------------------------------------------------------------
# Réservation
# ---------------------------------------------------------------------------
class ReservationSerializer(serializers.ModelSerializer):
    adherent_str = serializers.SerializerMethodField()
    ressource_str = serializers.CharField(source='ressource.titre', read_only=True)
    position_file = serializers.IntegerField(read_only=True)
    numero = serializers.CharField(read_only=True)
    class Meta:
        model = Reservation
        fields = '__all__'
    def get_adherent_str(self, obj):
        return str(obj.adherent.personne) if obj.adherent.personne else '—'
# ---------------------------------------------------------------------------
# Pénalité
# ---------------------------------------------------------------------------
class PenaliteSerializer(serializers.ModelSerializer):
    emprunt_str = serializers.CharField(source='emprunt.__str__', read_only=True)
    class Meta:
        model = Penalite
        fields = '__all__'
# ---------------------------------------------------------------------------
# Inventaire
# ---------------------------------------------------------------------------
class LigneInventaireSerializer(serializers.ModelSerializer):
    exemplaire_str = serializers.CharField(source='exemplaire.__str__', read_only=True)
    ressource_titre = serializers.CharField(source='exemplaire.ressource.titre', read_only=True)
    class Meta:
        model = LigneInventaire
        fields = '__all__'
class InventaireSerializer(serializers.ModelSerializer):
    responsable_nom = serializers.CharField(source='responsable.username', read_only=True)
    nb_exemplaires_theoriques = serializers.IntegerField(read_only=True)
    nb_exemplaires_verifies = serializers.IntegerField(read_only=True)
    nb_anomalies = serializers.IntegerField(read_only=True)
    class Meta:
        model = Inventaire
        fields = '__all__'
        read_only_fields = ['responsable']
class InventaireDetailSerializer(InventaireSerializer):
    lignes = LigneInventaireSerializer(many=True, read_only=True)
    class Meta(InventaireSerializer.Meta):
        fields = '__all__'
# ---------------------------------------------------------------------------
# Fournisseur / Acquisition
# ---------------------------------------------------------------------------
class FournisseurSerializer(serializers.ModelSerializer):
    nb_acquisitions = serializers.IntegerField(source='acquisitions.count', read_only=True)
    class Meta:
        model = Fournisseur
        fields = '__all__'
class LigneAcquisitionSerializer(serializers.ModelSerializer):
    ressource_str = serializers.CharField(source='ressource.titre', read_only=True)
    class Meta:
        model = LigneAcquisition
        fields = '__all__'
class AcquisitionSerializer(serializers.ModelSerializer):
    fournisseur_str = serializers.CharField(source='fournisseur.__str__', read_only=True)
    enregistre_par_nom = serializers.CharField(source='enregistre_par.username', read_only=True)
    lignes = LigneAcquisitionSerializer(many=True, read_only=True)
    numero = serializers.CharField(read_only=True)
    class Meta:
        model = Acquisition
        fields = '__all__'
        read_only_fields = ['enregistre_par']