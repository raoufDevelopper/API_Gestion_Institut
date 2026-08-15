from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Sum

from .models import Note, TypeEvaluation







def calculer_moyenne_matiere(etudiant, matiere, annee_academique, semestre):
    types_actifs = list(TypeEvaluation.objects.filter(actif=True))
    if not types_actifs:
        return None
    notes = Note.objects.filter(
        etudiant=etudiant,
        matiere=matiere,
        annee_academique=annee_academique,
        semestre=semestre,
        type_evaluation__actif=True,
    ).select_related("type_evaluation")
    notes_par_type = {note.type_evaluation_id: note for note in notes}
    if not all(type_eval.id in notes_par_type for type_eval in types_actifs):
        return None
    total = sum(
        notes_par_type[type_eval.id].valeur * type_eval.poids
        for type_eval in types_actifs
    )
    poids_total = sum(type_eval.poids for type_eval in types_actifs)
    if poids_total == 0:
        return None
    moyenne = total / poids_total
    return moyenne.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)













def calculer_moyenne_generale(etudiant, annee_academique, semestre):
    types_actifs = list(TypeEvaluation.objects.filter(actif=True))
    matieres_ids = Note.objects.filter(
        etudiant=etudiant,
        annee_academique=annee_academique,
        semestre=semestre,
    ).values_list("matiere_id", flat=True).distinct()
    total_pondere = Decimal("0")
    total_coefficients = Decimal("0")
    detail_par_matiere = []
    for matiere_id in matieres_ids:
        note_exemple = Note.objects.filter(matiere_id=matiere_id).select_related("matiere").first()
        matiere = note_exemple.matiere
        notes_par_type_id = {
            note.type_evaluation_id: note.valeur
            for note in Note.objects.filter(
                etudiant=etudiant,
                matiere=matiere,
                annee_academique=annee_academique,
                semestre=semestre,
            )
        }
        notes_detail = [
            {"type_evaluation": type_eval, "valeur": notes_par_type_id.get(type_eval.id)}
            for type_eval in types_actifs
        ]
        moyenne = calculer_moyenne_matiere(etudiant, matiere, annee_academique, semestre)
        moyenne_ponderee = None
        if moyenne is not None:
            moyenne_ponderee = (moyenne * matiere.coefficient).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
        detail_par_matiere.append({
            "matiere": matiere,
            "coefficient": matiere.coefficient,
            "notes_detail": notes_detail,
            "moyenne": moyenne,
            "moyenne_ponderee": moyenne_ponderee,
        })
        if moyenne_ponderee is not None:
            total_pondere += moyenne_ponderee
            total_coefficients += matiere.coefficient
    if total_coefficients == 0:
        return None, detail_par_matiere
    moyenne_generale_calculee = total_pondere / total_coefficients
    return moyenne_generale_calculee.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP), detail_par_matiere











def mention(moyenne):
    if moyenne is None:
        return "Non noté"
    moyenne = float(moyenne)
    if moyenne >= 18:
        return "Excellent"
    if moyenne >= 16:
        return "Très Bien"
    if moyenne >= 14:
        return "Bien"
    if moyenne >= 12:
        return "Assez Bien"
    if moyenne >= 10:
        return "Passable"
    return "Échec"









def moyenne_groupe_pour_evaluation(matiere, annee_academique, semestre, type_evaluation):
    notes = Note.objects.filter(
        matiere=matiere,
        annee_academique=annee_academique,
        semestre=semestre,
        type_evaluation=type_evaluation,
    )
    if not notes.exists():
        return None
    total = notes.aggregate(total=Sum("valeur"))["total"]
    return (total / notes.count()).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)











def calculer_deliberation_etudiant(etudiant, annee_academique, periode):

    # Import local pour éviter toute dépendance circulaire entre apps
   
    from apps.parametres.models import ParametreInstitut

    parametre = ParametreInstitut.get_solo()
    seuil = parametre.note_admission_minimale
    if periode == "ANNEE":
        credits_requis = Decimal(parametre.credits_requis_annee)
        moyenne_s1, detail_s1 = calculer_moyenne_generale(etudiant, annee_academique, "S1")
        moyenne_s2, detail_s2 = calculer_moyenne_generale(etudiant, annee_academique, "S2")
        moyennes_valides = [m for m in [moyenne_s1, moyenne_s2] if m is not None]
        moyenne_generale = (
            (sum(moyennes_valides) / len(moyennes_valides)).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            if len(moyennes_valides) == 2
            else None
        )
        detail_complet = detail_s1 + detail_s2
    else:
        credits_requis = Decimal(parametre.credits_requis_semestre)
        moyenne_generale, detail_complet = calculer_moyenne_generale(etudiant, annee_academique, periode)
    credits_obtenus = Decimal("0")
    matieres_non_validees = []
    for ligne in detail_complet:
        moyenne_matiere = ligne["moyenne"]
        coefficient = ligne["coefficient"]
        if moyenne_matiere is not None and moyenne_matiere >= seuil:
            credits_obtenus += coefficient
        else:
            matieres_non_validees.append({
                "matiere": ligne["matiere"].nom,
                "moyenne": str(moyenne_matiere) if moyenne_matiere is not None else None,
                "coefficient": str(coefficient),
            })
    if moyenne_generale is None:
        decision = "INCOMPLET"
    elif moyenne_generale < seuil:
        decision = "REDOUBLANT"
    elif credits_obtenus >= credits_requis:
        decision = "ADMIS"
    else:
        decision = "RATTRAPAGE"
    return {
        "moyenne_generale": moyenne_generale,
        "credits_obtenus": credits_obtenus,
        "credits_requis": credits_requis,
        "seuil_admission": seuil,
        "decision": decision,
        "matieres_non_validees": matieres_non_validees,
    }
















def construire_releves(classe, annee_academique, periode, etudiant_choisi):

    """Logique de calcul partagée entre la vue JSON et la vue PDF du relevé."""

    from apps.utilisateurs.models import Etudiant


    if etudiant_choisi:
        etudiants = [etudiant_choisi]
    else:
        etudiants = list(
            Etudiant.objects.filter(classe=classe, statut="ACTIF").order_by("nom", "prenom")
        )
    semestres_a_calculer = ["S1", "S2"] if periode == "ANNEE" else [periode]
    releves = []
    for etudiant in etudiants:
        details_semestres = []
        moyennes_valides = []
        for semestre in semestres_a_calculer:
            moyenne_gen, detail_matieres = calculer_moyenne_generale(
                etudiant, annee_academique, semestre
            )
            details_semestres.append({
                "semestre": semestre,
                "moyenne_generale": moyenne_gen,
                "mention": mention(moyenne_gen),
                "detail_matieres": detail_matieres,
            })
            if moyenne_gen is not None:
                moyennes_valides.append(moyenne_gen)
        moyenne_annuelle = None
        if periode == "ANNEE" and len(moyennes_valides) == 2:
            moyenne_annuelle = (moyennes_valides[0] + moyennes_valides[1]) / 2
        releves.append({
            "etudiant": etudiant,
            "details_semestres": details_semestres,
            "moyenne_annuelle": moyenne_annuelle,
            "mention_annuelle": mention(moyenne_annuelle) if moyenne_annuelle else None,
        })
    return releves