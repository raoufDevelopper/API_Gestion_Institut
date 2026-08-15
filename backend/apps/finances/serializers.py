from rest_framework import serializers
from .models import (
    Bourse, CategorieDepense, TypePaiement, Tarif, Inscription, FraisInscription,
    Paiement, Depense, CaisseSession,
)
class CategorieDepenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategorieDepense
        fields = '__all__'
class TypePaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypePaiement
        fields = '__all__'
class TarifSerializer(serializers.ModelSerializer):
    portee = serializers.CharField(source='decrire_portee', read_only=True)
    specificite = serializers.IntegerField(source='niveau_specificite', read_only=True)
    type_paiement_nom = serializers.CharField(source='type_paiement.nom', read_only=True)
    class Meta:
        model = Tarif
        fields = '__all__'
class FraisInscriptionSerializer(serializers.ModelSerializer):
    type_paiement_nom = serializers.CharField(source='type_paiement.nom', read_only=True)
    montant_paye = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    reste_a_payer = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    statut_paiement = serializers.CharField(read_only=True)
    class Meta:
        model = FraisInscription
        fields = '__all__'
class InscriptionSerializer(serializers.ModelSerializer):
    etudiant_str = serializers.CharField(source='etudiant.__str__', read_only=True)
    classe_str = serializers.CharField(source='classe.__str__', read_only=True)
    total_du = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    montant_paye = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    reste_a_payer = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    statut_paiement = serializers.CharField(read_only=True)
    frais = FraisInscriptionSerializer(many=True, read_only=True)
    class Meta:
        model = Inscription
        fields = '__all__'
        read_only_fields = ['cree_par']
    def validate(self, data):
        etudiant = data.get('etudiant', getattr(self.instance, 'etudiant', None))
        annee = data.get('annee_academique', getattr(self.instance, 'annee_academique', None))
        qs = Inscription.objects.filter(etudiant=etudiant, annee_academique=annee)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Cet étudiant est déjà inscrit pour cette année académique.")
        return data
class PaiementSerializer(serializers.ModelSerializer):
    inscription_str = serializers.CharField(source='inscription.__str__', read_only=True)
    type_paiement_nom = serializers.CharField(source='type_paiement.nom', read_only=True)
    numero_recu = serializers.CharField(read_only=True)
    class Meta:
        model = Paiement
        fields = '__all__'
        read_only_fields = ['enregistre_par']
    def validate(self, data):
        instance = Paiement(pk=self.instance.pk if self.instance else None, **{
            k: v for k, v in data.items() if k not in ('numero_recu',)
        })
        try:
            instance.clean()
        except Exception as e:
            raise serializers.ValidationError(str(e))
        return data
class DepenseSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    class Meta:
        model = Depense
        fields = '__all__'
        read_only_fields = ['demande_par', 'approuve_par']
    def validate(self, data):
        instance = Depense(pk=self.instance.pk if self.instance else None, **data)
        try:
            instance.clean()
        except Exception as e:
            raise serializers.ValidationError(str(e))
        return data
class CaisseSessionSerializer(serializers.ModelSerializer):
    solde_theorique = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    ecart = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, allow_null=True)
    ouverte_par_nom = serializers.CharField(source='ouverte_par.username', read_only=True)
    fermee_par_nom = serializers.CharField(source='fermee_par.username', read_only=True)
    class Meta:
        model = CaisseSession
        fields = '__all__'
        read_only_fields = ['solde_reel_fermeture', 'heure_fermeture', 'fermee_par', 'statut', 'ouverte_par']
class BourseSerializer(serializers.ModelSerializer):
    etudiant_str = serializers.CharField(source='etudiant.__str__', read_only=True)
    class Meta:
        model = Bourse
        fields = '__all__'