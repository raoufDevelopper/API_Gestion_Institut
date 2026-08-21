from django.core.management.base import BaseCommand

from apps.authentification.models import Permission, Role





class Command(BaseCommand):

    help = "Initialise les permissions, rôles et données de base de l'application."

    def handle(self, *args, **options):

        permissions_data = [
            # Authentification
            {'code': 'gerer_utilisateurs', 'nom': 'Gérer les utilisateurs', 'description': 'Consulter et gérer les comptes utilisateurs'},
            {'code': 'gerer_roles', 'nom': 'Gérer les rôles', 'description': 'Consulter et gérer les rôles'},
            {'code': 'gerer_permissions', 'nom': 'Gérer les permissions', 'description': 'Consulter et gérer les permissions'},

            # Utilisateurs (profils métier)
            {'code': 'gerer_etudiants', 'nom': 'Gérer les étudiants', 'description': 'Consulter et gérer les étudiants'},
            {'code': 'gerer_personnel', 'nom': 'Gérer le personnel', 'description': 'Consulter et gérer le personnel'},
            {'code': 'gerer_formateurs', 'nom': 'Gérer les formateurs', 'description': 'Consulter et gérer les formateurs'},

            # Académique
            {'code': 'gerer_niveaux', 'nom': 'Gérer les niveaux', 'description': 'Consulter et gérer les niveaux'},
            {'code': 'gerer_filieres', 'nom': 'Gérer les filières', 'description': 'Consulter et gérer les filières'},
            {'code': 'gerer_specialites', 'nom': 'Gérer les spécialités', 'description': 'Consulter et gérer les spécialités'},
            {'code': 'gerer_salles', 'nom': 'Gérer les salles', 'description': 'Consulter et gérer les salles'},
            {'code': 'gerer_matieres', 'nom': 'Gérer les matières', 'description': 'Consulter et gérer les matières'},
            {'code': 'gerer_annees_academiques', 'nom': 'Gérer les années académiques', 'description': 'Consulter et gérer les années académiques'},
            {'code': 'gerer_classes', 'nom': 'Gérer les classes', 'description': 'Consulter et gérer les classes'},
            {'code': 'gerer_emplois_du_temps', 'nom': 'Gérer les emplois du temps', 'description': 'Consulter et gérer les emplois du temps'},
            {'code': 'gerer_seances', 'nom': 'Gérer les séances', 'description': 'Consulter et gérer les séances'},
            {'code': 'gerer_sanctions', 'nom': 'Gérer les sanctions', 'description': 'Consulter et gérer les sanctions'},

            # Notes
            {'code': 'gerer_notes', 'nom': 'Gérer les notes', 'description': 'Consulter, saisir et gérer les notes, relevés et délibérations'},

            # Paramètres
            {'code': 'gerer_parametres', 'nom': 'Gérer les paramètres', 'description': "Modifier les paramètres de l'institut et la configuration du matricule"},
            {'code': 'gerer_sauvegardes', 'nom': 'Gérer les sauvegardes', 'description': 'Lancer, télécharger et supprimer les sauvegardes de la base de données'},
            {'code': 'gerer_archives', 'nom': 'Gérer les archives', 'description': "Archiver les années académiques terminées"},

            # Finances
            {'code': 'gerer_finances', 'nom': 'Gérer le tableau de bord finances', 'description': "Consulter le tableau de bord financier de l'institut"},
            {'code': 'gerer_inscriptions', 'nom': 'Gérer les inscriptions', 'description': 'Consulter et gérer les inscriptions des étudiants'},
            {'code': 'gerer_paiements', 'nom': 'Gérer les paiements', 'description': 'Consulter et enregistrer les paiements'},
            {'code': 'gerer_depenses', 'nom': 'Gérer les dépenses', 'description': "Consulter et enregistrer les dépenses de l'institut"},
            {'code': 'gerer_caisse', 'nom': 'Gérer la caisse', 'description': 'Ouvrir, consulter et fermer les sessions de caisse'},
            {'code': 'gerer_tarifs', 'nom': 'Gérer les tarifs', 'description': 'Configurer les types de paiement et les tarifs'},
            {'code': 'gerer_bourses', 'nom': 'Gérer les bourses', 'description': "Attribuer et gérer les bourses d'étudiants"},

            # Documents
            {'code': 'gerer_documents', 'nom': 'Gérer les documents', 'description': 'Générer diplômes, certificats et autres documents officiels'},

            # Bibliothèque
            {'code': 'gerer_bibliotheque', 'nom': 'Gérer la bibliothèque', 'description': "Gérer le catalogue, les emprunts, réservations et pénalités"},
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
                'gerer_etudiants', 'gerer_emplois_du_temps', 'gerer_seances',
                'gerer_matieres', 'gerer_notes',
            ],
        )

        # ---- Étudiant : consultation personnelle ----
        creer_ou_maj_role(
            'Étudiant',
            'Accès limité à la consultation de ses propres informations',
            [
                'gerer_emplois_du_temps',
            ],
        )

        # ---- Responsable académique : gestion pédagogique globale ----
        creer_ou_maj_role(
            'Responsable académique',
            "Gestion des filières, spécialités, classes, emplois du temps, notes et sanctions",
            [
                'gerer_niveaux', 'gerer_filieres', 'gerer_specialites', 'gerer_salles',
                'gerer_matieres', 'gerer_annees_academiques', 'gerer_classes',
                'gerer_emplois_du_temps', 'gerer_seances', 'gerer_sanctions', 'gerer_notes',
                'gerer_etudiants', 'gerer_formateurs',
            ],
        )

        # ---- Comptable / Agent financier ----
        creer_ou_maj_role(
            'Comptable',
            "Gestion des inscriptions, paiements, dépenses, caisse et tarification",
            [
                'gerer_finances', 'gerer_inscriptions', 'gerer_paiements', 'gerer_depenses',
                'gerer_caisse', 'gerer_tarifs', 'gerer_bourses', 'gerer_etudiants',
            ],
        )

        # ---- Secrétaire / Agent administratif ----
        creer_ou_maj_role(
            'Secrétaire',
            "Gestion administrative courante : utilisateurs, inscriptions, documents",
            [
                'gerer_etudiants', 'gerer_personnel', 'gerer_formateurs',
                'gerer_inscriptions', 'gerer_documents', 'gerer_utilisateurs',
            ],
        )

        # ---- Bibliothécaire ----
        creer_ou_maj_role(
            'Bibliothécaire',
            "Gestion du catalogue, des emprunts, réservations et pénalités",
            [
                'gerer_bibliotheque', 'gerer_etudiants', 'gerer_personnel',
            ],
        )

        # ---- Directeur / Direction générale ----
        creer_ou_maj_role(
            'Direction',
            "Vue d'ensemble : consultation transversale sans droits de configuration technique",
            [
                'gerer_utilisateurs', 'gerer_etudiants', 'gerer_personnel', 'gerer_formateurs',
                'gerer_niveaux', 'gerer_filieres', 'gerer_specialites', 'gerer_classes',
                'gerer_emplois_du_temps', 'gerer_notes', 'gerer_sanctions',
                'gerer_finances', 'gerer_inscriptions', 'gerer_paiements', 'gerer_depenses', 'gerer_caisse',
                'gerer_documents', 'gerer_bibliotheque', 'gerer_archives',
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
        