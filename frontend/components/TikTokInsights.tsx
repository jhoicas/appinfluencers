'use client';

interface TikTokInsightsProps {
  insights: {
    followers: number;
    following: number;
    total_likes: number;
    total_videos: number;
    avg_views: number;
    avg_likes: number;
    avg_comments: number;
    avg_shares: number;
    engagement_rate: number;
    video_views: number;
    profile_views: number;
    top_videos?: Array<{
      id: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      thumbnail_url: string;
    }>;
  } | null;
}

export default function TikTokInsights({ insights }: TikTokInsightsProps) {
  if (!insights) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">TikTok Insights</h3>
            <p className="text-sm text-gray-500">No hay datos disponibles</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Conecta tu cuenta de TikTok para ver insights detallados
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
          <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">TikTok Insights</h3>
            <p className="text-sm text-gray-500">Datos guardados en base de datos</p>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-black to-gray-800 rounded-lg text-white">
          <p className="text-2xl font-bold">{formatNumber(insights.followers)}</p>
          <p className="text-xs opacity-80 mt-1">Seguidores</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg text-white">
          <p className="text-2xl font-bold">{formatNumber(insights.total_likes)}</p>
          <p className="text-xs opacity-80 mt-1">Likes Totales</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg text-white">
          <p className="text-2xl font-bold">{insights.engagement_rate.toFixed(2)}%</p>
          <p className="text-xs opacity-80 mt-1">Engagement</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white">
          <p className="text-2xl font-bold">{formatNumber(insights.total_videos)}</p>
          <p className="text-xs opacity-80 mt-1">Videos</p>
        </div>
      </div>

      {/* Métricas Detalladas */}
      <div className="p-6 border-t">
        <h4 className="font-semibold text-gray-900 mb-4">Métricas Detalladas</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl">👁️</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{formatNumber(insights.avg_views)}</p>
              <p className="text-xs text-gray-500">Vistas promedio</p>
            </div>
          </div>

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
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{formatNumber(insights.avg_comments)}</p>
              <p className="text-xs text-gray-500">Comentarios promedio</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🔄</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{formatNumber(insights.avg_shares)}</p>
              <p className="text-xs text-gray-500">Compartidos promedio</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-xl">📹</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{formatNumber(insights.video_views)}</p>
              <p className="text-xs text-gray-500">Vistas totales</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{formatNumber(insights.profile_views)}</p>
              <p className="text-xs text-gray-500">Visitas al perfil</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Videos */}
      {insights.top_videos && insights.top_videos.length > 0 && (
        <div className="p-6 border-t">
          <h4 className="font-semibold text-gray-900 mb-4">Top Videos</h4>
          <div className="grid grid-cols-3 gap-3">
            {insights.top_videos.map((video, index) => (
              <div key={video.id} className="relative group">
                <img 
                  src={video.thumbnail_url} 
                  alt={`Top video ${index + 1}`}
                  className="w-full aspect-[9/16] object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="text-white text-center text-xs">
                    <p className="font-semibold">👁️ {formatNumber(video.views)}</p>
                    <p>❤️ {formatNumber(video.likes)}</p>
                    <p>💬 {formatNumber(video.comments)}</p>
                    <p>🔄 {formatNumber(video.shares)}</p>
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
