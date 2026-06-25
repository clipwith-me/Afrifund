interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function Logo({
  variant = 'full',
  className = '',
  iconClassName = '',
  textClassName = ''
}: LogoProps) {
  // Icon: Stylized "A" with African sunrise/horizon
  const LogoIcon = () => (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-10 w-10 ${iconClassName}`}
      aria-hidden="true"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#0284c7', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0369a1', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="sunGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#38bdf8', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Main circle background */}
      <circle cx="24" cy="24" r="23" fill="url(#logoGradient)" />

      {/* African sunrise (semi-circle) */}
      <path
        d="M 12 30 A 12 12 0 0 1 36 30 L 32 30 A 8 8 0 0 0 16 30 Z"
        fill="url(#sunGradient)"
      />

      {/* Stylized "A" - Mountain/Pyramid shape */}
      <path
        d="M 24 10 L 14 34 L 18 34 L 20 28 L 28 28 L 30 34 L 34 34 Z"
        fill="white"
      />

      {/* Horizontal bar of "A" */}
      <rect x="21" y="23" width="6" height="3" fill="white" />

      {/* Bottom horizon line */}
      <line x1="8" y1="36" x2="40" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />

      {/* Small stars/dots representing community */}
      <circle cx="14" cy="18" r="1.5" fill="white" opacity="0.8" />
      <circle cx="34" cy="18" r="1.5" fill="white" opacity="0.8" />
      <circle cx="24" cy="13" r="1.5" fill="white" opacity="0.9" />
    </svg>
  );

  // Full logo with text
  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <LogoIcon />
        <div className="flex flex-col">
          <span className={`text-2xl font-bold leading-tight tracking-tight text-gray-900 ${textClassName}`}>
            AfriFund
          </span>
          <span className="text-xs font-medium tracking-wider text-primary-600">
            FUND AFRICA
          </span>
        </div>
      </div>
    );
  }

  // Icon only
  if (variant === 'icon') {
    return <LogoIcon />;
  }

  // Text only
  return (
    <div className={`flex flex-col ${className}`}>
      <span className={`text-2xl font-bold leading-tight tracking-tight text-gray-900 ${textClassName}`}>
        AfriFund
      </span>
      <span className="text-xs font-medium tracking-wider text-primary-600">
        FUND AFRICA
      </span>
    </div>
  );
}

// Compact horizontal logo for mobile/small spaces
export function LogoCompact({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoGradientCompact" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#0284c7', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0369a1', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="sunGradientCompact" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#38bdf8', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="23" fill="url(#logoGradientCompact)" />
        <path d="M 12 30 A 12 12 0 0 1 36 30 L 32 30 A 8 8 0 0 0 16 30 Z" fill="url(#sunGradientCompact)" />
        <path d="M 24 10 L 14 34 L 18 34 L 20 28 L 28 28 L 30 34 L 34 34 Z" fill="white" />
        <rect x="21" y="23" width="6" height="3" fill="white" />
        <line x1="8" y1="36" x2="40" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="18" r="1.5" fill="white" opacity="0.8" />
        <circle cx="34" cy="18" r="1.5" fill="white" opacity="0.8" />
        <circle cx="24" cy="13" r="1.5" fill="white" opacity="0.9" />
      </svg>
      <span className="text-xl font-bold text-gray-900">AfriFund</span>
    </div>
  );
}

// Animated logo for loading states
export function LogoAnimated({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 animate-pulse"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoGradientAnim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#0284c7', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0369a1', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="sunGradientAnim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#38bdf8', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="23" fill="url(#logoGradientAnim)" />
        <path d="M 12 30 A 12 12 0 0 1 36 30 L 32 30 A 8 8 0 0 0 16 30 Z" fill="url(#sunGradientAnim)" />
        <path d="M 24 10 L 14 34 L 18 34 L 20 28 L 28 28 L 30 34 L 34 34 Z" fill="white" />
        <rect x="21" y="23" width="6" height="3" fill="white" />
        <line x1="8" y1="36" x2="40" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="18" r="1.5" fill="white" opacity="0.8" />
        <circle cx="34" cy="18" r="1.5" fill="white" opacity="0.8" />
        <circle cx="24" cy="13" r="1.5" fill="white" opacity="0.9" />
      </svg>
    </div>
  );
}
