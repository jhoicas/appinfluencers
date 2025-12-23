'use client';

interface InstagramInsightsProps {
  insights: {
    followers: number;
    following: number;
    posts_count: number;
    engagement_rate: number;
    avg_likes: number;
    avg_comments: number;
    reach: number;
    impressions: number;
    profile_views: number;
    website_clicks: number;
    top_posts?: Array<{
      id: string;
      likes: number;
      comments: number;
      image_url: string;
    }>;
  } | null;
}

export default function InstagramInsights({ insights }: InstagramInsightsProps) {
  if (!insights) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Instagram Insights</h3>
            <p className="text-sm text-gray-500">No hay datos disponibles</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Conecta tu cuenta de Instagram para ver insights detallados
        </p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Instagram Insights</h3>
            <p className="text-sm text-gray-500">Datos guardados en base de datos</p>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{formatNumber(insights.followers)}</p>
          <p className="text-xs text-gray-600 mt-1">Seguidores</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-orange-50 rounded-lg">
          <p className="text-2xl font-bold text-pink-600">{insights.engagement_rate.toFixed(2)}%</p>
          <p className="text-xs text-gray-600 mt-1">Engagement</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-orange-600">{formatNumber(insights.posts_count)}</p>
          <p className="text-xs text-gray-600 mt-1">Publicaciones</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{formatNumber(insights.reach)}</p>
          <p className="text-xs text-gray-600 mt-1">Alcance</p>
        </div>
      </div>

      {/* Métricas Detalladas */}
      <div className="p-6 border-t">
        <h4 className="font-semibold text-gray-900 mb-4">Métricas Detalladas</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-xl">❤️</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{formatNumber(insights.avg_likes)}</p>
              <p className="text-xs text-gray-500">Likes promedio</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{formatNumber(insights.avg_comments)}</p>
              <p className="text-xs text-gray-500">Comentarios promedio</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xl">👁️</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{formatNumber(insights.impressions)}</p>
              <p className="text-xs text-gray-500">Impresiones</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{formatNumber(insights.profile_views)}</p>
              <p className="text-xs text-gray-500">Visitas al perfil</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🔗</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{formatNumber(insights.website_clicks)}</p>
              <p className="text-xs text-gray-500">Clics al sitio web</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{formatNumber(insights.following)}</p>
              <p className="text-xs text-gray-500">Siguiendo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Posts */}
      {insights.top_posts && insights.top_posts.length > 0 && (
        <div className="p-6 border-t">
          <h4 className="font-semibold text-gray-900 mb-4">Top Posts</h4>
          <div className="grid grid-cols-3 gap-3">
            {insights.top_posts.map((post, index) => (
              <div key={post.id} className="relative group">
                <img 
                  src={post.image_url} 
                  alt={`Top post ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="text-white text-center">
                    <p className="text-sm font-semibold">❤️ {formatNumber(post.likes)}</p>
                    <p className="text-xs">💬 {formatNumber(post.comments)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
