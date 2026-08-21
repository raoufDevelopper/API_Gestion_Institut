from django.db.models.signals import post_save, post_delete

from django.dispatch import receiver

from django.contrib.auth.signals import user_logged_in, user_logged_out

from apps.utilisateurs.models import Etudiant, Personnel, Formateur

from apps.academique.models import Seance, EmploiDuTemps

from apps.notes.models import Deliberation

from .services import creer_notification




def _superusers_et_admins():
    from apps.authentification.models import User
    return User.objects.filter(is_superuser=True)


# ---------- CONNEXION / DECONNEXION ----------
@receiver(user_logged_in)
def notifier_connexion(sender, request, user, **kwargs):
    creer_notification(
        destinataire=user,
        titre="Connexion réussie",
        message=f"L'utilisateur {user} connecté avec succès.",
        type_notification='info',
    )

@receiver(user_logged_out)
def notifier_deconnexion(sender, request, user, **kwargs):
    if user:
        creer_notification(
            destinataire=user,
            titre="Déconnexion",
            message= f"L'utilisateur {user} a été déconnecté.",
            type_notification='info',
        )



# ---------- UTILISATEURS ----------
@receiver(post_save, sender=Etudiant)
def notifier_etudiant(sender, instance, created, **kwargs):
    for admin in _superusers_et_admins():
        creer_notification(
            destinataire=admin,
            titre="Étudiant créé" if created else "Étudiant modifié",
            message=f"{instance.matricule} - {instance.nom} {instance.prenom}",
            type_notification='succes' if created else 'info',
        )


@receiver(post_save, sender=Personnel)
def notifier_personnel(sender, instance, created, **kwargs):
    for admin in _superusers_et_admins():
        creer_notification(
            destinataire=admin,
            titre="Personnel créé" if created else "Personnel modifié",
            message=f"{instance.matricule} - {instance.nom} {instance.prenom}",
            type_notification='succes' if created else 'info',
        )


@receiver(post_save, sender=Formateur)
def notifier_formateur(sender, instance, created, **kwargs):
    for admin in _superusers_et_admins():
        creer_notification(
            destinataire=admin,
            titre="Formateur créé" if created else "Formateur modifié",
            message=str(instance),
            type_notification='succes' if created else 'info',
        )




# ---------- EMPLOI DU TEMPS ----------
@receiver(post_save, sender=EmploiDuTemps)
def notifier_emploi_du_temps(sender, instance, created, **kwargs):
    for admin in _superusers_et_admins():
        creer_notification(
            destinataire=admin,
            titre="Emploi du temps créé" if created else "Emploi du temps modifié",
            message=instance.nom_affiche,
            type_notification='info',
        )
@receiver(post_save, sender=Seance)
def notifier_seance(sender, instance, created, **kwargs):
    if instance.formateur and instance.formateur.personnel.user:
        creer_notification(
            destinataire=instance.formateur.personnel.user,
            titre="Nouvelle séance programmée" if created else "Séance modifiée",
            message=f"{instance.matiere} — {instance.get_jour_display()} {instance.heure_debut}-{instance.heure_fin}",
            type_notification='info',
        )







# ---------- NOTES / DELIBERATIONS ----------
@receiver(post_save, sender=Deliberation)
def notifier_deliberation(sender, instance, created, **kwargs):
    if instance.etudiant.user:
        creer_notification(
            destinataire=instance.etudiant.user,
            titre="Délibération disponible",
            message=f"Votre délibération ({instance.get_periode_display()}) : {instance.get_decision_display()}",
            type_notification='succes' if instance.decision == 'ADMIS' else 'avertissement',
            envoyer_email=True,
        )







#---------- finances ----------
from apps.finances.models import Inscription, Paiement, Depense, CaisseSession
@receiver(post_save, sender=Inscription)
def notifier_inscription(sender, instance, created, **kwargs):
    for admin in _superusers_et_admins():
        creer_notification(
            destinataire=admin,
            titre="Inscription créée" if created else "Inscription modifiée",
            message=str(instance),
            type_notification='succes' if created else 'info',
        )
