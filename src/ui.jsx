import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function Masthead({ title = 'Portal', chip = 'Public-safe archive' }) {
  return (
    <header className="masthead">
      <div className="bar-inner">
        <div className="mark">
          <span className="mark-badge" aria-hidden="true">
            DCIT
          </span>
          <span>
            <span className="mark-dept">Department of Computing and Information Technology</span>
            <span className="mark-title">
              Boot Camp <em>{title}</em>
            </span>
          </span>
        </div>
        <p className="chip">
          <ShieldCheck />
          <span>{chip}</span>
        </p>
      </div>
    </header>
  );
}

export function Block({ tab, icon, title, aside, children }) {
  return (
    <section className="block">
      <div className="block-rail" aria-hidden="true">
        <span className="block-tab">{tab}</span>
        <span className="block-rail-line" />
      </div>
      <div>
        <div className="block-head">
          <h2>
            {icon}
            {title}
          </h2>
          {aside}
        </div>
        {children}
      </div>
    </section>
  );
}
