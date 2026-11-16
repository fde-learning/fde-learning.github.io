// Search short knowledge names and natural questions without making long
// chapter prose match arbitrary, widely separated character fragments.
export const normalize = value => String(value || '').normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();

export function matchScore(query, title, body = '') {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (!terms.length) return 0;
  const label = normalize(title), full = normalize(body);
  let score = 0;
  for (const term of terms) {
    if (label.includes(term)) { score += 100; continue; }
    if (full.includes(term)) { score += 20; continue; }
    if (!/^[\u4e00-\u9fff]{3,}$/.test(term)) return 0;
    const pairs = [...new Set(Array.from({length: term.length - 1}, (_, i) => term.slice(i, i + 2)))];
    const hits = pairs.filter(pair => label.includes(pair)).length;
    if (hits < Math.max(2, Math.ceil(pairs.length * .67))) return 0;
    score += Math.round(hits / pairs.length * 50);
  }
  return score;
}

export function searchCatalog(catalog, bodyById, query) {
  const videos = new Map(catalog.videos.map(v => [v.id, v]));
  const books = new Map(catalog.books.map(b => [b.id, b]));
  const ranked = (rows, title, body = () => '') => rows.map(row => ({row, score: matchScore(query, title(row), body(row))}))
    .filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(item => item.row);
  return {
    videos: ranked(catalog.videos, v => `${v.id} ${v.knowledge} ${v.title} ${v.chapter}`),
    chapters: ranked(catalog.chapters,
      c => [c.id, c.title, books.get(c.book)?.title, ...c.videos.map(id => `${videos.get(id)?.knowledge || ''} ${videos.get(id)?.title || ''}`)].join(' '),
      c => bodyById.get(c.id) || '')
  };
}
