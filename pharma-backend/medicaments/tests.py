from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from categories.models import Categorie
from .models import Medicament

class MedicamentAPITests(APITestCase):
    def setUp(self):
        self.categorie = Categorie.objects.create(nom="Test Category")
        self.medicament = Medicament.objects.create(
            nom="Test Med",
            categorie=self.categorie,
            forme="Tab",
            dosage="10mg",
            prix_achat=10.0,
            prix_vente=20.0,
            stock_actuel=15,
            stock_minimum=10
        )
        self.list_url = reverse('medicament-list')
        self.detail_url = reverse('medicament-detail', kwargs={'pk': self.medicament.pk})
        self.alertes_url = reverse('medicament-alertes')

    def test_get_medicaments_list(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Results is in the response due to pagination
        self.assertEqual(len(response.data['results']), 1)

    def test_create_medicament(self):
        data = {
            "nom": "New Med",
            "categorie": self.categorie.id,
            "forme": "Capsule",
            "dosage": "50mg",
            "prix_achat": 15.0,
            "prix_vente": 30.0,
            "stock_actuel": 20,
            "stock_minimum": 5
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Medicament.objects.count(), 2)

    def test_soft_delete(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.medicament.refresh_from_db()
        self.assertFalse(self.medicament.est_actif)
        # Should not appear in list anymore
        response = self.client.get(self.list_url)
        self.assertEqual(len(response.data['results']), 0)

    def test_stock_alerts(self):
        # Create a med with low stock
        Medicament.objects.create(
            nom="Low Stock Med",
            categorie=self.categorie,
            forme="Tab",
            dosage="10mg",
            prix_achat=10.0,
            prix_vente=20.0,
            stock_actuel=4,
            stock_minimum=10
        )
        response = self.client.get(self.alertes_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Case with pagination
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['nom'], "Low Stock Med")
