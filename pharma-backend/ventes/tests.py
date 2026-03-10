from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from categories.models import Categorie
from medicaments.models import Medicament
from .models import Vente

class VenteAPITests(APITestCase):
    def setUp(self):
        self.cat = Categorie.objects.create(nom="Test Cat")
        self.med1 = Medicament.objects.create(
            nom="Med 1", dci="DCI 1", categorie=self.cat, forme="Tab",
            dosage="500mg", prix_achat=5.0, prix_vente=10.0, stock_actuel=100, stock_minimum=10
        )
        self.med2 = Medicament.objects.create(
            nom="Med 2", dci="DCI 2", categorie=self.cat, forme="Tab",
            dosage="1g", prix_achat=10.0, prix_vente=25.0, stock_actuel=50, stock_minimum=5
        )
        self.list_url = reverse('vente-list')

    def test_create_vente_and_stock_deduction(self):
        data = {
            "notes": "Test sale",
            "lignes": [
                {"medicament": self.med1.id, "quantite": 10},
                {"medicament": self.med2.id, "quantite": 5}
            ]
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check total: (10 * 10.0) + (5 * 25.0) = 100 + 125 = 225
        self.assertEqual(float(response.data['total_ttc']), 225.0)
        
        # Check stock deduction
        self.med1.refresh_from_db()
        self.med2.refresh_from_db()
        self.assertEqual(self.med1.stock_actuel, 90)
        self.assertEqual(self.med2.stock_actuel, 45)

    def test_create_vente_insufficient_stock(self):
        data = {
            "lignes": [
                {"medicament": self.med1.id, "quantite": 150} # Too much
            ]
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancel_vente_and_stock_restoration(self):
        # Create a sale first
        vente = self.client.post(self.list_url, {
            "lignes": [{"medicament": self.med1.id, "quantite": 10}]
        }, format='json').data
        
        self.med1.refresh_from_db()
        self.assertEqual(self.med1.stock_actuel, 90)
        
        annuler_url = reverse('vente-annuler', kwargs={'pk': vente['id']})
        response = self.client.post(annuler_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['statut'], 'ANNULÉE')
        
        # Check stock restoration
        self.med1.refresh_from_db()
        self.assertEqual(self.med1.stock_actuel, 100)

    def test_reference_generation(self):
        response = self.client.post(self.list_url, {
            "lignes": [{"medicament": self.med1.id, "quantite": 1}]
        }, format='json')
        self.assertIn('VNT-', response.data['reference'])
