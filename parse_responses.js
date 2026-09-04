const fs = require('fs');

const questions = JSON.parse(fs.readFileSync('apps/server/src/llm/questions.json', 'utf-8'));

const responsesContent = fs
  .readFileSync('Mind_Mapper_1000_Responses.md', 'utf-8')
  .replace(/^\uFEFF/, '') // strip BOM
  .replace(/\r\n?/g, '\n'); // normalize CRLF/CR → LF

const lines = responsesContent.split('\n');

for (const line of lines) {
  const match = line.match(/^Q(\d+):\s*"(.*)"\s*$/);
  if (match) {
    const idx = parseInt(match[1], 10) - 1;
    if (questions[idx]) {
      questions[idx].responseSeed = match[2];
    }
  }
}

let matched = 0;
for (const q of questions) {
  if (q.responseSeed) matched++;
}

// Keep the bank's compact one-line format (matches the committed file) so
// re-runs produce a minimal diff — only responseSeed values change.
const compact =
  '[' +
  questions
    .map((q) =>
      JSON.stringify({
        category: q.category,
        text: q.text,
        ...(q.responseSeed ? { responseSeed: q.responseSeed } : {}),
      })
    )
    .join(',') +
  ']\n';
fs.writeFileSync('apps/server/src/llm/questions.json', compact);
console.log('Matched', matched, 'responses to questions');
