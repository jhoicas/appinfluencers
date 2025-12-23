'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { LoadingScreen } from '@/components/ui/spinner';
import Container from '@/components/layout/Container';

interface Campaign {
  id: number;
  title: string;
  description: string;
  budget: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export default function CampanasPage() {
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

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <LoadingScreen message="Cargando campañas..." variant="infinity" />;
  }

  return (
    <Container size="xl" className="overflow-x-hidden">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mis Campañas</h1>
          <button
            onClick={() => router.push('/empresa/campanas/nueva')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Nueva Campaña
          </button>
        </div>

        {campanas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📢</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No tienes campañas aún
            </h2>
            <p className="text-gray-600 mb-6">
              Crea tu primera campaña para empezar a trabajar con influencers
            </p>
            <button
              onClick={() => router.push('/empresa/campanas/nueva')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Crear Primera Campaña
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campanas.map((campana) => (
              <div
                key={campana.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/empresa/campanas/${campana.id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {campana.title}
                    </h3>
                    {getStatusBadge(campana.status)}
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {campana.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Presupuesto:</span>
                      <span className="font-semibold">${campana.budget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Inicio:</span>
                      <span>{new Date(campana.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fin:</span>
                      <span>{new Date(campana.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/empresa/campanas/${campana.id}`);
                      }}
                      className="w-full text-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver Detalles →
                    </button>
                  </div>
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
    </Container>
  );
}
