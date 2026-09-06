from rest_framework import serializers

from .models import Niveau, Filiere, Specialite, TypeSalle, Salle, Matiere, AnneeAcademique, Classe, EmploiDuTemps, Seance, Sanction

from django.core.exceptions import ValidationError





class NiveauSerializer(serializers.ModelSerializer):
    class Meta:
        model = Niveau
        fields = '__all__'




class FiliereSerializer(serializers.ModelSerializer):
    responsable_nom = serializers.CharField(source='responsable.__str__', read_only=True)
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
    specialite_nom = serializers.CharField(source='specialite.nom', read_only=True)
    specialite_code = serializers.CharField(source='specialite.code', read_only=True)
    niveau_nom = serializers.CharField(source='niveau.nom', read_only=True)
    filiere_nom = serializers.CharField(source='filiere.nom', read_only=True)
    class Meta:
        model = Classe
        fields = '__all__'




class EmploiDuTempsSerializer(serializers.ModelSerializer):
    classe_str = serializers.CharField(
        source='classe.__str__',
        read_only=True
    )
    nom_affiche = serializers.CharField(
        read_only=True
    )
    nb_seances = serializers.IntegerField(
        read_only=True,
        default=0
    )
    annee_academique_libelle = serializers.CharField(
        source='annee_academique.libelle',
        read_only=True
    )
    formateurs_ids = serializers.SerializerMethodField()
    class Meta:
        model = EmploiDuTemps
        fields = '__all__'
    def get_formateurs_ids(self, obj):
        return list(
            obj.seances
            .exclude(formateur__isnull=True)
            .values_list(
                'formateur_id',
                flat=True
            )
            .distinct()
        )

    



class SeanceSerializer(serializers.ModelSerializer):
    matiere_nom = serializers.CharField(
        source='matiere.nom',
        read_only=True
    )
    salle_nom = serializers.CharField(
        source='salle.nom',
        read_only=True
    )
    formateur_str = serializers.CharField(
        source='formateur.__str__',
        read_only=True
    )
    class Meta:
        model = Seance
        fields = '__all__'
    def validate(self, data):
        """
        Validation des conflits avant l'enregistrement.
        """
        instance = self.instance or Seance()
        for attr, value in data.items():
            setattr(instance, attr, value)
        try:
            instance.full_clean()
        except ValidationError as e:
            raise serializers.ValidationError(
                e.message_dict if hasattr(e, 'message_dict')
                else e.messages
            )
        return data




class SanctionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sanction
        fields = '__all__'
