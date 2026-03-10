import random
import decimal
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from categories.models import Categorie
from medicaments.models import Medicament
from ventes.models import Vente, LigneVente


CATEGORIES = [
    {"nom": "Antibiotiques", "description": "Médicaments pour traiter les infections bactériennes"},
    {"nom": "Analgésiques", "description": "Médicaments contre la douleur"},
    {"nom": "Anti-inflammatoires", "description": "Médicaments réduisant l'inflammation"},
    {"nom": "Antihistaminiques", "description": "Médicaments contre les allergies"},
    {"nom": "Vitamines & Suppléments", "description": "Vitamines et compléments alimentaires"},
    {"nom": "Antihypertenseurs", "description": "Médicaments contre l'hypertension"},
    {"nom": "Antidiabétiques", "description": "Médicaments pour le diabète"},
]

MEDICAMENTS = [
    {"nom": "Amoxicilline", "dci": "Amoxicilline", "categorie": "Antibiotiques", "forme": "Comprimé", "dosage": "500mg", "prix_achat": "25.00", "prix_vente": "45.00", "stock_actuel": 150, "stock_minimum": 30, "ordonnance_requise": True},
    {"nom": "Augmentin", "dci": "Amoxicilline/Acide Clavulanique", "categorie": "Antibiotiques", "forme": "Comprimé", "dosage": "875mg/125mg", "prix_achat": "55.00", "prix_vente": "90.00", "stock_actuel": 80, "stock_minimum": 20, "ordonnance_requise": True},
    {"nom": "Doliprane", "dci": "Paracétamol", "categorie": "Analgésiques", "forme": "Comprimé", "dosage": "1000mg", "prix_achat": "8.00", "prix_vente": "15.00", "stock_actuel": 300, "stock_minimum": 50, "ordonnance_requise": False},
    {"nom": "Efferalgan", "dci": "Paracétamol", "categorie": "Analgésiques", "forme": "Comprimé effervescent", "dosage": "500mg", "prix_achat": "10.00", "prix_vente": "18.00", "stock_actuel": 5, "stock_minimum": 30, "ordonnance_requise": False},
    {"nom": "Ibuprofène", "dci": "Ibuprofène", "categorie": "Anti-inflammatoires", "forme": "Comprimé", "dosage": "400mg", "prix_achat": "12.00", "prix_vente": "22.00", "stock_actuel": 200, "stock_minimum": 40, "ordonnance_requise": False},
    {"nom": "Voltarène", "dci": "Diclofénac", "categorie": "Anti-inflammatoires", "forme": "Gel", "dosage": "1%", "prix_achat": "30.00", "prix_vente": "55.00", "stock_actuel": 8, "stock_minimum": 15, "ordonnance_requise": False},
    {"nom": "Clarityne", "dci": "Loratadine", "categorie": "Antihistaminiques", "forme": "Comprimé", "dosage": "10mg", "prix_achat": "18.00", "prix_vente": "32.00", "stock_actuel": 120, "stock_minimum": 25, "ordonnance_requise": False},
    {"nom": "Zyrtec", "dci": "Cétirizine", "categorie": "Antihistaminiques", "forme": "Comprimé", "dosage": "10mg", "prix_achat": "20.00", "prix_vente": "38.00", "stock_actuel": 90, "stock_minimum": 20, "ordonnance_requise": False},
    {"nom": "Vitamine C", "dci": "Acide Ascorbique", "categorie": "Vitamines & Suppléments", "forme": "Comprimé effervescent", "dosage": "1000mg", "prix_achat": "15.00", "prix_vente": "28.00", "stock_actuel": 250, "stock_minimum": 50, "ordonnance_requise": False},
    {"nom": "Vitamine D3", "dci": "Cholécalciférol", "categorie": "Vitamines & Suppléments", "forme": "Capsule", "dosage": "1000 UI", "prix_achat": "22.00", "prix_vente": "40.00", "stock_actuel": 3, "stock_minimum": 20, "ordonnance_requise": False},
    {"nom": "Amlodipine", "dci": "Amlodipine", "categorie": "Antihypertenseurs", "forme": "Comprimé", "dosage": "5mg", "prix_achat": "35.00", "prix_vente": "60.00", "stock_actuel": 60, "stock_minimum": 15, "ordonnance_requise": True},
    {"nom": "Metformine", "dci": "Metformine", "categorie": "Antidiabétiques", "forme": "Comprimé", "dosage": "850mg", "prix_achat": "20.00", "prix_vente": "38.00", "stock_actuel": 100, "stock_minimum": 25, "ordonnance_requise": True},
]


class Command(BaseCommand):
    help = 'Seeds the database with fake pharmacy data'

    def add_arguments(self, parser):
        parser.add_argument('--ventes', type=int, default=20, help='Number of sales to create')

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Seeding database...'))

        # --- Categories ---
        cat_map = {}
        for cat_data in CATEGORIES:
            cat, created = Categorie.objects.get_or_create(
                nom=cat_data["nom"],
                defaults={"description": cat_data["description"]}
            )
            cat_map[cat.nom] = cat
            if created:
                self.stdout.write(f'  Created category: {cat.nom}')

        # --- Medicaments ---
        med_list = []
        expiry_base = date.today() + timedelta(days=365)
        for med_data in MEDICAMENTS:
            med, created = Medicament.objects.get_or_create(
                nom=med_data["nom"],
                defaults={
                    "dci": med_data.get("dci"),
                    "categorie": cat_map[med_data["categorie"]],
                    "forme": med_data["forme"],
                    "dosage": med_data["dosage"],
                    "prix_achat": decimal.Decimal(med_data["prix_achat"]),
                    "prix_vente": decimal.Decimal(med_data["prix_vente"]),
                    "stock_actuel": med_data["stock_actuel"],
                    "stock_minimum": med_data["stock_minimum"],
                    "ordonnance_requise": med_data["ordonnance_requise"],
                    "date_expiration": expiry_base + timedelta(days=random.randint(0, 365)),
                }
            )
            med_list.append(med)
            if created:
                self.stdout.write(f'  Created medicament: {med.nom}')

        # --- Ventes ---
        num_ventes = options['ventes']
        created_ventes = 0
        for _ in range(num_ventes):
            vente = Vente.objects.create(statut='COMPLETÉE')
            total = decimal.Decimal('0.00')

            # 1-4 lines per sale
            meds_for_sale = random.sample(med_list, k=min(random.randint(1, 4), len(med_list)))
            for med in meds_for_sale:
                qty = random.randint(1, 5)
                prix = med.prix_vente
                ligne = LigneVente(
                    vente=vente,
                    medicament=med,
                    quantite=qty,
                    prix_unitaire=prix,
                )
                ligne.save()
                total += ligne.sous_total

            vente.total_ttc = total
            vente.save()
            created_ventes += 1

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Created {len(CATEGORIES)} categories, {len(MEDICAMENTS)} medicaments, {created_ventes} ventes.'
        ))
