import axiosInstance from './axiosConfig';

export interface Categorie {
  id: number;
  nom: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const fetchCategories = async (params: Record<string, any> = {}): Promise<Categorie[]> => {
  const response = await axiosInstance.get('/categories/', { params });
  return response.data;
};

export const createCategorie = async (data: Partial<Categorie>): Promise<Categorie> => {
  const response = await axiosInstance.post('/categories/', data);
  return response.data;
};
