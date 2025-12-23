'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      // La redirección se maneja en AuthContext.login()
    } catch (err: any) {
      // Manejar diferentes tipos de errores
      if (err.response?.status === 403) {
        const detail = err.response?.data?.detail || '';
        if (detail.includes('pending approval')) {
          // Redirigir a página de pendiente
          router.push('/pendiente');
          return;
        } else if (detail.includes('inactive')) {
          setError('❌ Tu cuenta ha sido desactivada. Contacta al soporte para más información.');
        } else {
          setError(detail);
        }
      } else if (err.response?.status === 401) {
        setError('❌ Correo electrónico o contraseña incorrectos.');
      } else {
        setError('❌ Error al iniciar sesión. Por favor intenta de nuevo.');
      }
    }
  };


  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="w-full max-w-sm border rounded-lg p-6 bg-white shadow-lg">
        <div className="flex justify-center mb-4">
          <Logo size={60} />
        </div>
        <h1 className="text-2xl font-bold mb-1 text-center">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">Accede a tu cuenta para continuar</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-transparent"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>

        <div className="text-xs text-muted-foreground mt-6 text-center">
          ¿No tienes cuenta? <Link className="underline" href="/registro">Regístrate</Link>
        </div>
      </div>
    </div>
  );
}
