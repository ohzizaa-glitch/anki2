import React from "react";

interface MascotProps {
  className?: string;
  size?: number;
  mood?: "happy" | "excited" | "waving" | "listening" | "thinking";
}

export const PinkBlobMascot: React.FC<MascotProps> = ({
  className = "",
  size = 72,
  mood = "waving",
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-sm"
      >
        {/* Left hand waving */}
        <path
          d="M18 52 C8 44, 4 30, 10 24 C14 20, 20 28, 26 42"
          stroke="#1e293b"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="animate-pulse origin-bottom-right"
        />

        {/* Right hand waving */}
        <path
          d="M82 52 C92 44, 96 30, 90 24 C86 20, 80 28, 74 42"
          stroke="#1e293b"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="animate-pulse origin-bottom-left"
        />

        {/* Left leg */}
        <path
          d="M38 82 L34 96"
          stroke="#1e293b"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Right leg */}
        <path
          d="M62 82 L66 96"
          stroke="#1e293b"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Main Body (Cute pink sphere/blob) */}
        <circle
          cx="50"
          cy="52"
          r="34"
          fill="#ff6b9d"
          className="transition-transform duration-300"
        />

        {/* Highlight sheen */}
        <ellipse
          cx="42"
          cy="34"
          rx="10"
          ry="6"
          fill="#ffa3c2"
          opacity="0.6"
        />

        {/* Left eye */}
        <circle cx="41" cy="48" r="3.8" fill="#1e293b" />
        <circle cx="42.5" cy="46.5" r="1.3" fill="#ffffff" />

        {/* Right eye */}
        <circle cx="59" cy="48" r="3.8" fill="#1e293b" />
        <circle cx="60.5" cy="46.5" r="1.3" fill="#ffffff" />

        {/* Cute blush cheeks */}
        <ellipse cx="34" cy="55" rx="4.5" ry="2.5" fill="#e11d48" opacity="0.35" />
        <ellipse cx="66" cy="55" rx="4.5" ry="2.5" fill="#e11d48" opacity="0.35" />

        {/* Smile */}
        <path
          d="M45 56 Q50 63 55 56"
          stroke="#1e293b"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

export const BlueCubeMascot: React.FC<MascotProps> = ({
  className = "",
  size = 72,
  mood = "listening",
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-sm"
      >
        {/* Headphone Band */}
        <path
          d="M20 45 C20 18, 80 18, 80 45"
          stroke="#1e293b"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left Ear Cushion */}
        <rect
          x="12"
          y="40"
          width="10"
          height="22"
          rx="5"
          fill="#1e293b"
        />

        {/* Right Ear Cushion */}
        <rect
          x="78"
          y="40"
          width="10"
          height="22"
          rx="5"
          fill="#1e293b"
        />

        {/* Left leg */}
        <path
          d="M38 84 L36 96"
          stroke="#1e293b"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Right leg */}
        <path
          d="M62 84 L64 96"
          stroke="#1e293b"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Body - Rounded Soft Square Cube */}
        <rect
          x="20"
          y="32"
          width="60"
          height="54"
          rx="16"
          fill="#818cf8"
        />

        {/* Subtle cube lighting */}
        <rect
          x="24"
          y="36"
          width="52"
          height="20"
          rx="10"
          fill="#a5b4fc"
          opacity="0.4"
        />

        {/* Left eye */}
        <circle cx="40" cy="56" r="3.8" fill="#1e293b" />
        <circle cx="41.5" cy="54.5" r="1.3" fill="#ffffff" />

        {/* Right eye */}
        <circle cx="60" cy="56" r="3.8" fill="#1e293b" />
        <circle cx="61.5" cy="54.5" r="1.3" fill="#ffffff" />

        {/* Soft Cheeks */}
        <ellipse cx="32" cy="62" rx="4" ry="2" fill="#4338ca" opacity="0.3" />
        <ellipse cx="68" cy="62" rx="4" ry="2" fill="#4338ca" opacity="0.3" />

        {/* Smile */}
        <path
          d="M46 63 Q50 69 54 63"
          stroke="#1e293b"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

export const RetroStar: React.FC<{ className?: string; size?: number; color?: string }> = ({
  className = "",
  size = 40,
  color = "#d4b886",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`select-none opacity-20 pointer-events-none ${className}`}
      fill={color}
    >
      {/* 8-pointed playful retro star like the reference background */}
      <path d="M50 0 L56 36 L92 20 L66 48 L100 50 L66 52 L92 80 L56 64 L50 100 L44 64 L8 80 L34 52 L0 50 L34 48 L8 20 L44 36 Z" />
    </svg>
  );
};

export const SpeechBubble: React.FC<{
  text: string;
  tailDirection?: "left" | "right" | "top" | "bottom";
  className?: string;
}> = ({ text, tailDirection = "left", className = "" }) => {
  return (
    <div
      className={`relative inline-block px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md select-none transition-all ${className}`}
    >
      {text}
      {/* Little tail */}
      {tailDirection === "left" && (
        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-inherit rotate-45" />
      )}
      {tailDirection === "right" && (
        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-inherit rotate-45" />
      )}
      {tailDirection === "bottom" && (
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-inherit rotate-45" />
      )}
    </div>
  );
};
