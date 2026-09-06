import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Award,
  Compass,
  ExternalLink,
  Globe,
  Handshake,
  Image as ImageIcon,
  Mail,
  MessageSquareQuote,
  Phone,
  Search,
  Sparkles
} from 'lucide-react';
import { applyPalette, paletteFor } from './lib/brand';
import { Block, Masthead } from './ui';
import './styles.css';

const CONTACT = {
  phone: '662-2002 ext 83640 / 83080 / 85385',
  email: 'DCIT.bootcamp@sta.uwi.edu',
  site: 'https://bit.ly/dcitbootcamp',
  siteLabel: 'bit.ly/dcitbootcamp'
};

function countOf(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function participantsOf(camp) {
  return countOf(camp.stats?.participantCount ?? camp.stats?.registrationRecordCount);
}

function factsFor(camp) {
  const stats = camp.stats || {};
  return [
    { label: 'Participants', value: stats.participantCount ?? stats.registrationRecordCount, primary: true },
    { label: 'Mentors', value: stats.mentorCount },
    { label: 'Teams', value: stats.teamCount },
    { label: 'Projects', value: stats.projectCount },
    { label: 'Sponsors', value: stats.sponsorCount },
    { label: 'Scholarships', value: stats.scholarshipCount },
    { label: 'Awards', value: camp.prizes?.length }
  ].filter((fact) => countOf(fact.value) > 0);
}

// The stored title usually ends with the year, which the poster numeral already carries.
function editionName(camp) {
  const title = String(camp.title || '').trim();
  return title.replace(new RegExp(`\\s*${camp.year}\\s*$`), '').trim() || title;
}

// Averages come straight from each edition's response sheet, so a whole number
// still needs a decimal to read as a score rather than a count.
function scoreOf(value, ceiling) {
  return Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)} / ${ceiling}` : null;
}

function metricsFor(feedback) {
  return [
    { label: 'Overall satisfaction', value: scoreOf(feedback.satisfaction, 5) },
    { label: 'Would recommend', value: scoreOf(feedback.recommend, 10) },
    {
      label: 'Net promoter score',
      value: Number.isFinite(Number(feedback.nps))
        ? `${Number(feedback.nps) > 0 ? '+' : ''}${feedback.nps}`
        : null
    },
    feedback.confidence
      ? { label: feedback.confidence.label, value: scoreOf(feedback.confidence.value, 5) }
      : null,
    countOf(feedback.wishLonger) > 0
      ? {
          label: 'Wanted a longer camp',
          value: `${feedback.wishLonger} of ${feedback.responseCount}`
        }
      : null
  ].filter((metric) => metric && metric.value);
}

function initialsOf(text) {
  return String(text || '')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

function App() {
  const [data, setData] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/bootcamps.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load bootcamp data: ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        setData(payload);
        const latestYear = payload.camps.map((entry) => entry.year).sort((a, b) => b - a)[0];
        setActiveYear(latestYear);
      })
      .catch((error) => {
        setData({ error: error.message, camps: [], sources: {} });
      });
  }, []);

  useEffect(() => {
    if (activeYear !== null) applyPalette(paletteFor(activeYear));
  }, [activeYear]);

  const years = useMemo(
    () => (data?.camps ? data.camps.map((entry) => entry.year).sort((a, b) => b - a) : []),
    [data]
  );
  const camp = useMemo(
    () => data?.camps?.find((entry) => entry.year === activeYear) ?? null,
    [data, activeYear]
  );
  const tracks = useMemo(() => {
    const byYear = {};
    for (const entry of data?.camps || []) byYear[entry.year] = entry.edition?.track;
    return byYear;
  }, [data]);

  const filteredTeams = useMemo(() => {
    if (!camp) return [];
    const needle = query.trim().toLowerCase();
    const teams = camp.teams || [];
    if (!needle) return teams;
    return teams.filter((team) =>
      [team.name, team.project, team.url].filter(Boolean).join(' ').toLowerCase().includes(needle)
    );
  }, [camp, query]);

  const totals = useMemo(() => {
    const camps = data?.camps || [];
    return {
      editions: camps.length,
      participants: camps.reduce((sum, entry) => sum + participantsOf(entry), 0),
      mentors: camps.reduce((sum, entry) => sum + countOf(entry.stats?.mentorCount), 0),
      projects: camps.reduce((sum, entry) => sum + countOf(entry.stats?.projectCount), 0),
      awards: camps.reduce((sum, entry) => sum + (entry.prizes?.length || 0), 0)
    };
  }, [data]);

  if (!data || activeYear === null) {
    return (
      <div className="shell">
        <div className="chrome">
          <Masthead />
        </div>
        <main className="sheet">
          <p className="standby">Loading public boot camp records…</p>
        </main>
      </div>
    );
  }

  if (data.error || !camp) {
    return (
      <div className="shell">
        <div className="chrome">
          <Masthead />
        </div>
        <main className="sheet">
          <p className="standby">{data.error || 'No boot camp record for the selected year.'}</p>
        </main>
      </div>
    );
  }

  const facts = factsFor(camp);
  const edition = camp.edition || {};
  const editionFacts = [
    { label: 'Dates', value: edition.dates },
    { label: 'Audience', value: edition.audience },
    { label: 'Format', value: edition.format },
    { label: 'Partners', value: edition.partners?.join(', ') }
  ].filter((entry) => entry.value);
  const hasEditionDetail =
    Boolean(edition.summary) ||
    editionFacts.length > 0 ||
    Boolean(edition.topics?.length) ||
    Boolean(edition.stack?.length);
  const teams = camp.teams || [];
  const sponsors = camp.sponsors || [];
  const prizes = camp.prizes || [];
  const galleryItems = teams.filter((team) => team.image);
  const feedback = camp.feedback || null;
  const feedbackMetrics = feedback ? metricsFor(feedback) : [];
  const feedbackQuotes = feedback?.quotes || [];

  return (
    <div className="shell">
      <div className="chrome">
        <Masthead />
        <div className="rail">
          <div className="bar-inner">
            <span className="rail-label">Editions</span>
            <div className="years" role="tablist" aria-label="Boot camp editions">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  role="tab"
                  className="year"
                  aria-selected={year === activeYear}
                  aria-controls="edition"
                  title={tracks[year] ? `${year} · ${tracks[year]}` : String(year)}
                  style={{ '--year-tone': paletteFor(year).brand }}
                  onClick={() => setActiveYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="sheet" id="edition" role="tabpanel" aria-label={`${camp.year} boot camp`}>
        <section className="edition">
          <div>
            <p className="kicker">{edition.track ? `${edition.track} edition` : 'Boot camp edition'}</p>
            <h1 className="edition-title">{editionName(camp)}</h1>
            {edition.theme ? <p className="edition-theme">“{edition.theme}”</p> : null}
          </div>
          <p className="edition-year">{camp.year}</p>
        </section>

        {facts.length ? (
          <div className="facts">
            {facts.map((fact) => (
              <div className={fact.primary ? 'plate plate-primary' : 'plate'} key={fact.label}>
                <p className="plate-label">{fact.label}</p>
                <p className="plate-value">{countOf(fact.value)}</p>
              </div>
            ))}
          </div>
        ) : null}

        {hasEditionDetail ? (
          <Block
            tab="Focus"
            icon={<Compass />}
            title={edition.track ? `${edition.track} focus` : 'Edition focus'}
            aside={
              edition.source ? (
                <a className="block-link" href={edition.source} target="_blank" rel="noreferrer">
                  Official page <ExternalLink />
                </a>
              ) : null
            }
          >
            {edition.summary ? <p className="lede">{edition.summary}</p> : null}

            {editionFacts.length ? (
              <dl className="specs">
                {editionFacts.map((entry) => (
                  <div key={entry.label}>
                    <dt>{entry.label}</dt>
                    <dd>{entry.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {edition.topics?.length ? (
              <div className="tag-set">
                <p className="tag-label">Covered</p>
                <ul className="tags">
                  {edition.topics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {edition.stack?.length ? (
              <div className="tag-set">
                <p className="tag-label">Tools</p>
                <ul className="tags tags-plain">
                  {edition.stack.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Block>
        ) : null}

        <Block
          tab="Projects"
          icon={<Sparkles />}
          title="Teams and projects"
          aside={
            teams.length > 6 ? (
              <label className="field">
                <Search />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search teams or projects"
                  aria-label="Search teams or projects"
                />
              </label>
            ) : teams.length ? (
              <span className="block-meta">
                {teams.length} {teams.length === 1 ? 'team' : 'teams'}
              </span>
            ) : null
          }
        >
          {teams.length === 0 ? (
            <p className="note-line">No team records were published for {camp.year}.</p>
          ) : filteredTeams.length === 0 ? (
            <p className="note-line">No team or project matches “{query.trim()}”.</p>
          ) : (
            <div className="projects">
              {filteredTeams.map((team) => (
                <article className="project" key={`${camp.year}-${team.name}-${team.project}`}>
                  {team.image ? (
                    <div className="plate-art">
                      <img src={team.image} alt={`${team.project || team.name} screenshot`} />
                    </div>
                  ) : null}
                  <div className="project-body">
                    {team.image ? null : (
                      <span className="project-monogram" aria-hidden="true">
                        {initialsOf(team.project || team.name)}
                      </span>
                    )}
                    <div className="project-copy">
                      <p className="project-team">{team.name}</p>
                      <h3>{team.project || 'Project title pending'}</h3>
                      {team.url ? (
                        <a className="cta" href={team.url} target="_blank" rel="noreferrer">
                          Open project <ExternalLink />
                        </a>
                      ) : (
                        <span className="no-cta">No public link on record</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Block>

        <Block
          tab="Awards"
          icon={<Award />}
          title="Prize winners"
          aside={
            prizes.length ? (
              <span className="block-meta">
                {prizes.length} {prizes.length === 1 ? 'category' : 'categories'}
              </span>
            ) : null
          }
        >
          {prizes.length ? (
            <div className="awards">
              {prizes.map((prize) => (
                <article className="award" key={`${camp.year}-${prize.category}`}>
                  <h3>{prize.category}</h3>
                  <p>{prize.winners.join(' · ')}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="note-line">No award records were published for {camp.year}.</p>
          )}
        </Block>

        <Block tab="Sponsors" icon={<Handshake />} title="Sponsors and scholarships">
          {sponsors.length ? (
            <div className="rows">
              {sponsors.map((sponsor, index) => (
                <div className="row" key={`${camp.year}-sponsor-${index}`}>
                  <p className="row-name">{sponsor.name || 'Unnamed sponsor record'}</p>
                  <p className="row-side">
                    {sponsor.tier || sponsor.type || 'Sponsor'}
                    {countOf(sponsor.scholarships) > 0 ? (
                      <span className="row-meta">
                        {sponsor.scholarships}{' '}
                        {sponsor.scholarships === 1 ? 'scholarship' : 'scholarships'}
                      </span>
                    ) : null}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="note-line">No sponsor records were published for {camp.year}.</p>
          )}
        </Block>

        {galleryItems.length ? (
          <Block tab="Gallery" icon={<ImageIcon />} title="Image gallery">
            <div className="gallery">
              {galleryItems.map((item) => (
                <figure key={`${camp.year}-gallery-${item.name}`}>
                  <img src={item.image} alt={`${item.project || item.name} gallery item`} />
                  <figcaption>{item.project || item.name}</figcaption>
                </figure>
              ))}
            </div>
          </Block>
        ) : null}

        {feedback ? (
          <Block
            tab="Voices"
            icon={<MessageSquareQuote />}
            title="Participant feedback"
            aside={
              countOf(feedback.responseCount) > 0 ? (
                <span className="block-meta">
                  {feedback.responseCount} {feedback.responseCount === 1 ? 'response' : 'responses'}
                </span>
              ) : null
            }
          >
            {feedbackMetrics.length ? (
              <div className="scores">
                {feedbackMetrics.map((metric) => (
                  <div className="score" key={metric.label}>
                    <p className="score-value">{metric.value}</p>
                    <p className="score-label">{metric.label}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {feedbackQuotes.length ? (
              <div className="quotes">
                {feedbackQuotes.map((quote, index) => (
                  <figure className="quote" key={`${camp.year}-quote-${index}`}>
                    <blockquote>{quote.text}</blockquote>
                    <figcaption>
                      {camp.year} participant
                      {quote.prompt ? <span className="quote-prompt">{quote.prompt}</span> : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : null}

            {feedback.note ? <p className="note-line">{feedback.note}</p> : null}
          </Block>
        ) : null}
      </main>

      <footer className="colophon">
        <div className="colophon-inner">
          <section>
            <h3>Archive totals</h3>
            <div className="totals">
              <p>
                <span className="total-value">{totals.editions}</span>
                <span className="total-label">Editions</span>
              </p>
              <p>
                <span className="total-value">{totals.participants}</span>
                <span className="total-label">Participants</span>
              </p>
              <p>
                <span className="total-value">{totals.mentors}</span>
                <span className="total-label">Mentors</span>
              </p>
              <p>
                <span className="total-value">{totals.projects}</span>
                <span className="total-label">Projects</span>
              </p>
              <p>
                <span className="total-value">{totals.awards}</span>
                <span className="total-label">Awards</span>
              </p>
            </div>
          </section>

          <section>
            <h3>More info</h3>
            <div className="contact">
              <span>
                <Phone /> {CONTACT.phone}
              </span>
              <a href={`mailto:${CONTACT.email}`}>
                <Mail /> {CONTACT.email}
              </a>
              <a href={CONTACT.site} target="_blank" rel="noreferrer">
                <Globe /> {CONTACT.siteLabel}
              </a>
            </div>
          </section>

          <section>
            <h3>About this archive</h3>
            <p>
              Public-safe records only: teams, projects, mentors, sponsors, awards, and counts. Participant
              contact details are never published here.
            </p>
          </section>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
