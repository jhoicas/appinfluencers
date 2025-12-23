'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100';
  };

  // Menú para EMPRESA
  const empresaMenu = [
    { href: '/empresa/dashboard', icon: '🏠', label: 'Dashboard' },
    { href: '/empresa/explorar', icon: '🔍', label: 'Explorar Influencers' },
    { href: '/empresa/campanas', icon: '📊', label: 'Mis Campañas' },
    { href: '/empresa/mensajes', icon: '💬', label: 'Mensajes' },
    { href: '/empresa/planes', icon: '💎', label: 'Planes' },
  ];

  // Menú para INFLUENCER
  const influencerMenu = [
    { href: '/influencer/dashboard', icon: '🏠', label: 'Dashboard' },
    { href: '/influencer/perfil', icon: '👤', label: 'Mi Perfil' },
    { href: '/influencer/campanas', icon: '📊', label: 'Mis Campañas' },
    { href: '/influencer/mensajes', icon: '💬', label: 'Mensajes' },
  ];

  // Menú para ADMIN
  const adminMenu = [
    { href: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
    { href: '/admin/usuarios', icon: '👥', label: 'Usuarios' },
    { href: '/admin/planes', icon: '💎', label: 'Planes' },
    { href: '/admin/estadisticas', icon: '📊', label: 'Estadísticas' },
  ];

  // Seleccionar el menú según el rol
  let menu: Array<{ href: string; icon: string; label: string }> = [];
  if (user.role === 'EMPRESA') menu = empresaMenu;
  else if (user.role === 'INFLUENCER') menu = influencerMenu;
  else if (user.role === 'ADMIN') menu = adminMenu;

  return (
    <aside className="w-64 border-r h-full bg-white hidden md:block">
      <div className="p-4 border-b bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">
            {user.role === 'EMPRESA' && '🏢'}
            {user.role === 'INFLUENCER' && '⭐'}
            {user.role === 'ADMIN' && '🔐'}
          </span>
          <h2 className="font-bold text-lg text-gray-800">
            {user.role === 'EMPRESA' && 'Empresa'}
            {user.role === 'INFLUENCER' && 'Influencer'}
            {user.role === 'ADMIN' && 'Admin'}
          </h2>
        </div>
        <p className="text-xs text-gray-600 truncate">{user.email}</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {menu.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${isActive(item.href)}`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
