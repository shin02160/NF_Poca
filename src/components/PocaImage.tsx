'use client';
import Image from 'next/image';
import { useState } from 'react';

interface Props {
  src: string | null;
  memberName: string;
  radius?: number;
  showNameOverlay?: boolean;
}

export default function PocaImage({ src, memberName, radius = 8, showNameOverlay = true }: Props) {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div
        style={{
          aspectRatio: '2/3',
          borderRadius: radius,
          background: '#dbeafe',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: '10px 8px',
          width: '100%',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/nflying-logo.png"
          alt="NFlying"
          style={{ width: '68%', filter: 'invert(1) sepia(1) saturate(6) hue-rotate(200deg) brightness(0.7)' }}
        />
        <p style={{ fontSize: 8, color: '#3b82f6', textAlign: 'center', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
          이미지<br />준비중입니다.
        </p>
      </div>
    );
  }

  return (
    <div style={{ aspectRatio: '2/3', borderRadius: radius, overflow: 'hidden', position: 'relative', width: '100%' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={memberName}
        onError={() => setImgError(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
      />
      {showNameOverlay && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px 6px 7px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.48))',
          }}
        >
          <p
            style={{
              textAlign: 'center',
              fontSize: 8,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            {memberName}
          </p>
        </div>
      )}
    </div>
  );
}
