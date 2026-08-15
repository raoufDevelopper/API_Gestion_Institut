from rest_framework import serializers

from .models import TypeEvaluation, Note, Deliberation





class TypeEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeEvaluation
        fields = '__all__'







class NoteSerializer(serializers.ModelSerializer):
    etudiant_str = serializers.CharField(source='etudiant.__str__', read_only=True)
    matiere_nom = serializers.CharField(source='matiere.nom', read_only=True)
    type_evaluation_libelle = serializers.CharField(source='type_evaluation.libelle', read_only=True)
    class Meta:
        model = Note
        fields = '__all__'







class DeliberationSerializer(serializers.ModelSerializer):
    etudiant_str = serializers.CharField(source='etudiant.__str__', read_only=True)
    class Meta:
        model = Deliberation
        fields = '__all__'
        read_only_fields = [
            'moyenne_generale', 'credits_obtenus', 'credits_requis',
            'seuil_admission', 'decision', 'matieres_non_validees',
            'date_calcul', 'date_premiere_deliberation',
        ]