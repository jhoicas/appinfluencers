'use client';

import { useEffect, useState } from 'react';
import { ButtonSpinner } from '@/components/ui/spinner';

interface FacebookLoginButtonProps {
  onSuccess: (accessToken: string, userData: any) => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export default function FacebookLoginButton({ onSuccess, onError }: FacebookLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    // Cargar el SDK de Facebook
    if (document.getElementById('facebook-jssdk')) {
      setSdkLoaded(true);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'TU_APP_ID', // Configura esto en .env.local
        cookie: true,
        xfbml: true,
        version: 'v20.0'
      });
      setSdkLoaded(true);
    };

    // Cargar el script del SDK
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/es_LA/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.getElementById('facebook-jssdk');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const handleFacebookLogin = () => {
    if (!window.FB) {
      console.error('Facebook SDK no está cargado');
      return;
    }

    setIsLoading(true);

    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          
          // Obtener información del usuario
          window.FB.api('/me', { fields: 'id,name,email,picture' }, (userData: any) => {
            console.log('Usuario de Facebook:', userData);
            onSuccess(accessToken, userData);
            setIsLoading(false);
          });
        } else {
          console.log('Usuario canceló el login o no autorizó');
          if (onError) {
            onError(new Error('Login cancelado'));
          }
          setIsLoading(false);
        }
      },
      { scope: 'public_profile,email' }
    );
  };

  return (
    <button
      type="button"
      onClick={handleFacebookLogin}
      disabled={isLoading || !sdkLoaded}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
    >
      {isLoading ? (
        <>
          <ButtonSpinner />
          <span>Conectando...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Continuar con Facebook</span>
        </>
      )}
    </button>
  );
}
