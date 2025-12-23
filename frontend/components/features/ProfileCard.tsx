'use client';

import { Profile } from '@/lib/validators';

export default function ProfileCard({
  profile,
  isLocked,
  onClick,
}: {
  profile: Profile;
  isLocked?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      role="button"
      onClick={onClick}
      className="border rounded-lg p-4 hover:shadow-sm transition cursor-pointer relative"
    >
      {isLocked && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-lg grid place-content-center text-sm font-medium">
          Bloqueado — requiere suscripción
        </div>
      )}
      <div className="font-semibold">Perfil #{profile.id}</div>
      <div className="text-sm text-muted-foreground">{profile.bio || 'Sin biografía'}</div>
      <div className="mt-2 text-xs text-muted-foreground">Followers IG: {profile.instagram_followers ?? 0}</div>
    </div>
  );
}
