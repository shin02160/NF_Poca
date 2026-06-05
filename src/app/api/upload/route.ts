import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

const COL_MAP: Record<string, string> = {
  '이름': 'name', 'name': 'name',
  '멤버': 'members', 'member': 'members', 'members': 'members',
  '매체': 'cat1', 'cat1': 'cat1',
  '종류': 'cat2', 'cat2': 'cat2',
  '앨범': 'album', 'album': 'album',
  '출처': 'origin', 'origin': 'origin',
  '발매': 'date', 'date': 'date',
  '연도': 'year', 'year': 'year',
  '상태': 'status', 'status': 'status',
  '구입처': 'source', 'source': 'source',
  '메모': 'note', 'note': 'note',
};

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"(.*)"$/, '$1'));
  return lines.slice(1).map((line) => {
    const vals = line.split(',').map((v) => v.trim().replace(/^"(.*)"$/, '$1'));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });

    const text = await file.text();
    const rows = parseCSV(text);
    if (!rows.length) return NextResponse.json({ error: 'CSV가 비어있거나 형식이 맞지 않습니다' }, { status: 400 });

    const records = rows.map((row) => {
      const rec: Record<string, unknown> = {};
      Object.entries(row).forEach(([k, v]) => {
        const col = COL_MAP[k];
        if (!col || !v) return;
        if (col === 'members') {
          rec[col] = v.split(/[,·|]/).map((s) => s.trim()).filter(Boolean);
        } else {
          rec[col] = v;
        }
      });
      if (!rec['year'] && rec['origin']) {
        rec['year'] = String(rec['origin']).match(/^(\d{4})/)?.[1] ?? null;
      }
      return rec;
    });

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/poca_cards`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(records),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase error: ${err}`);
    }

    return NextResponse.json({ inserted: records.length });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
