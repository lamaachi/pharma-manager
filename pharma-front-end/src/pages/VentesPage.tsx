import { useState, useEffect } from 'react';
import { Receipt, Search, Plus, Trash2, Calendar } from 'lucide-react';
import { fetchMedicaments } from '../api/medicamentsApi';
import type { Medicament } from '../api/medicamentsApi';
import { fetchVentes, createVente, annulerVente } from '../api/ventesApi';
import type { Vente } from '../api/ventesApi';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';

export default function VentesPage() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  
  // Sale Creation State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentSaleLines, setCurrentSaleLines] = useState<{
    medicament: Medicament;
    quantite: number;
    prix_unitaire: number;
  }[]>([]);

  const loadVentes = async () => {
    setLoading(true);
    try {
      const data = await fetchVentes(dateFilter ? { date: dateFilter } : {});
      setVentes(data.results || []);
    } catch (error) {
      console.error("Failed to load ventes", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMedicaments = async () => {
    try {
      const data = await fetchMedicaments({ search: searchTerm });
      setMedicaments(data.results || []);
    } catch (error) {
      console.error("Failed to load medicaments for sale", error);
    }
  };

  useEffect(() => {
    loadVentes();
  }, [dateFilter]);

  useEffect(() => {
    if (isModalOpen) {
      const delayDebounceFn = setTimeout(() => {
        loadMedicaments();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, isModalOpen]);

  // Handle saving a sale
  const handleCreateSale = async () => {
    if (currentSaleLines.length === 0) return;
    
    try {
      setLoading(true);
      await createVente({
        lignes: currentSaleLines.map(l => ({
          medicament: l.medicament.id,
          quantite: l.quantite
        }))
      });
      setIsModalOpen(false);
      setCurrentSaleLines([]);
      loadVentes();
    } catch (error) {
      console.error('Failed to create sale', error);
      alert('Erreur lors de la création de la vente');
    } finally {
      setLoading(false);
    }
  };

  const handleAnnulerVente = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette vente ? Le stock sera restauré.')) {
      try {
        await annulerVente(id);
        loadVentes();
      } catch (error) {
        console.error('Failed to cancel sale', error);
      }
    }
  };

  // Add line to current sale
  const addMedicamentToSale = (med: Medicament) => {
    if (med.stock_actuel <= 0) {
      alert("Ce médicament est en rupture de stock !");
      return;
    }
    
    setCurrentSaleLines(prev => {
      const existing = prev.find(p => p.medicament.id === med.id);
      if (existing) {
        if (existing.quantite >= med.stock_actuel) {
          alert("Stock insuffisant !");
          return prev;
        }
        return prev.map(p => 
          p.medicament.id === med.id ? { ...p, quantite: p.quantite + 1 } : p
        );
      }
      return [...prev, { medicament: med, quantite: 1, prix_unitaire: Number(med.prix_vente) }];
    });
    setSearchTerm(''); // clear search after add
  };

  const removeSaleLine = (id: number) => {
    setCurrentSaleLines(prev => prev.filter(l => l.medicament.id !== id));
  };

  const updateQuantity = (id: number, quantite: number) => {
    const med = currentSaleLines.find(l => l.medicament.id === id)?.medicament;
    if (med && quantite > med.stock_actuel) {
      alert(`Stock insuffisant. Maximum: ${med.stock_actuel}`);
      return;
    }
    setCurrentSaleLines(prev => 
      prev.map(l => l.medicament.id === id ? { ...l, quantite: Math.max(1, quantite) } : l)
    );
  };

  const currentTotal = currentSaleLines.reduce((acc, line) => acc + (line.quantite * line.prix_unitaire), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="text-blue-600" />
            Ventes
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gérez l'historique et enregistrez de nouvelles ventes</p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={18} />
          Nouvelle Vente
        </Button>
      </div>

      {/* History */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="date"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        {dateFilter && (
          <Button variant="ghost" onClick={() => setDateFilter('')}>Réinitialiser le filtre</Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && ventes.length === 0 ? (
          <div className="p-12 text-center flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : ventes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucune vente trouvée pour cette période.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-700">
                  <th className="p-4">Référence</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Articles (Qté)</th>
                  <th className="p-4 text-right">Total TTC</th>
                  <th className="p-4 text-center">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ventes.map((vente) => (
                  <tr key={vente.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">{vente.reference}</td>
                    <td className="p-4 text-gray-600">{formatDate(vente.date_vente)}</td>
                    <td className="p-4 text-gray-600 text-sm">
                        {vente.lignes?.reduce((acc, l) => acc + l.quantite, 0) || 0} articles
                    </td>
                    <td className="p-4 text-right font-medium">{formatCurrency(vente.total_ttc)}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        vente.statut === 'Complétée' ? 'bg-emerald-100 text-emerald-800' : 
                        vente.statut === 'Annulée' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vente.statut}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {vente.statut === 'Complétée' && (
                        <button 
                          onClick={() => handleAnnulerVente(vente.id)}
                          className="text-sm font-medium hover:underline text-red-600"
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sale Creation Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Enregistrer une Nouvelle Vente"
      >
        <div className="space-y-6">
          {/* Article Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input 
              placeholder="Rechercher un médicament à ajouter..." 
              className="pl-10 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && medicaments.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {medicaments.map(med => (
                  <li 
                    key={med.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0"
                    onClick={() => addMedicamentToSale(med)}
                  >
                    <div>
                      <div className="font-medium text-gray-900">{med.nom} - {med.dosage}</div>
                      <div className="text-xs text-gray-500">Stock: {med.stock_actuel} | {formatCurrency(med.prix_vente)}</div>
                    </div>
                    <Button size="sm" variant="secondary" className="px-2 py-1">Ajouter</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Current Sale Lines */}
          <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-[250px] shadow-inner bg-gray-50/50">
            {currentSaleLines.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-500">
                <Receipt size={32} className="mx-auto mb-2 text-gray-300" />
                Le panier est vide. <br/> Recherchez un médicament pour commencer.
              </div>
            ) : (
              <table className="w-full text-left bg-white h-fit">
                 <thead>
                  <tr className="bg-gray-100 text-xs text-gray-600 border-b border-gray-200">
                    <th className="p-3">Médicament</th>
                    <th className="p-3 w-24">Qté</th>
                    <th className="p-3 text-right">Prix</th>
                    <th className="p-3 text-center w-12"></th>
                  </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                  {currentSaleLines.map((line) => (
                    <tr key={line.medicament.id}>
                      <td className="p-3 shrink-0">
                        <div className="font-medium text-gray-900 text-sm">{line.medicament.nom}</div>
                      </td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          min="1" 
                          max={line.medicament.stock_actuel}
                          className="w-16 p-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          value={line.quantite}
                          onChange={(e) => updateQuantity(line.medicament.id, parseInt(e.target.value) || 1)}
                        />
                      </td>
                      <td className="p-3 text-right font-medium text-sm">
                        {formatCurrency(line.prix_unitaire * line.quantite)}
                      </td>
                      <td className="p-3 text-center">
                         <button 
                           onClick={() => removeSaleLine(line.medicament.id)}
                           className="text-red-500 hover:text-red-700 p-1"
                         >
                           <Trash2 size={16} />
                         </button>
                      </td>
                    </tr>
                  ))}
                 </tbody>
              </table>
            )}
          </div>

          {/* Total & Submit */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-sm">Total TTC</span>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(currentTotal)}</div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button 
                onClick={handleCreateSale} 
                className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                disabled={currentSaleLines.length === 0 || loading}
                isLoading={loading}
              >
                Encaisser
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
