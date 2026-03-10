import axiosInstance from './axiosConfig';
import type { PaginatedResponse } from './categoriesApi';

export interface VenteLine {
  id?: number;
  medicament: number | any;
  quantite: number;
  prix_unitaire?: string | number;
  sous_total?: string | number;
}

export interface Vente {
  id: number;
  reference: string;
  date_vente: string;
  total_ttc: string | number;
  statut: string;
  notes?: string;
  lignes: VenteLine[];
}

export const fetchVentes = async (params: Record<string, any> = {}): Promise<PaginatedResponse<Vente>> => {
  const response = await axiosInstance.get('/ventes/', { params });
  return response.data;
};

export const fetchVente = async (id: number | string): Promise<Vente> => {
  const response = await axiosInstance.get(`/ventes/${id}/`);
  return response.data;
};

export const createVente = async (data: any): Promise<Vente> => {
  const response = await axiosInstance.post('/ventes/', data);
  return response.data;
};

export const annulerVente = async (id: number | string): Promise<Vente> => {
  const response = await axiosInstance.post(`/ventes/${id}/annuler/`);
  return response.data;
};
