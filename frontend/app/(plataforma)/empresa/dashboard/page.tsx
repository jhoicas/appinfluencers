'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';

export default function EmpresaDashboardPage() {
  const { user, trialStatus, logout } = useAuth();
  const router = useRouter();

  return (
    <Container size="xl" className="overflow-x-hidden">
      <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Empresa</h1>
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h2 className="font-semibold text-blue-900">Bienvenido, {user?.full_name}</h2>
              <p className="text-blue-700">Email: {user?.email}</p>
              <p className="text-blue-700">Rol: {user?.role}</p>
            </div>

            {/* Trial Status */}
            {trialStatus && trialStatus.is_active && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h3 className="font-semibold text-yellow-900">🎁 Trial Activo</h3>
                <p className="text-yellow-700">
                  Tiempo restante: {trialStatus.hours_remaining?.toFixed(1)} horas
                </p>
                <p className="text-yellow-700">
                  {trialStatus.has_viewed_free_profile 
                    ? '✅ Ya usaste tu vista gratuita' 
                    : '🆓 Puedes ver 1 perfil completo gratis'}
                </p>
              </div>
            )}

            {!user?.has_active_subscription && (
              <div className="bg-purple-50 border border-purple-200 rounded p-4">
                <h3 className="font-semibold text-purple-900">💎 Suscríbete para acceso completo</h3>
                <p className="text-purple-700">
                  Obtén acceso ilimitado a todos los perfiles de influencers
                </p>
                <button 
                  onClick={() => router.push('/empresa/planes')}
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Ver Planes
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Campañas Activas</h3>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Propuestas Enviadas</h3>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Perfiles Vistos</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {trialStatus?.has_viewed_free_profile ? '1' : '0'}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
              <div className="space-y-2">
                <button 
                  onClick={() => router.push('/empresa/explorar')}
                  className="w-full text-left px-4 py-3 bg-blue-100 hover:bg-blue-200 rounded"
                >
                  🔍 Explorar Influencers
                </button>
                <button 
                  onClick={() => router.push('/empresa/campanas')}
                  className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  📊 Ver Mis Campañas
                </button>
                <button 
                  onClick={() => router.push('/empresa/mensajes')}
                  className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  💬 Mensajes
                </button>
                <button 
                  onClick={() => router.push('/empresa/transacciones')}
                  className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  💰 Ver Transacciones
                </button>
              </div>
            </div>
          </div>
        </div>
    </Container>
  );
}
