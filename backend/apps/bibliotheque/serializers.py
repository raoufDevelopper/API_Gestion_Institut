from rest_framework import serializers
from .models import Categorie, Livre, Exemplaire, Emprunt, Reservation, Penalite
class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = '__all__'
class LivreSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    nb_exemplaires_total = serializers.IntegerField(read_only=True)
    nb_exemplaires_disponibles = serializers.IntegerField(read_only=True)
    class Meta:
        model = Livre
        fields = '__all__'
class ExemplaireSerializer(serializers.ModelSerializer):
    livre_titre = serializers.CharField(source='livre.titre', read_only=True)
    class Meta:
        model = Exemplaire
        fields = '__all__'
class PenaliteSerializer(serializers.ModelSerializer):
    emprunteur_str = serializers.CharField(source='emprunt.emprunteur.__str__', read_only=True)
    class Meta:
        model = Penalite
        fields = '__all__'
        read_only_fields = ['emprunt', 'jours_retard', 'montant', 'frais_inscription']
class EmpruntSerializer(serializers.ModelSerializer):
    exemplaire_str = serializers.CharField(source='exemplaire.__str__', read_only=True)
    emprunteur_str = serializers.CharField(source='emprunteur.__str__', read_only=True)
    penalite = PenaliteSerializer(read_only=True)
    class Meta:
        model = Emprunt
        fields = '__all__'
        read_only_fields = ['enregistre_par', 'date_retour_reelle', 'statut']
    def validate(self, data):
        etudiant = data.get('etudiant')
        personnel = data.get('personnel')
        if not etudiant and not personnel:
            raise serializers.ValidationError("Un emprunteur (étudiant ou personnel) est requis.")
        if etudiant and personnel:
            raise serializers.ValidationError("Un emprunt ne peut avoir qu'un seul emprunteur.")
        return data
class ReservationSerializer(serializers.ModelSerializer):
    livre_titre = serializers.CharField(source='livre.titre', read_only=True)
    class Meta:
        model = Reservation
        fields = '__all__'
    def validate(self, data):
        etudiant = data.get('etudiant')
        personnel = data.get('personnel')
        if not etudiant and not personnel:
            raise serializers.ValidationError("Un réservataire (étudiant ou personnel) est requis.")
        if etudiant and personnel:
            raise serializers.ValidationError("Une réservation ne peut avoir qu'un seul réservataire.")
        return data
