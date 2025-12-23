'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Usuarios Totales</h3>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Empresas</h3>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Influencers</h3>
                <p className="text-3xl font-bold text-purple-600">0</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
              <div className="space-y-2">
                <button 
                  onClick={() => router.push('/admin/usuarios')}
                  className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  📋 Ver Usuarios Pendientes de Aprobación
                </button>
                <button 
                  onClick={() => router.push('/admin/planes')}
                  className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  💎 Gestionar Planes de Suscripción
                </button>
                <button 
                  onClick={() => router.push('/admin/estadisticas')}
                  className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  📊 Ver Estadísticas de la Plataforma
                </button>
                <button 
                  onClick={() => router.push('/admin/transacciones')}
                  className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  💰 Ver Transacciones
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
