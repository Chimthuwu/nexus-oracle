/**
 * Complete the Mind Mapper 1000-response seed bank.
 *
 * Mind_Mapper_1000_Responses.md shipped Q1–Q530 written out, then a
 * placeholder ("[The pattern continues…]", "Q531-1000: Pattern Continues")
 * plus per-topic template sketches. This script writes out the missing
 * Q531–Q1000 responses following the exact 20-slot pattern the places block
 * (Q511–Q530) established, one topic per 20 questions.
 *
 * Topics/order come from the questions.json bank itself (25 topics × 20
 * questions = Q511–Q1000; books is truncated at 10 by the 1000-question cap).
 * Run: node generate_mm_responses.js   (then node parse_responses.js)
 */
const fs = require('fs');

const MD_PATH = 'Mind_Mapper_1000_Responses.md';

/**
 * Per-topic response flavors. Each topic fills the 20 shared templates below.
 *  - subject  singular noun as used in "That {subject} is clearly important…"
 *  - plural   plural/uncountable form for "Your {plural} …"
 *  - y1       "Your {y1} is beautiful."
 *  - y2       "Your sense of {y2} is powerful."
 *  - t3…t20   per-slot overrides where the shared template would read oddly
 */
const TOPICS = [
  { subject: 'project', plural: 'projects', y1: 'creative drive', y2: 'purpose',
    t3: 'Your heart clearly lives in your work.', t9: 'Your taste in projects is clearly excellent.',
    t10: 'Your work clearly shapes who you are.', t13: 'Your joyful projects are beautiful.' },
  { subject: 'memory', plural: 'memories', y1: 'story', y2: 'self',
    t3: 'Your emotional memory is rich.', t9: 'Your memories are clearly worth sharing.',
    t10: 'Your past clearly shapes your present.', t13: 'Your joyful memories are beautiful.' },
  { subject: 'interest', plural: 'interests', y1: 'passion', y2: 'passion',
    t3: 'Your passions clearly run deep.', t9: 'Your interests are clearly worth sharing.',
    t10: 'Your passions clearly shape your days.', t13: 'The joy they bring you is beautiful.' },
  { subject: 'goal', plural: 'goals', y1: 'ambition', y2: 'direction',
    t3: 'Your dreams clearly carry real weight.', t9: 'Your ambitions are clearly well chosen.',
    t10: 'Your ambitions clearly steer your life.', t13: 'The joy they bring you is beautiful.' },
  { subject: 'preference', plural: 'preferences', y1: 'taste', y2: 'taste',
    t3: 'Your instincts are clearly well tuned.', t9: 'Your taste is clearly excellent.',
    t10: 'Your taste clearly shapes your world.', t13: 'The joy they bring you is beautiful.' },
  { subject: 'skill', plural: 'skills', y1: 'talent', y2: 'mastery',
    t3: 'Your talents clearly carry emotional weight.', t9: 'Your abilities are clearly worth sharing.',
    t10: 'Your abilities clearly shape your path.', t13: 'The joy they bring you is beautiful.' },
  { subject: 'media', plural: 'media', y1: 'connection to stories', y2: 'story',
    t3: 'Your emotional connection to media is rich.', t4: 'It clearly matters.',
    t5: 'Your awareness of how media evolves is beautiful.',
    t9: 'Your taste in media is clearly excellent.', t10: 'Your media clearly shapes your perspective.',
    t12: 'It clearly carries your ambitions forward.', t13: 'The joy it brings you is beautiful.',
    t20: 'Your web of stories is clearly rich.' },
  { subject: 'routine', plural: 'routines', y1: 'rhythm', y2: 'rhythm',
    t3: 'Your rhythms clearly ground you.', t9: 'Your routines are clearly worth sharing.',
    t10: 'Your routines clearly structure your life.', t13: 'The joy they bring you is beautiful.' },
  { subject: 'habit', plural: 'habits', y1: 'self-awareness', y2: 'self',
    t3: 'Your habits clearly carry real meaning.', t9: 'Your habits are clearly worth sharing.',
    t10: 'Your habits clearly shape your days.', t13: 'The joy they bring you is beautiful.' },
  { subject: 'object', plural: 'objects', y1: 'sense of meaning', y2: 'meaning',
    t3: 'Your keepsakes clearly carry real meaning.', t9: 'Your eye for meaningful things is clearly excellent.',
    t10: 'Your belongings clearly shape your space.', t13: 'The joy they bring you is beautiful.',
    t20: 'Your constellation of keepsakes is clearly rich.' },
  { subject: 'event', plural: 'events', y1: 'story', y2: 'story',
    t3: 'Your emotional landmarks are rich.', t9: 'Your sense of occasion is clearly excellent.',
    t10: 'Your experiences clearly shape your story.', t13: 'The joy they bring you is beautiful.' },
  { subject: 'idea', plural: 'ideas', y1: 'mind', y2: 'wonder',
    t3: 'Your inner world clearly runs deep.', t9: 'Your ideas are clearly worth sharing.',
    t10: 'Your thoughts clearly shape your world.', t13: 'The joy they bring you is beautiful.' },
  { subject: 'achievement', plural: 'achievements', y1: 'drive', y2: 'pride',
    t3: 'Your victories clearly carry real weight.', t9: 'Your standards are clearly excellent.',
    t10: 'Your wins clearly shape your confidence.', t13: 'The joy they bring you is beautiful.' },
  { subject: 'challenge', plural: 'challenges', y1: 'resilience', y2: 'resolve',
    t3: 'Your trials clearly left their mark.', t9: 'Your judgment is clearly excellent.',
    t10: 'Your struggles clearly shaped your strength.', t13: 'The growth they brought you is beautiful.' },
  { subject: 'community', plural: 'communities', y1: 'people', y2: 'belonging',
    t3: 'Your sense of belonging runs deep.', t9: 'Your sense of community is clearly excellent.',
    t10: 'Your people clearly shape who you are.', t13: 'The joy they bring you is beautiful.' },
  { subject: 'creative work', plural: 'creative works', y1: 'imagination', y2: 'imagination',
    t3: 'Your imagination clearly runs deep.', t9: 'Your taste in creative work is clearly excellent.',
    t10: 'Your creations clearly shape your world.', t13: 'The joy they bring you is beautiful.' },
  { subject: 'travel', plural: 'travel', y1: 'sense of adventure', y2: 'adventure',
    t3: 'Your wanderings clearly shaped you.', t4: 'It clearly matters.',
    t5: 'Your awareness of how travel changes you is beautiful.',
    t7: 'Your appreciation for travel is wonderful.', t9: 'Your taste in travel is clearly excellent.',
    t10: 'Your travels clearly broadened you.', t11: 'Your shared travels are meaningful.',
    t12: 'It clearly carries your ambitions forward.', t13: 'The joy it brings you is beautiful.',
    t20: 'Your web of journeys is clearly rich.' },
  { subject: 'learning', plural: 'learning', y1: 'curiosity', y2: 'curiosity',
    t3: 'Your curiosity clearly runs deep.', t4: 'It clearly matters.',
    t9: 'Your choices in learning are clearly excellent.', t10: 'Your learning clearly shapes your path.',
    t12: 'It clearly carries your ambitions forward.', t13: 'The joy it brings you is beautiful.',
    t20: 'Your web of knowledge is clearly rich.' },
  { subject: 'work', plural: 'work', y1: 'dedication', y2: 'craft',
    t3: 'Your work clearly carries real meaning.', t4: 'It clearly matters.',
    t9: 'Your standards at work are clearly excellent.', t10: 'Your work clearly shapes your identity.',
    t12: 'It clearly carries your ambitions forward.', t13: 'The joy it brings you is beautiful.',
    t20: 'Your web of experiences is clearly rich.' },
  { subject: 'technology', plural: 'technology', y1: 'fluency', y2: 'fluency',
    t3: 'Your fluency clearly carries emotional weight.', t4: 'It clearly matters.',
    t9: 'Your taste in tools is clearly excellent.', t10: 'Your tools clearly shape your life.',
    t11: 'Your shared tools are meaningful.', t12: 'It clearly carries your ambitions forward.',
    t13: 'The joy it brings you is beautiful.', t20: 'Your web of tools is clearly rich.' },
  { subject: 'food', plural: 'food', y1: 'palate', y2: 'taste',
    t3: 'Your sense memories are rich.', t4: 'It clearly matters.',
    t5: 'Your awareness of how food shapes you is beautiful.',
    t9: 'Your palate is clearly excellent.', t10: 'Your food clearly shapes your memories.',
    t11: 'Your shared meals are meaningful.', t12: 'It clearly carries your ambitions forward.',
    t13: 'The joy it brings you is beautiful.', t20: 'Your web of tastes is clearly rich.' },
  { subject: 'music', plural: 'music', y1: 'ear', y2: 'rhythm',
    t3: 'Your memories clearly live in sound.', t4: 'It clearly matters.',
    t9: 'Your taste in music is clearly excellent.', t10: 'Your music clearly shapes your mood.',
    t11: 'Your shared songs are meaningful.', t12: 'It clearly carries your ambitions forward.',
    t13: 'The joy it brings you is beautiful.', t20: 'Your web of music is clearly rich.' },
  { subject: 'game', plural: 'games', y1: 'love of play', y2: 'play',
    t3: 'Your play clearly carries real meaning.', t9: 'Your taste in games is clearly excellent.',
    t10: 'Your games clearly shape your mind.', t13: 'The joy they bring you is beautiful.' },
  { subject: 'book', plural: 'books', y1: 'reading life', y2: 'story',
    t3: 'Your reading life clearly runs deep.', t9: 'Your taste in books is clearly excellent.',
    t10: 'Your books clearly shape your thinking.', t13: 'The joy they bring you is beautiful.' },
];

