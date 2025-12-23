'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { LoadingScreen } from '@/components/ui/spinner';

interface Campaign {
  id: number;
  title: string;
  description: string;
  budget: number;
  status: string;
  start_date: string;
  end_date: string;
}

export default function InfluencerCampanasPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [campanas, setCampanas] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampanas();
  }, []);

  const fetchCampanas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns/');
      setCampanas(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando campañas disponibles..." variant="infinity" />;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mis Campañas</h1>

        {campanas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No tienes campañas activas
            </h2>
            <p className="text-gray-600 mb-6">
              Cuando las empresas te contraten, las campañas aparecerán aquí
            </p>
            <button
              onClick={() => router.push('/influencer/perfil')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Completar Mi Perfil
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {campanas.map((campana) => (
              <div
                key={campana.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/influencer/campanas/${campana.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {campana.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{campana.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>💰 ${campana.budget}</span>
                      <span>📅 {new Date(campana.start_date).toLocaleDateString()}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                        {campana.status}
                      </span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    Ver Detalles →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
