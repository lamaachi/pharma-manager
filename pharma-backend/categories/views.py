from rest_framework import viewsets
from .models import Categorie
from .serializers import CategorieSerializer

class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    pagination_class = None # usually we don't paginate categories for dropdowns, or we can leave it default
