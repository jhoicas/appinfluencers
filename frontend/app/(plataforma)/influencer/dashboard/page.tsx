'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';

export default function InfluencerDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <Container size="xl" className="overflow-x-hidden">
      <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Influencer</h1>
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded p-4">
              <h2 className="font-semibold text-purple-900">Bienvenido, {user?.full_name}</h2>
              <p className="text-purple-700">Email: {user?.email}</p>
              <p className="text-purple-700">Rol: {user?.role}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Campañas Activas</h3>
                <p className="text-3xl font-bold text-purple-600">0</p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Propuestas Recibidas</h3>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Ganancias Totales</h3>
                <p className="text-3xl font-bold text-green-600">$0</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
              <div className="space-y-2">
                <button 
                  onClick={() => router.push('/influencer/perfil')}
                  className="w-full text-left px-4 py-3 bg-purple-100 hover:bg-purple-200 rounded"
                >
                  👤 Ver/Editar Mi Perfil
                </button>
                <button 
                  onClick={() => router.push('/influencer/campanas')}
                  className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  📊 Ver Mis Campañas
                </button>
                <button 
                  onClick={() => router.push('/influencer/mensajes')}
                  className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  💬 Mensajes
                </button>
                <button 
                  onClick={() => router.push('/influencer/pagos')}
                  className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  💰 Historial de Pagos
                </button>
              </div>
            </div>
          </div>
        </div>
    </Container>
  );
}
