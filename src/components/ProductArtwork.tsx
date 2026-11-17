import { useState } from 'react';
import type { CatalogProduct, FinishId } from '../data/catalog';

interface ProductArtworkProps {
  productId: CatalogProduct['id'];
  finish: FinishId;
  className?: string;
}

const FINISH_PALETTES: Record<
  FinishId,
  { bodyLight: string; bodyMid: string; bodyDark: string; accent: string }
> = {
  sage: {
    bodyLight: '#6b876e',
    bodyMid: '#48634b',
    bodyDark: '#2f4332',
    accent: '#8ca58f',
  },
  basalt: {
    bodyLight: '#464d49',
    bodyMid: '#242926',
    bodyDark: '#121614',
    accent: '#636c67',
  },
  glacier: {
    bodyLight: '#dfe6e2',
    bodyMid: '#b4bdb8',
    bodyDark: '#86918b',
    accent: '#f0f4f2',
  },
};

export function ProductArtwork({
  productId,
  finish,
  className = '',
}: ProductArtworkProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const p = FINISH_PALETTES[finish];
  const uid = `${productId}-${finish}`;

  if (productId === 'material-flask' && !imgFailed) {
    return (
      <img
        src="https://www.gstatic.com/aistudio/starter-apps/flask-applet/flask-order-cutout.webp"
        alt="Material Flask insulated stainless steel bottle"
        className={`product-art-img ${className}`}
        data-finish={finish}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
      />
    );
  }

  if (productId === 'ridge-tumbler') {
    return (
      <svg
        viewBox="0 0 240 240"
        className={`product-art-svg ${className}`}
        role="img"
        aria-label="Ridge Camp Tumbler 450 ml"
      >
        <defs>
          <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.bodyDark} />
            <stop offset="32%" stopColor={p.bodyLight} />
            <stop offset="68%" stopColor={p.bodyMid} />
            <stop offset="100%" stopColor={p.bodyDark} />
          </linearGradient>
          <linearGradient id={`steel-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8d9691" />
            <stop offset="40%" stopColor="#e8eeea" />
            <stop offset="100%" stopColor="#77807b" />
          </linearGradient>
        </defs>
        <ellipse cx="120" cy="206" rx="50" ry="9" fill="rgba(5,8,7,0.22)" />
        {/* Press-in Lid */}
        <path
          d="M72 58 C72 50, 168 50, 168 58 L166 72 L74 72 Z"
          fill="#1b201e"
        />
        <rect x="86" y="45" width="68" height="9" rx="4" fill="#2d3431" />
        {/* Brushed Collar */}
        <rect x="74" y="70" width="92" height="10" rx="2" fill={`url(#steel-${uid})`} />
        {/* Tapered Tumbler Body */}
        <path
          d="M74 80 L166 80 L156 184 C155 193, 142 198, 120 198 C98 198, 85 193, 84 184 Z"
          fill={`url(#body-${uid})`}
        />
        {/* Subtle Rim Specular */}
        <path
          d="M94 84 L99 188"
          stroke={p.accent}
          strokeOpacity="0.28"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Minimal Mountain Emblem */}
        <path
          d="M108 136 L116 123 L122 132 L126 126 L133 136 Z"
          fill="none"
          stroke="rgba(243,246,244,0.65)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (productId === 'summit-canister') {
    return (
      <svg
        viewBox="0 0 240 240"
        className={`product-art-svg ${className}`}
        role="img"
        aria-label="Summit Trail Canister 600 ml"
      >
        <defs>
          <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.bodyDark} />
            <stop offset="30%" stopColor={p.bodyLight} />
            <stop offset="66%" stopColor={p.bodyMid} />
            <stop offset="100%" stopColor={p.bodyDark} />
          </linearGradient>
          <linearGradient id={`steel-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#858e89" />
            <stop offset="42%" stopColor="#e5ebe7" />
            <stop offset="100%" stopColor="#6c7570" />
          </linearGradient>
        </defs>
        <ellipse cx="120" cy="206" rx="56" ry="9" fill="rgba(5,8,7,0.22)" />
        {/* Knurled Wide Lid */}
        <rect x="64" y="48" width="112" height="32" rx="8" fill="#1d2320" />
        <rect x="74" y="42" width="92" height="8" rx="4" fill="#2c3330" />
        {/* Collar Ring */}
        <rect x="68" y="78" width="104" height="11" rx="2" fill={`url(#steel-${uid})`} />
        {/* Wide-mouth Vessel Body */}
        <path
          d="M66 89 L174 89 L174 183 C174 194, 158 199, 120 199 C82 199, 66 194, 66 183 Z"
          fill={`url(#body-${uid})`}
        />
        {/* Silicone Base Ring */}
        <path
          d="M66 178 C66 184, 174 184, 174 178 L174 185 C174 195, 156 199, 120 199 C84 199, 66 195, 66 185 Z"
          fill="#1a1f1d"
          opacity="0.88"
        />
        <path
          d="M88 95 L88 173"
          stroke={p.accent}
          strokeOpacity="0.28"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (productId === 'basecamp-carafe') {
    return (
      <svg
        viewBox="0 0 240 240"
        className={`product-art-svg ${className}`}
        role="img"
        aria-label="Basecamp Pour-Over Carafe 1.0 L"
      >
        <defs>
          <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.bodyDark} />
            <stop offset="32%" stopColor={p.bodyLight} />
            <stop offset="70%" stopColor={p.bodyMid} />
            <stop offset="100%" stopColor={p.bodyDark} />
          </linearGradient>
          <linearGradient id={`steel-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#858e89" />
            <stop offset="40%" stopColor="#edf2ef" />
            <stop offset="100%" stopColor="#6a736e" />
          </linearGradient>
        </defs>
        <ellipse cx="116" cy="208" rx="58" ry="9" fill="rgba(5,8,7,0.22)" />
        {/* Pour-Over Dripper Cone */}
        <path
          d="M66 36 L166 36 L142 74 L90 74 Z"
          fill={`url(#steel-${uid})`}
        />
        <rect x="86" y="74" width="60" height="9" rx="2" fill="#1d2320" />
        {/* Ergonomic Handle */}
        <path
          d="M158 92 C188 92, 190 162, 160 168"
          fill="none"
          stroke="#1d2320"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Spout */}
        <path d="M84 85 L68 78 L80 100 Z" fill={p.bodyDark} />
        {/* Carafe Body */}
        <path
          d="M82 83 L150 83 L164 182 C165 194, 146 200, 116 200 C86 200, 67 194, 68 182 Z"
          fill={`url(#body-${uid})`}
        />
        <path
          d="M95 92 L89 185"
          stroke={p.accent}
          strokeOpacity="0.28"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (productId === 'trail-sling-kit') {
    return (
      <svg
        viewBox="0 0 240 240"
        className={`product-art-svg ${className}`}
        role="img"
        aria-label="Trail Sling and Boot Kit"
      >
        <defs>
          <linearGradient id={`sling-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={p.bodyLight} />
            <stop offset="60%" stopColor={p.bodyMid} />
            <stop offset="100%" stopColor={p.bodyDark} />
          </linearGradient>
        </defs>
        <ellipse cx="120" cy="206" rx="58" ry="8" fill="rgba(5,8,7,0.2)" />
        {/* Crossbody Ripstop Strap Loop */}
        <path
          d="M78 134 C66 64, 152 34, 162 112"
          fill="none"
          stroke="#272e2b"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Anodized Carabiner */}
        <rect
          x="150"
          y="96"
          width="18"
          height="28"
          rx="9"
          fill="none"
          stroke="#88928c"
          strokeWidth="4"
        />
        {/* Ripstop Carrier Sleeve */}
        <rect
          x="74"
          y="110"
          width="74"
          height="74"
          rx="12"
          fill={`url(#sling-${uid})`}
        />
        <line
          x1="74"
          y1="138"
          x2="148"
          y2="138"
          stroke="rgba(17,22,20,0.28)"
          strokeWidth="3"
        />
        {/* Molded Silicone Base Boot */}
        <path
          d="M124 156 L186 156 L184 190 C184 197, 172 200, 155 200 C138 200, 126 197, 126 190 Z"
          fill="#1b201e"
        />
        <ellipse cx="155" cy="156" rx="31" ry="5" fill="#2c3431" />
      </svg>
    );
  }

  // Fallback for Material Flask if image failed
  return (
    <svg
      viewBox="0 0 240 240"
      className={`product-art-svg ${className}`}
      role="img"
      aria-label="Material Flask"
    >
      <defs>
        <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={p.bodyDark} />
          <stop offset="35%" stopColor={p.bodyLight} />
          <stop offset="70%" stopColor={p.bodyMid} />
          <stop offset="100%" stopColor={p.bodyDark} />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="212" rx="44" ry="8" fill="rgba(5,8,7,0.22)" />
      <rect x="96" y="34" width="48" height="24" rx="6" fill="#1d2320" />
      <rect x="94" y="56" width="52" height="10" rx="2" fill="#cbd3ce" />
      <path
        d="M94 66 L146 66 L154 90 L154 196 C154 204, 140 208, 120 208 C100 208, 86 204, 86 196 L86 90 Z"
        fill={`url(#body-${uid})`}
      />
    </svg>
  );
}
