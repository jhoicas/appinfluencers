'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_approved: boolean;
  is_active: boolean;
}

export default function UsuariosPendientesPage() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsuariosPendientes();
  }, []);

  const fetchUsuariosPendientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/', {
        params: {
          is_approved: false
        }
      });
      setUsuarios(response.data);
    } catch (err: any) {
      setError('Error al cargar usuarios pendientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const aprobarUsuario = async (userId: number) => {
    try {
      await api.patch(`/users/${userId}/approve`);
      // Actualizar la lista
      setUsuarios(usuarios.filter(u => u.id !== userId));
      alert('Usuario aprobado exitosamente');
    } catch (err: any) {
      alert('Error al aprobar usuario');
      console.error(err);
    }
  };

  const desactivarUsuario = async (userId: number) => {
    try {
      await api.patch(`/users/${userId}/deactivate`);
      // Actualizar la lista
      setUsuarios(usuarios.filter(u => u.id !== userId));
      alert('Usuario desactivado exitosamente');
    } catch (err: any) {
      alert('Error al desactivar usuario');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando usuarios pendientes...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Usuarios Pendientes de Aprobación</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {usuarios.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            No hay usuarios pendientes de aprobación
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {usuario.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {usuario.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.role === 'INFLUENCER' ? 'bg-purple-100 text-purple-800' :
                        usuario.role === 'EMPRESA' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {usuario.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pendiente
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => aprobarUsuario(usuario.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        onClick={() => desactivarUsuario(usuario.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        ❌ Rechazar
                      </button>
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
