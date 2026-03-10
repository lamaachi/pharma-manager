import { useEffect, useState } from 'react';
import { Pill, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import { fetchMedicaments, fetchAlertes } from '../api/medicamentsApi';
import type { Medicament } from '../api/medicamentsApi';
import { fetchVentes } from '../api/ventesApi';
import { formatCurrency } from '../utils/formatters';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalMedicaments: 0,
    alertesCount: 0,
    ventesAujourdhui: 0,
    chiffreAffaires: 0
  });
  
  const [recentAlertes, setRecentAlertes] = useState<Medicament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        // We'll run these queries concurrently
        const [medsRes, alertesRes, ventesRes] = await Promise.all([
          fetchMedicaments({ limit: 1 }), // Just need the count
          fetchAlertes({ limit: 5 }),     // Need count + top 5
          fetchVentes({ 
            // Simplified date filter for today (backend should handle exact date filtering)
            // Or we could calculate CA over the whole dataset for MVP if API filtering isnt complete
          })
        ]);

        setStats({
          totalMedicaments: medsRes.count || 0,
          alertesCount: alertesRes.count || 0,
          // Placeholder implementation until backend date filtering is exact format verified
          ventesAujourdhui: ventesRes.count || 0,
          chiffreAffaires: ventesRes.results?.reduce((acc, v) => acc + Number(v.total_ttc), 0) || 0
        });
        
        setRecentAlertes(alertesRes.results || []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Médicaments', value: stats.totalMedicaments, icon: Pill, color: 'bg-blue-500' },
    { title: 'Alertes Stock', value: stats.alertesCount, icon: AlertTriangle, color: 'bg-red-500' },
    { title: 'Ventes du jour', value: stats.ventesAujourdhui, icon: Package, color: 'bg-emerald-500' },
    { title: "Chiffre d'Affaires", value: formatCurrency(stats.chiffreAffaires), icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
            <div className={`p-4 rounded-lg bg-opacity-10 ${stat.color.replace('bg-', 'bg-').replace('500', '100')} text-${stat.color.replace('bg-', '')}`}>
              <stat.icon className={`h-8 w-8 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alertes Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            Médicaments en rupture imminente
          </h2>
        </div>
        
        {recentAlertes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucune alerte de stock bas pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-500">
                  <th className="p-4 font-medium">Médicament</th>
                  <th className="p-4 font-medium">Stock Actuel</th>
                  <th className="p-4 font-medium">Stock Minimum</th>
                  <th className="p-4 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentAlertes.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{med.nom}</div>
                      <div className="text-xs text-gray-500">{med.dosage}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {med.stock_actuel}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{med.stock_minimum}</td>
                    <td className="p-4">
                      <span className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle size={14} />
                        À réapprovisionner
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
