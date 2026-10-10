/* TUNK: per-page SEO: document title, meta description, canonical,
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

const SITE_NAME = 'TUNK';
const SITE_TAGLINE = 'Architecture, Exhibition, Product & Installation Design, Istanbul';
const SITE_DESC = "TUNK Studio: mimarlık ofisi, sergi tasarımı, mekansal enstalasyon, aydınlatma ve ürün tasarımı stüdyosu, Galata, İstanbul. Architecture, exhibition, installation and product design studio in Istanbul, with retail interiors, museum exhibitions, spatial installations, lighting, furniture and residential architecture.";
const DEFAULT_IMAGE = window.SITE_URL + '/assets/logo-tunk-black.png';

// project.kind / project.category (English, from data.js) -> Turkish search phrase
const KIND_TR = {
  'Interior & Lighting': 'İç Mekan ve Aydınlatma Tasarımı',
  'Immersive Exhibition': 'Sürükleyici Sergi Tasarımı',
  'Exhibition Architecture': 'Sergi Mimarisi ve Sergi Tasarımı',
  'Exhibition': 'Sergi Tasarımı',
  'Commercial Interior': 'Ticari İç Mekan Tasarımı',
  'Residential Interior': 'Konut İç Mimarisi',
  'Office Interior': 'Ofis İç Mimarisi',
  'Education Interior': 'Atölye ve Eğitim Mekanı Tasarımı',
  'Residential': 'Konut Mimarisi',
  'Retail Design': 'Mağaza Tasarımı',
  'Lighting Design': 'Aydınlatma Tasarımı',
  'Installation': 'Enstalasyon Tasarımı',
  'Installation · Performance': 'Işık ve Ses Enstalasyonu',
  'Permanent Installation': 'Kalıcı Enstalasyon',
  'Temporary Installation': 'Geçici Enstalasyon',
  'Proposal · Unrealised': 'Mimari Öneri',
  'Architecture': 'Mimarlık',
  'Product Design': 'Ürün Tasarımı',
};
const trPlace = (s) => String(s || 'Istanbul').replace(/Istanbul/g, 'İstanbul').replace(/ Museum/g, ' Müzesi');

function pageSEO(page) {
  const base = window.SITE_URL;
  if (page.id === 'project' && page.project) {
    const p = page.project;
    const loc = p.location || 'Istanbul';
    // Turkish discipline + place in the title/description: most searches for
    // this kind of work are in Turkish ("sergi tasarımı", "konut iç mimarisi").
    const kindTR = KIND_TR[p.kind] || KIND_TR[p.category] || '';
    const locTR = trPlace(loc);
    const title = `${p.name} | ${kindTR ? kindTR + ', ' : ''}${locTR} · TUNK Studio`;
    const desc = [kindTR, locTR, p.yearLabel].filter(Boolean).join(' · ') + '. '
      + (p.summary || '') + ` ${p.kind || p.category || ''}, ${loc}. `
      + 'TUNK Studio: İstanbul mimarlık, sergi tasarımı ve enstalasyon ofisi.';
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
      title: `TUNK Studio | İstanbul Mimarlık, Sergi Tasarımı ve Enstalasyon Ofisi`,
      desc: SITE_DESC,
      url: base + '/',
    },
    work: {
      title: `Projeler / Work: Mimarlık, Sergi Tasarımı ve Enstalasyon · TUNK Studio İstanbul`,
      desc: 'Selected work by TUNK Studio: sergi tasarımı, mekansal enstalasyon, perakende mağaza tasarımı, aydınlatma tasarımı ve konut mimarisi. Exhibition architecture, retail interiors, installation art, lighting design and residential architecture in Istanbul.',
      url: base + '/work',
    },
    about: {
      title: `Hakkında / About: Büşra Tunç ve TUNK Studio · İstanbul Mimarlık ve Tasarım Ofisi`,
      desc: 'Büşra Tunç tarafından 2014\u2019te kurulan TUNK Studio, Galata, İstanbul\u2019da mimarlık, sergi tasarımı, ürün tasarımı ve enstalasyon üzerine çalışan disiplinlerarası bir stüdyo. ' + String(DATA.about.p1 || SITE_DESC).split('\n')[0],
      url: base + '/about',
    },
    press: {
      title: `Basın / Press: TUNK Studio · ArchDaily, Designboom, Arkitera`,
      desc: 'TUNK Studio basında: ArchDaily, Designboom ve Arkitera\u2019da yayımlanan mimarlık, sergi ve enstalasyon projeleri. Press and coverage of TUNK Studio\u2019s architecture, exhibition and installation work, featured in Arkitera, ArchDaily and Designboom.',
      url: base + '/press',
    },
    contact: {
      title: `İletişim / Contact: TUNK Studio · Galata, İstanbul Mimarlık Ofisi`,
      desc: 'TUNK Studio ile iletişim: Galata, İstanbul. Mimarlık, iç mimarlık, mağaza ve sergi tasarımı, enstalasyon projeleri için. Get in touch with TUNK Studio, an architecture, exhibition and installation design studio in Galata, Istanbul.',
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
