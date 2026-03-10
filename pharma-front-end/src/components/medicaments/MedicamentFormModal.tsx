import { useState, useEffect } from 'react';
import type { Medicament } from '../../api/medicamentsApi';
import { fetchCategories } from '../../api/categoriesApi';
import type { Categorie } from '../../api/categoriesApi';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface MedicamentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Medicament>) => Promise<void>;
  initialData?: Medicament | null;
}

export const MedicamentFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: MedicamentFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Categorie[]>([]);
  
  const [formData, setFormData] = useState<Partial<Medicament>>({
    nom: '',
    dci: '',
    categorie: undefined,
    forme: '',
    dosage: '',
    prix_achat: '',
    prix_vente: '',
    stock_actuel: 0,
    stock_minimum: 10,
    ordonnance_requise: false,
  });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (initialData) {
        setFormData({
          ...initialData,
          categorie: typeof initialData.categorie === 'object' ? initialData.categorie.id : initialData.categorie,
        });
      } else {
        setFormData({
          nom: '', dci: '', categorie: undefined, forme: '', dosage: '',
          prix_achat: '', prix_vente: '', stock_actuel: 0, stock_minimum: 10,
          ordonnance_requise: false,
        });
      }
    }
  }, [isOpen, initialData]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'categorie') {
      const categoryId = value ? parseInt(value, 10) : undefined;
      setFormData(prev => ({ ...prev, [name]: categoryId }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      // Optional: Add error state display here
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Modifier le Médicament" : "Nouveau Médicament"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nom Commercial" name="nom" required value={formData.nom} onChange={handleChange} />
          <Input label="DCI (Optionnel)" name="dci" value={formData.dci} onChange={handleChange} />
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie <span className="text-red-500 ml-1">*</span></label>
            <select
              name="categorie"
              required
              value={(formData.categorie as number) || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
          
          <Input label="Forme" name="forme" placeholder="Ex: Comprimé" required value={formData.forme} onChange={handleChange} />
          <Input label="Dosage" name="dosage" placeholder="Ex: 500mg" required value={formData.dosage} onChange={handleChange} />
          
          <Input type="number" step="0.01" label="Prix d'Achat" name="prix_achat" required value={formData.prix_achat} onChange={handleChange} />
          <Input type="number" step="0.01" label="Prix de Vente" name="prix_vente" required value={formData.prix_vente} onChange={handleChange} />
          
          <Input type="number" label="Stock Actuel" name="stock_actuel" required value={formData.stock_actuel} onChange={handleChange} />
          <Input type="number" label="Stock Minimum" name="stock_minimum" required value={formData.stock_minimum} onChange={handleChange} />
        </div>

        <div className="flex items-center mt-4">
          <input
            id="ordonnance_requise"
            name="ordonnance_requise"
            type="checkbox"
            checked={formData.ordonnance_requise}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="ordonnance_requise" className="ml-2 block text-sm text-gray-900">
            Médicament sous ordonnance
          </label>
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {initialData ? "Sauvegarder les modifications" : "Créer le médicament"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
