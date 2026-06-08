/* TUNK — shared components. Exports to window for cross-file Babel scope. */

const { useState, useEffect, useRef } = React;

/* ---------- scroll-reveal (brand-legal: opacity + small translate) ----------
   IntersectionObserver is unreliable inside preview iframes, so we use a
   shared rAF/scroll checker against getBoundingClientRect, plus a hard
   fallback that reveals everything after a beat — content is never stuck. */
const _revealEls = new Set();
let _revealWired = false;
function _checkReveals() {
  const vh = window.innerHeight || 800;
  _revealEls.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < vh * 0.92) {
      const d = +el.dataset.revealDelay || 0;
      setTimeout(() => el.classList.add('in'), d);
      _revealEls.delete(el);
    }
  });
}
function _wireReveals() {
  if (_revealWired) return;
  _revealWired = true;
  window.addEventListener('scroll', _checkReveals, { passive: true });
  window.addEventListener('resize', _checkReveals);
}
function _registerReveal(el, delay) {
  if (!el) return;
  el.dataset.revealDelay = delay || 0;
  _revealEls.add(el);
  _wireReveals();
  requestAnimationFrame(() => requestAnimationFrame(_checkReveals));
  // hard safety: never leave anything hidden
  setTimeout(() => {if (_revealEls.has(el)) {el.classList.add('in');_revealEls.delete(el);}}, 1600);
}

function Reveal({ as = 'div', delay = 0, className = '', style = {}, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;if (!el) return;
    el.classList.remove('in');
    _registerReveal(el, delay);
  }, [delay]);
  const Tag = as;
  return <Tag ref={ref} className={`reveal ${className}`} style={style} {...rest}>{children}</Tag>;
}

/* ---------- live clock (Istanbul) ---------- */
function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => {
      try {
        const s = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Istanbul' }).format(new Date());
        setT(s);
      } catch (e) {setT('');}
    };
    tick();const id = setInterval(tick, 10000);return () => clearInterval(id);
  }, []);
  return <span className="clock">IST {t}</span>;
}

/* ---------- placeholder / real-image frame ---------- */
function Frame({ ratio = '4/3', num = '№ 00', meta = '', dim = '', accent = null, wm = null, img = null, alt = '', bare = false, style = {} }) {
  // bare = just the photograph: no frame chrome, crop marks, numbers, labels.
  if (bare) {
    return (
      <div className={`frame bare ${img ? 'has-img' : ''}`} style={{ aspectRatio: ratio, ...style }}>
        {img
          ? <img className="frame-img" src={img} alt={alt} loading="lazy" />
          : <React.Fragment><div className="grain" /><div className="inset" /></React.Fragment>}
      </div>);
  }
  return (
    <div className={`frame ${img ? 'has-img' : ''}`} style={{ aspectRatio: ratio, ...style }}>
      {img ? (
        <img className="frame-img" src={img} alt={alt} loading="lazy" />
      ) : (
        <React.Fragment>
          <div className="grain" />
          <div className="inset" />
        </React.Fragment>
      )}
      <span className="crop-tl" /><span className="crop-br" />
      {wm && <div className="wm">{wm}</div>}
      <span className="f-num lab">{num}</span>
      {meta && <span className="f-meta lab">{meta}</span>}
      {dim && <span className="f-dim lab">{dim}</span>}
      {accent && !img && <div className="accent-wash" style={{ backgroundColor: `var(--${accent}-tr)` }} />}
    </div>);

}

/* ---------- nav ---------- */
function Nav({ page, go, dark = false }) {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // Over the slideshow / image hero (not scrolled): transparent nav, white
  // text & logo. Once scrolled (solid white nav) or on other pages: black.
  const overlay = dark && !solid;
  const cls = `nav2 ${solid || !dark ? 'solid' : ''}`;
  const logo = overlay ? window.TUNK_LOGO_WHITE : window.TUNK_LOGO_BLACK;
  const col = overlay ? 'var(--paper)' : 'var(--ink)';
  return (
    <header className={cls} style={{ color: col, height: "66px" }}>
      <div className="brand" onClick={() => go({ id: 'home' })}>
        <img src={logo} alt="TUNK" />
        <span className="disc">{DATA.site.discipline}</span>
      </div>
      <nav className="links">
        {DATA.nav.map((l) =>
        <a key={l.id}
        className={page.id === l.id || l.id === 'work' && page.id === 'project' ? 'is-active' : ''}
        onClick={() => go({ id: l.id })}>{l.label}</a>
        )}
      </nav>
    </header>);

}

