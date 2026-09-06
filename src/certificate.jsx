import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Award, Download, Lock, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { decryptSecret } from './lib/certCrypto';
import { applyPalette, latestPalette } from './lib/brand';
import { emailVariants, NAME_MATCH_THRESHOLD, nameScore } from './lib/fuzzy';
import { areUnlocked, unlock } from './lib/unlockStore';
import { FeedbackSurvey } from './feedback';
import { Block, Masthead } from './ui';
import './styles.css';

function CertificateApp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    applyPalette(latestPalette());
  }, []);

  const canSubmit = useMemo(() => name.trim().length >= 2 && email.includes('@'), [name, email]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus('searching');
    setError('');
    setResults([]);
    setUnlocked(false);

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/certificates.json`);
      if (!response.ok) throw new Error(`Could not load certificate index (${response.status})`);
      const payload = await response.json();
      const variants = emailVariants(email);
      const named = (payload.records || [])
        .map((record) => ({ record, score: nameScore(name, record.name) }))
        .filter((entry) => entry.score >= NAME_MATCH_THRESHOLD)
        .sort((a, b) => b.score - a.score);

      const matches = [];
      for (const { record, score } of named) {
        let url = null;
        for (const variant of variants) {
          for (const secret of record.secrets || []) {
            const decrypted = await decryptSecret(secret, variant);
            if (decrypted !== null) {
              url = decrypted;
              break;
            }
          }
          if (url !== null) break;
        }
        if (url === null) continue;
        matches.push({
          name: record.name,
          year: record.year,
          camp: record.camp,
          url,
          score
        });
      }

      matches.sort((a, b) => b.year - a.year || b.score - a.score);
      setResults(matches);
      setUnlocked(areUnlocked(matches));
      setStatus(matches.length ? 'found' : 'empty');
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : 'Lookup failed');
      setStatus('error');
    }
  }

  return (
    <div className="shell">
      <div className="chrome">
        <Masthead title="Certificates" chip="Link-only page" />
      </div>

      <main className="sheet">
        <section className="edition">
          <div>
            <p className="kicker">Participants</p>
            <h1 className="edition-title">Certificate lookup</h1>
          </div>
          <Award className="edition-emblem" size={112} strokeWidth={1.1} aria-hidden="true" />
        </section>

        <p className="cert-lede">
          Enter the name and email used at registration, then complete a short feedback survey to unlock your
          certificate. Capitalization does not matter, close misspellings are accepted, and a guardian email works
          if that is what was registered.
        </p>

        <form className="cert-form" onSubmit={handleSubmit}>
          <label>
            <span>
              <UserRound /> Full name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              placeholder="First and last name"
              required
            />
          </label>
          <label>
            <span>
              <Mail /> Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="Participant or guardian email"
              required
            />
          </label>
          <button type="submit" disabled={!canSubmit || status === 'searching'}>
            {status === 'searching' ? 'Searching…' : 'Find certificate'}
          </button>
        </form>

        <Block tab="Notes" icon={<ShieldCheck />} title="How this lookup works">
          <ul className="bullets">
            <li>Names are matched case-insensitively and tolerate close misspellings.</li>
            <li>A guardian email works when that is the address used at registration.</li>
            <li>
              Certificate links are encrypted with the registration email, so no participant email is ever
              published in this site&rsquo;s data.
            </li>
            <li>
              The feedback survey is anonymous. It is not linked to your name, email or certificate, and it is
              only asked once per device.
            </li>
          </ul>
        </Block>

        {status === 'empty' ? (
          <Block tab="Result" icon={<Award />} title="No match found">
            <p className="note-line">
              No certificate matched that name and email. Try the spelling used at registration, or the guardian
              email.
            </p>
          </Block>
        ) : null}

        {status === 'error' ? (
          <Block tab="Result" icon={<Award />} title="Lookup failed">
            <p className="note-line">{error}</p>
          </Block>
        ) : null}

        {results.length ? (
          <Block
            tab={unlocked ? 'Result' : 'Step 1'}
            icon={unlocked ? <Award /> : <Lock />}
            title={
              unlocked
                ? results.length === 1
                  ? 'Certificate found'
                  : 'Certificates found'
                : 'One step before your download'
            }
            aside={
              <span className="block-meta">
                {results.length} {results.length === 1 ? 'record' : 'records'}
              </span>
            }
          >
            {unlocked ? null : (
              <p className="note-line">
                We matched your registration. Complete the short feedback survey below and your download appears
                here.
              </p>
            )}
            <div className="projects">
              {results.map((result) => (
                <article className="cert-hit" key={`${result.year}-${result.name}-${result.url || 'pending'}`}>
                  <p className="project-team">{result.year}</p>
                  <h3>{result.name}</h3>
                  <p>{result.camp}</p>
                  {!result.url ? (
                    <span className="no-cta">A certificate has not been issued for this record yet.</span>
                  ) : unlocked ? (
                    <a className="cta" href={result.url} target="_blank" rel="noreferrer">
                      Download certificate <Download />
                    </a>
                  ) : (
                    <span className="no-cta">
                      <Lock size={14} aria-hidden="true" /> Locked until feedback is sent
                    </span>
                  )}
                </article>
              ))}
            </div>
          </Block>
        ) : null}

        {results.length && !unlocked ? (
          <FeedbackSurvey
            onComplete={() => {
              unlock(results);
              setUnlocked(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : null}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<CertificateApp />);
