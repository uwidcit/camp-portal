import {
  ALL_QUESTIONS,
  FEEDBACK_ACTION,
  OTHER_VALUE,
  buildSubmission,
  createEmptyAnswers,
  missingInSection,
  SECTIONS
} from '../src/lib/feedbackForm.js';

const marker = 'TEST SUBMISSION - please delete';
const dryRun = !process.argv.includes('--send');

const answers = createEmptyAnswers();

for (const question of ALL_QUESTIONS) {
  switch (question.kind) {
    case 'date':
      answers[question.id] = '2009-03-14';
      break;
    case 'grid':
      for (const row of question.rows) {
        answers[question.id][row.entry] = question.options[0].value;
      }
      break;
    case 'checkbox':
      answers[question.id] = question.allowOther
        ? [question.options[0].value, OTHER_VALUE]
        : [question.options[0].value];
      if (question.allowOther) answers[`${question.id}:other`] = marker;
      break;
    case 'radio':
    case 'scale':
      answers[question.id] = question.options[0].value;
      break;
    default:
      answers[question.id] = marker;
  }
}

for (const section of SECTIONS) {
  const missing = missingInSection(section, answers);
  if (missing.length) throw new Error(`Fixture left required questions blank: ${missing.join(', ')}`);
}

const body = buildSubmission(answers).toString();
console.log(`Payload has ${body.split('&').length} fields across ${SECTIONS.length} sections.`);

if (dryRun) {
  console.log('Dry run. Re-run with --send to post a real response to the live form.');
  process.exit(0);
}

const response = await fetch(FEEDBACK_ACTION, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body
});

const html = await response.text();
const recorded = html.includes('Your response has been recorded');
const rejected = html.includes('This is a required question');
const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'unknown';

console.log(`Response page: "${title}" (status ${response.status})`);

if (!response.ok || rejected || !recorded) {
  throw new Error(`Submission rejected (required-field error: ${rejected}).`);
}

console.log(`Submission recorded. Delete the response marked "${marker}".`);
