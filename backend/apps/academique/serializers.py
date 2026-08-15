from rest_framework import serializers

from .models import Niveau, Filiere, Specialite, TypeSalle, Salle, Matiere, AnneeAcademique, Classe, EmploiDuTemps, Seance, Sanction






class NiveauSerializer(serializers.ModelSerializer):
    class Meta:
        model = Niveau
        fields = '__all__'




class FiliereSerializer(serializers.ModelSerializer):
    responsable_nom = serializers.CharField(source='responsable.nom', read_only=True)
    class Meta:
        model = Filiere
        fields = '__all__'




class SpecialiteSerializer(serializers.ModelSerializer):
    filiere_nom = serializers.CharField(source='filiere.nom', read_only=True)
    class Meta:
        model = Specialite
        fields = '__all__'




class TypeSalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeSalle
        fields = '__all__'




class SalleSerializer(serializers.ModelSerializer):
    type_salle_libelle = serializers.CharField(source='type_salle.libelle', read_only=True)
    class Meta:
        model = Salle
        fields = '__all__'




class MatiereSerializer(serializers.ModelSerializer):
    specialite_noms = serializers.StringRelatedField(source='specialite', many=True, read_only=True)
    niveau_noms = serializers.StringRelatedField(source='niveau', many=True, read_only=True)
    class Meta:
        model = Matiere
        fields = '__all__'




class AnneeAcademiqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnneeAcademique
        fields = '__all__'




class ClasseSerializer(serializers.ModelSerializer):
    specialite_nom = serializers.CharField(source='nom.nom', read_only=True)
    niveau_nom = serializers.CharField(source='niveau.nom', read_only=True)
    filiere_nom = serializers.CharField(source='filiere.nom', read_only=True)
    class Meta:
        model = Classe
        fields = '__all__'




class EmploiDuTempsSerializer(serializers.ModelSerializer):
    classe_str = serializers.CharField(source='classe.__str__', read_only=True)
    nom_affiche = serializers.CharField(read_only=True)
    class Meta:
        model = EmploiDuTemps
        fields = '__all__'




class SeanceSerializer(serializers.ModelSerializer):
    matiere_nom = serializers.CharField(source='matiere.nom', read_only=True)
    salle_nom = serializers.CharField(source='salle.nom', read_only=True)
    formateur_str = serializers.CharField(source='formateur.__str__', read_only=True)
    class Meta:
        model = Seance
        fields = '__all__'
    def validate(self, data):
        instance = Seance(pk=self.instance.pk if self.instance else None, **{
            **{k: v for k, v in data.items()}
        })
        try:
            instance.clean()
        except Exception as e:
            raise serializers.ValidationError(str(e))
        return data




class SanctionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sanction
        fields = '__all__'