@receiver(post_save, sender=Paiement)
def notifier_paiement(sender, instance, created, **kwargs):
    for admin in _superusers_et_admins():
        creer_notification(
            destinataire=admin,
            titre="Paiement enregistré" if created else "Paiement modifié",
            message=f"{instance.numero_recu} — {instance.montant}",
            type_notification='succes',
        )
    if instance.inscription.etudiant.user:
        creer_notification(
            destinataire=instance.inscription.etudiant.user,
            titre="Paiement reçu",
            message=f"Votre paiement de {instance.montant} ({instance.type_paiement}) a été enregistré.",
            type_notification='succes',
            envoyer_email=True,
        )
@receiver(post_save, sender=Depense)
def notifier_depense(sender, instance, created, **kwargs):
    for admin in _superusers_et_admins():
        creer_notification(
            destinataire=admin,
            titre="Dépense créée" if created else "Dépense modifiée",
            message=f"{instance.libelle} — {instance.montant}",
            type_notification='info',
        )
@receiver(post_save, sender=CaisseSession)
def notifier_caisse(sender, instance, created, **kwargs):
    for admin in _superusers_et_admins():
        creer_notification(
            destinataire=admin,
            titre="Session de caisse ouverte" if created else "Session de caisse fermée",
            message=str(instance),
            type_notification='info',
        )







from apps.bibliotheque.models import Livre, Emprunt, Reservation, Penalite


# ---------- LIVRE (catalogue) ----------
@receiver(post_save, sender=Livre)
def notifier_livre(sender, instance, created, **kwargs):
    for admin in _superusers_et_admins():
        creer_notification(
            destinataire=admin,
            titre="Livre ajouté au catalogue" if created else "Livre modifié",
            message=f"{instance.titre} — {instance.auteur}",
            type_notification='succes' if created else 'info',
        )





# ---------- EMPRUNT ----------
@receiver(post_save, sender=Emprunt)
def notifier_emprunt(sender, instance, created, **kwargs):
    emprunteur_user = instance.etudiant.user if instance.etudiant else (
        instance.personnel.user if instance.personnel else None
    )
    if emprunteur_user:
        if created:
            creer_notification(
                destinataire=emprunteur_user,
                titre="Emprunt enregistré",
                message=f"{instance.exemplaire.livre.titre} — retour prévu le {instance.date_retour_prevue}",
                type_notification='info',
            )
        elif instance.statut == 'retourne':
            creer_notification(
                destinataire=emprunteur_user,
                titre="Retour confirmé",
                message=f"Le retour de « {instance.exemplaire.livre.titre} » a bien été enregistré.",
                type_notification='succes',
            )
    for admin in _superusers_et_admins():
        creer_notification(
            destinataire=admin,
            titre="Nouvel emprunt" if created else "Emprunt mis à jour",
            message=str(instance),
            type_notification='info',
        )





# ---------- RESERVATION ----------
@receiver(post_save, sender=Reservation)
def notifier_reservation(sender, instance, created, **kwargs):
    reservataire_user = instance.etudiant.user if instance.etudiant else (
        instance.personnel.user if instance.personnel else None
    )
    if not reservataire_user:
        return
    if created:
        creer_notification(
            destinataire=reservataire_user,
            titre="Réservation enregistrée",
            message=f"Vous êtes en attente pour « {instance.livre.titre} ».",
            type_notification='info',
        )
    elif instance.statut == 'disponible':
        creer_notification(
            destinataire=reservataire_user,
            titre="Livre disponible",
            message=f"« {instance.livre.titre} » est maintenant disponible pour vous. Merci de passer le récupérer rapidement.",
            type_notification='succes',
            envoyer_email=True,
        )





# ---------- PENALITE ----------
@receiver(post_save, sender=Penalite)
def notifier_penalite(sender, instance, created, **kwargs):
    emprunteur_user = instance.emprunt.etudiant.user if instance.emprunt.etudiant else (
        instance.emprunt.personnel.user if instance.emprunt.personnel else None
    )
    if not emprunteur_user:
        return
    if created:
        creer_notification(
            destinataire=emprunteur_user,
            titre="Pénalité de retard",
            message=f"Une pénalité de {instance.montant} vous a été appliquée pour {instance.jours_retard} jour(s) de retard.",
            type_notification='avertissement',
            envoyer_email=True,
        )
    elif instance.payee:
        creer_notification(
            destinataire=emprunteur_user,
            titre="Pénalité réglée",
            message=f"Votre pénalité de {instance.montant} a bien été réglée.",
            type_notification='succes',
        )

