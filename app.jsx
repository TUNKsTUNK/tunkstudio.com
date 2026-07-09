/* TUNK — app shell: router + tweaks + mount */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "hero": "feature",
  "typeScale": 0.5,
  "density": "regular",
  "accent": "#0A0A0A",
  "motion": true
}/*EDITMODE-END*/;

const DENSITY_M = {
  compact:  "clamp(20px, 3.5vw, 56px)",
  regular:  "clamp(28px, 5vw, 96px)",
  spacious: "clamp(40px, 7vw, 132px)",
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Encode/decode page state to a URL hash so the browser back/forward
  // buttons work like real navigation, not just in-app state.
  const encodePage = (p) => {
    if (p.id === 'project' && p.project) return '#/project/' + encodeURIComponent(p.project.slug);
    if (p.id === 'home') return '#/';
    return '#/' + p.id;
  };
  const decodeHash = (hash) => {
    const h = (hash || '').replace(/^#\/?/, '');
    if (!h) return { id: 'home' };
    const parts = h.split('/');
    if (parts[0] === 'project' && parts[1]) {
      const slug = decodeURIComponent(parts[1]);
      const project = DATA.projects.find((pr) => pr.slug === slug);
      if (project) return { id: 'project', project };
      return { id: 'home' };
    }
    if (['work', 'about', 'press', 'contact'].includes(parts[0])) return { id: parts[0] };
    return { id: 'home' };
  };

  const [page, setPage] = useState(() => decodeHash(window.location.hash));

  // Pushes a new history entry (real navigation, e.g. clicking a link/tile).
  const go = (p) => {
    setPage(p);
    const hash = encodePage(p);
    if (window.location.hash !== hash) window.history.pushState({ page: p.id }, '', hash);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // Back/forward button: read the new hash, update state, but don't push again.
  useEffect(() => {
    const onPop = () => {
      setPage(decodeHash(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', onPop);
    // normalise the very first load so a bookmarked/shared hash has a history entry
    if (!window.location.hash) window.history.replaceState({ page: 'home' }, '', '#/');
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // apply tweaks to :root
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--tscale', String(t.typeScale));
    r.style.setProperty('--m', DENSITY_M[t.density] || DENSITY_M.regular);
    r.style.setProperty('--accent', t.accent);
    r.style.setProperty('--reveal-y', t.motion ? '10px' : '0px');
    r.classList.toggle('no-motion', !t.motion);
  }, [t.typeScale, t.density, t.accent, t.motion]);

  const darkHero = (page.id === 'home' && t.hero === 'feature') || page.id === 'project';

  let view;
  if (page.id === 'home') view = <HomePage go={go} hero={t.hero} />;
  else if (page.id === 'work') view = <WorkPage go={go} />;
  else if (page.id === 'project') view = <ProjectPage project={page.project} go={go} />;
  else if (page.id === 'about') view = <AboutPage go={go} />;
  else if (page.id === 'press') view = <PressPage go={go} />;
  else if (page.id === 'contact') view = <ContactPage go={go} />;
  else view = <HomePage go={go} hero={t.hero} />;

  return (
    <React.Fragment>
      <Nav page={page} go={go} dark={darkHero} key={page.id + '-' + t.hero} />
      {view}
      <Footer go={go} />

      <TweaksPanel>
        <TweakSection label="Hero" />
        <TweakRadio label="Direction" value={t.hero}
          options={['statement', 'feature', 'index']}
          onChange={(v) => setTweak('hero', v)} />

        <TweakSection label="Layout" />
        <TweakSlider label="Display type" value={t.typeScale} min={0.4} max={1.3} step={0.05}
          onChange={(v) => setTweak('typeScale', v)} />
        <TweakRadio label="Density" value={t.density}
          options={['compact', 'regular', 'spacious']}
          onChange={(v) => setTweak('density', v)} />

        <TweakSection label="Accent" subtitle="Brand reserves colour for real project material — loosen with care" />
        <TweakColor label="Page accent" value={t.accent}
          options={['#0A0A0A', '#1C3FBF', '#D4271E', '#C97A1A']}
          onChange={(v) => setTweak('accent', v)} />

        <TweakSection label="Motion" />
        <TweakToggle label="Scroll reveal" value={t.motion}
          onChange={(v) => setTweak('motion', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
