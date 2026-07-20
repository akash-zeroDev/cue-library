import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SignInButton, SignUpButton, SignOutButton, UserButton, useUser } from '@clerk/clerk-react';
import { prompts as fallbackPrompts } from './data/prompts.js';
import Modal from './components/Modal.jsx';
import Pricing from './components/Pricing.jsx';
import Contact from './components/Contact.jsx';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Admin from './pages/Admin.jsx';
import TodaysPick from './components/TodaysPick.jsx';
import './styles/overhaul.css';

const getIsTouch = () => (typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 768));

function MainApp() {
  const [activeNav, setActiveNav] = useState(0);
  const [query, setQuery] = useState('');
  const [price, setPrice] = useState('all');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('new');
  const [sortOpen, setSortOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const { user, isSignedIn } = useUser();
  const isAdmin = isSignedIn && ['akashkumar7653099@gmail.com', 'aloksivastava1025@gmail.com'].includes(user?.primaryEmailAddress?.emailAddress);
  
  const { allPrompts } = useApp();

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  }, []);

  const rootRef = useRef(null);
  const contentRef = useRef(null);
  const navRef = useRef(null);
  const heroRef = useRef(null);
  const barRef = useRef(null);
  const browseRef = useRef(null);
  const sortRef = useRef(null);
  const catRef = useRef(null);
  const authBarRef = useRef(null);

  const scrollState = useRef({
    cur: 0,
    target: 0,
    lastY: 0,
    navHidden: false,
    max: 0,
    parallaxEls: []
  });

  const onSearchInput = (e) => setQuery(e.target.value);
  const clearQuery = () => setQuery('');
  const toggleSort = () => setSortOpen((s) => !s);
  const toggleCat = () => setCatOpen((s) => !s);
  const pickSort = (v) => { setSort(v); setSortOpen(false); };
  const pickCat = (v) => { setCat(v); setCatOpen(false); };
  const goHome = (e) => {
    if (e) e.preventDefault();
    scrollState.current.target = 0;
    setActiveNav(0); setQuery(''); setPrice('all'); setCat('all'); setSort('new'); setSortOpen(false); setCatOpen(false);
  };
  const clearFilters = () => { setQuery(''); setPrice('all'); setCat('all'); setSort('new'); setSortOpen(false); setCatOpen(false); setActiveNav(0); };
  
  const onDocDown = useCallback((e) => {
    if (sortOpen && sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    if (catOpen && catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
  }, [sortOpen, catOpen]);

  useEffect(() => {
    window.addEventListener('mousedown', onDocDown);
    return () => window.removeEventListener('mousedown', onDocDown);
  }, [onDocDown]);

  const stop = (e) => e.stopPropagation();

  const viewport = () => (rootRef.current && rootRef.current.clientHeight) || window.innerHeight || 700;
  
  const clamp = useCallback((v) => {
    return Math.max(0, Math.min(v, scrollState.current.max || 0));
  }, []);

  const scrollToBrowse = () => {
    if (browseRef.current) scrollState.current.target = clamp(browseRef.current.offsetTop - 90);
  };

  const measure = useCallback(() => {
    if (!contentRef.current) return;
    scrollState.current.max = Math.max(0, contentRef.current.scrollHeight - viewport());
    if (scrollState.current.target > scrollState.current.max) {
      scrollState.current.target = scrollState.current.max;
    }
  }, []);

  const refreshParallax = useCallback(() => {
    scrollState.current.parallaxEls = contentRef.current ? Array.from(contentRef.current.querySelectorAll('[data-speed]')) : [];
  }, []);

  const isModalOpenRef = useRef(false);
  useEffect(() => {
    isModalOpenRef.current = !!selectedItem;
  }, [selectedItem]);

  const onWheel = useCallback((e) => {
    if (isModalOpenRef.current) return;
    if (getIsTouch()) return;
    e.preventDefault();
    scrollState.current.target = clamp(scrollState.current.target + e.deltaY * (e.deltaMode === 1 ? 32 : 1));
  }, [clamp]);

  const _ty = useRef(0);
  const onTouchStart = useCallback((e) => { 
    if (getIsTouch()) return;
    _ty.current = e.touches[0].clientY; 
  }, []);
  const onTouchMove = useCallback((e) => {
    if (isModalOpenRef.current) return;
    if (getIsTouch()) return;
    e.preventDefault();
    const y = e.touches[0].clientY;
    scrollState.current.target = clamp(scrollState.current.target + (_ty.current - y) * 2.8);
    _ty.current = y;
  }, [clamp]);

  const onKey = useCallback((e) => {
    if (isModalOpenRef.current) return;
    if (getIsTouch()) return;
    const vp = viewport();
    const map = { ArrowDown: 90, ArrowUp: -90, PageDown: vp * 0.9, PageUp: -vp * 0.9, ' ': vp * 0.9, Home: -1e9, End: 1e9 };
    if (map[e.key] === undefined) return;
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    e.preventDefault();
    scrollState.current.target = clamp(scrollState.current.target + map[e.key]);
  }, [clamp]);

  const palettes = useMemo(() => ({
    ink: {
      '--bg': '#0A0A0A', '--s1': '#111111', '--s2': '#171717', '--s3': '#1E1E1E',
      '--border': 'rgba(255,255,255,0.08)', '--border-strong': 'rgba(255,255,255,0.14)',
      '--t1': '#EDEDED', '--t2': 'rgba(255,255,255,0.65)', '--t3': 'rgba(255,255,255,0.45)', '--tstrong': '#FFFFFF',
      '--acc': '#3B82F6', '--acc-hover': '#2563EB', '--acc-bg': '#0B1F3D', '--acc-fg': '#93C5FD', '--acc-line': 'rgba(147,197,253,0.22)', '--acc-glow': 'rgba(59,130,246,0.16)',
      '--glass': 'rgba(10,10,10,0.55)', '--glass-border': 'rgba(255,255,255,0.10)',
      '--cta-bg': '#F4F4F1', '--cta-fg': '#0A0A0A'
    }
  }), []);

  useEffect(() => {
    if (!rootRef.current) return;
    const p = palettes.ink;
    for (const k in p) rootRef.current.style.setProperty(k, p[k]);
    if (heroRef.current) {
      heroRef.current.style.borderRadius = '30px';
    }
  }, [palettes]);

  const tick = useCallback(() => {
    const ease = Math.max(0.03, 0.19 - 8 * 0.016);
    const st = scrollState.current;
    
    let c = 0;
    if (getIsTouch()) {
      c = window.scrollY;
      st.cur = c;
      st.target = c;
      if (contentRef.current) contentRef.current.style.transform = `none`;
    } else {
      st.cur += (st.target - st.cur) * ease;
      if (Math.abs(st.target - st.cur) < 0.06) st.cur = st.target;
      c = st.cur;
      if (contentRef.current) contentRef.current.style.transform = `translate3d(0,${-c}px,0)`;
    }
    
    for (let i = 0; i < st.parallaxEls.length; i++) {
      const el = st.parallaxEls[i];
      const s = parseFloat(el.getAttribute('data-speed')) || 0;
      let off = c * s;
      if (off > 22) off = 22; else if (off < -22) off = -22;
      el.style.transform = `translate3d(0,${off}px,0)`;
    }
    
    if (heroRef.current) {
      const p = Math.min(c / 640, 1);
      heroRef.current.style.opacity = String(1 - p * 0.9);
      heroRef.current.style.transform = `translate3d(0,${c * 0.14}px,0) scale(${1 - p * 0.045})`;
    }
    
    if (barRef.current) barRef.current.style.height = (st.max > 0 ? (c / st.max) * viewport() : 0) + 'px';
    
    const y = c;
    if (navRef.current) {
      if (y > st.lastY + 2 && y > 150) {
        if (!st.navHidden) { 
          st.navHidden = true; 
          navRef.current.style.transform = 'translate3d(-50%,-150px,0)'; 
          if (authBarRef.current) { 
            authBarRef.current.style.transition = 'transform .55s cubic-bezier(0.16,1,0.3,1), opacity .55s'; 
            authBarRef.current.style.transform = 'translate3d(0,-150px,0)'; 
            authBarRef.current.style.opacity = '0';
          } 
        }
      } else if (y < st.lastY - 2 || y < 90) {
        if (st.navHidden) { 
          st.navHidden = false; 
          navRef.current.style.transform = 'translate3d(-50%,0,0)'; 
          if (authBarRef.current) {
            authBarRef.current.style.transform = 'translate3d(0,0,0)'; 
            authBarRef.current.style.opacity = '1';
          }
        }
      }
    }
    
    st.lastY = y;
    scrollState.current.raf = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      const _navDone = () => { 
        if(navRef.current) {
          navRef.current.style.animation = 'none'; 
          navRef.current.style.transform = 'translate3d(-50%,0,0)'; 
          navRef.current.style.transition = 'transform .55s cubic-bezier(0.16,1,0.3,1)'; 
        }
      };
      navRef.current.addEventListener('animationend', _navDone, { once: true });
      setTimeout(() => { if (navRef.current && navRef.current.style.animation !== 'none') _navDone(); }, 1000);
    }
    
    scrollState.current.target = 0; 
    scrollState.current.cur = 0; 
    scrollState.current.lastY = 0;
    
    refreshParallax();
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => measure());
    
    let _ro = null;
    if (typeof ResizeObserver !== 'undefined' && contentRef.current) {
      _ro = new ResizeObserver(() => measure());
      _ro.observe(contentRef.current);
    }
    
    const _onResize = () => measure();
    window.addEventListener('resize', _onResize);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    
    const _t = setTimeout(() => measure(), 500);
    const _t2 = setTimeout(() => measure(), 1400);
    
    scrollState.current.raf = requestAnimationFrame(tick);

    return () => {
      if (scrollState.current.raf) cancelAnimationFrame(scrollState.current.raf);
      if (_ro) _ro.disconnect();
      window.removeEventListener('resize', _onResize);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
      clearTimeout(_t);
      clearTimeout(_t2);
    };
  }, [measure, onKey, onTouchMove, onTouchStart, onWheel, refreshParallax, tick]);

  useEffect(() => {
    refreshParallax();
    measure();
  }, [query, price, cat, sort, activeNav, refreshParallax, measure]);

  const vstyle = (v, size) => {
    const base = { fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--t1,#F4F4F1)', lineHeight: 1, fontSize: size + 'px' };
    if (v === 'serif') return { ...base, fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em', fontSize: (size + 8) + 'px' };
    if (v === 'caps') return { ...base, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: (size - 6) + 'px' };
    if (v === 'sans-accent') return { ...base, color: 'var(--acc-fg,#93C5FD)' };
    return base;
  };

  const allItems = useMemo(() => {
    return allPrompts.filter(p => p.status !== 'draft' || isAdmin).map(p => ({
      ...p,
      isPremium: p.tier === 'premium',
      isFree: p.tier !== 'premium',
      brandStyle: vstyle(p.variant, 34)
    }));
  }, [allPrompts, isAdmin]);

  const onCardEnter = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'scale(1.01)';
    card.style.background = '#242424';
    const mock = card.querySelector('[data-mock]');
    const prev = card.querySelector('[data-preview]');
    if (mock) mock.style.opacity = '0';
    if (prev) {
      if (!prev.hasAttribute('data-video')) prev.style.opacity = '1';
      const video = prev.querySelector('video');
      if (video) video.play().catch(()=>{});
    }
  };
  
  const onCardLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'scale(1)';
    card.style.background = '#1c1c1c';
    const mock = card.querySelector('[data-mock]');
    const prev = card.querySelector('[data-preview]');
    if (mock) mock.style.opacity = '1';
    if (prev) {
      if (!prev.hasAttribute('data-video')) prev.style.opacity = '0';
      const video = prev.querySelector('video');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    }
  };

  const q = query.trim().toLowerCase();
  const filtering = q !== '' || price !== 'all' || cat !== 'all' || sort !== 'new';

  let results = allItems.filter((it) => {
    if (price === 'free' && it.tier !== 'free') return false;
    if (price === 'premium' && it.tier !== 'premium') return false;
    if (cat !== 'all' && !(it.category || '').toLowerCase().split(',').map(s=>s.trim()).includes(cat.toLowerCase())) return false;
    if (q) {
      const hay = (it.title + ' ' + it.brand + ' ' + it.category).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (sort === 'az') results = results.slice().sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === 'free') results = results.slice().sort((a, b) => (a.tier === 'free' ? 0 : 1) - (b.tier === 'free' ? 0 : 1) || b.date - a.date);
  else if (sort === 'prem') results = results.slice().sort((a, b) => (a.tier === 'premium' ? 0 : 1) - (b.tier === 'premium' ? 0 : 1) || b.date - a.date);
  else results = results.slice().sort((a, b) => b.date - a.date);


  const navLinks = ['Home', 'Pricing', 'Contact'].map((label, i) => ({
    label, active: i === activeNav,
    onClick: () => {
      setActiveNav(i);
      scrollState.current.target = 0;
    }
  }));

  const seg = (v, label) => ({
    label,
    onClick: () => setPrice(v),
    style: { padding: '7px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all .18s ease', border: '1px solid ' + (price === v ? 'var(--acc-line,rgba(147,197,253,0.22))' : 'transparent'), background: price === v ? 'var(--acc-bg,#0B1F3D)' : 'transparent', color: price === v ? 'var(--acc-fg,#93C5FD)' : 'var(--t2,rgba(255,255,255,0.65))' }
  });
  const priceOpts = [seg('all', 'All'), seg('free', 'Free'), seg('premium', 'Premium')];

  const sortItemStyle = (active) => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', width: '100%', textAlign: 'left', border: 'none', borderRadius: '9px', padding: '9px 13px', fontFamily: 'inherit', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background .15s ease, color .15s ease', background: active ? 'var(--acc-bg,#0B1F3D)' : 'transparent', color: active ? 'var(--acc-fg,#93C5FD)' : 'var(--t2,rgba(255,255,255,0.65))' });
  
  const allTags = allItems.flatMap(it => (it.category || '').split(',').map(s => s.trim()).filter(Boolean));
  const uniqueCats = Array.from(new Set(allTags)).sort();
  const catOpts = [['all', 'All Tags'], ...uniqueCats.map(c => [c, c])].map(([v, l]) => ({ label: l, active: cat === v, onClick: () => pickCat(v), style: sortItemStyle(cat === v) }));
  const catChevStyle = { display: 'inline-flex', color: 'var(--t3,rgba(255,255,255,0.45))', transition: 'transform .2s ease', transform: catOpen ? 'rotate(180deg)' : 'rotate(0deg)' };

  const resultCount = filtering ? results.length : allItems.length;
  const countLabel = filtering ? (results.length === 1 ? 'result' : 'results') : 'prompts';
  const resultsHeading = results.length === 0 ? 'Nothing here' : (results.length === 1 ? '1 prompt found' : results.length + ' prompts found');

  const sortLabels = { new: 'Newest', az: 'A–Z', free: 'Free first', prem: 'Premium first' };
  const sortOpts = [['new', 'Newest'], ['az', 'A–Z'], ['free', 'Free first'], ['prem', 'Premium first']].map(([v, l]) => ({ label: l, active: sort === v, onClick: () => pickSort(v), style: sortItemStyle(sort === v) }));
  const chevStyle = { display: 'inline-flex', color: 'var(--t3,rgba(255,255,255,0.45))', transition: 'transform .2s ease', transform: sortOpen ? 'rotate(180deg)' : 'rotate(0deg)' };



  const CardComponent = ({ item }) => {
    const [inView, setInView] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setInView(true);
      }, { rootMargin: '300px' });
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, []);

    // Generate a subtle deterministic hue for this card based on its ID
    const hash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    
    return (
      <article ref={ref} onClick={() => setSelectedItem(item)} onMouseEnter={onCardEnter} onMouseLeave={onCardLeave} style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all .2s ease', transform: 'scale(1)', background: '#1c1c1c', padding: '0 0 16px 0', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
        <div data-thumb="true" style={{ position: 'relative', overflow: 'hidden', background: '#0a0a0a', width: '100%', borderRadius: '18px' }}>
          {!item.hoverSrc && !item.thumbSrc && (
            <div data-mock="true" style={{ aspectRatio: '16 / 9', transition: 'opacity .45s ease', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '28px', background: `radial-gradient(circle at 20% 30%, hsla(${hue}, 60%, 25%, 0.15) 0%, transparent 60%), radial-gradient(circle at 80% 80%, hsla(${hue + 40}, 60%, 20%, 0.15) 0%, transparent 60%)` }}>
              <div style={{...item.brandStyle, textShadow: '0 4px 12px rgba(0,0,0,0.5)'}}>{item.brand}</div>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)', pointerEvents: 'none' }}></div>
            </div>
          )}
          {item.thumbSrc && (
            <div data-mock="true" style={{ transition: 'opacity .45s ease', background: '#000', display: 'flex' }}>
              <img src={item.thumbSrc} alt={item.title} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 'inherit' }} />
            </div>
          )}
          {!item.thumbSrc && item.hoverSrc && (
            <div data-video-base="true" style={{ background: '#000', display: 'flex' }}>
              {item.hoverSrc.match(/\.(jpeg|jpg|gif|png|webp|svg|heic)$/i) ? (
                <img src={item.hoverSrc} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 'inherit' }} alt={item.title} />
              ) : (
                <video src={item.hoverSrc} loop muted playsInline preload="auto" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 'inherit' }} />
              )}
            </div>
          )}
          <div data-preview="true" data-video={item.hoverSrc ? "true" : undefined} style={{ position: 'absolute', inset: 0, opacity: item.hoverSrc ? 1 : 0, transition: 'opacity .5s ease', background: 'var(--s2,#171717)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {item.hoverSrc ? (
              inView ? (
                item.hoverSrc.match(/\.(jpeg|jpg|gif|png|webp|svg|heic)$/i) ? (
                  <img src={item.hoverSrc} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} alt={item.title} />
                ) : (
                  <video src={item.hoverSrc} autoPlay loop muted playsInline preload="auto" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                )
              ) : null
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '15px 18px', borderBottom: '1px solid var(--border,rgba(255,255,255,0.08))', background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--acc,#3B82F6)' }}></span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.16)' }}></span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.16)' }}></span>
                  <span style={{ marginLeft: '10px', height: '8px', flex: 1, maxWidth: '140px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }}></span>
                </div>
                <div style={{ flex: 1, padding: '22px', display: 'flex', flexDirection: 'column', gap: '11px', justifyContent: 'center' }}>
                  <div style={{ height: '16px', width: '68%', borderRadius: '4px', background: `hsla(${hue}, 80%, 60%, 0.9)`, transformOrigin: 'left', animation: 'barpulse 1.9s ease-in-out infinite' }}></div>
                  <div style={{ height: '11px', width: '52%', borderRadius: '4px', background: 'rgba(255,255,255,0.14)', transformOrigin: 'left', animation: 'barpulse 1.9s ease-in-out infinite .2s' }}></div>
                  <div style={{ height: '11px', width: '60%', borderRadius: '4px', background: 'rgba(255,255,255,0.10)', transformOrigin: 'left', animation: 'barpulse 1.9s ease-in-out infinite .4s' }}></div>
                  <div style={{ display: 'flex', gap: '9px', marginTop: '8px', alignItems: 'center' }}>
                    <span style={{ height: '28px', width: '92px', borderRadius: '999px', background: `hsla(${hue}, 80%, 60%, 1)` }}></span>
                    <span style={{ height: '28px', width: '28px', borderRadius: '999px', border: '1px solid var(--border-strong,rgba(255,255,255,0.14))' }}></span>
                    <span style={{ width: '2px', height: '24px', background: 'rgba(255,255,255,0.4)', animation: 'blink 1s step-end infinite' }}></span>
                  </div>
                </div>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '40%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.10), transparent)', animation: 'sheen 2.6s linear infinite', pointerEvents: 'none' }}></div>
              </>
            )}
          </div>
        </div>
        <div style={{ padding: '16px 16px 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>{item.title}</h3>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{item.category || 'Hero'}</div>
          </div>
          {item.isPremium ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
              Premium
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>
              Copy
            </span>
          )}
        </div>
      </article>
    );
  };

  return (
    <div ref={rootRef} style={{ background: 'var(--bg,#0A0A0A)', color: 'var(--t1,#E8E1D6)', fontFamily: "'Hanken Grotesk', system-ui, -apple-system, sans-serif", minHeight: '100vh', overflow: getIsTouch() ? 'visible' : 'hidden', position: 'relative' }}>
      
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#3B82F6', color: '#fff', padding: '12px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: 600, zIndex: 1000, boxShadow: '0 12px 24px rgba(0,0,0,0.3)', animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {toastMsg}
        </div>
      )}

      <Modal item={selectedItem} onClose={() => setSelectedItem(null)} showToast={showToast} />
      
      <div ref={barRef} style={{ position: 'fixed', top: 0, right: 0, width: '2px', height: 0, background: 'var(--acc,#3B82F6)', opacity: 0.55, zIndex: 130, pointerEvents: 'none' }}></div>

      {!selectedItem && (
        <nav className="app-nav" ref={navRef} aria-label="Primary" style={{ position: 'fixed', top: '22px', left: '50%', transform: 'translate3d(-50%,0,0)', zIndex: 120, display: 'flex', alignItems: 'center', gap: '4px', padding: '9px 24px', borderRadius: '999px', background: 'var(--glass,rgba(10,10,10,0.55))', WebkitBackdropFilter: 'blur(20px) saturate(180%)', backdropFilter: 'blur(20px) saturate(180%)', border: '1px solid var(--glass-border,rgba(255,255,255,0.10))', boxShadow: '0 10px 34px -10px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)', animation: 'navIn .85s cubic-bezier(0.16,1,0.3,1) both' }}>
          <a href="#" onClick={goHome} className="hover-color-tstrong" style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.045em', color: 'var(--tstrong,#fff)', lineHeight: 1, transition: 'color .18s ease' }}>cue<span style={{ color: 'var(--acc,#3B82F6)' }}>·</span></a>
          <span style={{ width: '1px', height: '20px', background: 'var(--glass-border,rgba(255,255,255,0.12))', margin: '0 16px 0 12px' }}></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            {navLinks.map((t, i) => (
              <button key={i} onClick={t.onClick} className="hover-color-tstrong" style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, letterSpacing: '0.01em', color: 'var(--t2,rgba(255,255,255,0.62))', padding: '6px 1px', transition: 'color .18s ease' }}>
                {t.label}
                {t.active && <span style={{ position: 'absolute', left: 0, right: 0, bottom: '-4px', height: '2px', borderRadius: '2px', background: 'var(--acc,#3B82F6)' }}></span>}
              </button>
            ))}
          </div>
        </nav>
      )}

      {!selectedItem && isAdmin && (
        <button onClick={() => window.location.hash = '#/admin'} className="app-admin hover-border-strong-14" style={{ position: 'fixed', top: '22px', left: 'clamp(16px,3vw,32px)', zIndex: 121, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '999px', background: 'var(--glass,rgba(10,10,10,0.55))', WebkitBackdropFilter: 'blur(20px) saturate(180%)', backdropFilter: 'blur(20px) saturate(180%)', border: '1px solid var(--glass-border,rgba(255,255,255,0.10))', boxShadow: '0 10px 34px -10px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)', color: 'var(--tstrong,#fff)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.01em', cursor: 'pointer', transition: 'all 0.2s ease', animation: 'fadeUp .7s cubic-bezier(0.16,1,0.3,1) both' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          Admin Panel
        </button>
      )}

      {!selectedItem && (
        <div className="app-auth" ref={authBarRef} style={{ position: 'fixed', top: '22px', right: 'clamp(16px,3vw,32px)', zIndex: 121, display: 'flex', alignItems: 'center', gap: '6px', padding: isSignedIn ? '6px 14px 6px 6px' : '8px 8px 8px 10px', borderRadius: '999px', background: 'var(--glass,rgba(10,10,10,0.55))', WebkitBackdropFilter: 'blur(20px) saturate(180%)', backdropFilter: 'blur(20px) saturate(180%)', border: '1px solid var(--glass-border,rgba(255,255,255,0.10))', boxShadow: '0 10px 34px -10px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)', animation: 'fadeUp .7s cubic-bezier(0.16,1,0.3,1) both' }}>
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="hover-color-tstrong" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, letterSpacing: '0.01em', color: 'var(--t2,rgba(255,255,255,0.62))', padding: '8px 13px', borderRadius: '999px', transition: 'color .18s ease' }}>Log in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="hover-btn-signup" style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--cta-bg,#F4F4F1)', color: 'var(--cta-fg,#0A0A0A)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, letterSpacing: '-0.005em', padding: '9px 18px', borderRadius: '999px', transition: 'transform .2s ease, box-shadow .3s ease' }}>Sign up</button>
              </SignUpButton>
            </>
          ) : (
            <UserButton 
              showName 
              appearance={{
                elements: {
                  userButtonOuterIdentifier: {
                    color: 'var(--t1, #EDEDED)',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                  }
                }
              }} 
            />
          )}
        </div>
      )}

      <div ref={contentRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', willChange: getIsTouch() ? 'auto' : 'transform' }}>
        {activeNav === 1 ? (
          <Pricing />
        ) : activeNav === 2 ? (
          <Contact />
        ) : activeNav === 3 ? (
          <TodaysPick allItems={allItems} renderCard={(item) => <CardComponent key={item.id} item={item} />} />
        ) : (
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '90px clamp(20px,4vw,56px) 20px' }}>
          
          <section ref={heroRef} style={{ position: 'relative', minHeight: '62vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(20px,4vw,50px) 0', overflow: 'hidden', willChange: 'transform, opacity' }}>
            <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '100vw', height: '100%', background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.08) 0%, transparent 60%)', pointerEvents: 'none' }}></div>
            

            
            <h1 style={{ position: 'relative', fontFamily: "'Bricolage Grotesque', 'Hanken Grotesk', sans-serif", fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.85, textTransform: 'uppercase', color: 'var(--tstrong,#fff)', fontSize: 'clamp(42px, 12vw, 190px)', textWrap: 'balance', zIndex: 2 }}>
              <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.08em' }}>
                <span style={{ display: 'inline-block', marginRight: '0.14em', animation: 'heroRise 1.1s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.05s' }}>SHIP</span>
                <span style={{ display: 'inline-block', marginRight: '0.14em', fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, textTransform: 'none', color: 'var(--t2,rgba(255,255,255,0.7))', letterSpacing: '-0.02em', animation: 'heroRise 1.1s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.15s' }}>your</span>
                <span style={{ display: 'inline-block', animation: 'heroRise 1.1s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.25s' }}>NEXT</span>
              </span>
              <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.12em', position: 'relative' }}>
                <span style={{ display: 'inline-block', marginRight: '0.16em', animation: 'heroRise 1.1s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.35s' }}>LANDING</span>
                <span style={{ display: 'inline-block', position: 'relative', animation: 'heroRise 1.1s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.45s' }}>
                  <span style={{ background: 'linear-gradient(135deg, #fff 0%, #93C5FD 50%, #3B82F6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PAGE</span>
                  <span style={{ position: 'absolute', top: '-0.2em', right: '-0.4em', fontSize: '0.35em', color: 'var(--acc,#3B82F6)', opacity: 0.8, fontWeight: 300, animation: 'fadeUp 1s ease 1s both' }}>✧</span>
                </span>
              </span>
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap', marginTop: 'clamp(36px,5vw,64px)', animation: 'fadeUp .9s ease .6s both', position: 'relative', zIndex: 2 }}>
              <div style={{ maxWidth: '520px' }}>
                <p style={{ color: 'var(--t2,rgba(255,255,255,0.65))', fontSize: 'clamp(16px, 1.25vw, 20px)', lineHeight: 1.6, letterSpacing: '-0.01em' }}>
                  Battle-tested prompts for <span style={{ color: '#fff', fontWeight: 600 }}>Bolt</span>, <span style={{ color: '#fff', fontWeight: 600 }}>v0</span>, <span style={{ color: '#fff', fontWeight: 600 }}>Cursor</span>, and <span style={{ color: '#fff', fontWeight: 600 }}>Framer</span>. Stop endlessly tweaking and start shipping.
                </p>
                <div style={{ display: 'flex', gap: '16px', marginTop: '24px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--t3,rgba(255,255,255,0.45))', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> No fluff</span>
                  <span style={{ fontSize: '10.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--t3,rgba(255,255,255,0.45))', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Production-grade</span>
                </div>
              </div>
              
              <button onClick={() => { setActiveNav(3); scrollState.current.target = 0; window.scrollTo(0,0); }} className="hover-btn-get" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'var(--tstrong,#fff)', color: '#000', fontWeight: 700, fontSize: '16px', padding: '16px 36px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.8)', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em', whiteSpace: 'nowrap', transition: 'all .3s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 8px 30px -10px rgba(255,255,255,0.3)' }}>
                Today's Pick <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', marginTop: 'clamp(30px,4vw,50px)', display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', animation: 'fadeUp 1s ease .8s both' }}>
              <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--t3,rgba(255,255,255,0.4))', fontWeight: 600 }}>01 — Curated by hand</span>
              <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--t3,rgba(255,255,255,0.4))', fontWeight: 600 }}>{allPrompts.length} prompts</span>
              <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--t3,rgba(255,255,255,0.4))', fontWeight: 600 }}>Bolt · v0 · Cursor · Framer</span>
              <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--acc-fg,#93C5FD)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Scroll to browse <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></span>
            </div>
          </section>

          <div ref={browseRef} style={{ padding: '24px 0 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', minWidth: '236px', display: 'flex', alignItems: 'center', gap: '11px', background: 'var(--s1,#111)', border: '1px solid var(--border,rgba(255,255,255,0.08))', borderRadius: '999px', padding: '11px 18px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px', flexShrink: 0, color: 'var(--t3,rgba(255,255,255,0.45))' }}><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.35-4.35"></path></svg>
              <input value={query} onInput={onSearchInput} placeholder="Search prompts, brands, categories…" aria-label="Search prompts" style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--tstrong,#fff)', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, letterSpacing: '0.01em', padding: 0 }} />
              {query !== '' && (
                <button onClick={clearQuery} aria-label="Clear search" className="hover-search-clear" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', color: 'var(--t2,rgba(255,255,255,0.6))', cursor: 'pointer', flexShrink: 0, transition: 'color .15s ease, background .15s ease' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '11px', height: '11px' }}><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg></button>
              )}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--s1,#111)', border: '1px solid var(--border,rgba(255,255,255,0.08))', borderRadius: '999px', padding: '4px', flexShrink: 0 }}>
              {priceOpts.map((p, i) => <button key={i} className="price-opt" onClick={p.onClick} style={p.style}>{p.label}</button>)}
            </div>
            <div ref={sortRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={toggleSort} aria-label="Sort prompts" className="hover-border-strong-14" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', background: 'var(--s1,#111)', color: 'var(--t1,#EDEDED)', border: '1px solid var(--border,rgba(255,255,255,0.08))', borderRadius: '999px', padding: '10px 15px', fontFamily: 'inherit', fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', transition: 'border-color .18s ease' }}>
                <span style={{ color: 'var(--t3,rgba(255,255,255,0.45))' }}>Sort</span>{sortLabels[sort]}<span style={chevStyle}><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '10px', height: '10px', display: 'block' }}><path d="M3 4.5L6 7.5L9 4.5"></path></svg></span>
              </button>
              {sortOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 60, minWidth: '200px', background: 'var(--s2,#171717)', border: '1px solid var(--border-strong,rgba(255,255,255,0.14))', borderRadius: '14px', padding: '6px', boxShadow: '0 22px 54px -18px rgba(0,0,0,0.85)', animation: 'fadeUp .18s ease both' }}>
                  {sortOpts.map((o, i) => (
                    <button key={i} className="sort-opt" onClick={o.onClick} style={o.style}><span>{o.label}</span>{o.active && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px', flexShrink: 0 }}><path d="M20 6L9 17l-5-5"></path></svg>}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '0 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexShrink: 0 }}>
              <span style={{ fontSize: '10.5px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--t3,rgba(255,255,255,0.45))', fontWeight: 600 }}>Browse the library</span>
              <span style={{ fontSize: '10.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--acc-fg,#93C5FD)', fontWeight: 600 }}>{resultCount} {countLabel}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div ref={catRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button onClick={toggleCat} aria-label="Filter by tag" className="hover-border-strong-14" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', background: 'var(--s1,#111)', color: 'var(--t1,#EDEDED)', border: '1px solid var(--border,rgba(255,255,255,0.08))', borderRadius: '999px', padding: '10px 15px', fontFamily: 'inherit', fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', transition: 'border-color .18s ease' }}>
                  <span style={{ color: 'var(--t3,rgba(255,255,255,0.45))' }}>Tag:</span>{cat === 'all' ? 'All' : cat}<span style={catChevStyle}><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '10px', height: '10px', display: 'block' }}><path d="M3 4.5L6 7.5L9 4.5"></path></svg></span>
                </button>
                {catOpen && (
                  <div className="custom-scrollbar" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 60, minWidth: '200px', maxHeight: '300px', overflowY: 'auto', background: 'var(--s2,#171717)', border: '1px solid var(--border-strong,rgba(255,255,255,0.14))', borderRadius: '14px', padding: '6px', boxShadow: '0 22px 54px -18px rgba(0,0,0,0.85)', animation: 'fadeUp .18s ease both' }}>
                    {catOpts.map((o, i) => (
                      <button key={i} className="sort-opt" onClick={o.onClick} style={o.style}><span>{o.label}</span>{o.active && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px', flexShrink: 0 }}><path d="M20 6L9 17l-5-5"></path></svg>}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <section style={{ padding: '16px 0 72px', minHeight: '60vh' }}>
            {results.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', columnGap: '24px', rowGap: '44px', alignItems: 'start', animation: 'fadeGrid .4s ease both' }}>
                {results.map((item, i) => <CardComponent key={i} item={item} />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', opacity: 0.5 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px', marginBottom: '16px' }}><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.3-4.3"></path></svg>
                <p style={{ fontSize: '15px', fontWeight: 500 }}>No prompts found for this filter.</p>
                <button onClick={clearFilters} style={{ marginTop: '16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 16px', borderRadius: '999px', cursor: 'pointer' }}>Clear filters</button>
              </div>
            )}
          </section>

          <footer style={{ marginTop: '54px', paddingTop: '34px', borderTop: '1px solid var(--border-strong,rgba(255,255,255,0.14))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--acc,#3B82F6)', opacity: 0.8 }}></span><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1,#EDEDED)', letterSpacing: '-0.01em' }}>All systems operational</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', letterSpacing: '0.04em', color: 'var(--t3,rgba(255,255,255,0.45))' }}>
              <span>© 2026 Cue library</span><span style={{ opacity: 0.5 }}>·</span><a href="#" className="hover-color-t1" style={{ color: 'var(--t3,rgba(255,255,255,0.45))' }}>Colophon</a><span style={{ opacity: 0.5 }}>·</span><a href="#" className="hover-color-t1" style={{ color: 'var(--t3,rgba(255,255,255,0.45))' }}>Twitter</a>
            </div>
          </footer>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const { isSignedIn, user } = useUser();
  const isAdmin = isSignedIn && ['akashkumar7653099@gmail.com', 'aloksivastava1025@gmail.com'].includes(user?.primaryEmailAddress?.emailAddress);
  const [hasAutoRedirected, setHasAutoRedirected] = useState(false);

  useEffect(() => {
    if (isAdmin && !hasAutoRedirected && hash !== '#/admin') {
      window.location.hash = '#/admin';
      setHasAutoRedirected(true);
    }
  }, [isAdmin, hasAutoRedirected, hash]);

  if (hash === '#/admin') {
    return (
      <AppProvider>
        <Admin />
      </AppProvider>
    );
  }

  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
