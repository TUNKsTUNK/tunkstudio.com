/* TUNK — Work / Project / About / Press / Contact pages */

function WorkPage({ go }) {
  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState('All');
  const base = filter === 'All' ? DATA.projects : DATA.projects.filter(p => p.tags.includes(filter));
  const filtered = [...base].sort((a, b) => {
    // Projects with photography come first; un-photographed ones fall to the end.
    const pa = hasPhotos(a), pb = hasPhotos(b);
    if (pa !== pb) return pa ? -1 : 1;
    if (a.year == null && b.year == null) return 0;
    if (a.year == null) return 1;
    if (b.year == null) return -1;
    return b.year - a.year; // most recent first
  });
  return (
    <main className="route">
      <div className="work-head">
        <div className="wrap">
          <div className="lab lab-ink" style={{ marginBottom: 22 }}>№ 01 — WORK</div>
          <h1 className="mega" style={{ marginBottom: 56 }}>All projects</h1>
          <div className="filterbar">
            <span className="lbl">Filter</span>
            {DATA.filters.map(f => (
              <span key={f} className={`chip2 ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>{f}</span>
            ))}
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              <span className={`chip2 ${view === 'grid' ? 'on' : ''}`} onClick={() => setView('grid')}>Grid</span>
              <span className={`chip2 ${view === 'index' ? 'on' : ''}`} onClick={() => setView('index')}>Index</span>
            </span>
          </div>
          <div className="lab" style={{ marginTop: 12, marginBottom: 40 }}>
            {filtered.length.toString().padStart(2, '0')} PROJECTS · 2014—2028
          </div>
        </div>
      </div>

      <div className="wrap" style={{ padding: '0 var(--m) 96px' }}>
        {view === 'grid' ? (
          <div className="work-grid">
            {filtered.map(p => <Reveal key={p.cat}><Tile p={p} go={go} /></Reveal>)}
          </div>
        ) : (
          <div className="ix">
            <div className="r head">
              <span className="lab">№</span><span className="lab">Project</span>
              <span className="lab k-hide">Discipline</span><span className="lab k-hide">Location</span>
              <span className="lab k-hide">Year</span><span />
            </div>
            {filtered.map(p => (
              <div className="r" key={p.cat} onClick={() => go({ id: 'project', project: p })}>
                <span className="lab">№ {p.cat}</span>
                <span className="nm">{p.name}</span>
                <span className="lab k-hide">{p.category.toUpperCase()}</span>
                <span className="lab k-hide">{(p.location || 'Istanbul').toUpperCase()}</span>
                <span className="lab k-hide">{p.yearLabel}</span>
                <span className="a">→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ProjectPage({ project, go }) {
  const p = project || DATA.projects[0];
  const idx = DATA.projects.findIndex(x => x.cat === p.cat);
  const next = DATA.projects[(idx + 1) % DATA.projects.length];
  const prev = DATA.projects[(idx - 1 + DATA.projects.length) % DATA.projects.length];
  const accentVar = p.accent ? `var(--${p.accent})` : 'var(--ink)';
  const loc = p.location ? p.location.toUpperCase() : 'ISTANBUL';
  const gal = p.gallery || [];
  const isVid = (s) => /\.(mp4|webm|mov)$/i.test(s);
  // all images for this project, for the lightbox (videos excluded)
  const lbImages = [p.hero, ...gal].filter(Boolean).filter((s) => !isVid(s));
  const [lb, setLb] = useState(-1); // -1 = closed, else index into lbImages
  const openLb = (img) => { const k = lbImages.indexOf(img); if (k >= 0) setLb(k); };

  const specs = [
    ['Discipline', p.category],
    ['Year', p.yearLabel],
    p.location ? ['Location', p.location] : null,
    p.status ? ['Status', p.status] : null,
    p.collab ? ['Collaboration', p.collab] : null,
    p.press ? ['Press', p.press.join(' · ')] : null,
  ].filter(Boolean);

  const [heroMuted, setHeroMuted] = useState(false);
  const heroIframeRef = useRef(null);
  const heroVideoRef = useRef(null);
  useEffect(() => {
    // reset per-project so navigating between two video-hero projects still starts with sound on
    setHeroMuted(false);
  }, [p.slug]);
  useEffect(() => {
    if (p.heroVideo && heroIframeRef.current) {
      // Vimeo's player postMessage API — no player.js needed for this one call
      heroIframeRef.current.contentWindow.postMessage(JSON.stringify({ method: 'setMuted', value: heroMuted }), 'https://player.vimeo.com');
    }
    if (p.heroVideoLocal && heroVideoRef.current) {
      heroVideoRef.current.muted = heroMuted;
    }
  }, [heroMuted, p.heroVideo, p.heroVideoLocal]);

  return (
    <main className="route" style={{ '--accent': accentVar }}>
      <section className={`pj-hero ${(p.heroVideo || p.heroVideoLocal) ? 'pj-hero-video-sec' : ''}`}>
        <div onClick={() => !p.heroVideo && !p.heroVideoLocal && p.hero && openLb(p.hero)}
             className={p.slug === 'yesim-evi' ? 'pj-hero-natural hero-wide' : (p.slug === 'parfumlab-mersin' ? 'pj-hero-natural' : '')}
             style={{ position: 'absolute', inset: 0, zIndex: 1, cursor: (p.heroVideo || p.heroVideoLocal) ? 'default' : (p.hero ? 'zoom-in' : 'default') }}>
          {p.heroVideo ? (
            <iframe
              ref={heroIframeRef}
              src={`https://player.vimeo.com/video/${p.heroVideo}?autoplay=1&muted=0&loop=1&controls=0&app_id=122963#t=10s`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, pointerEvents: 'none' }}
              allow="autoplay; fullscreen; picture-in-picture"
              title={`${p.name} — film`}
            />
          ) : p.heroVideoLocal ? (
            <div className="pj-hero-video">
              <video
                ref={heroVideoRef}
                src={p.heroVideoLocal} autoPlay playsInline preload="auto" loop
              />
            </div>
          ) : (
            <Frame ratio="auto" num={`№ ${p.cat}`} meta="" img={p.hero} alt={`${p.name} — ${p.kind}, ${p.location || 'Istanbul'}`} accent={p.accent}
                   bare wm={p.cat} style={{ position: 'absolute', inset: 0, aspectRatio: 'auto' }}
                   fit={(p.slug === 'yesim-evi' || p.slug === 'parfumlab-mersin') ? 'contain' : 'cover'} />
          )}
        </div>
        <div className="scrim" style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,.34)', zIndex: 2, pointerEvents: 'none' }} />
        {(p.heroVideo || p.heroVideoLocal) && (
          <button
            className="lazyvid-mute pj-hero-mute" aria-label={heroMuted ? 'Unmute' : 'Mute'}
            style={{ zIndex: 5 }}
            onClick={(e) => { e.stopPropagation(); setHeroMuted((m) => !m); }}
          >
            {heroMuted ? 'SOUND OFF' : 'SOUND ON'}
          </button>
        )}
        <div className="pj-bar" style={{ zIndex: 4 }}>
          <span className="lab" style={{ color: 'var(--paper)' }}>№ {p.cat} · {p.yearLabel}</span>
          <span className="lab" style={{ color: 'var(--paper)', cursor: 'pointer' }} onClick={() => go({ id: 'work' })}>← ALL PROJECTS</span>
        </div>
        <div className="pj-title-wrap">
          <div className="lab" style={{ color: 'rgba(255,255,255,.8)', marginBottom: 16 }}>{p.kind.toUpperCase()} · {loc}</div>
          <h1 className="pj-title mega-sm" style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: .92 }}>{p.name}</h1>
        </div>
      </section>

      <section className="pj-body wrap">
        <div>
          <p className="lede">{p.summary}</p>
          <p className="para">{p.para}</p>
          {p.photographer
            ? <p className="para" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--graphite)', marginTop: 32 }}>Photography — {p.photographer}{p.graphics ? <><br />Graphics — {p.graphics}</> : null}</p>
            : (!p.gallery || !p.gallery.length)
              ? <p className="para" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--aluminium)', marginTop: 32 }}>Photography pending — images to follow</p>
              : null}
        </div>
        <div className="pj-specs">
          {specs.map(([k, v]) => (
            <div className="s" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
          ))}
        </div>
      </section>

      <section className="pj-gallery wrap">
        <div className="pj-grid-g">
          {gal.map((g, k) => (
            isVid(g)
              ? <Reveal as="figure" className="g-cell g-vid" key={k} delay={(k % 3) * 60}>
                  <LazyVideo src={g} />
                  <figcaption className="pl-cap">{String(k + 1).padStart(2, '0')} · FILM</figcaption>
                </Reveal>
              : <Reveal as="figure" className="g-cell" key={k} delay={(k % 3) * 60} onClick={() => openLb(g)}>
                  <img src={g} alt={`${p.name} — ${String(k + 1).padStart(2, '0')}`} loading="lazy" />
                  <figcaption className="pl-cap">{String(k + 1).padStart(2, '0')}</figcaption>
                </Reveal>
          ))}
        </div>
      </section>

      {lb >= 0 && <Lightbox images={lbImages} index={lb} title={p.name} onClose={() => setLb(-1)} />}

      <section className="pj-nav wrap">
        <a onClick={() => go({ id: 'project', project: prev })}>
          <div className="lab">← PREVIOUS</div>
          <div className="nm">{prev.name}</div>
        </a>
        <a className="nx" onClick={() => go({ id: 'project', project: next })}>
          <div className="lab">NEXT →</div>
          <div className="nm">{next.name}</div>
        </a>
      </section>
    </main>
  );
}

