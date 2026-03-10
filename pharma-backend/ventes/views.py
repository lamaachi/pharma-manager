from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from .models import Vente
from .serializers import VenteSerializer, VenteDetailSerializer

class VenteViewSet(viewsets.ModelViewSet):
    queryset = Vente.objects.all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = {
        'date_vente': ['gte', 'lte'],
        'statut': ['exact'],
    }
    ordering_fields = ['date_vente', 'total_ttc']
    ordering = ['-date_vente']

    def get_serializer_class(self):
        if self.action in ['retrieve']:
            return VenteDetailSerializer
        return VenteSerializer

    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        vente = self.get_object()
        
        if vente.statut == 'ANNULÉE':
            return Response({"error": "Cette vente est déjà annulée."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Restore stock
            for ligne in vente.lignes.all():
                medicament = ligne.medicament
                medicament.stock_actuel += ligne.quantite
                medicament.save()
            
            vente.statut = 'ANNULÉE'
            vente.save()

        serializer = self.get_serializer(vente)
        return Response(serializer.data)
