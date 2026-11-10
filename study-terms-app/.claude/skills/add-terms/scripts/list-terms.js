// 지금 있는 용어를 한 줄씩 출력한다: id | term | ko | src
// 사용: node list-terms.js [study-terms-app 경로]
const path = require('path');
const root = path.resolve(process.argv[2] || '.');
const { buildCatalog } = require(path.join(root, 'server/terms.js'));
const { terms } = buildCatalog();
console.log(`# ${terms.length}개`);
for (const t of terms) console.log([t.id, t.term, t.ko, t.src].join(' | '));
