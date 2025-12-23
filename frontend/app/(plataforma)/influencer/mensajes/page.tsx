'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function InfluencerMensajesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mensajes</h1>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No tienes mensajes aún
          </h2>
          <p className="text-gray-600 mb-6">
            Cuando las empresas te contacten, las conversaciones aparecerán aquí
          </p>
          <button
            onClick={() => router.push('/influencer/perfil')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Completar Mi Perfil
          </button>
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
