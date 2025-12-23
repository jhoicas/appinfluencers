'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
}

export default function PlanesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanes();
  }, []);

  const fetchPlanes = async () => {
    try {
      const response = await api.get('/subscription-plans/');
      setPlanes(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactar = () => {
    alert('Funcionalidad de pago en desarrollo. Por ahora, contacta a: ventas@influencers.com');
  };

  if (loading) {
    return <LoadingScreen message="Cargando planes de suscripción..." variant="pulse" />;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Elige tu Plan</h1>
          <p className="text-xl text-gray-600">
            Accede a miles de influencers y lleva tus campañas al siguiente nivel
          </p>
        </div>

        {user?.has_active_subscription && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-8">
            ✅ Ya tienes una suscripción activa
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg shadow-lg overflow-hidden ${
                plan.is_featured
                  ? 'border-4 border-purple-500 transform scale-105'
                  : 'border border-gray-200'
              }`}
            >
              {plan.is_featured && (
                <div className="bg-purple-500 text-white text-center py-2 font-semibold">
                  ⭐ MÁS POPULAR
                </div>
              )}

              <div className="p-6 bg-white">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>

                <div className="mb-6 min-h-[80px] flex items-center">
                  <div>
                    <div className="text-4xl font-bold text-gray-900">
                      {plan.price_display}
                    </div>
                    {plan.billing_period === 'monthly' && (
                      <span className="text-gray-600">/mes</span>
                    )}
                    {plan.billing_period === 'yearly' && (
                      <span className="text-gray-600">/año</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleContactar}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
                    plan.is_featured
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {plan.price === null ? 'Contactar Ventas' : 'Suscribirse'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Volver al Dashboard
          </button>
        </div>

        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Preguntas frecuentes?
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-gray-600">
                Sí, puedes actualizar o degradar tu plan en cualquier momento.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-gray-600">
                Aceptamos tarjetas de crédito, débito y transferencias bancarias.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                ¿Hay contrato de permanencia?
              </h3>
              <p className="text-gray-600">
                No, todos nuestros planes son mensuales sin compromiso de permanencia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
