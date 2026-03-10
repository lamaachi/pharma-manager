from django.db import models
from categories.models import Categorie

class Medicament(models.Model):
    nom = models.CharField(max_length=200, verbose_name="Nom Commercial")
    dci = models.CharField(max_length=200, blank=True, null=True, verbose_name="DCI (Optionnel)")
    categorie = models.ForeignKey(Categorie, on_delete=models.PROTECT, related_name='medicaments', verbose_name="Catégorie")
    forme = models.CharField(max_length=100, verbose_name="Forme")
    dosage = models.CharField(max_length=100, verbose_name="Dosage")
    
    prix_achat = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix d'Achat")
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix de Vente")
    
    stock_actuel = models.IntegerField(default=0, verbose_name="Stock Actuel")
    stock_minimum = models.IntegerField(default=10, verbose_name="Stock Minimum")
    
    date_expiration = models.DateField(null=True, blank=True, verbose_name="Date d'Expiration")
    ordonnance_requise = models.BooleanField(default=False, verbose_name="Ordonnance Requise")
    
    est_actif = models.BooleanField(default=True, verbose_name="Est Actif (Soft Delete)")

    class Meta:
        verbose_name = "Médicament"
        verbose_name_plural = "Médicaments"
        ordering = ['nom']

    def __str__(self):
        return f"{self.nom} - {self.forme} {self.dosage}"

    @property
    def est_en_alerte(self):
        return self.stock_actuel <= self.stock_minimum
