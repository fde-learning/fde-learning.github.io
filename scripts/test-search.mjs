import fs from 'node:fs';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const source = fs.readFileSync(new URL('site/search.js', root), 'utf8');
const {matchScore, searchCatalog} = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const catalog = JSON.parse(fs.readFileSync(new URL('site/data/catalog.json', root), 'utf8'));
const bodies = new Map(JSON.parse(fs.readFileSync(new URL('site/data/search-index.json', root), 'utf8')).chapters.map(c => [c.id, c.text]));
const checks = [];
function check(name, fn) { fn(); checks.push(name); }
check('Natural question finds the actual internal-request video', () => {
  const results = searchCatalog(catalog, bodies, '第二条请求');
  assert.equal(results.videos[0].id, 'B04-03');
  assert.equal(results.chapters[0].id, 'B04');
  assert.ok(results.chapters.length <= 3);
});
check('Chinese fragments never match unrelated long prose', () => assert.equal(matchScore('第二条请求', '路径与文件', '第二部分里有一条路径，请求另见后章'), 0));
check('Empty query returns no accidental whole-library matches', () => assert.deepEqual(searchCatalog(catalog, bodies, '  '), {videos:[], chapters:[]}));
check('Exact chapter and full-width entry work', () => {
  assert.equal(searchCatalog(catalog, bodies, 'Ａ１１').chapters[0].id, 'A11');
});
check('Short knowledge title lookup', () => assert.equal(searchCatalog(catalog, bodies, '未知值与统计').videos[0].id, 'C01-02'));
check('Combined problem words narrow the answer', () => assert.equal(searchCatalog(catalog, bodies, '文件 三份').videos[0].id, 'A11-01'));
check('Unknown text has no spurious matches', () => assert.equal(searchCatalog(catalog, bodies, '不存在的胡萝卜课程').videos.length, 0));
console.log(JSON.stringify({status:'passed', checks}));
