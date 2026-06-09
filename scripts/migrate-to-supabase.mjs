/**
 * Notion → Supabase 마이그레이션 스크립트
 * 실행: node scripts/migrate-to-supabase.mjs
 */

// 환경변수 또는 직접 입력 (실행 시: NOTION_TOKEN=xxx node scripts/migrate-to-supabase.mjs)
const NOTION_TOKEN = process.env.NOTION_TOKEN || '';
const NOTION_DB_ID = process.env.NOTION_DB_ID || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const BUCKET = 'poca-images';

const sbHeaders = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

// ── Notion fetch ──────────────────────────────────────────
function extractText(prop) {
  if (!prop) return null;
  if (prop.type === 'title')      return prop.title?.[0]?.plain_text ?? null;
  if (prop.type === 'rich_text')  return prop.rich_text?.[0]?.plain_text ?? null;
  if (prop.type === 'select')     return prop.select?.name ?? null;
  return null;
}
function extractMultiSelect(prop) {
  if (!prop || prop.type !== 'multi_select') return [];
  return prop.multi_select?.map(s => s.name) ?? [];
}
function extractImage(prop) {
  if (!prop || prop.type !== 'files') return null;
  const file = prop.files?.[0];
  if (!file) return null;
  return file.type === 'external' ? file.external?.url : file.file?.url ?? null;
}

async function fetchAllNotionCards() {
  const cards = [];
  let cursor;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Notion error: ${JSON.stringify(data)}`);
    for (const page of data.results) {
      const p = page.properties;
      cards.push({
        id:        page.id,
        name:      extractText(p['포카명'] ?? p['Name']) ?? '(이름 없음)',
        members:   extractMultiSelect(p['멤버'] ?? p['member']),
        kind:      extractText(p['종류'] ?? p['kind']),
        album:     extractText(p['출처'] ?? p['album']),
        year:      extractText(p['발매'] ?? p['year']),
        image_url: extractImage(p['사진'] ?? p['image']),
        note:      extractText(p['구입처'] ?? p['note']),
      });
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return cards;
}

// ── 이미지 → Supabase Storage 업로드 ─────────────────────
async function uploadImage(notionUrl, cardId) {
  try {
    const res = await fetch(notionUrl);
    if (!res.ok) throw new Error(`image fetch ${res.status}`);
    const buffer = await res.arrayBuffer();
    const ext = notionUrl.includes('.png') ? 'png' : 'jpg';
    const path = `${cardId}.${ext}`;
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

    const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      headers: {
        ...sbHeaders,
        'Content-Type': mime,
        'x-upsert': 'true',
      },
      body: buffer,
    });
    if (!up.ok) {
      const err = await up.text();
      throw new Error(`upload failed: ${err}`);
    }
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  } catch (e) {
    console.warn(`  ⚠️  이미지 업로드 실패 (${cardId}): ${e.message}`);
    return null;
  }
}

// ── Supabase upsert ───────────────────────────────────────
async function upsertCards(cards) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/poca_cards`, {
    method: 'POST',
    headers: {
      ...sbHeaders,
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(cards),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`upsert failed: ${err}`);
  }
}

// ── main ──────────────────────────────────────────────────
async function main() {
  console.log('📥 Notion에서 데이터 가져오는 중…');
  const cards = await fetchAllNotionCards();
  console.log(`✅ ${cards.length}개 카드 로드 완료\n`);

  const migrated = [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    process.stdout.write(`[${i+1}/${cards.length}] ${card.name} … `);

    let imageUrl = card.image_url;
    if (imageUrl) {
      imageUrl = await uploadImage(imageUrl, card.id);
      process.stdout.write(imageUrl ? '🖼️  ' : '❌ ');
    } else {
      process.stdout.write('— ');
    }

    migrated.push({ ...card, image_url: imageUrl });
    console.log('done');

    // Supabase rate limit 방지
    if ((i + 1) % 20 === 0) {
      await upsertCards(migrated.slice(i - 19, i + 1));
    }
  }

  // 나머지 upsert
  const remainder = migrated.length % 20;
  if (remainder > 0) {
    await upsertCards(migrated.slice(-remainder));
  }
  if (migrated.length <= 20) {
    await upsertCards(migrated);
  }

  console.log(`\n🎉 마이그레이션 완료! ${migrated.length}개 카드가 Supabase에 저장됐습니다.`);
}

main().catch(e => { console.error('❌ 오류:', e); process.exit(1); });
