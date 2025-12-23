import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function Logo({ size = 40, className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG Logo inline - Inspirado en el diseño de conexión */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Gradientes */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        
        {/* Círculo inferior (cyan a purple) */}
        <path
          d="M 20 70 Q 15 50, 25 35 Q 35 20, 50 25 Q 60 28, 55 40 Q 52 48, 45 52 Q 35 58, 25 60 Q 18 62, 20 70 Z"
          fill="url(#gradient1)"
          opacity="0.9"
        />
        
        {/* Círculo superior (orange a pink) */}
        <path
          d="M 80 30 Q 85 50, 75 65 Q 65 80, 50 75 Q 40 72, 45 60 Q 48 52, 55 48 Q 65 42, 75 40 Q 82 38, 80 30 Z"
          fill="url(#gradient2)"
          opacity="0.9"
        />
        
        {/* Elemento de conexión central */}
        <ellipse cx="50" cy="50" rx="8" ry="12" fill="url(#gradient1)" opacity="0.8" transform="rotate(45 50 50)"/>
        
        {/* Destellos */}
        <circle cx="15" cy="25" r="3" fill="#F59E0B" opacity="0.7"/>
        <circle cx="25" cy="15" r="2" fill="#F59E0B" opacity="0.6"/>
        <circle cx="85" cy="75" r="3" fill="#EC4899" opacity="0.7"/>
        <circle cx="75" cy="85" r="2" fill="#EC4899" opacity="0.6"/>
        <circle cx="85" cy="15" r="2.5" fill="#F59E0B" opacity="0.7"/>
        <circle cx="15" cy="85" r="2.5" fill="#06B6D4" opacity="0.7"/>
      </svg>
      
      {showText && (
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Influencers
        </span>
      )}
    </div>
  );
}
