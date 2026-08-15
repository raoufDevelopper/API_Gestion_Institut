from rest_framework import serializers

from apps.authentification.models import User

from .models import Etudiant, Personnel, Formateur



class EtudiantSerializer(serializers.ModelSerializer):
    matricule = serializers.CharField(read_only=True)
    specialite_nom = serializers.CharField(source='specialite.nom', read_only=True)
    niveau_nom = serializers.CharField(source='niveau.nom', read_only=True)
    classe_str = serializers.CharField(source='classe.__str__', read_only=True)

    class Meta:
        model = Etudiant
        fields = '__all__'

    def validate_user(self, value):
        qs = Etudiant.objects.filter(user=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Cet utilisateur est déjà lié à un profil étudiant.")
        return value







class PersonnelSerializer(serializers.ModelSerializer):
    matricule = serializers.CharField(read_only=True)
    class Meta:
        model = Personnel
        fields = '__all__'
    def validate_user(self, value):
        qs = Personnel.objects.filter(user=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Cet utilisateur est déjà lié à un profil personnel.")
        return value


    






class FormateurSerializer(serializers.ModelSerializer):
    personnel_nom = serializers.CharField(source='personnel.nom', read_only=True)
    personnel_prenom = serializers.CharField(source='personnel.prenom', read_only=True)
    class Meta:
        model = Formateur
        fields = '__all__'
    def validate_personnel(self, value):
        qs = Formateur.objects.filter(personnel=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ce personnel est déjà enregistré comme formateur.")
        return value

