from decimal import Decimal

from django.contrib import admin

from django.contrib import messages

from django.db.models import Sum

from .models import TypeEvaluation, Note, Deliberation






@admin.register(TypeEvaluation)
class TypeEvaluationAdmin(admin.ModelAdmin):
    list_display = ("libelle", "code", "poids", "ordre", "actif", "somme_poids_actifs")
    list_editable = ("poids", "ordre", "actif")
    search_fields = ("libelle", "code")
    ordering = ("ordre", "code")
    def somme_poids_actifs(self, obj):
        total = TypeEvaluation.objects.filter(actif=True).aggregate(
            total=Sum("poids")
        )["total"] or Decimal("0")
        return f"{total} (sur tous les types actifs)"
    somme_poids_actifs.short_description = "Somme des poids actifs"
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        total = TypeEvaluation.objects.filter(actif=True).aggregate(
            total=Sum("poids")
        )["total"] or Decimal("0")
        if total != Decimal("1.00"):
            self.message_user(
                request,
                f"Attention : la somme des poids des types d'évaluation actifs est "
                f"actuellement de {total}, pas 1.00. Les moyennes calculées seront "
                f"faussées tant que ce n'est pas corrigé.",
                level=messages.WARNING,
            )






@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = (
        "etudiant", "matiere", "type_evaluation", "valeur",
        "semestre", "annee_academique", "formateur", "date_modification",
    )
    list_filter = ("semestre", "annee_academique", "type_evaluation", "matiere")
    search_fields = ("etudiant__nom", "etudiant__prenom", "matiere__nom")
    autocomplete_fields = ("etudiant", "matiere", "formateur")
    ordering = ("-date_modification",)






@admin.register(Deliberation)
class DeliberationAdmin(admin.ModelAdmin):
    list_display = (
        "etudiant", "periode", "annee_academique", "moyenne_generale",
        "credits_obtenus", "credits_requis", "decision", "verrouillee",
    )
    list_filter = ("periode", "decision", "verrouillee", "annee_academique")
    search_fields = ("etudiant__nom", "etudiant__prenom", "etudiant__matricule")
    autocomplete_fields = ("etudiant", "annee_academique")
    ordering = ("etudiant",)
    readonly_fields = (
        "moyenne_generale", "credits_obtenus", "credits_requis", "seuil_admission",
        "decision", "matieres_non_validees", "date_calcul", "date_premiere_deliberation",
    )