'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';

interface TrialPaywallProps {
  onClose: () => void;
}

export default function TrialPaywall({ onClose }: TrialPaywallProps) {
  const { trialStatus } = useAuth();

  const handleSubscribe = () => {
    window.location.href = '/empresa/suscripcion';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">🔒 Suscripción Requerida</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {trialStatus?.has_viewed_free_profile ? (
            <p className="text-muted-foreground">
              Ya utilizaste tu vista gratuita durante el trial de 24 horas.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Tu trial de 24 horas ha expirado.
            </p>
          )}

          <div className="bg-primary/10 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">
              {formatCurrency(49900)}
              <span className="text-base font-normal text-muted-foreground">/mes</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Acceso ilimitado a todos los perfiles
            </p>
          </div>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Ver perfiles ilimitados
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Crear campañas ilimitadas
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Mensajería directa con influencers
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Soporte prioritario
            </li>
          </ul>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubscribe} className="flex-1">
              Suscribirse Ahora
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
