import { NextResponse } from 'next/server';

const NOTION_TOKEN    = process.env.NOTION_TOKEN!;
const NOTION_DB_ID    = process.env.NOTION_DB_ID!;
const SUPABASE_URL    = process.env.SUPABASE_URL!;
const SUPABASE_SVC    = process.env.SUPABASE_SERVICE_KEY!;
const BUCKET          = 'poca-images';

const sbHeaders = {
  apikey:        SUPABASE_SVC,
  Authorization: `Bearer ${SUPABASE_SVC}`,
  'Content-Type': 'application/json',
};

function kindToCat1(kind: string | null): string {
  if (!kind) return '기타';
  if (kind.includes('앨범포카'))              return '앨범';
  if (kind.includes('화보포카') || kind.includes('잡지포카')) return '잡지/화보';
  if (kind.includes('특전_콘서트'))           return '콘서트/팬미팅';
  if (kind === 'MD')                          return 'MD굿즈';
  if (kind.includes('팬싸인회'))              return '팬사인회';
  if (kind.includes('공방포카'))              return '공방';
  if (kind === '트레카' || kind === 'N.Fia_Zone') return '콘서트/팬미팅';
  if (kind.includes('특전_기타'))             return '기타';
  return '기타';
}

function extractText(prop: any): string | null {
  if (!prop) return null;
  if (prop.type === 'title')     return prop.title?.[0]?.plain_text ?? null;
  if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text ?? null;
  if (prop.type === 'select')    return prop.select?.name ?? null;
  return null;
}
function extractMultiSelect(prop: any): string[] {
  if (!prop || prop.type !== 'multi_select') return [];
  return prop.multi_select?.map((s: any) => s.name) ?? [];
}
function extractImageUrl(prop: any): string | null {
  if (!prop || prop.type !== 'files') return null;
  const file = prop.files?.[0];
  if (!file) return null;
  return file.type === 'external' ? file.external?.url : file.file?.url ?? null;
}

async function fetchAllNotionCards() {
  const cards: any[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization:    `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type':   'application/json',
      },
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Notion ${res.status}: ${JSON.stringify(data)}`);
    for (const page of data.results) {
      const p = page.properties;
      const kind   = extractText(p['종류'] ?? p['kind']);
      const origin = extractText(p['출처'] ?? p['album']);
      const year   = extractText(p['발매'] ?? p['year'])
                     ?? origin?.match(/^(\d{4})/)?.[1]
                     ?? null;
      cards.push({
        id:      page.id,
        name:    extractText(p['포카명'] ?? p['Name']) ?? '(이름 없음)',
        members: extractMultiSelect(p['멤버'] ?? p['member']),
        kind,
        cat2:    kind,
        cat1:    kindToCat1(kind),
        album:   origin,
        origin,
        year,
        status:  extractText(p['상태'] ?? p['status']) ?? null,
        note:    extractText(p['구입처'] ?? p['note']),
        _notionImageUrl: extractImageUrl(p['사진'] ?? p['image']),
      });
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return cards;
}

async function uploadImage(notionUrl: string, cardId: string): Promise<string | null> {
  try {
    const res = await fetch(notionUrl);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const ext  = notionUrl.includes('.png') ? 'png' : 'jpg';
    const path = `${cardId}.${ext}`;
    const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Content-Type': ext === 'png' ? 'image/png' : 'image/jpeg', 'x-upsert': 'true' },
      body: buffer,
    });
    if (!up.ok) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  } catch {
    return null;
  }
}

async function upsertBatch(rows: any[]) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/poca_cards`, {
    method: 'POST',
    headers: { ...sbHeaders, Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`upsert failed: ${await res.text()}`);
}

export async function POST() {
  try {
    const notionCards = await fetchAllNotionCards();

    // 기존 image_url 조회 (이미 Supabase Storage에 올라간 것은 재업로드 안 함)
    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/poca_cards?select=id,image_url`,
      { headers: sbHeaders }
    );
    const existingRows: { id: string; image_url: string | null }[] = existingRes.ok
      ? await existingRes.json()
      : [];
    const existingMap = new Map(existingRows.map((r) => [r.id, r.image_url]));

    const batch: any[] = [];
    let newImages = 0;

    for (const card of notionCards) {
      const { _notionImageUrl, ...rest } = card;
      let image_url = existingMap.get(card.id) ?? null;

      // Supabase Storage URL이 없고 Notion URL이 있으면 업로드
      if (!image_url && _notionImageUrl) {
        image_url = await uploadImage(_notionImageUrl, card.id);
        if (image_url) newImages++;
      }

      batch.push({ ...rest, image_url });

      if (batch.length === 20) {
        await upsertBatch(batch.splice(0));
      }
    }
    if (batch.length) await upsertBatch(batch);

    return NextResponse.json({
      synced: notionCards.length,
      newImages,
      syncedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Refresh error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
