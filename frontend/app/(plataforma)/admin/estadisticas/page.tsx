'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Stats {
  total_users: number;
  total_empresas: number;
  total_influencers: number;
  total_admins: number;
  pending_approvals: number;
  active_campaigns: number;
  total_revenue: number;
  active_subscriptions: number;
}

export default function EstadisticasPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Obtener estadísticas de diferentes endpoints
      const [usersResponse, campaignsResponse] = await Promise.all([
        api.get('/users/'),
        api.get('/campaigns/').catch(() => ({ data: [] })),
      ]);

      const users = usersResponse.data;
      const campaigns = campaignsResponse.data;

      const statsData: Stats = {
        total_users: users.length,
        total_empresas: users.filter((u: any) => u.role === 'EMPRESA').length,
        total_influencers: users.filter((u: any) => u.role === 'INFLUENCER').length,
        total_admins: users.filter((u: any) => u.role === 'ADMIN').length,
        pending_approvals: users.filter((u: any) => !u.is_approved).length,
        active_campaigns: campaigns.filter((c: any) => c.status === 'ACTIVE').length,
        total_revenue: 0, // Calcular desde pagos cuando esté implementado
        active_subscriptions: users.filter((u: any) => u.has_active_subscription).length,
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error al cargar estadísticas
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Estadísticas de la Plataforma</h1>
          <button
            onClick={() => fetchStats()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔄 Actualizar
          </button>
        </div>

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Usuarios</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Empresas</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total_empresas}</p>
              </div>
              <div className="text-4xl">🏢</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Influencers</p>
                <p className="text-3xl font-bold text-purple-600">{stats.total_influencers}</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Administradores</p>
                <p className="text-3xl font-bold text-green-600">{stats.total_admins}</p>
              </div>
              <div className="text-4xl">🔐</div>
            </div>
          </div>
        </div>

        {/* Estadísticas de Actividad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800 mb-1">Pendientes de Aprobación</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.pending_approvals}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
            {stats.pending_approvals > 0 && (
              <button
                onClick={() => router.push('/admin/usuarios')}
                className="mt-4 text-sm text-yellow-800 hover:text-yellow-900 underline"
              >
                Ver usuarios pendientes →
              </button>
            )}
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 mb-1">Campañas Activas</p>
                <p className="text-3xl font-bold text-green-900">{stats.active_campaigns}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-800 mb-1">Suscripciones Activas</p>
                <p className="text-3xl font-bold text-purple-900">{stats.active_subscriptions}</p>
              </div>
              <div className="text-4xl">💎</div>
            </div>
          </div>
        </div>

        {/* Gráfico de Distribución de Usuarios */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Distribución de Usuarios</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Empresas</span>
                <span className="text-sm text-gray-600">
                  {stats.total_users > 0 ? Math.round((stats.total_empresas / stats.total_users) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${stats.total_users > 0 ? (stats.total_empresas / stats.total_users) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Influencers</span>
                <span className="text-sm text-gray-600">
                  {stats.total_users > 0 ? Math.round((stats.total_influencers / stats.total_users) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${stats.total_users > 0 ? (stats.total_influencers / stats.total_users) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Administradores</span>
                <span className="text-sm text-gray-600">
                  {stats.total_users > 0 ? Math.round((stats.total_admins / stats.total_users) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${stats.total_users > 0 ? (stats.total_admins / stats.total_users) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/admin/usuarios')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold">Gestionar Usuarios</div>
              <div className="text-sm text-gray-600">Ver y aprobar usuarios</div>
            </button>

            <button
              onClick={() => router.push('/admin/planes')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-left"
            >
              <div className="text-2xl mb-2">💎</div>
              <div className="font-semibold">Gestionar Planes</div>
              <div className="text-sm text-gray-600">Editar planes de suscripción</div>
            </button>

            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left"
            >
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-semibold">Dashboard</div>
              <div className="text-sm text-gray-600">Volver al inicio</div>
            </button>
          </div>
        </div>

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
