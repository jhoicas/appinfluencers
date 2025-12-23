'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: string;
  status: string;
  description: string;
  payment_method: string;
  transaction_reference: string;
  created_at: string;
  updated_at: string;
}

export default function EmpresaTransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const transactionId = params.id as string;

  useEffect(() => {
    fetchTransaction();
  }, [transactionId]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/transactions/${transactionId}`);
      setTransaction(response.data);
    } catch (error: any) {
      console.error('Error fetching transaction:', error);
      if (error.response?.status === 403) {
        alert('No tienes permiso para ver esta transacción');
        router.push('/empresa/transacciones');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallido';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return '📋';
      case 'campaign':
        return '📢';
      case 'refund':
        return '↩️';
      default:
        return '💰';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'subscription':
        return 'Suscripción';
      case 'campaign':
        return 'Campaña';
      case 'refund':
        return 'Reembolso';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando transacción...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Transacción no encontrada</h2>
          <button
            onClick={() => router.push('/empresa/transacciones')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Volver a Transacciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/empresa/transacciones')}
            className="text-purple-600 hover:text-purple-800 mb-4 inline-flex items-center"
          >
            ← Volver a Mis Transacciones
          </button>
          <h1 className="text-3xl font-bold">Detalle de Transacción #{transaction.id}</h1>
        </div>

        {/* Estado */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Estado</h2>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                  transaction.status
                )}`}
              >
                {getStatusText(transaction.status)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Monto</p>
              <p className="text-3xl font-bold text-purple-600">
                ${transaction.amount.toFixed(2)}
              </p>
            </div>
          </div>

          {transaction.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800">
                ⏳ Esta transacción está pendiente de procesamiento. Te notificaremos cuando se complete.
              </p>
            </div>
          )}

          {transaction.status === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-red-800">
                ❌ Esta transacción falló. Por favor contacta a soporte para más información.
              </p>
            </div>
          )}
        </div>

        {/* Información de la Transacción */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Información de la Transacción</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tipo</p>
              <p className="font-semibold">
                {getTypeIcon(transaction.type)} {getTypeText(transaction.type)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Referencia</p>
              <p className="font-semibold font-mono text-sm">
                {transaction.transaction_reference || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Método de Pago</p>
              <p className="font-semibold">{transaction.payment_method || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Fecha</p>
              <p className="font-semibold">
                {new Date(transaction.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600 mb-1">Descripción</p>
              <p className="font-semibold">{transaction.description}</p>
            </div>
          </div>
        </div>

        {/* Ayuda */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">¿Necesitas ayuda?</h4>
              <p className="text-sm text-blue-800 mb-3">
                Si tienes alguna pregunta sobre esta transacción, nuestro equipo de soporte está aquí para ayudarte.
              </p>
              <button
                onClick={() => router.push('/empresa/mensajes')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Contactar Soporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
