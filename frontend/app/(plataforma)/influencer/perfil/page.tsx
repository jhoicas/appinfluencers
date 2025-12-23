'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import SyncSocialMedia from '@/components/SyncSocialMedia';
import InstagramInsights from '@/components/InstagramInsights';
import TikTokInsights from '@/components/TikTokInsights';
import { LoadingScreen, ButtonSpinner } from '@/components/ui/spinner';
import Container from '@/components/layout/Container';

interface Profile {
  id: number;
  bio: string;
  instagram_handle: string;
  instagram_followers: number;
  tiktok_handle: string;
  tiktok_followers: number;
  youtube_handle: string;
  youtube_subscribers: number;
  average_engagement_rate: number;
  categories: { [key: string]: string };
  instagram_insights: any;
  tiktok_insights: any;
}

const AVAILABLE_CATEGORIES = [
  'Moda', 'Belleza', 'Fitness', 'Viajes', 'Comida', 'Tecnología',
  'Gaming', 'Música', 'Arte', 'Lifestyle', 'Negocios', 'Educación',
  'Deportes', 'Fotografía', 'Cine', 'Salud', 'Mascotas', 'Otro'
];

export default function InfluencerPerfilPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    bio: '',
    instagram_handle: '',
    instagram_followers: '',
    tiktok_handle: '',
    youtube_handle: '',
    average_engagement_rate: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profiles/me');
      setProfile(response.data);
      
      // Inicializar formData con los datos del perfil
        // Manejar categories como array (nuevo formato) u objeto (legacy)
        let categoriesArray: string[] = [];
        if (response.data.categories) {
          categoriesArray = Array.isArray(response.data.categories)
            ? response.data.categories
            : Object.values(response.data.categories);
        }
      
      setFormData({
        bio: response.data.bio || '',
        instagram_handle: response.data.instagram_handle || '',
        instagram_followers: response.data.instagram_followers?.toString() || '',
        tiktok_handle: response.data.tiktok_handle || '',
        youtube_handle: response.data.youtube_handle || '',
        average_engagement_rate: response.data.average_engagement_rate?.toString() || '',
      });
      
      setSelectedCategories(categoriesArray);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No profile yet - redirect to create profile
        router.push('/influencer/perfil/crear');
        return;
      }
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const payload = {
        bio: formData.bio,
        instagram_handle: formData.instagram_handle || null,
        instagram_followers: parseInt(formData.instagram_followers) || 0,
        tiktok_handle: formData.tiktok_handle || null,
        youtube_handle: formData.youtube_handle || null,
        average_engagement_rate: parseFloat(formData.average_engagement_rate) || 0,
        categories: selectedCategories, // Enviar como array, no como objeto
      };

      console.log('Updating profile with payload:', JSON.stringify(payload, null, 2));
      await api.put('/profiles/me', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      alert('¡Perfil actualizado exitosamente!');
      setEditing(false);
      fetchProfile(); // Recargar datos
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMsg = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail))
        : error.message;
      alert('Error al actualizar el perfil: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando perfil..." variant="orbit" />;
  }

  if (!profile) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Completa tu perfil de influencer
            </h2>
            <p className="text-gray-600 mb-6">
              Crea tu perfil para que las empresas puedan encontrarte y contratarte
            </p>
            <button
              onClick={() => router.push('/influencer/perfil/crear')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Crear Mi Perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <Container size="lg" className="overflow-x-hidden">
        <h1 className="text-3xl font-bold mb-6">Editar Mi Perfil</h1>
        
        <form onSubmit={handleUpdate} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">s-1 md:grid-cols-2 gap-6">
              {/* Biografía */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Biografía
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>

              {/* Redes Sociales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Instagram Handle
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-lg text-gray-600">
                      @
                    </span>
                    <input
                      type="text"
                      value={formData.instagram_handle}
                      onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                      className="flex-1 px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="tu_usuario"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    TikTok Handle
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-lg text-gray-600">
                      @
                    </span>
                    <input
                      type="text"
                      value={formData.tiktok_handle}
                      onChange={(e) => setFormData({...formData, tiktok_handle: e.target.value})}
                      className="flex-1 px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="tu_usuario"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    YouTube Handle
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-lg text-gray-600">
                      @
                    </span>
                    <input
                      type="text"
                      value={formData.youtube_handle}
                      onChange={(e) => setFormData({...formData, youtube_handle: e.target.value})}
                      className="flex-1 px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="tu_canal"
                    />
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Seguidores en Instagram
                  </label>
                  <input
                    type="number"
                    value={formData.instagram_followers}
                    onChange={(e) => setFormData({...formData, instagram_followers: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="10000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Engagement Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.average_engagement_rate}
                    onChange={(e) => setFormData({...formData, average_engagement_rate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="3.5"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Categorías */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Categorías de Contenido
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {AVAILABLE_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        if (selectedCategories.includes(category)) {
                          setSelectedCategories(selectedCategories.filter(c => c !== category));
                        } else {
                          setSelectedCategories([...selectedCategories, category]);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg border transition ${
                        selectedCategories.includes(category)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selecciona las categorías que mejor describan tu contenido
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading && <ButtonSpinner size="sm" />}
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </form>
      </Container>
    );
  }

  const handleEditClick = () => {
    // Cargar datos actuales al formulario antes de editar
      let categoriesArray: string[] = [];
      if (profile.categories) {
        categoriesArray = Array.isArray(profile.categories)
          ? profile.categories
          : Object.values(profile.categories);
      }
    
    setFormData({
      bio: profile.bio || '',
      instagram_handle: profile.instagram_handle || '',
      instagram_followers: profile.instagram_followers?.toString() || '',
      tiktok_handle: profile.tiktok_handle || '',
      youtube_handle: profile.youtube_handle || '',
      average_engagement_rate: profile.average_engagement_rate?.toString() || '',
    });
    
    setSelectedCategories(categoriesArray);
    setEditing(true);
  };

  return (
    <Container size="lg" className="overflow-x-hidden">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <button
            onClick={handleEditClick}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            ✏️ Editar Perfil
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Biografía</h3>
              <p className="text-gray-700">{profile.bio}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Redes Sociales</h3>
              <div className="space-y-2">
                {profile.instagram_handle && (
                  <div className="flex items-center">
                    <span className="text-pink-600 mr-2">📷 Instagram:</span>
                    <span>@{profile.instagram_handle}</span>
                  </div>
                )}
                {profile.tiktok_handle && (
                  <div className="flex items-center">
                    <span className="text-black mr-2">🎵 TikTok:</span>
                    <span>@{profile.tiktok_handle}</span>
                  </div>
                )}
                {profile.youtube_handle && (
                  <div className="flex items-center">
                    <span className="text-red-600 mr-2">▶️ YouTube:</span>
                    <span>@{profile.youtube_handle}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="text-sm text-gray-600 mb-1">Seguidores Instagram</h4>
                <p className="text-2xl font-bold">{profile.instagram_followers?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="text-sm text-gray-600 mb-1">Engagement Rate</h4>
                <p className="text-2xl font-bold">{profile.average_engagement_rate || 0}%</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Categorías</h3>
              <div className="flex flex-wrap gap-2">
                 {profile.categories && (Array.isArray(profile.categories) ? profile.categories : Object.values(profile.categories)).map((cat: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sincronizar Redes Sociales */}
        <div className="mt-8">
          <SyncSocialMedia onSyncComplete={fetchProfile} />
        </div>

        {/* Instagram Insights */}
        {profile.instagram_insights && (
          <div className="mt-8">
            <InstagramInsights insights={profile.instagram_insights} />
          </div>
        )}

        {/* TikTok Insights */}
        {profile.tiktok_insights && (
          <div className="mt-8">
            <TikTokInsights insights={profile.tiktok_insights} />
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
    </Container>
  );
}
