import axiosInstance from './axiosConfig';
import { Categorie, PaginatedResponse } from './categoriesApi';

export interface Medicament {
  id: number;
  nom: string;
  dci?: string;
  categorie: number | Categorie;
  forme: string;
  dosage: string;
  prix_achat: string | number;
  prix_vente: string | number;
  stock_actuel: number;
  stock_minimum: number;
  date_expiration: string;
  ordonnance_requise: boolean;
  est_actif: boolean;
  est_en_alerte?: boolean;
}

export type { PaginatedResponse };

export const fetchMedicaments = async (params: Record<string, any> = {}): Promise<PaginatedResponse<Medicament>> => {
  const response = await axiosInstance.get('/medicaments/', { params });
  return response.data;
};

export const fetchMedicament = async (id: number | string): Promise<Medicament> => {
  const response = await axiosInstance.get(`/medicaments/${id}/`);
  return response.data;
};

export const createMedicament = async (data: Partial<Medicament>): Promise<Medicament> => {
  const response = await axiosInstance.post('/medicaments/', data);
  return response.data;
};

export const updateMedicament = async (id: number | string, data: Partial<Medicament>): Promise<Medicament> => {
  const response = await axiosInstance.patch(`/medicaments/${id}/`, data);
  return response.data;
};

export const deleteMedicament = async (id: number | string): Promise<void> => {
  await axiosInstance.delete(`/medicaments/${id}/`);
};

export const fetchAlertes = async (params: Record<string, any> = {}): Promise<PaginatedResponse<Medicament>> => {
  const response = await axiosInstance.get('/medicaments/alertes/', { params });
  return response.data;
};
