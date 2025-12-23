'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="flex justify-center mb-6">
          <Logo size={120} />
        </div>
        <p className="text-xl text-gray-700 mb-8">
          Conecta marcas con influencers de manera fácil y efectiva
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/registro" 
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            Registrarse
          </Link>
          <Link 
            href="/login" 
            className="px-8 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition font-semibold"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
