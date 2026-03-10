from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VenteViewSet, LigneVenteViewSet

router = DefaultRouter()
router.register(r'ventes', VenteViewSet, basename='vente')
router.register(r'lignes-ventes', LigneVenteViewSet, basename='lignevente')

urlpatterns = [
    path('', include(router.urls)),
]