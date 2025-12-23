'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface SyncSocialMediaProps {
  onSyncComplete?: () => void;
}

export default function SyncSocialMedia({ onSyncComplete }: SyncSocialMediaProps) {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<'instagram' | 'tiktok' | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      // TODO: Implement /social-media/config endpoint
      // const response = await api.get('/social-media/config');
      const response = { data: { facebook_app_id: null } }; // Mock response
      setConfig(response.data);
    } catch (error) {
      console.error('Error fetching social media config:', error);
    }
  };

  const syncInstagram = async () => {
    if (!config?.instagram_configured) {
      alert('Instagram API no está configurada. Contacta al administrador.');
      return;
    }

    setSyncing('instagram');
    setLoading(true);

    try {
      // Iniciar flujo de OAuth de Instagram
      const appId = config.facebook_app_id;
      const redirectUri = encodeURIComponent(window.location.origin + '/influencer/perfil');
      const scope = 'instagram_basic,instagram_manage_insights';
      
      // Abrir ventana de autenticación
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token`;
      
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const authWindow = window.open(
        authUrl,
        'Instagram Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Escuchar el mensaje de la ventana de autenticación
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'instagram_auth_success') {
          const { accessToken, userId } = event.data;
          
          try {
            // Llamar al backend para sincronizar
            const response = await api.post('/social-media/instagram/sync', {
              instagram_user_id: userId,
              access_token: accessToken
            });
            
            alert('✅ Instagram sincronizado exitosamente!');
            if (onSyncComplete) onSyncComplete();
          } catch (error: any) {
            console.error('Error syncing Instagram:', error);
            alert('❌ Error al sincronizar Instagram: ' + (error.response?.data?.detail || error.message));
          }
          
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Timeout de 5 minutos
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        if (authWindow && !authWindow.closed) {
          authWindow.close();
        }
      }, 300000);

    } catch (error: any) {
      console.error('Error initiating Instagram sync:', error);
      alert('❌ Error al iniciar sincronización de Instagram');
    } finally {
      setLoading(false);
      setSyncing(null);
    }
  };

  const syncTikTok = async () => {
    if (!config?.tiktok_configured) {
      alert('TikTok API no está configurada. Contacta al administrador.');
      return;
    }

    setSyncing('tiktok');
    setLoading(true);

    try {
      // Iniciar flujo de OAuth de TikTok
      const clientKey = config.tiktok_client_key;
      const redirectUri = encodeURIComponent(window.location.origin + '/influencer/perfil');
      const scope = 'user.info.basic,video.list';
      
      const authUrl = `https://www.tiktok.com/v2/auth/authorize?client_key=${clientKey}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
      
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const authWindow = window.open(
        authUrl,
        'TikTok Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Escuchar el mensaje de la ventana de autenticación
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'tiktok_auth_success') {
          const { accessToken } = event.data;
          
          try {
            // Llamar al backend para sincronizar
            const response = await api.post('/social-media/tiktok/sync', {
              access_token: accessToken
            });
            
            alert('✅ TikTok sincronizado exitosamente!');
            if (onSyncComplete) onSyncComplete();
          } catch (error: any) {
            console.error('Error syncing TikTok:', error);
            alert('❌ Error al sincronizar TikTok: ' + (error.response?.data?.detail || error.message));
          }
          
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Timeout de 5 minutos
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        if (authWindow && !authWindow.closed) {
          authWindow.close();
        }
      }, 300000);

    } catch (error: any) {
      console.error('Error initiating TikTok sync:', error);
      alert('❌ Error al iniciar sincronización de TikTok');
    } finally {
      setLoading(false);
      setSyncing(null);
    }
  };

  if (!config) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Sincronizar Redes Sociales</h3>
      <p className="text-sm text-gray-600 mb-6">
        Actualiza tus insights conectándote a tus cuentas de redes sociales. Los datos se guardarán en nuestra base de datos.
      </p>

      <div className="space-y-4">
        {/* Instagram */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Instagram</p>
              <p className="text-xs text-gray-500">
                {config.instagram_configured ? 'Configurado' : 'No configurado'}
              </p>
            </div>
          </div>
          <button
            onClick={syncInstagram}
            disabled={loading || !config.instagram_configured}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
          >
            {syncing === 'instagram' ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>

        {/* TikTok */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">TikTok</p>
              <p className="text-xs text-gray-500">
                {config.tiktok_configured ? 'Configurado' : 'No configurado'}
              </p>
            </div>
          </div>
          <button
            onClick={syncTikTok}
            disabled={loading || !config.tiktok_configured}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
          >
            {syncing === 'tiktok' ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 text-xl">ℹ️</span>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Cómo funciona:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Los insights se guardan en nuestra base de datos</li>
              <li>Siempre verás los datos guardados más recientes</li>
              <li>Haz clic en "Sincronizar" para actualizar con datos nuevos de las APIs</li>
              <li>La sincronización puede tardar unos segundos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
