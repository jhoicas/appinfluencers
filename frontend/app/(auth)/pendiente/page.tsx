'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';

export default function PendientePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Logo size={80} />
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⏳</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Cuenta Pendiente de Aprobación
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            Tu cuenta de influencer está siendo revisada por nuestro equipo de administración.
            Te notificaremos por correo electrónico cuando tu cuenta sea aprobada y puedas comenzar
            a usar la plataforma.
          </p>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">¿Qué sigue?</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✅ Revisaremos tu perfil</li>
              <li>📧 Te enviaremos un correo de confirmación</li>
              <li>🚀 Podrás acceder a todas las funciones</li>
            </ul>
          </div>

          {/* Time estimate */}
          <p className="text-sm text-gray-500 mb-6">
            Este proceso suele tomar entre 24-48 horas
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              Volver al Login
            </Link>
            <Link
              href="/"
              className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Ir al Inicio
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-600">
              ¿Tienes preguntas?{' '}
              <a href="mailto:soporte@influencers.com" className="text-purple-600 hover:text-purple-800 font-semibold">
                Contacta a soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
