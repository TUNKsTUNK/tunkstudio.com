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
const SITE_TAGLINE = 'Architecture, Immersive Installations & Exhibition Design, Istanbul';
const SITE_DESC = "TUNK: mimarlık ofisi, sergi tasarımı, mekânsal enstalasyon, aydınlatma ve ürün tasarımı stüdyosu, Galata, İstanbul. Architecture, immersive installation and exhibition design studio in Istanbul, with retail interiors and kiosks, museum exhibitions, installation design for artists, lighting, furniture and residential architecture.";
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
  'Installation Design': 'Enstalasyon Tasarımı',
  'Set & Atmosphere Design': 'Set ve Atmosfer Tasarımı',
  'Spatial Set Design': 'Mekânsal Set Tasarımı',
  'Set Design': 'Set Tasarımı',
  'Installation · Performance': 'Işık ve Ses Enstalasyonu',
  'Spatial Video Installation': 'Mekânsal Video Enstalasyonu',
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
    const title = `${p.name} | ${kindTR ? kindTR + ', ' : ''}${locTR} · TUNK`;
    const desc = [kindTR, locTR, p.yearLabel].filter(Boolean).join(' · ') + '. '
      + (p.summary || '') + ` ${p.kind || p.category || ''}, ${loc}. `
      + 'TUNK: İstanbul mimarlık, sergi tasarımı ve mekânsal enstalasyon stüdyosu.';
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
        // every project photo, captioned with the studio name so image search ties the work to TUNK
        image: (() => {
          const srcs = [p.hero, ...(p.gallery || []).map((g) => (typeof g === 'string' ? g : g.src))]
            .filter((g, k, a) => g && /\.(jpe?g|png|webp)$/i.test(g) && a.indexOf(g) === k);
          return srcs.length ? srcs.map((g) => ({
            '@type': 'ImageObject',
            contentUrl: base + '/' + g.replace(/^\.?\//, ''),
            caption: `${p.name} by TUNK, ${p.kind || p.category || ''}, ${loc}`,
            creditText: p.photographer || undefined,
            creator: { '@type': 'Organization', '@id': base + '/#studio', name: SITE_NAME },
          })) : undefined;
        })(),
        dateCreated: p.yearLabel || String(p.year || ''),
        locationCreated: { '@type': 'Place', name: loc },
        keywords: [p.category, p.kind, ...(p.tags || [])].filter(Boolean).join(', '),
        award: p.award || undefined,
        creator: { '@type': 'Organization', '@id': base + '/#studio', name: SITE_NAME, url: base },
      },
    };
  }
  const map = {
    home: {
      title: `TUNK | İstanbul Mimarlık, Sergi Tasarımı ve Mekânsal Enstalasyon Stüdyosu`,
      desc: SITE_DESC,
      url: base + '/',
    },
    work: {
      title: `Projeler / Work: Mimarlık, Sergi Tasarımı ve Mekânsal Enstalasyon · TUNK İstanbul`,
      desc: 'Selected work by TUNK: sergi tasarımı, mekânsal enstalasyon, perakende mağaza tasarımı, aydınlatma tasarımı ve konut mimarisi. Exhibition architecture, retail interiors, installation art, lighting design and residential architecture in Istanbul.',
      url: base + '/work',
    },
    about: {
      title: `Hakkında / About: TUNK · İstanbul Mimarlık ve Tasarım Stüdyosu`,
      desc: 'TUNK, İstanbul merkezli bir mimarlık ve tasarım stüdyosu: mimarlık, iç mekan, sergi tasarımı, enstalasyon, aydınlatma ve ürün tasarımı. ' + String(DATA.about.p1 || SITE_DESC).split('\n')[0],
      url: base + '/about',
    },
    press: {
      title: `Basın / Press: TUNK · Frame, ArchDaily, Designboom, Design Milk`,
      desc: 'TUNK basında: ArchDaily, Designboom ve Arkitera\u2019da yayımlanan mimarlık, sergi ve enstalasyon projeleri. Press and coverage of TUNK\u2019s architecture, exhibition and installation work, featured in Arkitera, ArchDaily and Designboom.',
      url: base + '/press',
    },
    contact: {
      title: `İletişim / Contact: TUNK · Galata, İstanbul Mimarlık Ofisi`,
      desc: 'TUNK ile iletişim: Galata, İstanbul. Mimarlık, iç mimarlık, mağaza ve sergi tasarımı, enstalasyon projeleri için. Get in touch with TUNK, an architecture, exhibition and installation design studio in Galata, Istanbul.',
      url: base + '/contact',
    },
    kvkk: {
      title: `KVKK ve Gizlilik Politikası · TUNK`,
      desc: 'TUNK KVKK aydınlatma metni ve gizlilik politikası: tunkstudio.com ziyaretçilerinin ve stüdyo ile iletişime geçenlerin kişisel verilerinin işlenmesi, haklar ve başvuru yolu. Privacy policy.',
      url: base + '/kvkk',
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
