'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ButtonSpinner } from '@/components/ui/spinner';
import Container from '@/components/layout/Container';

export default function CrearPerfilPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    instagram_handle: '',
    tiktok_handle: '',
    youtube_handle: '',
    followers_count: '',
    engagement_rate: '',
    categories: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Convertir categorías de string a lista
      const categoriesArray = formData.categories
        .split(',')
        .map(c => c.trim())
        .filter(c => c);

      console.log('Categories raw input string:', formData.categories);
      console.log('CategoriesArray built:', categoriesArray, 'isArray?', Array.isArray(categoriesArray), 'typeof:', typeof categoriesArray);

      const payload = {
        bio: formData.bio,
        instagram_handle: formData.instagram_handle || null,
        instagram_followers: parseInt(formData.followers_count) || 0,
        tiktok_handle: formData.tiktok_handle || null,
        youtube_handle: formData.youtube_handle || null,
        average_engagement_rate: parseFloat(formData.engagement_rate) || 0,
        categories: Array.isArray(categoriesArray) ? categoriesArray : Object.values(categoriesArray as any),
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));
      // Enviar explícitamente como JSON para preservar arrays
      await api.post('/profiles/', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      alert('¡Perfil creado exitosamente!');
      router.push('/influencer/perfil');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      const errorMsg = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail))
        : error.message;
      alert('Error al crear el perfil: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="lg" className="overflow-x-hidden">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <h1 className="text-3xl font-bold mb-6">Crear Mi Perfil de Influencer</h1>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Biografía */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Biografía <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={4}
                placeholder="Cuéntanos sobre ti, tu contenido y tu audiencia..."
                required
              />
            </div>

            {/* Redes Sociales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Número de Seguidores <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.followers_count}
                  onChange={(e) => setFormData({...formData, followers_count: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="10000"
                  required
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total de seguidores en tu red principal
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Engagement Rate (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.engagement_rate}
                  onChange={(e) => setFormData({...formData, engagement_rate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="3.5"
                  required
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Promedio de interacción con tu contenido
                </p>
              </div>
            </div>

            {/* Categorías */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Categorías de Contenido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.categories}
                onChange={(e) => setFormData({...formData, categories: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Moda, Belleza, Lifestyle"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Separa las categorías con comas. Ej: Tecnología, Gaming, Reviews
              </p>
            </div>

            {/* Ejemplos de categorías */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 md:col-span-2">
              <p className="text-sm font-medium text-purple-900 mb-2">
                💡 Categorías sugeridas:
              </p>
              <div className="flex flex-wrap gap-2">
                {['Moda', 'Belleza', 'Tecnología', 'Gaming', 'Fitness', 'Comida', 'Viajes', 'Lifestyle', 'Educación', 'Entretenimiento'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      const current = formData.categories;
                      const newValue = current ? `${current}, ${cat}` : cat;
                      setFormData({...formData, categories: newValue});
                    }}
                    className="px-3 py-1 bg-white border border-purple-300 rounded-full text-sm text-purple-700 hover:bg-purple-100 transition"
                  >
                    + {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4 md:col-span-2">
              <button
                type="button"
                onClick={() => router.back()}
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
                {loading ? 'Creando...' : 'Crear Perfil'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
}
