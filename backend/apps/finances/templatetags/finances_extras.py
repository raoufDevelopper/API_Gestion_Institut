from django import template
register = template.Library()
@register.filter
def devise(value):
    """Formate un montant : 15000 -> '15 000 FCFA'."""
    if value is None:
        return "—"
    try:
        entier = int(round(float(value)))
    except (TypeError, ValueError):
        return value
    return f"{entier:,}".replace(",", " ") + " FCFA"
TONE_MAP = {
    # Statut financier (Inscription.statut_paiement / FraisInscription.statut_paiement)
    "PAYE": "emerald",
    "PARTIEL": "amber",
    "NON_PAYE": "brick",
    # Statut administratif (Inscription.statut)
    "VALIDEE": "emerald",
    "EN_ATTENTE": "amber",
    "ANNULEE": "brick",
    # Statut paiement (Paiement.statut)
    "VALIDE": "emerald",
    "ANNULE": "brick",
    "REMBOURSE": "slate",
    # Statut dépense (Depense.statut)
    "APPROUVEE": "brass",
    "REJETEE": "brick",
    "PAYEE": "emerald",
    # Statut caisse (CaisseSession.statut)
    "OUVERTE": "brass",
    "FERMEE": "slate",
}
LABEL_MAP = {
    "PAYE": "Payé",
    "PARTIEL": "Partiel",
    "NON_PAYE": "Non payé",
}
@register.filter
def statut_tone(statut):
    """Retourne la classe CSS de couleur (emerald/amber/brick/slate/brass) pour un statut."""
    return TONE_MAP.get(statut, "slate")
@register.filter
def statut_label(statut):
    """Traduit les statuts calculés (propriétés Python, pas de TextChoices donc pas de get_FOO_display)."""
    return LABEL_MAP.get(statut, statut)