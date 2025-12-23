'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

interface Transaction {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  payment_method: string;
  transaction_reference: string;
  created_at: string;
  updated_at: string;
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);

  const transactionId = params.id as string;

  useEffect(() => {
    fetchTransaction();
  }, [transactionId]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/transactions/${transactionId}`);
      setTransaction(response.data);
    } catch (error) {
      console.error('Error fetching transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`¿Estás seguro de cambiar el estado a ${newStatus}?`)) {
      return;
    }

    try {
      setUpdating(true);
      await api.put(`/transactions/${transactionId}`, { status: newStatus });
      alert('Estado actualizado exitosamente');
      fetchTransaction();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert('Por favor escribe un mensaje');
      return;
    }

    try {
      setUpdating(true);
      // TODO: Implementar endpoint de mensajes
      await api.post('/messages/', {
        receiver_id: transaction?.user_id,
        content: message,
      });
      alert('Mensaje enviado exitosamente');
      setMessage('');
      setShowMessageModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setUpdating(false);
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
            onClick={() => router.push('/admin/transacciones')}
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
            onClick={() => router.push('/admin/transacciones')}
            className="text-purple-600 hover:text-purple-800 mb-4 inline-flex items-center"
          >
            ← Volver a Transacciones
          </button>
          <h1 className="text-3xl font-bold">Detalle de Transacción #{transaction.id}</h1>
        </div>

        {/* Estado y Acciones */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Estado Actual</h2>
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

          {/* Acciones de Estado */}
          {transaction.status === 'pending' && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Gestionar Transacción</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateStatus('completed')}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  ✅ Marcar como Completada
                </button>
                <button
                  onClick={() => handleUpdateStatus('failed')}
                  disabled={updating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  ❌ Marcar como Fallida
                </button>
                <button
                  onClick={() => handleUpdateStatus('cancelled')}
                  disabled={updating}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  🚫 Cancelar
                </button>
              </div>
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
              <p className="text-sm text-gray-600 mb-1">Fecha de Creación</p>
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

        {/* Información del Cliente */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {transaction.user_name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-lg">{transaction.user_name}</p>
                <p className="text-gray-600">{transaction.user_email}</p>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <button
                onClick={() => setShowMessageModal(true)}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                💬 Enviar Mensaje al Cliente
              </button>
            </div>
          </div>
        </div>

        {/* Historial */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Historial</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="font-semibold">Transacción Creada</p>
                <p className="text-sm text-gray-600">
                  {new Date(transaction.created_at).toLocaleString('es-ES')}
                </p>
              </div>
            </div>
            {transaction.updated_at !== transaction.created_at && (
              <div className="flex items-start gap-3 pb-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-semibold">Última Actualización</p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.updated_at).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Mensaje */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Enviar Mensaje</h3>
            <p className="text-gray-600 mb-4">
              Enviar mensaje a: <strong>{transaction.user_name}</strong>
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 mb-4"
              rows={5}
              placeholder="Escribe tu mensaje aquí..."
            />
            <div className="flex gap-3">
              <button
                onClick={handleSendMessage}
                disabled={updating || !message.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {updating ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessage('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
