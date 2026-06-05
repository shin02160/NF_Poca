'use client';
import { useRef, useCallback, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import PocaImage from './PocaImage';

interface Props {
  onClose: () => void;
}

export default function PhotobookPanel({ onClose }: Props) {
  const { photobookCards, removeFromPhotobook, clearPhotobook } = useAppStore();
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string, ms = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  const toBase64 = async (src: string): Promise<string> => {
    try {
      const proxied = `/api/image-proxy?url=${encodeURIComponent(src)}`;
      const res = await fetch(proxied);
      if (!res.ok) throw new Error('proxy failed');
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return '';
    }
  };

  const handleExport = useCallback(async () => {
    if (photobookCards.length === 0 || exporting) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const el = exportRef.current;
      if (!el) return;

      // 모든 이미지를 base64로 교체
      const imgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
      const origSrcs = imgs.map((img) => img.src);
      await Promise.all(
        imgs.map(async (img) => {
          if (!img.src || img.src.startsWith('data:')) return;
          const b64 = await toBase64(img.src);
          if (b64) img.src = b64;
        })
      );

      const canvas = await html2canvas(el, { scale: 2, useCORS: false, backgroundColor: '#ffffff' });
      imgs.forEach((img, i) => { img.src = origSrcs[i]; });

      const now = new Date();
      const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
      const fileName = `nf_poca_${ts}.png`;

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );

      const ua = navigator.userAgent;
      const isChromeIOS = /CriOS/.test(ua);
      const isIOS = /iPad|iPhone|iPod/.test(ua);

      // Chrome iOS: 새 탭에 이미지 열기 → 길게 눌러 사진 저장
      if (isChromeIOS) {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const w = window.open('', '_blank');
          if (w) {
            w.document.write(`
              <html><head><meta name="viewport" content="width=device-width,initial-scale=1">
              <style>body{margin:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px}
              img{max-width:100%;border-radius:8px}
              p{color:#fff;font-size:14px;font-weight:600;text-align:center;padding:0 20px;line-height:1.6;margin:0}
              </style></head><body>
              <img src="${dataUrl}" alt="N.Flying POCA"/>
              <p>이미지를 <strong>길게 눌러</strong><br>사진 앱에 저장하세요 📷</p>
              </body></html>
            `);
            w.document.close();
          }
        };
        reader.readAsDataURL(blob);
        return;
      }

      // iOS Safari: Web Share API → 공유 시트에서 "이미지 저장" 선택
      const file = new File([blob], fileName, { type: 'image/png' });
      if (
        isIOS &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        showToast("공유 시트에서 '이미지 저장'을 탭하세요 📸", 5000);
        try {
          await navigator.share({ files: [file], title: 'N.Flying POCA' });
          return;
        } catch (e) {
          if ((e as Error).name === 'AbortError') return;
        }
      }

      // Android Web Share API
      if (
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({ files: [file], title: 'N.Flying POCA' });
          return;
        } catch (e) {
          if ((e as Error).name === 'AbortError') return;
        }
      }

      // Fallback: PC 다운로드
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, [photobookCards, exporting]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--color-dim)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 480,
            margin: '0 auto',
            background: 'var(--color-surface)',
            borderRadius: '22px 22px 0 0',
            boxShadow: '0 -12px 48px rgba(0,0,0,0.18)',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* 핸들 */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
            <div style={{ width: 40, height: 4, borderRadius: 100, background: 'var(--color-border-light)' }} />
          </div>

          {/* 헤더 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px 8px',
              borderBottom: '1px solid var(--color-border-light)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>📷 포토북</span>
              <span
                style={{
                  height: 22,
                  padding: '0 8px',
                  borderRadius: 100,
                  background: 'var(--color-primary-bg)',
                  color: 'var(--color-primary)',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {photobookCards.length}장
              </span>
            </div>
            {photobookCards.length > 0 && (
              <button
                onClick={clearPhotobook}
                style={{
                  height: 30,
                  padding: '0 12px',
                  borderRadius: 100,
                  border: '1px solid var(--color-border)',
                  background: 'none',
                  color: 'var(--color-text-mid)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                전체 비우기
              </button>
            )}
          </div>

          {/* 목록 */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {photobookCards.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '32px 0', fontSize: 14 }}>
                담긴 포카가 없습니다.
              </p>
            ) : (
              photobookCards.map((card) => (
                <div
                  key={card.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 16px',
                    borderBottom: '1px solid var(--color-border-light)',
                  }}
                >
                  <div style={{ width: 40, flexShrink: 0 }}>
                    <PocaImage src={card.imageUrl} memberName={card.members[0] ?? ''} radius={6} showNameOverlay={false} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {card.name}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-text-mid)' }}>
                      {[card.members.join(' · '), card.album].filter(Boolean).join(' / ')}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromPhotobook(card.id)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      border: 'none',
                      background: 'var(--color-border-light)',
                      color: 'var(--color-text-mid)',
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {/* 숨겨진 캡처 레이아웃 */}
          <div
            ref={exportRef}
            style={{
              position: 'absolute',
              left: -9999,
              top: -9999,
              background: 'white',
              padding: 16,
              width: 480,
            }}
          >
            {/* 로고만 — POCA 텍스트 없음 */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/nflying-logo.png" alt="NFlying" style={{ height: 32 }} />
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#888' }}>
                {(() => {
                  const d = new Date();
                  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
                })()}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {photobookCards.map((card) => (
                <div key={card.id} style={{ textAlign: 'center' }}>
                  <PocaImage src={card.imageUrl} memberName={card.members[0] ?? ''} radius={6} showNameOverlay={false} />
                  <div style={{ marginTop: 6, padding: '0 2px' }}>
                    <p style={{ margin: 0, fontSize: 9, fontWeight: 600, color: '#333', wordBreak: 'break-word', lineHeight: 1.4 }}>
                      {card.name}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 8, color: '#666', lineHeight: 1.4 }}>{card.members.join(' · ')}</p>
                    {card.album && <p style={{ margin: '1px 0 0', fontSize: 8, color: '#999', lineHeight: 1.4 }}>{card.album}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div style={{ padding: '12px 16px 24px' }}>
            <button
              onClick={handleExport}
              disabled={photobookCards.length === 0 || exporting}
              style={{
                width: '100%',
                height: 52,
                borderRadius: 14,
                border: 'none',
                background: photobookCards.length === 0 ? 'var(--color-border-light)' : 'var(--color-primary)',
                color: photobookCards.length === 0 ? 'var(--color-text-light)' : 'white',
                fontSize: 15,
                fontWeight: 700,
                cursor: photobookCards.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: photobookCards.length > 0 && !exporting ? '0 4px 20px rgba(51,102,255,0.28)' : 'none',
                opacity: exporting ? 0.8 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {exporting ? '⏳ 이미지 생성 중…' : '📸 이미지 저장 / 공유'}
            </button>
          </div>
        </div>
      </div>

      {/* 토스트 안내 */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 110,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(23,23,25,0.92)',
          color: 'white',
          padding: '10px 18px',
          borderRadius: 100,
          fontSize: 13,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          zIndex: 200,
          pointerEvents: 'none',
        }}>
          {toast}
        </div>
      )}
    </>
  );
}
