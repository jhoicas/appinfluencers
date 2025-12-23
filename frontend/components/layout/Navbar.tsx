"use client";

import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b bg-white shadow-sm flex items-center px-6">
      <Logo size={35} />
      
      <div className="ml-auto flex items-center gap-4">
        {user && (
          <>
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold uppercase">
                {user.role}
              </span>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                Salir
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