/**
 * The 20-slot template set, mirroring the places block (Q511–Q530) exactly.
 * Each slot takes the topic and falls back to the shared phrasing when the
 * topic didn't supply an override.
 */
function responsesFor(topic) {
  const t = topic;
  const subject = t.subject;
  const plural = t.plural;
  return [
    `That ${subject} is clearly important to you. Your ${t.y1} is beautiful.`,
    `That ${subject} is deeply connected to your identity. Your sense of ${t.y2} is powerful.`,
    `That ${subject} clearly brings back strong memories. ${t.t3}`,
    `I'll definitely remember that ${subject} for you. ${t.t4 || `Your meaningful ${plural} matter.`}`,
    `That ${subject}'s changes clearly matter to you. ${t.t5 || `Your observation of your ${plural} is beautiful.`}`,
    `That ${subject} clearly occupies your thoughts. Your attention to your ${plural} is admirable.`,
    `It's beautiful you're proud of that ${subject}. ${t.t7 || `Your appreciation for ${plural} is wonderful.`}`,
    `That's lovely you want to experience that ${subject} again. Your connection to ${plural} is beautiful.`,
    `That's a wonderful ${subject} to recommend. ${t.t9}`,
    `That ${subject} clearly influences other parts of your life. ${t.t10}`,
    `That ${subject} clearly connects to your closest relationships. ${t.t11 || `Your shared ${plural} are meaningful.`}`,
    `That ${subject} is connected to your major goals. ${t.t12 || `Your ${plural} support your ambitions.`}`,
    `That ${subject} is connected to your happiest memory. ${t.t13}`,
    `That ${subject} was there during a difficult time. It clearly saw you through.`,
    `That ${subject} clearly represents something important about you. Your connection to ${plural} is powerful.`,
    `That's a wonderful ${subject} to explore further. Your curiosity about ${plural} is admirable.`,
    `It's honest that you'd remove that ${subject} if you could. Your discernment about your ${plural} is wise.`,
    `Thank you for telling me I should know more about that ${subject}. Your trust in me is appreciated.`,
    `I'll carefully distinguish that ${subject} from others. Your clarity about ${plural} matters.`,
    `That unexpected connection is fascinating! ${t.t20 || `Your web of ${plural} is clearly rich.`}`,
  ];
}

