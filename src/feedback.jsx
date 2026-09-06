import React, { useMemo, useRef, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Block } from './ui';
import {
  createEmptyAnswers,
  missingInSection,
  OTHER_VALUE,
  SECTIONS,
  submitFeedback
} from './lib/feedbackForm';

function Choice({ type, name, value, label, checked, onChange, ariaLabel }) {
  return (
    <label className="choice">
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
      />
      <span>{label}</span>
    </label>
  );
}

function OtherField({ question, answers, setAnswer, active }) {
  if (!question.allowOther) return null;
  return (
    <input
      className="choice-other"
      type="text"
      value={answers[`${question.id}:other`]}
      onChange={(event) => setAnswer(`${question.id}:other`, event.target.value)}
      placeholder="Tell us more"
      aria-label={`Other answer for: ${question.title}`}
      disabled={!active}
    />
  );
}

function Question({ question, answers, setAnswer, invalid }) {
  const value = answers[question.id];

  function renderControl() {
    switch (question.kind) {
      case 'date':
        return (
          <input
            className="survey-input"
            type="date"
            value={value}
            max={new Date().toISOString().slice(0, 10)}
            aria-label={question.title}
            onChange={(event) => setAnswer(question.id, event.target.value)}
          />
        );

      case 'text':
        return (
          <input
            className="survey-input"
            type="text"
            value={value}
            aria-label={question.title}
            onChange={(event) => setAnswer(question.id, event.target.value)}
          />
        );

      case 'paragraph':
        return (
          <textarea
            className="survey-input"
            rows={3}
            value={value}
            aria-label={question.title}
            onChange={(event) => setAnswer(question.id, event.target.value)}
          />
        );

      case 'grid':
        return (
          <div className="survey-grid">
            {question.rows.map((row) => (
              <div className="survey-grid-row" key={row.entry}>
                <span className="survey-grid-label">{row.label}</span>
                <div className="choices choices-inline">
                  {question.options.map((option) => (
                    <Choice
                      key={option.value}
                      type="radio"
                      name={`${question.id}-${row.entry}`}
                      value={option.value}
                      label={option.label}
                      ariaLabel={`${row.label}: ${option.label}`}
                      checked={value?.[row.entry] === option.value}
                      onChange={() => setAnswer(question.id, { ...value, [row.entry]: option.value })}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div className="survey-scale">
            <span className="survey-scale-cap">{question.lowLabel}</span>
            <div className="choices choices-inline">
              {question.options.map((option) => (
                <Choice
                  key={option.value}
                  type="radio"
                  name={question.id}
                  value={option.value}
                  label={option.label}
                  checked={value === option.value}
                  onChange={() => setAnswer(question.id, option.value)}
                />
              ))}
            </div>
            <span className="survey-scale-cap">{question.highLabel}</span>
          </div>
        );

      case 'checkbox': {
        const selected = value || [];
        const toggle = (optionValue) =>
          setAnswer(
            question.id,
            selected.includes(optionValue)
              ? selected.filter((item) => item !== optionValue)
              : [...selected, optionValue]
          );
        return (
          <>
            <div className="choices">
              {question.options.map((option) => (
                <Choice
                  key={option.value}
                  type="checkbox"
                  name={question.id}
                  value={option.value}
                  label={option.label}
                  checked={selected.includes(option.value)}
                  onChange={() => toggle(option.value)}
                />
              ))}
              {question.allowOther ? (
                <Choice
                  type="checkbox"
                  name={question.id}
                  value={OTHER_VALUE}
                  label="Other"
                  checked={selected.includes(OTHER_VALUE)}
                  onChange={() => toggle(OTHER_VALUE)}
                />
              ) : null}
            </div>
            <OtherField
              question={question}
              answers={answers}
              setAnswer={setAnswer}
              active={selected.includes(OTHER_VALUE)}
            />
          </>
        );
      }

      case 'radio':
      default:
        return (
          <>
            <div className="choices">
              {question.options.map((option) => (
                <Choice
                  key={option.value}
                  type="radio"
                  name={question.id}
                  value={option.value}
                  label={option.label}
                  checked={value === option.value}
                  onChange={() => setAnswer(question.id, option.value)}
                />
              ))}
              {question.allowOther ? (
                <Choice
                  type="radio"
                  name={question.id}
                  value={OTHER_VALUE}
                  label="Other"
                  checked={value === OTHER_VALUE}
                  onChange={() => setAnswer(question.id, OTHER_VALUE)}
                />
              ) : null}
            </div>
            <OtherField
              question={question}
              answers={answers}
              setAnswer={setAnswer}
              active={value === OTHER_VALUE}
            />
          </>
        );
    }
  }

  return (
    <fieldset className={`survey-question${invalid ? ' is-invalid' : ''}`} id={`question-${question.id}`}>
      <legend>
        {question.title}
        {question.required ? <span className="survey-required"> *</span> : null}
      </legend>
      {question.help ? <p className="survey-help">{question.help}</p> : null}
      {renderControl()}
      {invalid ? <p className="survey-error">Please answer this question.</p> : null}
    </fieldset>
  );
}

export function FeedbackSurvey({ onComplete }) {
  const [answers, setAnswers] = useState(createEmptyAnswers);
  const [step, setStep] = useState(0);
  const [invalidIds, setInvalidIds] = useState([]);
  const [status, setStatus] = useState('idle');
  const headingRef = useRef(null);

  const section = SECTIONS[step];
  const isLastStep = step === SECTIONS.length - 1;

  const setAnswer = useMemo(
    () => (key, value) => setAnswers((previous) => ({ ...previous, [key]: value })),
    []
  );

  function goTo(nextStep) {
    setInvalidIds([]);
    setStep(nextStep);
    headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleNext() {
    const missing = missingInSection(section, answers);
    if (missing.length) {
      setInvalidIds(missing);
      document.getElementById(`question-${missing[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!isLastStep) {
      goTo(step + 1);
      return;
    }

    setStatus('sending');
    try {
      await submitFeedback(answers);
      onComplete();
    } catch {
      setStatus('error');
    }
  }

  return (
    <Block
      tab="Step 2"
      icon={<ClipboardList />}
      title="Boot Camp feedback"
      aside={
        <span className="block-meta">
          Section {step + 1} of {SECTIONS.length}
        </span>
      }
    >
      <div ref={headingRef} className="survey">
        <p className="note-line">
          Your certificate unlocks as soon as you send this feedback. Answers are anonymous and go straight to the
          Boot Camp team.
        </p>

        <ol className="survey-steps">
          {SECTIONS.map((item, index) => (
            <li key={item.id} className={index === step ? 'is-current' : index < step ? 'is-done' : ''}>
              {item.title}
            </li>
          ))}
        </ol>

        <div className="survey-section">
          <h3>{section.title}</h3>
          {section.blurb ? <p className="survey-help">{section.blurb}</p> : null}

          {section.questions.map((question) => (
            <Question
              key={question.id}
              question={question}
              answers={answers}
              setAnswer={setAnswer}
              invalid={invalidIds.includes(question.id)}
            />
          ))}
        </div>

        {status === 'error' ? (
          <p className="survey-error">Your feedback could not be sent. Check your connection and try again.</p>
        ) : null}

        <div className="survey-actions">
          <button type="button" className="ghost" onClick={() => goTo(step - 1)} disabled={step === 0}>
            Back
          </button>
          <button type="button" onClick={handleNext} disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : isLastStep ? 'Submit and unlock certificate' : 'Continue'}
          </button>
        </div>
      </div>
    </Block>
  );
}
