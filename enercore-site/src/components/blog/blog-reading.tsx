'use client';

import { useEffect, useState } from 'react';

/** Slim progress bar fixed to the top of the viewport that fills as you scroll. */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (el.scrollTop / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent">
      <div className="h-full bg-brand-lime transition-[width] duration-75" style={{ width: `${progress}%` }} />
    </div>
  );
}

interface Heading { id: string; text: string; level: number; }

/** Builds a table of contents from the rendered article's h2/h3 elements. */
export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    const article = document.getElementById('article-body');
    if (!article) return;
    const els = Array.from(article.querySelectorAll('h2, h3')) as HTMLElement[];
    const hs = els.map((el, i) => {
      if (!el.id) el.id = `heading-${i}`;
      return { id: el.id, text: el.textContent ?? '', level: el.tagName === 'H2' ? 2 : 3 };
    });
    setHeadings(hs);

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-80px 0px -70% 0px' },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="text-sm">
      <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-wide text-brand-grey">On this page</p>
      <ul className="space-y-2 border-l border-brand-lgrey">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? 20 : 12 }}>
            <a
              href={`#${h.id}`}
              className={`block border-l-2 -ml-px pl-3 transition-colors ${
                active === h.id ? 'border-brand-lime font-medium text-brand-navy' : 'border-transparent text-brand-grey hover:text-brand-navy'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Share row: native share where available, plus copy-link. */
export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
    } else {
      copy();
    }
  }
  async function copy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const url = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const text = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-brand-grey">Share</span>
      <a href={`https://twitter.com/intent/tweet?text=${text}&url=${url}`} target="_blank" rel="noopener noreferrer"
        className="rounded-full border border-brand-lgrey px-3 py-1.5 text-sm hover:border-brand-lime hover:text-brand-green">X</a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`} target="_blank" rel="noopener noreferrer"
        className="rounded-full border border-brand-lgrey px-3 py-1.5 text-sm hover:border-brand-lime hover:text-brand-green">LinkedIn</a>
      <a href={`https://api.whatsapp.com/send?text=${text}%20${url}`} target="_blank" rel="noopener noreferrer"
        className="rounded-full border border-brand-lgrey px-3 py-1.5 text-sm hover:border-brand-lime hover:text-brand-green">WhatsApp</a>
      <button onClick={copy}
        className="rounded-full border border-brand-lgrey px-3 py-1.5 text-sm hover:border-brand-lime hover:text-brand-green">
        {copied ? 'Copied!' : 'Copy link'}
      </button>
      <button onClick={share}
        className="rounded-full bg-brand-green px-3 py-1.5 text-sm text-white hover:bg-brand-navy">Share…</button>
    </div>
  );
}
