const fs = require('fs');

const questions = JSON.parse(fs.readFileSync('apps/server/src/llm/questions.json', 'utf-8'));

const responsesContent = fs.readFileSync('Mind_Mapper_1000_Responses.md', 'utf-8');
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

fs.writeFileSync('apps/server/src/llm/questions.json', JSON.stringify(questions, null, 2));
console.log('Matched', matched, 'responses to questions');