/* ---------- footer ---------- */
function Footer({ go }) {
  const f = DATA.footer;
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="top">
          <div>
            <div className="word">TUNK</div>
            <div className="mono" style={{ color: 'var(--aluminium)', marginTop: 18 }}>
              {f.tagline}<br />{f.location}
            </div>
          </div>
          <div>
            <div className="h">Studio</div>
            <div className="links">
              <a onClick={() => go({ id: 'work' })}>Work</a>
              <a onClick={() => go({ id: 'about' })}>About</a>
              <a onClick={() => go({ id: 'press' })}>Press</a>
            </div>
          </div>
          <div>
            <div className="h">Contact</div>
            <div className="mono">{DATA.contact.email}</div>
          </div>
          <div>
            <div className="h">Follow</div>
            <div className="links">
              <a>{f.instagram}</a>
              <a>{f.newsletter}</a>
            </div>
          </div>
        </div>
        <div className="legal">
          <span>{DATA.site.copyright}</span>
          <span>VAT 0000000000 · Legal · Cookies</span>
        </div>
      </div>
    </footer>);

}

/* ---------- work tile ---------- */
function Tile({ p, go }) {
  const loc = p.location ? p.location.split(',')[0].toUpperCase() : 'ISTANBUL';
  return (
    <div className="tile2" onClick={() => go({ id: 'project', project: p })}>
      <Frame ratio="4/3" num={`№ ${p.cat}`} meta={`${loc} · ${p.kind.toUpperCase()}`}
      img={p.hero} alt={p.name} accent={p.accent} wm={p.cat} />
      <div className="meta">
        <div className="nm">{p.name}</div>
        <div className="yr">{p.yearLabel}</div>
      </div>
      <div className="sub">{p.category} · {p.kind}</div>
    </div>);

}

/* ---------- lightbox — fullscreen image viewer with prev/next + swipe ---------- */
function Lightbox({ images = [], index = 0, title = '', onClose }) {
  const [i, setI] = useState(index);
  useEffect(() => { setI(index); }, [index]);
  const n = images.length;
  const go = (d) => setI(v => (v + d + n) % n);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [n]);
  // swipe
  const tx = useRef(null);
  const onTS = (e) => { tx.current = e.touches[0].clientX; };
  const onTE = (e) => {
    if (tx.current == null) return;
    const dx = e.changedTouches[0].clientX - tx.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    tx.current = null;
  };
  if (!n) return null;
  return (
    <div className="lb" onClick={onClose} onTouchStart={onTS} onTouchEnd={onTE}>
      <div className="lb-top" onClick={(e) => e.stopPropagation()}>
        <span className="lab" style={{ color: 'var(--paper)' }}>{title}</span>
        <span className="lab" style={{ color: 'var(--paper)' }}>{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        <button className="lb-x" aria-label="Close" onClick={onClose}>✕</button>
      </div>
      <button className="lb-arrow prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); go(-1); }}>←</button>
      <img className="lb-img" src={images[i]} alt={`${title} ${i + 1}`} onClick={(e) => e.stopPropagation()} />
      <button className="lb-arrow next" aria-label="Next" onClick={(e) => { e.stopPropagation(); go(1); }}>→</button>
      <div className="lb-dots" onClick={(e) => e.stopPropagation()}>
        {images.map((s, k) => (
          <button key={k} className={`dot ${k === i ? 'on' : ''}`} aria-label={`Image ${k + 1}`} onClick={() => setI(k)} />
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Reveal, Clock, Frame, Nav, Footer, Tile, Lightbox });