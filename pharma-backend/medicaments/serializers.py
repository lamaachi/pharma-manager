from rest_framework import serializers
from .models import Medicament
from categories.serializers import CategorieSerializer

class MedicamentSerializer(serializers.ModelSerializer):
    est_en_alerte = serializers.ReadOnlyField()
    
    class Meta:
        model = Medicament
        fields = '__all__'

class MedicamentListSerializer(MedicamentSerializer):
    # This serializer can be used for listing if you want the category details embedded
    categorie = CategorieSerializer(read_only=True)
