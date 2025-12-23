'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { LoadingScreen } from '@/components/ui/spinner';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number | null;
  price_display: string;
  billing_period: string;
  features: string[];
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
}

export default function AdminPlanesPage() {
  const { user } = useAuth();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    price_display: '',
    billing_period: 'monthly',
    features: '',
    is_featured: false,
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchPlanes();
  }, []);

  const fetchPlanes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscription-plans/', {
        params: { active_only: false }
      });
      setPlanes(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      alert('Error al cargar planes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price?.toString() || '',
        price_display: plan.price_display,
        billing_period: plan.billing_period,
        features: plan.features.join('\n'),
        is_featured: plan.is_featured,
        is_active: plan.is_active,
        display_order: plan.display_order,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        price_display: '',
        billing_period: 'monthly',
        features: '',
        is_featured: false,
        is_active: true,
        display_order: 0,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const features = formData.features.split('\n').filter(f => f.trim());
    const price = formData.price ? parseFloat(formData.price) : null;
    
    const payload = {
      name: formData.name,
      description: formData.description,
      price,
      price_display: formData.price_display,
      billing_period: formData.billing_period,
      features,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
      display_order: formData.display_order,
    };

    try {
      if (editingPlan) {
        await api.patch(`/subscription-plans/${editingPlan.id}`, payload);
        alert('Plan actualizado exitosamente');
      } else {
        await api.post('/subscription-plans/', payload);
        alert('Plan creado exitosamente');
      }
      handleCloseModal();
      fetchPlanes();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      alert('Error al guardar el plan: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (planId: number) => {
    if (!confirm('¿Estás seguro de eliminar este plan?')) return;

    try {
      await api.delete(`/subscription-plans/${planId}`);
      alert('Plan eliminado exitosamente');
      fetchPlanes();
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Error al eliminar el plan');
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando planes..." variant="pulse" />;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestión de Planes</h1>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Crear Nuevo Plan
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periodo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destacado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {planes.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{plan.display_order}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{plan.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{plan.price_display}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{plan.billing_period}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      plan.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {plan.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {plan.is_featured ? '⭐ Sí' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleOpenModal(plan)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre del Plan</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Precio (número o dejar vacío)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="49.99"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Precio Display</label>
                    <input
                      type="text"
                      value={formData.price_display}
                      onChange={(e) => setFormData({...formData, price_display: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="$49 o Personalizado"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Periodo de Facturación</label>
                    <select
                      value={formData.billing_period}
                      onChange={(e) => setFormData({...formData, billing_period: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="monthly">Mensual</option>
                      <option value="yearly">Anual</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Orden de Visualización</label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Características (una por línea)
                  </label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({...formData, features: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    rows={6}
                    placeholder="Acceso ilimitado&#10;Soporte 24/7&#10;API access"
                    required
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Plan Destacado (⭐ MÁS POPULAR)</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Plan Activo</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingPlan ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
