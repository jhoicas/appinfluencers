'use client';

import { useSearchProfiles } from '@/services/profileService';
import { useAuth } from '@/hooks/useAuth';
import ProfileCard from '@/components/features/ProfileCard';
import TrialPaywall from '@/components/features/TrialPaywall';
import { LoadingScreen } from '@/components/ui/spinner';
import Container from '@/components/layout/Container';
import { useState } from 'react';

export default function ExplorarPage() {
  const { data: profiles, isLoading } = useSearchProfiles();
  const { trialStatus } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);

  const canViewProfile = (profileId: number) => {
    if (!trialStatus) return true; // Has subscription

    if (!trialStatus.is_active) {
      return false;
    }

    if (trialStatus.has_viewed_free_profile && !trialStatus.can_view_more_profiles) {
      return false;
    }

    return true;
  };

  const handleProfileClick = (profileId: number) => {
    if (!canViewProfile(profileId)) {
      setShowPaywall(true);
      return;
    }

    window.location.href = `/empresa/perfil/${profileId}`;
  };

  if (isLoading) {
    return <LoadingScreen message="Cargando influencers..." variant="wave" />;
  }

  return (
    <Container size="xl" className="overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-6">Explorar Influencers</h1>

      {trialStatus?.is_active && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            🎁 <strong>Trial Activo:</strong> {trialStatus.hours_remaining?.toFixed(1)} horas restantes.
            {trialStatus.has_viewed_free_profile ? ' Ya usaste tu vista gratuita.' : ' Puedes ver 1 perfil completo gratis.'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles?.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isLocked={!canViewProfile(profile.id)}
            onClick={() => handleProfileClick(profile.id)}
          />
        ))}
      </div>

      {showPaywall && (
        <TrialPaywall onClose={() => setShowPaywall(false)} />
      )}
    </Container>
  );
}
