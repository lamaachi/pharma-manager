import { useState, useEffect } from 'react';
import { Pill, Plus, Search, Edit2, Trash2, AlertTriangle, FileText } from 'lucide-react';
import { fetchMedicaments, createMedicament, updateMedicament, deleteMedicament } from '../api/medicamentsApi';
import type { Medicament } from '../api/medicamentsApi';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { MedicamentFormModal } from '../components/medicaments/MedicamentFormModal';

export default function MedicamentsPage() {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicament | null>(null);

  const loadMedicaments = async () => {
    setLoading(true);
    try {
      // The API should handle searching via `search` param in real scenario
      const data = await fetchMedicaments({ search: searchTerm });
      setMedicaments(data.results || []);
    } catch (error) {
      console.error("Failed to load medicaments", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadMedicaments();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleCreateOrUpdate = async (data: Partial<Medicament>) => {
    if (editingMed) {
      await updateMedicament(editingMed.id, data);
    } else {
      await createMedicament(data);
    }
    loadMedicaments();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce médicament ?")) {
      try {
        await deleteMedicament(id);
        loadMedicaments();
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  const openNewModal = () => {
    setEditingMed(null);
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medicament) => {
    setEditingMed(med);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Pill className="text-blue-600" />
            Gestion des Médicaments
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gérez le catalogue et surveillez les stocks</p>
        </div>
        
        <Button onClick={openNewModal} className="shrink-0 flex items-center gap-2">
          <Plus size={18} />
          Nouveau Médicament
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input 
            placeholder="Rechercher par nom ou DCI..." 
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Placeholder for Category Filter (Bonus feature) */}
        <select className="border border-gray-300 rounded-lg px-4 bg-white text-gray-700 h-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          <option value="">Toutes les catégories</option>
          {/* We would load and map categories here */}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : medicaments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucun médicament trouvé pour cette recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-700">
                  <th className="p-4">Nom & Dosage</th>
                  <th className="p-4">Catégorie</th>
                  <th className="p-4">Prix Public</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-center">Ordonnance</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {medicaments.map((med) => {
                  const isLowStock = med.stock_actuel <= med.stock_minimum;
                  
                  return (
                    <tr key={med.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{med.nom}</div>
                        <div className="text-xs text-gray-500">
                          {med.forme} - {med.dosage}
                          {med.dci && <span className="ml-1 text-gray-400">({med.dci})</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {typeof med.categorie === 'object' ? med.categorie.nom : `Catégorie ${med.categorie}`}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900 font-medium">
                        {formatCurrency(med.prix_vente)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                              isLowStock ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {med.stock_actuel}
                            </span>
                            {isLowStock && <span title="Stock faible"><AlertTriangle size={16} className="text-red-500" /></span>}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {med.ordonnance_requise ? (
                          <span title="Ordonnance requise"><FileText size={18} className="text-amber-500 mx-auto" /></span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(med)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Modifier"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(med.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MedicamentFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateOrUpdate}
        initialData={editingMed}
      />
    </div>
  );
}
