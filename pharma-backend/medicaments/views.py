from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from .models import Medicament
from .serializers import MedicamentSerializer, MedicamentListSerializer

class MedicamentViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categorie', 'ordonnance_requise']
    search_fields = ['nom', 'dci']
    ordering_fields = ['nom', 'stock_actuel', 'prix_vente']
    ordering = ['nom']

    def get_queryset(self):
        # Only return active items by default
        return Medicament.objects.filter(est_actif=True)

    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'retrieve':
            return MedicamentListSerializer
        return MedicamentSerializer

    def perform_destroy(self, instance):
        # Soft delete mechanism
        instance.est_actif = False
        instance.save()

    @action(detail=False, methods=['get'])
    def alertes(self, request):
        """Retourne les médicaments avec un stock bas ou expiré."""
        alertes = Medicament.objects.filter(
            est_actif=True
        ).filter(
            models.Q(stock_actuel__lte=models.F('stock_minimum'))
        )
        
        page = self.paginate_queryset(alertes)
        if page is not None:
            serializer = MedicamentListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = MedicamentListSerializer(alertes, many=True)
        return Response(serializer.data)
