export const FEEDBACK_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLSfiZlmyVZO8L34ojGYci_T_hl3aNsXrgvPsV8jO5d1B4z03BA/formResponse';

export const FEEDBACK_VIEW_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfiZlmyVZO8L34ojGYci_T_hl3aNsXrgvPsV8jO5d1B4z03BA/viewform';

export const OTHER_VALUE = '__other_option__';

// Option strings must match the Google Form exactly; `label` is what we render.
const SATISFACTION = [
  { value: '1 - Very Dissatisfied', label: '1' },
  { value: '2 - Dissatisfied', label: '2' },
  { value: '3 - Neutral', label: '3' },
  { value: '4 - Satisfied', label: '4' },
  { value: '5 - Very Satisfied', label: '5' }
];

const EVENT_RATING = [
  { value: '1', label: '1' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' }
];

function choices(values) {
  return values.map((value) => ({ value, label: value }));
}

function scalePoints(from, to) {
  const points = [];
  for (let i = from; i <= to; i += 1) points.push({ value: String(i), label: String(i) });
  return points;
}

export const SECTIONS = [
  {
    id: 'experience',
    title: 'Your experience',
    questions: [
      {
        id: 'birthday',
        kind: 'date',
        entry: '2096366377',
        title: 'What is your birthday?',
        required: true
      },
      {
        id: 'liked-most',
        kind: 'paragraph',
        entry: '1000004',
        title: 'What did you like the MOST about this Boot Camp?',
        required: true
      },
      {
        id: 'liked-least',
        kind: 'paragraph',
        entry: '1000005',
        title: 'What did you like the LEAST about this Boot Camp?',
        required: true
      },
      {
        id: 'wanted-content',
        kind: 'paragraph',
        entry: '1000007',
        title: 'What would you like to see included in the Boot Camp content?',
        help: 'Separate each suggestion with a comma.',
        required: true
      },
      {
        id: 'favourite-session',
        kind: 'grid',
        title: 'Which session was your favourite?',
        help: '1 is very dissatisfied, 5 is very satisfied.',
        required: true,
        options: SATISFACTION,
        rows: [
          { entry: '1866224727', label: 'Day 1 · Prompt Engineering' },
          { entry: '139470955', label: 'Day 2 · Web & AI' },
          { entry: '1927957249', label: 'Day 3 · Data Analytics & AI' },
          { entry: '1997443439', label: 'Day 4 · Gaming & AI' },
          { entry: '1449813890', label: 'Day 5 · AI Safety' },
          { entry: '776181968', label: 'Day 6 · Guest Speakers & Presentation' }
        ]
      },
      {
        id: 'challenging-session',
        kind: 'grid',
        title: 'Which session was the most challenging?',
        help: '1 is very easy, 5 is very difficult.',
        required: true,
        options: SATISFACTION,
        rows: [
          { entry: '497452519', label: 'Day 1 · Prompt Engineering' },
          { entry: '1718642736', label: 'Day 2 · Web & AI' },
          { entry: '1758794384', label: 'Day 3 · Data Analytics & AI' },
          { entry: '981190905', label: 'Day 4 · Gaming & AI' },
          { entry: '580239093', label: 'Day 5 · AI Safety' },
          { entry: '1786029123', label: 'Day 6 · Guest Speakers & Presentation' }
        ]
      },
      {
        id: 'events',
        kind: 'grid',
        title: 'How would you rate the following?',
        help: '1 is poor, 5 is excellent.',
        required: true,
        options: EVENT_RATING,
        rows: [
          { entry: '1997462748', label: 'Invited talk · Michaela Noel' },
          { entry: '632428075', label: 'Invited talk · Arthur Thompson' },
          { entry: '1951941534', label: 'Google Classroom' },
          { entry: '1866891772', label: 'Mentoring sessions' },
          { entry: '2001959015', label: 'Activity sessions' },
          { entry: '1387857174', label: 'Socialization sessions' }
        ]
      },
      {
        id: 'discovery',
        kind: 'checkbox',
        entry: '1000012',
        title: 'How did you learn about this Boot Camp?',
        help: 'Choose every source that applies.',
        required: true,
        allowOther: true,
        options: choices([
          'UWI Website',
          'Instagram',
          'Facebook',
          "What's App Messages (Flyer)",
          'Word of mouth',
          'School Teacher',
          'Parent'
        ])
      },
      {
        id: 'duration',
        kind: 'radio',
        entry: '1000015',
        title: 'What did you think of the length of the Boot Camp?',
        required: false,
        options: [
          { value: 'Wish it was longer', label: 'Wish it was longer' },
          { value: 'Whis it was shorter', label: 'Wish it was shorter' },
          { value: 'Just long enough', label: 'Just long enough' }
        ]
      },
      {
        id: 'satisfaction',
        kind: 'scale',
        entry: '1000014',
        title: 'Overall, how satisfied were you with this Boot Camp?',
        required: true,
        lowLabel: 'Boring',
        highLabel: 'Awesome',
        options: scalePoints(1, 5)
      },
      {
        id: 'recommend',
        kind: 'scale',
        entry: '1594803936',
        title: 'How likely are you to recommend this Boot Camp to other students?',
        required: true,
        lowLabel: 'Not at all likely',
        highLabel: 'Extremely likely',
        options: scalePoints(1, 10)
      },
      {
        id: 'confidence',
        kind: 'scale',
        entry: '1629293197',
        title: '"I feel more confident in my ability to build with AI."',
        required: true,
        lowLabel: 'Greatly disagree',
        highLabel: 'Greatly agree',
        options: scalePoints(1, 5)
      },
      {
        id: 'teacher',
        kind: 'text',
        entry: '1220123545',
        title: 'Name and email of the I.T. or Computer Science teacher at your school',
        help: 'If you know it. Otherwise write "not sure".',
        required: true
      }
    ]
  },
  {
    id: 'career',
    title: 'Computing career interest',
    blurb:
      'For this form, computing careers include Computer Science, Information Technology and Software Engineering.',
    questions: [
      {
        id: 'career-likelihood',
        kind: 'radio',
        entry: '1322409147',
        title: 'How likely are you to pursue a career in computing after attending this camp?',
        required: true,
        allowOther: true,
        options: choices([
          'I still intend to pursue a Computing Career as my first choice',
          'I will change my first choice to a Computing Career.',
          'I am more likely to pursue  a Computing Career than when I started the camp but it is still my second choice to something else',
          'I am less inclined to pursue a Computing Career',
          'I am sure that I do not want to pursue a Computing Career now'
        ])
      },
      {
        id: 'career-reasons',
        kind: 'checkbox',
        entry: '178624405',
        title: 'If I were to choose a career in computing, it would be because:',
        help: 'Choose every reason that applies.',
        required: true,
        options: choices([
          'I am passionate about the field',
          'I think that I can make a lot of money',
          'I think that I can get a job easily',
          'I want to be an entrepreneur',
          'I still think that programmers are cool',
          'I like the challenge',
          'I want to do research'
        ])
      },
      {
        id: 'degree-confidence',
        kind: 'radio',
        entry: '937612590',
        title:
          'I feel more confident that I would be able to handle Computer Science / I.T. as a degree or career choice',
        required: true,
        options: choices(['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree'])
      }
    ]
  },
  {
    id: 'perceptions',
    title: 'Perceptions',
    questions: [
      {
        id: 'adjectives',
        kind: 'paragraph',
        entry: '1642575059',
        title: 'Five adjectives you would now use to describe Computer Science:',
        required: true
      },
      {
        id: 'final-comments',
        kind: 'paragraph',
        entry: '1277280637',
        title: 'Final comments, suggestions or sentiments',
        help: 'Optional.',
        required: false
      },
      {
        id: 'remote-value',
        kind: 'radio',
        entry: '1141098061',
        title: 'How was the value of the Boot Camp affected by it being delivered remotely?',
        required: true,
        options: choices([
          'Negatively affected to a large extent',
          'Negatively affected to a small extent',
          'Having it remote had no effect on the value',
          'Positively affected by a small extent.',
          'Positively affected by a great extent'
        ])
      }
    ]
  }
];

export const ALL_QUESTIONS = SECTIONS.flatMap((section) => section.questions);

export function createEmptyAnswers() {
  const answers = {};
  for (const question of ALL_QUESTIONS) {
    if (question.kind === 'checkbox') answers[question.id] = [];
    else if (question.kind === 'grid') answers[question.id] = {};
    else answers[question.id] = '';
    if (question.allowOther) answers[`${question.id}:other`] = '';
  }
  return answers;
}

function isAnswered(question, answers) {
  const value = answers[question.id];
  if (question.kind === 'checkbox') {
    if (!value?.length) return false;
    if (value.includes(OTHER_VALUE) && !answers[`${question.id}:other`]?.trim()) return false;
    return true;
  }
  if (question.kind === 'grid') {
    return question.rows.every((row) => Boolean(value?.[row.entry]));
  }
  if (value === OTHER_VALUE) return Boolean(answers[`${question.id}:other`]?.trim());
  return Boolean(String(value ?? '').trim());
}

export function missingInSection(section, answers) {
  return section.questions.filter((question) => question.required && !isAnswered(question, answers)).map((q) => q.id);
}

function appendChoice(params, question, value, answers) {
  params.append(`entry.${question.entry}`, value);
  if (value === OTHER_VALUE) {
    params.append(`entry.${question.entry}.other_option_response`, answers[`${question.id}:other`].trim());
  }
}

export function buildSubmission(answers) {
  const params = new URLSearchParams();

  for (const question of ALL_QUESTIONS) {
    const value = answers[question.id];

    switch (question.kind) {
      case 'date': {
        if (!value) break;
        const [year, month, day] = String(value).split('-');
        if (!year || !month || !day) break;
        params.append(`entry.${question.entry}_year`, year);
        params.append(`entry.${question.entry}_month`, String(Number(month)));
        params.append(`entry.${question.entry}_day`, String(Number(day)));
        break;
      }
      case 'grid': {
        for (const row of question.rows) {
          const rowValue = value?.[row.entry];
          if (rowValue) params.append(`entry.${row.entry}`, rowValue);
        }
        break;
      }
      case 'checkbox': {
        for (const item of value || []) appendChoice(params, question, item, answers);
        break;
      }
      case 'radio':
      case 'scale': {
        if (value) appendChoice(params, question, value, answers);
        break;
      }
      default: {
        const text = String(value ?? '').trim();
        if (text) params.append(`entry.${question.entry}`, text);
      }
    }
  }

  // Google rejects multi-section responses that do not walk through every page.
  params.append('fvv', '1');
  params.append('pageHistory', SECTIONS.map((_, index) => index).join(','));
  params.append('fbzx', String(-Math.floor(Math.random() * 9e18)));
  params.append('submissionTimestamp', String(Date.now()));

  return params;
}

export async function submitFeedback(answers) {
  await fetch(FEEDBACK_ACTION, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: buildSubmission(answers).toString()
  });
}
