'use client';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export default function Logo({
  size = 32,
  showText = true,
  textClassName = 'text-xl font-bold text-gray-900',
}: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      {/* N Monogram Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Intemso logo"
      >
        {/* Rounded square background with gradient */}
        <defs>
          <linearGradient
            id="intemso-bg"
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3366ff" />
            <stop offset="1" stopColor="#1333e1" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="9" fill="url(#intemso-bg)" />

        {/* Bold N letterform — continuous stroke */}
        <path
          d="M11 30V10L29 30V10"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Accent spark — opportunity dot */}
        <circle cx="30.5" cy="8" r="2.2" fill="#8eb5ff" />
      </svg>

      {showText && <span className={textClassName}>Intemso</span>}
    </div>
  );
}
