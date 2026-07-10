/* TUNK — per-page SEO: document title, meta description, canonical,
   Open Graph / Twitter cards, and JSON-LD structured data. Runs client-side
   on every page change; Google's crawler executes JS, so this is picked up
   for indexing even though the shell is a single static index.html. */

window.SITE_URL = 'https://tunkstudio.com';

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
  el.setAttribute('href', href);
}
function upsertLD(id, obj) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(obj);
}

const SITE_NAME = 'TUNK Studio';
const SITE_TAGLINE = 'Architecture, Exhibition, Product & Installation Design — Istanbul';
const SITE_DESC = "TUNK Studio — mimarlık ofisi, sergi tasarımı, mekansal enstalasyon, aydınlatma ve ürün tasarımı stüdyosu, Galata, İstanbul. Architecture, exhibition, installation and product design studio in Istanbul — retail interiors, museum exhibitions, spatial installations, lighting, furniture and residential architecture.";
const DEFAULT_IMAGE = window.SITE_URL + '/assets/logo-tunk-black.png';

function pageSEO(page) {
  const base = window.SITE_URL;
  if (page.id === 'project' && page.project) {
    const p = page.project;
    const loc = p.location || 'Istanbul';
    const title = `${p.name} — ${SITE_NAME}`;
    const desc = (p.summary || SITE_DESC) + ` ${p.kind || p.category || ''} — ${loc}.`;
    return {
      title, desc,
      url: base + '/work/' + p.slug,
      image: p.hero ? base + '/' + p.hero.replace(/^\.?\//, '') : DEFAULT_IMAGE,
      ld: {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: p.name,
        description: p.summary || desc,
        url: base + '/work/' + p.slug,
        image: p.hero ? base + '/' + p.hero.replace(/^\.?\//, '') : undefined,
        dateCreated: p.yearLabel || String(p.year || ''),
        creator: { '@type': 'Organization', name: SITE_NAME, url: base },
        locationCreated: { '@type': 'Place', name: loc },
        keywords: [p.category, p.kind, ...(p.tags || [])].filter(Boolean).join(', '),
      },
    };
  }
  const map = {
    home: {
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      desc: SITE_DESC,
      url: base + '/',
    },
    work: {
      title: `Work — ${SITE_NAME} | Architecture, Exhibition & Installation Projects`,
      desc: 'Selected work by TUNK Studio: sergi tasarımı, mekansal enstalasyon, perakende mağaza tasarımı, aydınlatma tasarımı ve konut mimarisi. Exhibition architecture, retail interiors, installation art, lighting design and residential architecture in Istanbul.',
      url: base + '/work',
    },
    about: {
      title: `About — ${SITE_NAME} | Istanbul Architecture & Design Studio`,
      desc: DATA.about.p1 || SITE_DESC,
      url: base + '/about',
    },
    press: {
      title: `Press — ${SITE_NAME}`,
      desc: 'Press and coverage of TUNK Studio\u2019s architecture, exhibition and installation work, featured in Arkitera, ArchDaily and Designboom.',
      url: base + '/press',
    },
    contact: {
      title: `Contact — ${SITE_NAME} | Galata, Istanbul`,
      desc: 'Get in touch with TUNK Studio — architecture, exhibition and installation design studio in Galata, Istanbul.',
      url: base + '/contact',
    },
  };
  return map[page.id] || map.home;
}

function applySEO(page) {
  const seo = pageSEO(page);
  document.title = seo.title;
  upsertMeta('name', 'description', seo.desc);
  upsertLink('canonical', seo.url);
  upsertMeta('property', 'og:type', page.id === 'project' ? 'article' : 'website');
  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:title', seo.title);
  upsertMeta('property', 'og:description', seo.desc);
  upsertMeta('property', 'og:url', seo.url);
  upsertMeta('property', 'og:image', seo.image || DEFAULT_IMAGE);
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', seo.title);
  upsertMeta('name', 'twitter:description', seo.desc);
  upsertMeta('name', 'twitter:image', seo.image || DEFAULT_IMAGE);

  if (seo.ld) upsertLD('ld-page', seo.ld);
  else { const el = document.getElementById('ld-page'); if (el) el.remove(); }
}

window.applySEO = applySEO;
