'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

interface Conversation {
  user_id: number;
  user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function MensajesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      // Por ahora, simulamos datos ya que el endpoint de mensajes puede no estar implementado
      // En producción, esto llamaría a: api.get('/messages/conversations')
      setConversations([]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando mensajes...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mensajes</h1>

        {conversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No tienes mensajes aún
            </h2>
            <p className="text-gray-600 mb-6">
              Cuando contactes a influencers, tus conversaciones aparecerán aquí
            </p>
            <button
              onClick={() => router.push('/empresa/explorar')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Explorar Influencers
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y">
              {conversations.map((conv) => (
                <div
                  key={conv.user_id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => router.push(`/empresa/mensajes/${conv.user_id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {conv.user_name}
                        </h3>
                        {conv.unread_count > 0 && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {conv.last_message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 ml-4">
                      {new Date(conv.last_message_time).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
      </div>
    </div>
  );
}
