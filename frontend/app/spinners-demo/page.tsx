'use client';

import { Spinner, LoadingScreen, ButtonSpinner } from '@/components/ui/spinner';
import { useState } from 'react';

export default function SpinnerShowcase() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Spinners Personalizados</h1>
        <p className="text-muted-foreground">Diferentes variantes de spinners únicos para la aplicación</p>
      </div>

      {/* Orbit Spinner */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Orbit (Orbital)</h2>
        <p className="text-sm text-muted-foreground">Perfecto para: Cargas de página, verificación de sesión</p>
        <div className="flex items-center gap-8 p-8 bg-muted/20 rounded-lg">
          <Spinner size="sm" variant="orbit" />
          <Spinner size="md" variant="orbit" />
          <Spinner size="lg" variant="orbit" />
          <Spinner size="xl" variant="orbit" />
        </div>
      </div>

      {/* Wave Spinner */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Wave (Olas)</h2>
        <p className="text-sm text-muted-foreground">Perfecto para: Carga de listas, búsquedas, filtros</p>
        <div className="flex items-center gap-8 p-8 bg-muted/20 rounded-lg">
          <Spinner size="sm" variant="wave" />
          <Spinner size="md" variant="wave" />
          <Spinner size="lg" variant="wave" />
          <Spinner size="xl" variant="wave" />
        </div>
      </div>

      {/* Dots Spinner */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Dots (Puntos)</h2>
        <p className="text-sm text-muted-foreground">Perfecto para: Botones, acciones inline</p>
        <div className="flex items-center gap-8 p-8 bg-muted/20 rounded-lg">
          <Spinner size="sm" variant="dots" />
          <Spinner size="md" variant="dots" />
          <Spinner size="lg" variant="dots" />
          <Spinner size="xl" variant="dots" />
        </div>
      </div>

      {/* Pulse Spinner */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Pulse (Pulso)</h2>
        <p className="text-sm text-muted-foreground">Perfecto para: Estados de espera, notificaciones</p>
        <div className="flex items-center gap-8 p-8 bg-muted/20 rounded-lg">
          <Spinner size="sm" variant="pulse" />
          <Spinner size="md" variant="pulse" />
          <Spinner size="lg" variant="pulse" />
          <Spinner size="xl" variant="pulse" />
        </div>
      </div>

      {/* Infinity Spinner */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Infinity (Infinito)</h2>
        <p className="text-sm text-muted-foreground">Perfecto para: Procesos continuos, sincronización</p>
        <div className="flex items-center gap-8 p-8 bg-muted/20 rounded-lg">
          <Spinner size="sm" variant="infinity" />
          <Spinner size="md" variant="infinity" />
          <Spinner size="lg" variant="infinity" />
          <Spinner size="xl" variant="infinity" />
        </div>
      </div>

      {/* Loading Screen Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Pantallas de Carga Completas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-muted/10">
            <LoadingScreen message="Cargando..." variant="orbit" />
          </div>
          <div className="border rounded-lg p-4 bg-muted/10">
            <LoadingScreen message="Procesando datos..." variant="wave" />
          </div>
        </div>
      </div>

      {/* Button Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Ejemplos en Botones</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 3000);
            }}
            disabled={loading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <ButtonSpinner size="sm" />}
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>

          <button
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 flex items-center gap-2"
          >
            <Spinner size="sm" variant="dots" />
            <span>Cargando datos</span>
          </button>

          <button
            className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 flex items-center gap-2"
          >
            <Spinner size="sm" variant="pulse" />
            <span>Sincronizando</span>
          </button>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="space-y-4 border-t pt-8">
        <h2 className="text-2xl font-semibold">Cómo Usar</h2>
        <div className="space-y-2 text-sm">
          <div className="p-4 bg-muted/20 rounded-lg">
            <p className="font-mono mb-2">import {'{ Spinner, LoadingScreen, ButtonSpinner }'} from '@/components/ui/spinner';</p>
          </div>
          
          <div className="p-4 bg-muted/20 rounded-lg">
            <p className="font-semibold mb-2">Spinner básico:</p>
            <p className="font-mono">&lt;Spinner size="md" variant="orbit" /&gt;</p>
          </div>

          <div className="p-4 bg-muted/20 rounded-lg">
            <p className="font-semibold mb-2">Pantalla de carga completa:</p>
            <p className="font-mono">&lt;LoadingScreen message="Cargando..." variant="wave" /&gt;</p>
          </div>

          <div className="p-4 bg-muted/20 rounded-lg">
            <p className="font-semibold mb-2">Spinner para botones:</p>
            <p className="font-mono">&lt;ButtonSpinner size="sm" /&gt;</p>
          </div>
        </div>
      </div>
    </div>
  );
}
