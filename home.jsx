/* TUNK — Home page (immersive long-scroll). 3 hero directions via tweak. */

function HeroStatement({ go }) {
  const h = DATA.home;
  return (
    <section className="hero-full">
      <div className="heroA">
        <Reveal className="lab lab-ink eyebrow">{h.eyebrow}</Reveal>
        <Reveal as="h1" className="mega statement" delay={60} style={{ whiteSpace: 'normal', fontSize: 'clamp(40px, 8vw, 92px)' }}>
          {h.statement}
        </Reveal>
        <Reveal className="meta-grid" delay={140}>
          {h.metaCols.map((c, i) =>
          <div className="col" key={i}>
              <span className="lab k">{c.k}</span>
              <span className="lab v" style={{ whiteSpace: 'pre-line' }}>{c.v}</span>
            </div>
          )}
        </Reveal>
      </div>
      <div className="heroA" style={{ flex: '0 0 auto', paddingTop: 0, paddingBottom: 40 }}>
        <div className="scrollcue lab lab-ink"><span className="ln" /> SCROLL — SELECTED WORK</div>
      </div>
    </section>);

}

function HeroFeature({ go }) {
  const h = DATA.home;
  // Homepage slideshow: one strong image per photographed project, in curated order.
  // Each slide links to its own project, so the hero showcases the whole studio.
  const order = ['parfumlab-pneuma', 'yesim-evi', 'oculus', 'postane', 'samih-rifat', 'hali-atolyesi', 'paintshop', 'liminal'];
  const featured = order
    .map((s) => DATA.projects.find((p) => p.slug === s))
    .filter((p) => p && hasPhotos(p));
  const slides = featured.length
    ? featured.map((p) => ({ img: p.hero, p }))
    : [{ img: null, p: DATA.projects[0] }];

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [op, setOp] = useState(1); // opacity of the incoming (top) layer
  const prevRef = useRef(0); // index of the image held on the bottom layer
  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [paused, slides.length]);
  // Preload only the NEXT slide's image (not all of them) so the crossfade stays
  // instant without forcing the browser to download every project's hero at once
  // on first paint — that alone was several MB of unseen images.
  useEffect(() => {
    const next = slides[(i + 1) % slides.length];
    if (next && next.img) { const im = new Image(); im.src = next.img; }
  }, [i, slides]);
  // Smooth crossfade: bottom layer holds the previous image at full opacity while
  // the incoming image fades in on top (many small JS steps — CSS transitions
  // freeze in this preview compositor, but timers run, so this stays smooth).
  useEffect(() => {
    setOp(0);
    const steps = 28,dur = 900;
    let s = 0;
    const id = setInterval(() => {
      s += 1;
      const t = s / steps;
      setOp(t < 1 ? (1 - Math.cos(t * Math.PI)) / 2 : 1); // ease-in-out
      if (s >= steps) {clearInterval(id);prevRef.current = i;}
    }, dur / steps);
    return () => clearInterval(id);
  }, [i]);

  const cur = slides[i].p;
  const loc = cur.location ? cur.location.split(',')[0].toUpperCase() : 'ISTANBUL';
  const curImg = slides[i].img;
  const prevImg = slides[prevRef.current] ? slides[prevRef.current].img : curImg;

  return (
    <section className="hero-full">
      <div className="heroB" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {/* bottom layer: previous image, held full-opacity (no dark gap) */}
        <div className="album-photo" style={{ backgroundImage: prevImg ? `url(${prevImg})` : 'none' }} />
        {/* top layer: incoming image fading in */}
        <div className="album-photo" onClick={() => go({ id: 'project', project: cur })}
        style={{ backgroundImage: curImg ? `url(${curImg})` : 'none', opacity: op, cursor: 'pointer' }} />
        <div className="scrim" />
        <div className="overlay-top">
          <span className="lab" style={{ color: 'rgba(255,255,255,.85)' }}>{h.eyebrow}</span>
        </div>
        <div className="overlay-bottom">
          <h1 className="mega statement">{h.statement}</h1>
          <div className="feature-meta">
            <div onClick={() => go({ id: 'project', project: cur })} style={{ cursor: 'pointer' }}>
              <div className="lab" style={{ color: 'rgba(255,255,255,.9)', marginBottom: 6 }}>{cur.name}</div>
              <div className="lab" style={{ color: 'rgba(255,255,255,.7)' }}>{cur.kind.toUpperCase()} · {loc} · {cur.yearLabel}</div>
            </div>
            <div className="album-dots">
              {slides.map((s, n) =>
              <button key={n} className={`dot ${n === i ? 'on' : ''}`} aria-label={`Slide ${n + 1}`}
              onClick={(e) => {e.stopPropagation();setI(n);}} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>);

}

function HeroIndex({ go }) {
  const h = DATA.home;
  return (
    <section className="hero-full">
      <div className="heroC">
        <div className="left">
          <Reveal className="lab lab-ink" style={{ marginBottom: 28 }}>{h.eyebrow}</Reveal>
          <Reveal as="h1" className="mega statement" delay={60} style={{ whiteSpace: 'pre-line' }}>{h.statementShort}</Reveal>
          <Reveal delay={120}>
            <p style={{ maxWidth: 360, marginTop: 28, fontSize: 15, lineHeight: 1.6, color: 'var(--graphite)' }}>{h.intro1}</p>
          </Reveal>
        </div>
        <Reveal className="right" delay={100}>
          <div className="lab lab-ink" style={{ marginBottom: 14 }}>INDEX — {DATA.projects.length.toString().padStart(2, '0')} PROJECTS</div>
          <div className="idx-list">
            {DATA.projects.slice(0, 8).map((p) =>
            <div className="row" key={p.cat} onClick={() => go({ id: 'project', project: p })}>
                <span className="n">№ {p.cat}</span>
                <span className="nm">{p.name}</span>
                <span className="yr">{p.yearLabel}</span>
              </div>
            )}
            <div className="row" onClick={() => go({ id: 'work' })} style={{ opacity: .7 }}>
              <span className="n">→</span>
              <span className="nm" style={{ fontWeight: 500, fontSize: 15 }}>All {DATA.projects.length} projects</span>
              <span className="yr">2014—28</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>);

}

function SelectedWork({ go }) {
  const h = DATA.home;
  // Curated order (set by studio). Only projects with photography are shown for now;
  // the rest stay hidden from the home selection until their images are uploaded.
  const order = ['parfumlab-pneuma', 'yesim-evi', 'postane', 'hali-atolyesi', 'oculus', 'samih-rifat', 'parfumlab-cepa'];
  const list = order.map((s) => DATA.projects.find((p) => p.slug === s)).filter((p) => p && hasPhotos(p));
  return (
    <section className="sec" style={{ paddingTop: 96 }}>
      <div className="wrap">
        <div className="sec-head">
          <div className="l"><span className="n"></span><h2>{h.selectedLabel}</h2></div>
          <span className="more" onClick={() => go({ id: 'work' })}>{h.selectedMore} →</span>
        </div>
        <div className="feat" style={{ padding: 0 }}>
          {list.map((p, i) => {
            const big = i % 3 === 0;
            const loc = p.location ? p.location.split(',')[0].toUpperCase() : 'ISTANBUL';
            return (
              <Reveal className="row" key={p.cat} style={{ borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid var(--ink)' }}>
                <div className="head">
                  <span className="idx">№ {(i + 1).toString().padStart(2, '0')} / {DATA.projects.length}</span>
                  <span className="lab">{p.category.toUpperCase()}</span>
                </div>
                <div className={`media ${p.slug === 'yesim-evi' ? 'media-natural' : ''}`} onClick={() => go({ id: 'project', project: p })}>
                  <Frame ratio={big ? '21/9' : '16/9'} num={`№ ${p.cat}`}
                  meta={`${loc} · ${p.kind.toUpperCase()}`} img={p.thumb || p.hero} alt={`${p.name} — ${p.kind}, ${p.location || 'Istanbul'}`}
                  accent={p.accent} wm={p.cat} fit={p.slug === 'yesim-evi' ? 'contain' : 'cover'} />
                </div>
                <div className="title-line" onClick={() => go({ id: 'project', project: p })} style={{ cursor: 'pointer' }}>
                  <span className="title">{p.name}</span>
                  <span className="arrow">→</span>
                </div>
                <div className="undermeta">
                  <div><span className="lab k">Type</span><span className="lab v">{p.kind}</span></div>
                  <div><span className="lab k">Year</span><span className="lab v">{p.yearLabel}</span></div>
                  <div><span className="lab k">Location</span><span className="lab v">{p.location || 'Istanbul'}</span></div>
                </div>
              </Reveal>);

          })}
        </div>
      </div>
    </section>);

}

function MethodBand() {
  const m = DATA.method;
  return (
    <section className="method">
      <div className="wrap">
        <Reveal className="lab eyebrow">{m.eyebrow}</Reveal>
        <Reveal as="p" className="big" style={{ maxWidth: '24ch' }}>{m.big}</Reveal>
      </div>
    </section>);

}

function ContactStrip({ go }) {
  return (
    <section className="sec" style={{ paddingTop: 112, paddingBottom: 112 }}>
      <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32, borderTop: '1px solid var(--ink)', paddingTop: 48 }}>
        <div>
          <div className="lab lab-ink" style={{ marginBottom: 20 }}></div>
          <h2 className="mega-sm" style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: .92 }}>Have a site,<br />a brief, a room?</h2>
        </div>
        <div className="btn2 primary" onClick={() => go({ id: 'contact' })}>
</div>
      </div>
    </section>);
}

function HomePage({ go, hero }) {
  const Hero = hero === 'feature' ? HeroFeature : hero === 'index' ? HeroIndex : HeroStatement;
  return (
    <main className="route">
      <Hero go={go} />
      <SelectedWork go={go} />
    </main>);

}

Object.assign(window, { HomePage, HeroStatement, HeroFeature, HeroIndex });