function AboutPage({ go }) {
  const a = DATA.about;
  return (
    <main className="route">
      <div className="lede-block">
        <div className="wrap">
          <div className="lab lab-ink" style={{ marginBottom: 22 }}>{a.eyebrow}</div>
          <h1 className="mega-sm" style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: .92, maxWidth: '16ch' }}>{a.heading}</h1>
        </div>
      </div>
      <div className="wrap" style={{ marginTop: 80 }}>
        <Reveal className="about-row">
          <div className="label">Practice</div>
          <div>
            <p>{a.p1}</p>
            <p className="small">{a.p2}</p>
          </div>
        </Reveal>
        <Reveal className="about-row">
          <div className="label">Disciplines</div>
          <div className="team">
            {a.disciplines.map(t => (
              <div className="p" key={t.name}>
                <div className="nm">{t.name}</div>
                <div className="rl">{t.role}</div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal className="about-row">
          <div className="label">Clients & collaborators</div>
          <div className="clients">
            {a.clients.map(c => <span key={c}>{c}</span>)}
          </div>
        </Reveal>
      </div>
    </main>
  );
}

function PressPage({ go }) {
  const p = DATA.press;
  return (
    <main className="route">
      <div className="lede-block">
        <div className="wrap">
          <div className="lab lab-ink" style={{ marginBottom: 22 }}>{p.eyebrow}</div>
          <h1 className="mega-sm" style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: .92 }}>{p.title}</h1>
          <p style={{ maxWidth: 560, fontSize: 15, lineHeight: 1.6, marginTop: 40, color: 'var(--graphite)' }}>{p.intro}</p>
        </div>
      </div>
      <div className="wrap" style={{ padding: '64px var(--m) 96px' }}>
        <div className="lab lab-ink" style={{ marginBottom: 18 }}>Selected coverage</div>
        <div className="press">
          {p.items.map(r => (
            <a className="r" key={r.n} href={r.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="lab">№ {r.n}</span>
              <span className="nm">{r.name}</span>
              <span className="lab k-hide">{r.pub}</span>
              <span className="lab k-hide">{r.type} · {r.year}</span>
              <span className="dl">Read <span style={{ fontFamily: 'var(--font-mono)' }}>→</span></span>
            </a>
          ))}
        </div>

        <div className="lab lab-ink" style={{ margin: '56px 0 18px' }}>Press kit</div>
        <div className="press">
          {p.downloads.map(r => (
            <div className="r" key={r.n} style={{ gridTemplateColumns: '70px 1fr 220px 130px' }}>
              <span className="lab">№ {r.n}</span>
              <span className="nm">{r.name}</span>
              <span className="lab k-hide">{r.meta}</span>
              <span className="dl">Download <span style={{ fontFamily: 'var(--font-mono)' }}>→</span></span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function ContactPage({ go }) {
  const c = DATA.contact;
  const fields = [['Name', ''], ['Email', ''], ['Subject', 'New project'], ['Budget', 'Approx. range']];
  return (
    <main className="route">
      <div className="lede-block">
        <div className="wrap">
          <div className="lab lab-ink" style={{ marginBottom: 22 }}>{c.eyebrow}</div>
          <h1 className="mega" style={{ }}>{c.title}</h1>
        </div>
      </div>
      <div className="wrap" style={{ marginTop: 72 }}>
        <div className="contact-grid">
          <div>
            <div className="lab lab-ink" style={{ marginBottom: 20 }}>Studio</div>
            <div className="mono" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8, letterSpacing: '.02em', textTransform: 'uppercase', whiteSpace: 'pre-line' }}>
              {c.address}{'\n\n'}<a href={`mailto:${c.email}`} className="contact-email">{c.email}</a>
            </div>
          </div>
          <div>
            <div className="lab lab-ink" style={{ marginBottom: 24 }}>Enquire</div>
            <form onSubmit={(e) => { e.preventDefault(); alert('Submitted (demo).'); }} className="form-grid">
              {fields.map(([l, ph]) => (
                <div className="field" key={l}>
                  <label>{l}</label>
                  <input defaultValue="" placeholder={ph} />
                </div>
              ))}
              <div className="field full">
                <label>Message</label>
                <textarea rows="4" placeholder="A short description of the project, site and timeline." />
              </div>
              <button type="submit" className="btn2 primary" style={{ justifySelf: 'start' }}>Send enquiry →</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

Object.assign(window, { WorkPage, ProjectPage, AboutPage, PressPage, ContactPage });
