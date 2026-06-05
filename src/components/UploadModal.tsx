'use client';
import { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';

const CSV_TEMPLATE = `이름,멤버,매체,종류,앨범,출처,발매,상태,구입처,메모
승협 포카,승협,앨범,랜덤포카,Everlasting,2025_Everlasting,2025-03,owned,,
훈 포카,훈,팬미팅,앨범포카,우.사.합,2026_우사합,2026-05,planned,,`;

interface Props {
  onClose: () => void;
}

type UploadState = 'idle' | 'loading' | 'success' | 'error';

export default function UploadModal({ onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) {
      setMessage('.csv 파일만 업로드 가능합니다');
      setState('error');
      return;
    }
    setFile(f);
    setState('idle');
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setState('loading');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setState('success');
      setMessage(`${data.inserted}개 포카가 등록됐습니다.`);
      // 데이터 새로고침
      setTimeout(() => useAppStore.getState().resetFilter(), 500);
    } catch (e: any) {
      setState('error');
      setMessage(e.message);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob(['﻿' + CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poca_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,18,0.48)', zIndex: 60, display: 'flex', alignItems: 'flex-end' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, margin: '0 auto',
          background: 'var(--surface)', borderRadius: '22px 22px 0 0',
          boxShadow: '0 -16px 60px rgba(0,0,0,0.18)',
          padding: '0 16px 32px',
        }}
      >
        {/* 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 20px' }}>
          <div style={{ width: 38, height: 4, borderRadius: 100, background: 'var(--border)' }} />
        </div>

        <p style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>CSV 업로드</p>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: 'var(--text-muted)' }}>
          이름·멤버·매체·종류·앨범·출처·발매·상태·구입처·메모 컬럼을 포함한 CSV 파일을 업로드하세요.
        </p>

        {/* 파일 드롭 존 */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          style={{
            border: `1.5px dashed ${file ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 12,
            padding: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            background: file ? '#2563eb08' : 'var(--surface2)',
            marginBottom: 12,
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <p style={{ margin: 0, fontSize: 13, color: file ? 'var(--accent)' : 'var(--text-muted)', fontWeight: file ? 600 : 400 }}>
            {file ? `📄 ${file.name}` : '클릭하거나 CSV 파일을 드래그하세요'}
          </p>
        </div>

        {/* 상태 메시지 */}
        {message && (
          <p style={{ margin: '0 0 12px', fontSize: 12, color: state === 'error' ? 'var(--wanted)' : 'var(--owned)', fontWeight: 600 }}>
            {state === 'success' ? '✓ ' : '⚠ '}{message}
          </p>
        )}

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={downloadTemplate}
            style={{
              flex: 1, height: 48, borderRadius: 12,
              border: '1.5px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            템플릿 다운로드
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || state === 'loading' || state === 'success'}
            style={{
              flex: 2, height: 48, borderRadius: 12, border: 'none',
              background: !file || state === 'loading' ? 'var(--surface2)' : state === 'success' ? 'var(--owned)' : 'var(--accent)',
              color: !file || state === 'loading' ? 'var(--text-dim)' : 'white',
              fontSize: 14, fontWeight: 700, cursor: !file || state === 'loading' ? 'not-allowed' : 'pointer',
            }}
          >
            {state === 'loading' ? '업로드 중…' : state === 'success' ? '완료 ✓' : '업로드'}
          </button>
        </div>
      </div>
    </div>
  );
}
