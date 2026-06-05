import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/poca_cards?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase error: ${err}`);
    }

    const rows = await res.json();

    // Supabase 컬럼 → 앱 타입 변환
    const cards = rows.map((r: any) => ({
      id:      r.id,
      name:    r.name,
      members: r.members ?? [],
      kind:    r.kind ?? null,
      cat1:    r.cat1 ?? null,
      cat2:    r.cat2 ?? r.kind ?? null,
      album:   r.album ?? null,
      origin:  r.origin ?? null,
      date:    r.date ?? null,
      year:    r.year ?? (r.origin?.match(/^(\d{4})/)?.[1] ?? null),
      status:  r.status ?? null,
      imageUrl: (r.photos?.[0]) ?? r.image_url ?? null,
      photos:  r.photos ?? [],
      source:  r.source ?? null,
      note:    r.note ?? null,
    }));

    return NextResponse.json({ cards, total: cards.length });
  } catch (err: any) {
    console.error('Supabase fetch error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
