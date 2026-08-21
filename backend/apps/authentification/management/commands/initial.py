from django.core.management.base import BaseCommand

from apps.authentification.models import Permission, Role





class Command(BaseCommand):

    help = "Initialise les permissions, rôles et données de base de l'application."

    def handle(self, *args, **options):
        permissions_data = [
            # Authentification
            {'code': 'voir_utilisateurs', 'nom': 'Voir les utilisateurs', 'description': 'Consulter la liste des comptes utilisateurs'},
            {'code': 'voir_roles', 'nom': 'Voir les rôles', 'description': 'Consulter la liste des rôles'},
            {'code': 'voir_permissions', 'nom': 'Voir les permissions', 'description': 'Consulter la liste des permissions'},
            # Utilisateurs (profils métier)
            {'code': 'voir_etudiants', 'nom': 'Voir les étudiants', 'description': 'Consulter la liste des étudiants'},
            {'code': 'voir_personnel', 'nom': 'Voir le personnel', 'description': 'Consulter la liste du personnel'},
            {'code': 'voir_formateurs', 'nom': 'Voir les formateurs', 'description': 'Consulter la liste des formateurs'},
            # Académique
            {'code': 'voir_niveaux', 'nom': 'Voir les niveaux', 'description': 'Consulter la liste des niveaux'},
            {'code': 'voir_filieres', 'nom': 'Voir les filières', 'description': 'Consulter la liste des filières'},
            {'code': 'voir_specialites', 'nom': 'Voir les spécialités', 'description': 'Consulter la liste des spécialités'},
            {'code': 'voir_salles', 'nom': 'Voir les salles', 'description': 'Consulter la liste des salles'},
            {'code': 'voir_matieres', 'nom': 'Voir les matières', 'description': 'Consulter la liste des matières'},
            {'code': 'voir_annees_academiques', 'nom': 'Voir les années académiques', 'description': 'Consulter la liste des années académiques'},
            {'code': 'voir_classes', 'nom': 'Voir les classes', 'description': 'Consulter la liste des classes'},
            {'code': 'voir_emplois_du_temps', 'nom': 'Voir les emplois du temps', 'description': 'Consulter les emplois du temps'},
            {'code': 'voir_seances', 'nom': 'Voir les séances', 'description': 'Consulter la liste des séances'},
            {'code': 'voir_sanctions', 'nom': 'Voir les sanctions', 'description': 'Consulter la liste des sanctions'},
            # Notes
            {'code': 'voir_notes', 'nom': 'Voir les notes', 'description': 'Consulter, saisir et gérer les notes, relevés et délibérations'},
            # Paramètres
            {'code': 'gerer_parametres', 'nom': 'Gérer les paramètres', 'description': "Modifier les paramètres de l'institut et la configuration du matricule"},
            {'code': 'gerer_sauvegardes', 'nom': 'Gérer les sauvegardes', 'description': 'Lancer, télécharger et supprimer les sauvegardes de la base de données'},
            {'code': 'gerer_archives', 'nom': 'Gérer les archives', 'description': "Archiver les années académiques terminées"},
            {'code': 'gerer_notifications', 'nom': 'Gérer les notifications', 'description': "gestion des lectures et de contrôle des notifications"},
            # Finances
            {'code': 'voir_finances', 'nom': 'Voir le tableau de bord finances', 'description': "Consulter le tableau de bord financier de l'institut"},
            {'code': 'voir_inscriptions', 'nom': 'Voir les inscriptions', 'description': 'Consulter et gérer les inscriptions des étudiants'},
            {'code': 'voir_paiements', 'nom': 'Voir les paiements', 'description': 'Consulter et enregistrer les paiements'},
            {'code': 'voir_depenses', 'nom': 'Voir les dépenses', 'description': "Consulter et enregistrer les dépenses de l'institut"},
            {'code': 'voir_caisse', 'nom': 'Voir la caisse', 'description': 'Ouvrir, consulter et fermer les sessions de caisse'},
            {'code': 'gerer_tarifs', 'nom': 'Gérer les tarifs', 'description': 'Configurer les types de paiement et les tarifs'},
            {'code': 'gerer_bourses', 'nom': 'Gérer les bourses', 'description': "Attribuer et gérer les bourses d'étudiants"},
            # Documents
            {'code': 'gerer_documents', 'nom': 'Gérer les documents', 'description': 'Générer diplômes, certificats et autres documents officiels'},
            # Bibliothèque
            {'code': 'voir_bibliotheque', 'nom': 'Voir la bibliothèque', 'description': "Gérer le catalogue, les emprunts, réservations et pénalités"},
        ]
        
        self.stdout.write(self.style.NOTICE('Création des permissions...'))
        permissions_creees = []
        for data in permissions_data:
            permission, cree = Permission.objects.get_or_create(
                code=data['code'],
                defaults={'nom': data['nom'], 'description': data['description']}
            )
            permissions_creees.append(permission)
            if cree:
                self.stdout.write(self.style.SUCCESS(f"  + Permission créée : {permission.code}"))
            else:
                self.stdout.write(f"  = Permission déjà existante : {permission.code}")
        self.stdout.write(self.style.NOTICE('\nCréation des rôles...'))
        def creer_ou_maj_role(nom, description, codes_permissions):
            role, cree = Role.objects.get_or_create(nom=nom, defaults={'description': description})
            permissions_role = Permission.objects.filter(code__in=codes_permissions)
            role.permissions.set(permissions_role)
            if cree:
                self.stdout.write(self.style.SUCCESS(f'  + Rôle créé : {nom}'))
            else:
                self.stdout.write(f'  = Rôle déjà existant : {nom} (permissions mises à jour)')
            return role
        # ---- Administrateur : accès complet ----
        creer_ou_maj_role(
            'Administrateur',
            'Accès complet à toutes les fonctionnalités',
            [p.code for p in permissions_creees],
        )
        # ---- Formateur : pédagogie limitée ----
        creer_ou_maj_role(
            'Formateur',
            'Accès aux fonctionnalités pédagogiques : étudiants, emplois du temps, notes',
            [
                'voir_etudiants', 'voir_emplois_du_temps', 'voir_seances',
                'voir_matieres', 'voir_notes',
            ],
        )
        # ---- Étudiant : consultation personnelle ----
        creer_ou_maj_role(
            'Étudiant',
            'Accès limité à la consultation de ses propres informations',
            [
                'voir_emplois_du_temps',
            ],
        )
        # ---- Responsable académique : gestion pédagogique globale ----
        creer_ou_maj_role(
            'Responsable académique',
            "Gestion des filières, spécialités, classes, emplois du temps, notes et sanctions",
            [
                'voir_niveaux', 'voir_filieres', 'voir_specialites', 'voir_salles',
                'voir_matieres', 'voir_annees_academiques', 'voir_classes',
                'voir_emplois_du_temps', 'voir_seances', 'voir_sanctions', 'voir_notes',
                'voir_etudiants', 'voir_formateurs',
            ],
        )
        # ---- Comptable / Agent financier ----
        creer_ou_maj_role(
            'Comptable',
            "Gestion des inscriptions, paiements, dépenses, caisse et tarification",
            [
                'voir_finances', 'voir_inscriptions', 'voir_paiements', 'voir_depenses',
                'voir_caisse', 'gerer_tarifs', 'gerer_bourses', 'voir_etudiants',
            ],
        )
        # ---- Secrétaire / Agent administratif ----
        creer_ou_maj_role(
            'Secrétaire',
            "Gestion administrative courante : utilisateurs, inscriptions, documents",
            [
                'voir_etudiants', 'voir_personnel', 'voir_formateurs',
                'voir_inscriptions', 'gerer_documents', 'voir_utilisateurs',
            ],
        )
        # ---- Bibliothécaire ----
        creer_ou_maj_role(
            'Bibliothécaire',
            "Gestion du catalogue, des emprunts, réservations et pénalités",
            [
                'voir_bibliotheque', 'voir_etudiants', 'voir_personnel',
            ],
        )
        # ---- Directeur / Direction générale ----
        creer_ou_maj_role(
            'Direction',
            "Vue d'ensemble : consultation transversale sans droits de configuration technique",
            [
                'voir_utilisateurs', 'voir_etudiants', 'voir_personnel', 'voir_formateurs',
                'voir_niveaux', 'voir_filieres', 'voir_specialites', 'voir_classes',
                'voir_emplois_du_temps', 'voir_notes', 'voir_sanctions',
                'voir_finances', 'voir_inscriptions', 'voir_paiements', 'voir_depenses', 'voir_caisse',
                'gerer_documents', 'voir_bibliotheque', 'gerer_archives',
            ],
        )
        self.stdout.write(self.style.NOTICE('\nCréation des types de paiement de base...'))
        from apps.finances.models import TypePaiement
        type_scolarite, cree = TypePaiement.objects.get_or_create(
            code='SCOLARITE',
            defaults={'nom': 'Scolarité', 'obligatoire_a_inscription': True, 'ordre': 1}
        )
        if cree:
            self.stdout.write(self.style.SUCCESS('  + Type de paiement créé : Scolarité (code: SCOLARITE)'))
        else:
            self.stdout.write('  = Type de paiement déjà existant : Scolarité')
        type_inscription, cree = TypePaiement.objects.get_or_create(
            code='INSCRIPTION',
            defaults={'nom': "Frais d'inscription", 'obligatoire_a_inscription': True, 'ordre': 0}
        )
        if cree:
            self.stdout.write(self.style.SUCCESS("  + Type de paiement créé : Frais d'inscription (code: INSCRIPTION)"))
        else:
            self.stdout.write("  = Type de paiement déjà existant : Frais d'inscription")
        type_penalite, cree = TypePaiement.objects.get_or_create(
            code='PENALITE_BIBLIOTHEQUE',
            defaults={'nom': 'Pénalité bibliothèque', 'obligatoire_a_inscription': False, 'ordre': 99}
        )
        if cree:
            self.stdout.write(self.style.SUCCESS('  + Type de paiement créé : Pénalité bibliothèque (code: PENALITE_BIBLIOTHEQUE)'))
        else:
            self.stdout.write('  = Type de paiement déjà existant : Pénalité bibliothèque')
        self.stdout.write(self.style.SUCCESS('\nInitialisation terminée avec succès.'))