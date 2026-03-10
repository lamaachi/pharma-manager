from rest_framework import serializers
from django.db import transaction
from .models import Vente, LigneVente
from medicaments.models import Medicament
from medicaments.serializers import MedicamentSerializer

class LigneVenteSerializer(serializers.ModelSerializer):
    sous_total = serializers.ReadOnlyField()
    prix_unitaire = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    class Meta:
        model = LigneVente
        fields = ['id', 'medicament', 'quantite', 'prix_unitaire', 'sous_total']

class VenteSerializer(serializers.ModelSerializer):
    lignes = LigneVenteSerializer(many=True)
    total_ttc = serializers.ReadOnlyField()
    reference = serializers.ReadOnlyField()
        
    class Meta:
        model = Vente
        fields = ['id', 'reference', 'date_vente', 'total_ttc', 'statut', 'notes', 'lignes']

    def validate_lignes(self, value):
        if not value:
            raise serializers.ValidationError("Une vente doit contenir au moins un article.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        lignes_data = validated_data.pop('lignes')
        vente = Vente.objects.create(**validated_data)
        total = 0

        for ligne_data in lignes_data:
            medicament = ligne_data['medicament']
            quantite = ligne_data['quantite']

            # Check stock
            if medicament.stock_actuel < quantite:
                raise serializers.ValidationError(
                    f"Stock insuffisant pour {medicament.nom}. Disponible: {medicament.stock_actuel}, Demandé: {quantite}"
                )

            # Snapshot price if not provided (though plan says snapshot at sale)
            # In real case, frontend might send the price it displayed, 
            # or we take current price from DB.
            if 'prix_unitaire' not in ligne_data:
                ligne_data['prix_unitaire'] = medicament.prix_vente

            ligne = LigneVente.objects.create(vente=vente, **ligne_data)
            total += ligne.sous_total

            # Deduct stock
            medicament.stock_actuel -= quantite
            medicament.save()

        vente.total_ttc = total
        vente.save()
        return vente

class LigneVenteDetailSerializer(LigneVenteSerializer):
    medicament = MedicamentSerializer(read_only=True)

class VenteDetailSerializer(VenteSerializer):
    # For detailed view with medicament info
    lignes = LigneVenteDetailSerializer(many=True, read_only=True)
