from django.db import models
from django.utils import timezone
from medicaments.models import Medicament

class Vente(models.Model):
    STATUT_CHOICES = (
        ('EN_COURS', 'En cours'),
        ('COMPLETÉE', 'Complétée'),
        ('ANNULÉE', 'Annulée'),
    )

    reference = models.CharField(max_length=20, unique=True, verbose_name="Référence")
    date_vente = models.DateTimeField(default=timezone.now, verbose_name="Date de vente")
    total_ttc = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Total TTC")
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='COMPLETÉE', verbose_name="Statut")
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")

    class Meta:
        verbose_name = "Vente"
        verbose_name_plural = "Ventes"
        ordering = ['-date_vente']

    def __str__(self):
        return self.reference

    def save(self, *args, **kwargs):
        if not self.reference:
            # Generate reference: VNT-YYYY-XXXX
            year = timezone.now().year
            last_vente = Vente.objects.filter(reference__startswith=f'VNT-{year}').order_by('-reference').first()
            if last_vente:
                last_number = int(last_vente.reference.split('-')[-1])
                new_number = last_number + 1
            else:
                new_number = 1
            self.reference = f'VNT-{year}-{new_number:04d}'
        super().save(*args, **kwargs)

class LigneVente(models.Model):
    vente = models.ForeignKey(Vente, on_delete=models.CASCADE, related_name='lignes', verbose_name="Vente")
    medicament = models.ForeignKey(Medicament, on_delete=models.PROTECT, verbose_name="Médicament")
    quantite = models.PositiveIntegerField(verbose_name="Quantité")
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix Unitaire (Snapshot)")
    sous_total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Sous-total")

    class Meta:
        verbose_name = "Ligne de Vente"
        verbose_name_plural = "Lignes de Vente"

    def __str__(self):
        return f"{self.medicament.nom} x {self.quantite}"

    def save(self, *args, **kwargs):
        self.sous_total = self.quantite * self.prix_unitaire
        super().save(*args, **kwargs)
