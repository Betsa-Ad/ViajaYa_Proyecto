import React from 'react';

// Logotipo institucional
export default function Logo({ variante = 'navbar' }) {
  const esFooter = variante === 'footer';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        userSelect: 'none',
      }}
    >
      <svg
        width={esFooter ? '42' : '38'}
        height={esFooter ? '42' : '38'}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="22" fill="#75B9AE" fillOpacity="0.25" stroke="#75B9AE" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="15" fill="#167C80" fillOpacity="0.2" />

        <path
          d="M20 40 C21 32 23 26 25 21"
          stroke="#FAF8F2"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        <path
          d="M25 21 C21 17 15 17 13 19 C16 21 21 22 25 21 Z"
          fill="#FAF8F2"
        />
        <path
          d="M25 21 C23 15 19 13 16 13 C18 16 22 18 25 21 Z"
          fill="#75B9AE"
        />
        <path
          d="M25 21 C26 15 29 12 32 12 C31 15 29 18 25 21 Z"
          fill="#FAF8F2"
        />
        <path
          d="M25 21 C29 17 34 16 36 18 C33 20 29 21 25 21 Z"
          fill="#75B9AE"
        />

        <path
          d="M16 16 L33 22 L38 20 L36 24 L32 25 L33 30 L30 28 L29 26 L23 24 L17 26 L19 23 L16 16 Z"
          fill="#FAF8F2"
          stroke="#75B9AE"
          strokeWidth="0.8"
        />
      </svg>

      <span
        style={{
          fontSize: esFooter ? '1.55rem' : '1.5rem',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          display: 'inline-flex',
          alignItems: 'baseline',
        }}
      >
        <span style={{ color: '#FAF8F2' }}>Viaja</span>
        <span style={{ color: '#75B9AE', marginLeft: '2px' }}>Ya</span>
      </span>
    </div>
  );
}
