'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import InstagramInsights from '@/components/InstagramInsights';
import TikTokInsights from '@/components/TikTokInsights';

interface Profile {
  id: number;
  user_id: number;
  bio: string;
  profile_picture_url: string;
  instagram_handle: string;
  instagram_followers: number;
  tiktok_handle: string;
  tiktok_followers: number;
  youtube_handle: string;
  youtube_subscribers: number;
  average_engagement_rate: number;
  suggested_rate_per_post: number;
  suggested_rate_per_story: number;
  suggested_rate_per_video: number;
  categories: { [key: string]: string };
  portfolio_items: any;
  total_campaigns_completed: number;
  average_rating: number;
  instagram_insights: any;
  tiktok_insights: any;
  created_at: string;
  updated_at: string;
}

export default function PerfilInfluencerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileId = params.id as string;

  useEffect(() => {
    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/profiles/${profileId}`);
      setProfile(response.data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      
      if (error.response?.status === 402) {
        setError('Tu período de prueba ha expirado. Suscríbete para ver más perfiles.');
      } else if (error.response?.status === 403) {
        setError('Ya has visto tu perfil gratuito durante el período de prueba. Suscríbete para ver más perfiles.');
      } else if (error.response?.status === 404) {
        setError('Perfil no encontrado.');
      } else {
        setError('Error al cargar el perfil. Por favor intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContactar = () => {
    // Redirigir a mensajes o abrir modal de contacto
    router.push(`/empresa/mensajes?influencer=${profile?.user_id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-800 mb-4">⚠️ {error}</h2>
            {error.includes('prueba') && (
              <button
                onClick={() => router.push('/empresa/planes')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Ver Planes de Suscripción
              </button>
            )}
            <button
              onClick={() => router.push('/empresa/explorar')}
              className="ml-4 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Volver a Explorar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Perfil no encontrado</h2>
          <button
            onClick={() => router.push('/empresa/explorar')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Volver a Explorar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile.instagram_handle?.[0]?.toUpperCase() || 'I'}
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  @{profile.instagram_handle || 'Influencer'}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-600">
                    ⭐ {profile.average_rating || 'N/A'} ({profile.total_campaigns_completed} campañas)
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleContactar}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              💬 Contactar
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Biografía</h2>
          <p className="text-gray-700">{profile.bio}</p>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.instagram_followers > 0 && (
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">📷 Instagram</div>
                <div className="text-2xl font-bold">{profile.instagram_followers.toLocaleString()}</div>
                <div className="text-xs text-gray-500">seguidores</div>
              </div>
            )}
            {profile.tiktok_followers > 0 && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">🎵 TikTok</div>
                <div className="text-2xl font-bold">{profile.tiktok_followers.toLocaleString()}</div>
                <div className="text-xs text-gray-500">seguidores</div>
              </div>
            )}
            {profile.youtube_subscribers > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">▶️ YouTube</div>
                <div className="text-2xl font-bold">{profile.youtube_subscribers.toLocaleString()}</div>
                <div className="text-xs text-gray-500">suscriptores</div>
              </div>
            )}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">📊 Engagement</div>
              <div className="text-2xl font-bold">{profile.average_engagement_rate}%</div>
              <div className="text-xs text-gray-500">tasa promedio</div>
            </div>
          </div>
        </div>

        {/* Categorías */}
        {profile.categories && Object.keys(profile.categories).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Categorías</h2>
            <div className="flex flex-wrap gap-2">
              {Object.values(profile.categories).map((cat: string, index: number) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tarifas */}
        {(profile.suggested_rate_per_post || profile.suggested_rate_per_story || profile.suggested_rate_per_video) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Tarifas Sugeridas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.suggested_rate_per_post && (
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Post</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${profile.suggested_rate_per_post.toLocaleString()}
                  </div>
                </div>
              )}
              {profile.suggested_rate_per_story && (
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Story</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${profile.suggested_rate_per_story.toLocaleString()}
                  </div>
                </div>
              )}
              {profile.suggested_rate_per_video && (
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Video</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${profile.suggested_rate_per_video.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instagram Insights */}
        <div className="mb-6">
          <InstagramInsights insights={profile.instagram_insights} />
        </div>

        {/* TikTok Insights */}
        <div className="mb-6">
          <TikTokInsights insights={profile.tiktok_insights} />
        </div>

        {/* Botón volver */}
        <div className="mt-8">
          <button
            onClick={() => router.push('/empresa/explorar')}
            className="text-purple-600 hover:text-purple-800 underline"
          >
            ← Volver a Explorar
          </button>
        </div>
      </div>
    </div>
  );
}