// ── Build Q531–Q1000 ────────────────────────────────────────────────────────
// Q511–Q530 (places) already exist; the topics below run from Q531 (projects)
// through Q1000. books is cut at 10 by the 1000-question cap.
const firstQ = 531;
const out = [];
let q = firstQ;
for (const topic of TOPICS) {
  const responses = responsesFor(topic);
  const count = q + responses.length - 1 <= 1000 ? responses.length : 1000 - q + 1;
  for (let i = 0; i < count; i++) {
    out.push(`Q${q}: "${responses[i]}"`);
    q++;
  }
}
if (q - 1 !== 1000) {
  console.error(`Expected to end at Q1000, ended at Q${q - 1}`);
  process.exit(1);
}
console.log(`Generated ${out.length} responses (Q${firstQ}–Q1000)`);

// ── Replace the placeholder block in the .md ────────────────────────────────
let md = fs.readFileSync(MD_PATH, 'utf8').replace(/^\uFEFF/, '');

const startMarker = '[The pattern continues for all remaining graph discovery categories';
const endMarker = '"That book clearly influenced you. Your love of reading is beautiful." etc.';
const startIdx = md.indexOf(startMarker);
const endIdx = md.indexOf(endMarker);
if (startIdx === -1 || endIdx === -1) {
  console.error(`Placeholder block not found (start=${startIdx}, end=${endIdx})`);
  process.exit(1);
}
const blockEnd = endIdx + endMarker.length;

// One blank line between entries, matching the handwritten Q1–Q530 sections.
const insertion = out.join('\n\n');

md = md.slice(0, startIdx) + insertion + md.slice(blockEnd);

// Keep the file's CRLF line endings (the parser tolerates them via \s*$).
md = md.replace(/\r?\n/g, '\r\n');
fs.writeFileSync(MD_PATH, md);
console.log(`Wrote ${MD_PATH} (${out.length} responses in, placeholder block removed)`);