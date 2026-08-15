from rest_framework import serializers
from .models import Diplome, TypeCertificat, Certificat, Document
class DiplomeSerializer(serializers.ModelSerializer):
    etudiant_str = serializers.CharField(source='etudiant.__str__', read_only=True)
    numero_diplome = serializers.CharField(read_only=True)
    mention = serializers.CharField(read_only=True)
    signe_par_str = serializers.CharField(source='signe_par.__str__', read_only=True)
    class Meta:
        model = Diplome
        fields = '__all__'
        read_only_fields = ['genere_par', 'fichier']
    def validate_deliberation(self, value):
        if value.decision != 'ADMIS' or value.periode != 'ANNEE':
            raise serializers.ValidationError(
                "Un diplôme ne peut être généré que pour une délibération d'année complète avec décision ADMIS."
            )
        qs = Diplome.objects.filter(deliberation=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Un diplôme existe déjà pour cette délibération.")
        return value
class TypeCertificatSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeCertificat
        fields = '__all__'
class CertificatSerializer(serializers.ModelSerializer):
    etudiant_str = serializers.CharField(source='etudiant.__str__', read_only=True)
    type_certificat_nom = serializers.CharField(source='type_certificat.nom', read_only=True)
    numero = serializers.CharField(read_only=True)
    class Meta:
        model = Certificat
        fields = '__all__'
        read_only_fields = ['genere_par', 'fichier']
class DocumentSerializer(serializers.ModelSerializer):
    concerne_etudiant_str = serializers.CharField(source='concerne_etudiant.__str__', read_only=True)
    concerne_personnel_str = serializers.CharField(source='concerne_personnel.__str__', read_only=True)
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['ajoute_par']