/* ═══════════════════════════════════════════════════════════
   PORTFOLIO — main.js
   All logic: loader, cursor, nav, scroll spy, animations,
   skills tabs, project filter, contact form, theme toggle.
═══════════════════════════════════════════════════════════ */
'use strict';

/* ─── Helpers ─────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── 1. LOADER ───────────────────────────────────────── */
(function initLoader() {
  const loader  = $('#loader');
  const bar     = $('#loaderBar');
  const percent = $('#loaderPercent');
  if (!loader) return;

  let p = 0;
  const tick = setInterval(() => {
    p += Math.random() * 18 + 4;
    if (p >= 100) {
      p = 100;
      clearInterval(tick);
      bar.style.width = '100%';
      percent.textContent = '100%';
      setTimeout(() => {
        loader.classList.add('hidden');
        startReveal();
      }, 450);
    }
    bar.style.width = p + '%';
    percent.textContent = Math.floor(p) + '%';
  }, 120);
})();

/* ─── 2. HERO CANVAS PARTICLES ───────────────────────── */
(function initCanvas() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dots = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createDots() {
    dots = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + .3,
      dx: (Math.random() - .5) * .4,
      dy: (Math.random() - .5) * .4,
      a: Math.random(),
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // dots
    dots.forEach(d => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139,92,246,${d.a * .7})`;
      ctx.fill();
      d.x += d.dx; d.y += d.dy;
      if (d.x < 0 || d.x > W) d.dx *= -1;
      if (d.y < 0 || d.y > H) d.dy *= -1;
    });
    // lines between nearby dots
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(139,92,246,${(1 - dist / 120) * .15})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  createDots();
  draw();
  window.addEventListener('resize', () => { resize(); createDots(); });
})();

/* ─── 3. CUSTOM CURSOR ────────────────────────────────── */
(function initCursor() {
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring || window.matchMedia('(pointer:coarse)').matches) return;

  document.addEventListener('mousemove', e => {
    const x = e.clientX;
    const y = e.clientY;
    dot.style.left  = x + 'px';
    dot.style.top   = y + 'px';
    ring.style.left = x + 'px';
    ring.style.top  = y + 'px';
  });

  // Hover effect on interactive elements
  const hoverEls = 'a, button, .skill-card, .project-card, .stat-card, .contact-item';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) {
      ring.style.width  = '56px';
      ring.style.height = '56px';
      ring.style.borderColor = 'rgba(139,92,246,.8)';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) {
      ring.style.width  = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'rgba(139,92,246,.5)';
    }
  });
})();

/* ─── 4. HEADER SCROLL EFFECTS ────────────────────────── */
(function initHeader() {
  const header = $('#header');
  const backTop = $('#backTop');
  if (!header) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    if (backTop) backTop.classList.toggle('visible', y > 400);
  }, { passive: true });

  if (backTop) {
    backTop.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
  }
})();

/* ─── 5. MOBILE MENU ──────────────────────────────────── */
(function initMenu() {
  const toggle = $('#menuToggle');
  const menu   = $('#navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  // Close when a link is clicked
  $$('.nav-link', menu).forEach(link =>
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
    })
  );
})();

/* ─── 6. SCROLL SPY ───────────────────────────────────── */
(function initScrollSpy() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let currentContext = 'home';
    const scrollY = window.scrollY;

    sections.forEach(sec => {
      const sectionTop = sec.offsetTop;
      // Adjust offset (e.g. 150px) based on header height
      if (scrollY >= sectionTop - 150) {
        currentContext = sec.getAttribute('id');
      }
    });

    navLinks.forEach(l => {
      l.classList.toggle('active', l.dataset.section === currentContext);
    });
  }, { passive: true });
  
  // Trigger once on load
  window.dispatchEvent(new Event('scroll'));
})();

/* ─── 7. SCROLL REVEAL ────────────────────────────────── */
function startReveal() {
  const els = $$('.reveal-up, .reveal-left, .reveal-right');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: .12 });

  els.forEach(el => observer.observe(el));
}

/* ─── 8. ROLE TEXT TYPEWRITER ─────────────────────────── */
(function initTypewriter() {
  const el = $('#roleText');
  if (!el) return;

  const roles = [
    'Backend Developer',
    'Full Stack Developer',
    'API Engineer',
    '.NET & Java Developer',
  ];
  let ri = 0, ci = 0, deleting = false;

  function type() {
    const current = roles[ri];
    if (!deleting) {
      el.textContent = current.slice(0, ++ci);
      if (ci === current.length) {
        deleting = true;
        setTimeout(type, 2000);
        return;
      }
    } else {
      el.textContent = current.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
      }
    }
    setTimeout(type, deleting ? 40 : 85);
  }

  setTimeout(type, 800);
})();

/* ─── 9. STAT COUNTERS ────────────────────────────────── */
(function initCounters() {
  const stat$ = $$('.stat-num');
  if (!stat$.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = +el.dataset.count;
      const dur    = 1800;
      const step   = dur / target;
      let cur = 0;
      const counter = setInterval(() => {
        cur = Math.min(cur + 1, target);
        el.textContent = cur;
        if (cur >= target) clearInterval(counter);
      }, step);
      observer.unobserve(el);
    });
  }, { threshold: .5 });

  stat$.forEach(el => observer.observe(el));
})();

/* ─── 10. SKILLS TABS ─────────────────────────────────── */
(function initSkillsTabs() {
  const tabs   = $$('.skills-tab');
  const panels = $$('.skills-panel');
  if (!tabs.length) return;

  function activate(tab) {
    const key = tab.dataset.tab;
    tabs.forEach(t   => t.classList.toggle('active', t === tab));
    panels.forEach(p => p.classList.toggle('active', p.dataset.panel === key));

    // Animate bars in active panel
    const panel = panels.find(p => p.dataset.panel === key);
    if (panel) {
      $$('.skill-bar', panel).forEach(bar => {
        bar.style.width = '0%';
        // Re-trigger: force reflow
        void bar.offsetWidth;
        setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, 50);
      });

      // Re-trigger reveal on cards
      $$('.reveal-up', panel).forEach(c => {
        c.classList.remove('visible');
        void c.offsetWidth;
        setTimeout(() => c.classList.add('visible'), 60);
      });
    }
  }

  tabs.forEach(tab => tab.addEventListener('click', () => activate(tab)));

  // Trigger initial skill bars for the first active tab
  const activePanel = panels.find(p => p.classList.contains('active'));
  if (activePanel) {
    const barObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        $$('.skill-bar', e.target).forEach((bar, i) => {
          setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, i * 80);
        });
        barObserver.unobserve(e.target);
      });
    }, { threshold: .2 });
    barObserver.observe(activePanel);
  }
})();

/* ─── 11. PROJECT FILTER & LINKS ──────────────────────── */
(function initProjects() {
  const filterBtns = $$('.filter-btn');
  const cards      = $$('.project-card');
  if (!cards.length) return;

  const repoLinks = {
    'Cosmalyze': 'https://play.google.com/store/apps/details?id=com.anilgvnc.cosmalyze',
    'Unet': 'https://github.com/Unet-Your-Network',
    'E-Commerce-Application': 'https://github.com/karasungurhuseyinardil/E-Commerce-Application',
    'Streaming-Service': 'https://github.com/karasungurhuseyinardil/StreamingService'
  };

  cards.forEach(card => {
    const repo = card.dataset.repo;
    if (repo && repoLinks[repo]) {
      const url = repoLinks[repo];
      // Map entire card click to repo
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (!e.target.closest('a')) {
          window.open(url, '_blank');
        }
      });
      // Map overlay link
      const link = card.querySelector('.proj-link');
      if (link) {
        link.href = url;
        link.target = '_blank';
      }
    }
  });

  if (!filterBtns.length) return;
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !show);
        if (show) {
          card.style.animation = 'none';
          void card.offsetWidth;
          card.style.animation = 'fadeInUp .4s ease both';
        }
      });
    });
  });
})();

/* ─── 12. CONTACT FORM ────────────────────────────────── */
(function initContactForm() {
  const form    = $('#contactForm');
  const submitBtn = $('#formSubmitBtn');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Fields
    const name    = $('#formName');
    const email   = $('#formEmail');
    const message = $('#formMessage');
    const subject = $('#formSubject');
    let valid = true;

    [name, email, subject, message].forEach(f => {
      if (!f) return;
      if (!f.value.trim()) {
        f.style.borderColor = 'var(--clr-red)';
        valid = false;
      } else {
        f.style.borderColor = '';
      }
    });

    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = 'var(--clr-red)';
      valid = false;
    }

    if (!valid) {
      const isTr = document.documentElement.lang === 'tr';
      showToast(isTr ? 'Lütfen tüm alanları doğru doldurun.' : 'Please fill all fields correctly.', 'error');
      return;
    }

    const isTr = document.documentElement.lang === 'tr';
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${isTr ? 'Gönderiliyor...' : 'Sending...'}`;
    submitBtn.disabled = true;

    // --- EMAILJS INTEGRATION ---
    // Bu değerler config.js dosyasından (GİTHUBA EKLENMEZ) alınır.
    if (typeof emailjs === 'undefined') {
      console.error('EmailJS SDK not loaded!');
      showToast(isTr ? 'Email servisi yüklenemedi, lütfen sayfayı yenileyin.' : 'Email service not loaded, please refresh.', 'error');
      submitBtn.disabled = false;
      return;
    }

    const config = window.PORTFOLIO_CONFIG || {};
    const SERVICE_ID  = config.EMAILJS_SERVICE_ID || 'service_default'; 
    const TEMPLATE_ID = config.EMAILJS_TEMPLATE_ID || 'template_oti8y65'; 
    const PUBLIC_KEY  = config.EMAILJS_PUBLIC_KEY;
    
    const templateParams = {
      name:       name.value,
      from_name:  name.value,
      from_email: email.value,
      subject:    subject.value,
      message:    message.value,
      date:       new Date().toLocaleDateString('tr-TR'),
      time:       new Date().toLocaleTimeString('tr-TR'),
      to_email:   config.EMAILJS_RECEIVER_EMAIL || 'ardilkarasungur12@gmail.com'
    };

    console.log('EmailJS gönderiliyor...', { SERVICE_ID, TEMPLATE_ID, templateParams });

    // EmailJS v4: init() ile public key zaten ayarlandı, send() sadece 3 parametre alır
    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
      .then((response) => {
        console.log('EmailJS SUCCESS!', response.status, response.text);
        showToast(isTr ? 'Mesaj gönderildi! En kısa sürede döneceğim.' : "Message sent! I'll get back to you soon.", 'success');
        form.reset();
      })
      .catch((err) => {
        console.error('EmailJS Full Error Object:', JSON.stringify(err));
        const errorMsg = (err && err.text) || (err && err.message) || String(err);
        console.error('EmailJS Error Message:', errorMsg);
        
        if (errorMsg.toLowerCase().includes('service')) {
          console.warn('HATA: EMAILJS_SERVICE_ID geçersiz. config.js içindeki EMAILJS_SERVICE_ID değerini kontrol edin ("service_xxxx" formatında olmalı).');
        }
        if (errorMsg.toLowerCase().includes('template')) {
          console.warn('HATA: EMAILJS_TEMPLATE_ID geçersiz. config.js içindeki EMAILJS_TEMPLATE_ID değerini kontrol edin.');
        }

        showToast(isTr ? 'Bir hata oluştu, lütfen doğrudan e-posta gönderin.' : 'Error! Please send an email directly.', 'error');
      })
      .finally(() => {
        const btnText = isTr ? 'Mesaj Gönder' : 'Send Message';
        submitBtn.innerHTML = `<span>${btnText}</span><i class="fas fa-paper-plane"></i>`;
        submitBtn.disabled = false;
      });
  });
})();

/* ─── 13. THEME TOGGLE ────────────────────────────────── */
(function initTheme() {
  const btn  = $('#themeToggle');
  const body = document.body;
  if (!btn) return;

  const saved = localStorage.getItem('pf-theme') || 'dark';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const next = body.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('pf-theme', next);
  });

  function applyTheme(theme) {
    body.dataset.theme = theme;
    btn.innerHTML = theme === 'dark'
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }
})();

/* ─── 14. SCROLL INDICATOR HIDE ──────────────────────── */
(function initScrollIndicator() {
  const si = $('#scrollIndicator');
  if (!si) return;
  window.addEventListener('scroll', () => {
    si.style.opacity = window.scrollY > 80 ? '0' : '1';
    si.style.transition = 'opacity .4s ease';
  }, { passive: true });
})();

/* ─── 15. SCROLL PROGRESS BAR ─────────────────────────── */
(function initScrollProgress() {
  const bar = $('#scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / max * 100).toFixed(1) + '%';
  }, { passive: true });
})();

/* ─── 16. BUTTON RIPPLE EFFECT ────────────────────────── */
(function initRipple() {
  $$('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        position:absolute;
        width:${size}px; height:${size}px;
        left:${x - size/2}px; top:${y - size/2}px;
        background:rgba(255,255,255,.25);
        border-radius:50%;
        pointer-events:none;
        transform:scale(0);
        animation:rippleOut .55s ease-out forwards;
      `;
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
})();

/* ─── Inject ripple keyframe once ───────────────────── */
(function() {
  const s = document.createElement('style');
  s.textContent = `@keyframes rippleOut{to{transform:scale(1);opacity:0;}}`;
  document.head.appendChild(s);
})();

/* ═══════════════════════════════════════════════════════════
   FAZ 2 — GITHUB API STATS
   Fetches public repos + stars for karasungurhuseyinardil
   and updates the About stat cards + project star badges.
═══════════════════════════════════════════════════════════ */
(function initGithubStats() {
  const GH_USER = 'karasungurhuseyinardil';

  /* --- About section: update repo stat card --------- */
  async function fetchUserStats() {
    try {
      const res  = await fetch(`https://api.github.com/users/${GH_USER}`);
      if (!res.ok) return;
      const data = await res.json();
      // Update stat card 1 (Projects Shipped) with actual public repos
      const repoStat = document.querySelector('#stat1 .stat-num');
      if (repoStat) {
        repoStat.setAttribute('data-count', data.public_repos);
        repoStat.textContent = data.public_repos;
      }
    } catch (_) { /* silent fail — keep static value */ }
  }

  /* --- Project cards: inject ⭐ star counts ---------- */
  async function fetchProjectStars() {
    const cards = [...document.querySelectorAll('.project-card[data-repo]')];
    if (!cards.length) return;

    await Promise.allSettled(cards.map(async card => {
      const repo = card.dataset.repo;
      try {
        const res  = await fetch(`https://api.github.com/repos/${GH_USER}/${repo}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.stargazers_count === undefined) return;
        // Inject badge into project-body after the type tag
        const body = card.querySelector('.project-body');
        const type = card.querySelector('.project-type');
        if (!body || !type) return;
        // Avoid duplicate badges
        if (body.querySelector('.star-badge')) return;
        const badge = document.createElement('span');
        badge.className = 'star-badge';
        badge.innerHTML = `<i class="fas fa-star"></i> ${data.stargazers_count}`;
        type.insertAdjacentElement('afterend', badge);
      } catch (_) { /* silent */ }
    }));
  }

  // Only fetch when About section enters viewport to save bandwidth
  const aboutSection = document.querySelector('#about');
  if (!aboutSection) { fetchUserStats(); fetchProjectStars(); return; }

  const once = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    fetchUserStats();
    fetchProjectStars();
    once.disconnect();
  }, { threshold: .1 });
  once.observe(aboutSection);
})();

/* ═══════════════════════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM
═══════════════════════════════════════════════════════════ */
function showToast(msg, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const icon  = type === 'success' ? 'circle-check' : type === 'error' ? 'circle-xmark' : 'circle-info';
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas fa-${icon}"></i><span>${msg}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-show'));
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

/* ═══════════════════════════════════════════════════════════
   FAZ 2 — FULL TR / EN LANGUAGE SWITCH
═══════════════════════════════════════════════════════════ */
(function initLangSwitch() {
  const btn   = document.querySelector('#langToggle');
  const label = document.querySelector('#langLabel');
  if (!btn) return;

  /* ── Full translation dictionary ── */
  const T = {
    en: {
      /* page */
      'page.title': 'Hüseyin Ardıl Karasungur — Developer Portfolio',
      'meta.desc':  'Backend & Full Stack Developer skilled in Java, .NET and React.',
      /* section tags */
      'about.tag':   '01 / about',   'skills.tag':  '02 / skills',
      'exp.tag':     '03 / experience', 'proj.tag': '04 / projects', 'contact.tag': '05 / contact',
      /* section titles (HTML) */
      'about.title':   'About <span class="text-gradient">Me</span>',
      'skills.title':  'Tech <span class="text-gradient">Stack</span>',
      'exp.title':     'Work <span class="text-gradient">History</span>',
      'proj.title':    'Featured <span class="text-gradient">Projects</span>',
      'contact.title': "Let's <span class=\"text-gradient\">Connect</span>",
      /* section subtitles */
      'about.sub':   'A little bit about who I am and what drives me',
      'skills.sub':  'Technologies I use to bring ideas to life',
      'exp.sub':     'My professional journey so far',
      'proj.sub':    "A selection of work I'm proud of",
      'contact.sub': "Have a project or opportunity in mind? I'd love to hear about it.",
      /* about paragraphs (HTML) */
      'about.p1': 'I\'m <strong>Hüseyin Ardıl Karasungur</strong>, a Backend &amp; Full Stack Developer currently completing my <strong>B.S. in Computer Engineering</strong> at Doğuş University, Istanbul (Full Scholarship — graduating June 2025). I was ranked <strong>first in both my department and faculty</strong> upon admission.',
      'about.p2': 'I specialize in building robust <strong>APIs and backend systems</strong> using Java, Spring Boot, and .NET, while also being capable on the frontend with React and JavaScript. I constantly seek to adopt clean architecture principles such as SOLID, OOP, and Design Patterns in every project I work on.',
      'about.p3': "I'm passionate about software craftsmanship, AI-driven applications, and contributing to meaningful products that reach real users — from cosmetics ingredient analyzers to professional networking platforms.",
      /* about meta */
      'about.loc':    'Istanbul, Turkey',
      'about.edu':    'B.S. Computer Engineering — Doğuş University (2020–2025), Full Scholarship',
      'about.status': 'Open to full-time opportunities',
      /* about buttons */
      'about.btn.cv':      'Download CV', 'about.btn.contact': 'Contact Me',
      /* stat labels */
      'stat1.lbl': 'Projects Shipped', 'stat2.lbl': 'Work Experiences',
      'stat3.lbl': 'Tech Skills',      'stat4.lbl': 'Certifications & Awards',
      /* skills tabs */
      'tab.backend': 'Backend', 'tab.frontend': 'Frontend', 'tab.tools': 'Practices & Tools',
      /* skill levels */
      'lvl.advanced': 'Advanced', 'lvl.intermediate': 'Intermediate',
      /* experience */
      'exp1.role': 'Backend Developer', 'exp1.type': 'Full-time · Istanbul, TR', 'exp1.comp': '<i class="fas fa-building"></i> Bilgera Software A.Ş.', 'exp1.date': '<i class="fas fa-calendar"></i> Aug 2025 – Present', 
      'exp1.desc': 'Worked on backend development processes for the <strong>Repzone</strong> platform using .NET, focusing on API development and improving existing services. Also took on the <strong>Product Owner</strong> role for the Danone project — contributing to requirement definition, monitoring the development process, and facilitating communication between partners.',
      'exp2.role': 'Backend Developer', 'exp2.type': 'Part-time · Istanbul, TR', 'exp2.comp': '<i class="fas fa-building"></i> Turkcell', 'exp2.date': '<i class="fas fa-calendar"></i> Aug 2024 – Dec 2024',
      'exp2.desc': 'Worked as a part-time backend developer in the <strong>Corporate Customer Relations Department</strong>. Contributed to backend systems using <strong>Java</strong> and <strong>Spring</strong>, helping maintain and extend existing enterprise-grade services.',
      'exp3.role': 'Backend Development Intern', 'exp3.type': 'Internship · Istanbul, TR', 'exp3.comp': '<i class="fas fa-building"></i> Tekhnelogos', 'exp3.date': '<i class="fas fa-calendar"></i> Jun 2024 – Aug 2024',
      'exp3.desc': 'Developed an <strong>OKR (Objectives and Key Results)</strong> tracking system using .NET, enabling internal goal monitoring and reporting across teams.',
      'exp4.role': 'Mobile App Development Intern', 'exp4.type': 'Internship · Istanbul, TR', 'exp4.comp': '<i class="fas fa-building"></i> Kafein Technology Solutions', 'exp4.date': '<i class="fas fa-calendar"></i> Jul 2022 – Aug 2022',
      'exp4.desc': 'Developed a <strong>weather application</strong> using Java and Android Studio, integrating real-time API data and modern UI components.',
      /* certifications / volunteer */
      'certs.title': 'Trainings & Certifications',
      'vol.section.title': 'Volunteer <span class="text-gradient">Experience</span>',
      'vol1.title': 'Business Development Leader', 'vol1.org': 'AIESEC in Istanbul Asia',
      'vol1.desc': 'Led business development initiatives and engaged with AIESEC members to expand partnership networks across Istanbul.',
      'vol1.date': 'Mar 2023 – Aug 2023',
      'cert1.date': 'Feb 2025 – Jul 2025',
      'cert2.date': 'Jul 2023 – Jan 2024',
      'cert3.date': 'Mar 2024 – Jun 2024',
      'cert4.date': 'Nov 2023 – Mar 2024',
      'cert5.date': 'Jun 2023 – Jan 2024',
      'cert6.date': '2017 & 2018',
      'vol2.title': 'Gamification Volunteer', 'vol2.org': 'GamFed Turkey',
      'vol2.desc': 'Applied gamification strategies to improve motivation and performance in non-gaming environments and organizations.',
      'vol2.date': 'Nov 2022 – Sep 2023',
      /* projects */
      'proj1.type': 'Mobile · AI',   'proj1.desc': 'Enables barcode scanning and ingredient analysis for cosmetics. Provides AI-driven personalized product recommendations powered by ML Kit.',
      'proj2.type': 'Full Stack',    'proj2.desc': 'A .NET-based platform for professionals to showcase their networks, supporting authentication, data management, and a fully responsive UI.',
      'proj3.type': 'Backend',       'proj3.desc': 'Java-based e-commerce system supporting registration, login, product browsing, cart management, checkout flow, and order tracking.',
      'proj4.type': 'Frontend',      'proj4.desc': 'Frontend of a streaming platform built with JavaScript, featuring responsive layout design and smooth media preview UI components.',
      /* contact */
      'contact.h3': 'Get In Touch',
      'contact.p':  "I'm currently open to full-time positions and freelance projects. Whether you have a role to discuss or just want to say hello my inbox is always open!",
      'lbl.email': 'Email', 'lbl.linkedin': 'LinkedIn', 'lbl.github': 'GitHub',
      'form.lbl.name': 'Name', 'form.lbl.email': 'Email', 'form.lbl.subject': 'Subject', 'form.lbl.message': 'Message',
      'form.ph.name': 'Your full name', 'form.ph.email': 'mail@mail.com',
      'form.ph.subject': 'Job opportunity / Project inquiry', 'form.ph.msg': 'Tell me more…',
      'form.submit': 'Send Message', 'form.success': "Message sent! I'll get back to you soon.",
      /* footer */
      'footer.copy': '© 2026 Hüseyin Ardıl Karasungur',
      'footer.suffix': '',
    },
    tr: {
      'page.title': 'Hüseyin Ardıl Karasungur — Geliştirici Portföyü',
      'meta.desc':  'Java, .NET ve React konularında uzman Backend & Full Stack Geliştirici.',
      'about.tag':   '01 / hakkımda',  'skills.tag':  '02 / beceriler',
      'exp.tag':     '03 / deneyim',   'proj.tag':   '04 / projeler',  'contact.tag': '05 / iletişim',
      'about.title':   'Hakkımda',
      'skills.title':  'Teknoloji <span class="text-gradient">Yığını</span>',
      'exp.title':     'Çalışma <span class="text-gradient">Geçmişim</span>',
      'proj.title':    'Öne Çıkan <span class="text-gradient">Projeler</span>',
      'contact.title': 'İletişime <span class="text-gradient">Geçelim</span>',
      'about.sub':   'Kim olduğum ve beni nelerin motive ettiğine dair kısa bir bilgi',
      'skills.sub':  'Fikirleri hayata geçirmek için kullandığım teknolojiler',
      'exp.sub':     'Şimdiye kadarki profesyonel yolculuğum',
      'proj.sub':    'Gurur duyduğum işlerden bir seçki',
      'contact.sub': 'Bir proje veya fırsat aklınızda mı? Haberleşmekten mutluluk duyarım.',
      'about.p1': 'Ben <strong>Hüseyin Ardıl Karasungur</strong>, İstanbul Doğuş Üniversitesi Bilgisayar Mühendisliği bölümünde öğrenimimi sürdüren bir Backend & Full Stack Geliştiriciyim (Tam Burs — Haziran 2025 mezuniyeti). Üniversiteye girişte <strong>hem bölümümden hem de fakültemden birincilik</strong> derecesiyle kabul edildim.',
      'about.p2': '<strong>API\'ler ve backend sistemleri</strong> geliştirme konusunda Java, Spring Boot ve .NET ile uzmanlaşıyorum; aynı zamanda React ve JavaScript ile frontend tarafında da etkin çalışabiliyorum. Her projemde SOLID, OOP ve Tasarım Desenleri gibi temiz mimari prensiplerini benimsemeye özen gösteriyorum.',
      'about.p3': 'Yazılım zanaatına, yapay zeka destekli uygulamalara ve kozmetik içerik analizörlerinden profesyonel ağ platformlarına kadar gerçek kullanıcılara ulaşan anlamlı ürünlere katkı sağlamaya büyük önem veriyorum.',
      'about.loc':    'İstanbul, Türkiye',
      'about.edu':    'Bilgisayar Mühendisliği — Doğuş Üniversitesi (2020–2025), Tam Burs',
      'about.status': 'Tam zamanlı fırsatlara açığım',
      'about.btn.cv': 'CV İndir', 'about.btn.contact': 'İletişim',
      'stat1.lbl': 'Teslim Edilen Proje', 'stat2.lbl': 'İş Deneyimi',
      'stat3.lbl': 'Teknik Beceri',       'stat4.lbl': 'Sertifika & Ödül',
      'tab.backend': 'Backend', 'tab.frontend': 'Frontend', 'tab.tools': 'Pratikler & Araçlar',
      'lvl.advanced': 'İleri Seviye', 'lvl.intermediate': 'Orta Seviye',
      'exp1.role': 'Backend Geliştirici', 'exp1.type': 'Tam Zamanlı · İstanbul, TR', 'exp1.comp': '<i class="fas fa-building"></i> Bilgera Yazılım A.Ş.', 'exp1.date': '<i class="fas fa-calendar"></i> Ağu 2025 – Günümüz',
      'exp1.desc': '<strong>Repzone</strong> platformu için .NET kullanarak backend geliştirme süreçlerinde çalıştım; API geliştirme ve mevcut servislerin iyileştirilmesine odaklandım. Danone projesi için <strong>Ürün Sahibi</strong> rolünü üstlenerek gereksinimlerin tanımlanmasına, süreç takibine ve paydaşlar arası iletişim koordinasyonuna katkıda bulundum.',
      'exp2.role': 'Backend Geliştirici', 'exp2.type': 'Yarı Zamanlı · İstanbul, TR', 'exp2.comp': '<i class="fas fa-building"></i> Turkcell', 'exp2.date': '<i class="fas fa-calendar"></i> Ağu 2024 – Ara 2024',
      'exp2.desc': '<strong>Kurumsal Müşteri İlişkileri Departmanı\'nda</strong> yarı zamanlı backend geliştirici olarak çalıştım. <strong>Java</strong> ve <strong>Spring</strong> kullanarak mevcut kurumsal servislerin bakımına ve geliştirilmesine katkıda bulundum.',
      'exp3.role': 'Backend Geliştirme Stajyeri', 'exp3.type': 'Staj · İstanbul, TR', 'exp3.comp': '<i class="fas fa-building"></i> Tekhnelogos', 'exp3.date': '<i class="fas fa-calendar"></i> Haz 2024 – Ağu 2024',
      'exp3.desc': '.NET kullanarak dahili hedef izleme ve raporlamayı sağlayan <strong>OKR (Hedefler ve Temel Sonuçlar)</strong> takip sistemi geliştirdim.',
      'exp4.role': 'Mobil Uygulama Geliştirme Stajyeri', 'exp4.type': 'Staj · İstanbul, TR', 'exp4.comp': '<i class="fas fa-building"></i> Kafein Teknoloji Çözümleri', 'exp4.date': '<i class="fas fa-calendar"></i> Tem 2022 – Ağu 2022',
      'exp4.desc': 'Java ve Android Studio kullanarak gerçek zamanlı API verileri ile modern UI bileşenlerini entegre eden bir <strong>hava durumu uygulaması</strong> geliştirdim.',
      'certs.title': 'Eğitimler & Sertifikalar',
      'vol.section.title': 'Gönüllü <span class="text-gradient">Deneyimi</span>',
      'vol1.title': 'İş Geliştirme Lideri', 'vol1.org': 'AIESEC İstanbul Asya',
      'vol1.desc': 'İstanbul genelinde ortaklık ağlarını genişletmek için iş geliştirme girişimleri yürüttüm ve AIESEC üyeleriyle iş birliği yaptım.',
      'vol1.date': 'Mar 2023 – Ağu 2023',
      'cert1.date': 'Şub 2025 – Tem 2025',
      'cert2.date': 'Tem 2023 – Oca 2024',
      'cert3.date': 'Mar 2024 – Haz 2024',
      'cert4.date': 'Kas 2023 – Mar 2024',
      'cert5.date': 'Haz 2023 – Oca 2024',
      'cert6.date': '2017 & 2018',
      'vol2.title': 'Oyunlaştırma Gönüllüsü', 'vol2.org': 'GamFed Turkey',
      'vol2.desc': 'Oyun dışı ortamlarda motivasyonu ve performansı artırmak için oyunlaştırma stratejileri uyguladım.',
      'vol2.date': 'Kas 2022 – Eyl 2023',
      'proj1.type': 'Mobil · YZ',   'proj1.desc': 'Kozmetik ürünler için barkod tarama ve içerik analizi. ML Kit destekli yapay zeka ile kişiselleştirilmiş ürün önerileri sunar.',
      'proj2.type': 'Full Stack',   'proj2.desc': 'Profesyonellerin ağlarını sergilemeleri için .NET tabanlı bir platform. Kimlik doğrulama, veri yönetimi ve tam duyarlı arayüz destekler.',
      'proj3.type': 'Backend',      'proj3.desc': 'Kayıt, giriş, ürün listeleme, sepet yönetimi, ödeme akışı ve sipariş takibini destekleyen Java tabanlı e-ticaret sistemi.',
      'proj4.type': 'Frontend',     'proj4.desc': 'Duyarlı düzen ve akıcı medya önizleme bileşenlerine sahip, JavaScript ile oluşturulmuş yayın platformu ön yüzü.',
      'contact.h3': 'İletişime Geçin',
      'contact.p':  'Tam zamanlı pozisyonlara ve freelance projelere açığım. Bir fırsat görüşmek ya da sadece merhaba demek ister misiniz? Gelen kutum her zaman açık!',
      'lbl.email': 'E-posta', 'lbl.linkedin': 'LinkedIn', 'lbl.github': 'GitHub',
      'form.lbl.name': 'Ad Soyad', 'form.lbl.email': 'E-posta', 'form.lbl.subject': 'Konu', 'form.lbl.message': 'Mesaj',
      'form.ph.name': 'Adınız ve soyadınız', 'form.ph.email': 'mail@mail.com',
      'form.ph.subject': 'İş fırsatı / Proje teklifi', 'form.ph.msg': 'Daha fazla bilgi verin...',
      'form.submit': 'Mesaj Gönder', 'form.success': 'Mesaj gönderildi! En kısa sürede geri döneceğim.',
      'footer.copy': '© 2026 Hüseyin Ardıl Karasungur',
      'footer.suffix': '',
    }
  };

  /* ── Selector → key mapping ── */
  const MAP = [
    /* section tags */
    ['#aboutTag',   'about.tag',   false], ['#skillsTag',  'skills.tag',   false],
    ['#expTag',     'exp.tag',     false], ['#projTag',    'proj.tag',     false],
    ['#contactTag', 'contact.tag', false],
    /* section titles (HTML) */
    ['#aboutTitle',   'about.title',   true], ['#skillsTitle',   'skills.title',  true],
    ['#expTitle',     'exp.title',     true], ['#projTitle',    'proj.title',    true],
    ['#contactTitle', 'contact.title', true],
    /* subtitles */
    ['#aboutSub',    'about.sub',   false], ['#skillsSub',    'skills.sub',  false],
    ['#expSub',      'exp.sub',     false], ['#projSub',     'proj.sub',    false],
    ['#contactSub',  'contact.sub', false],
    /* about paragraphs */
    ['#about .about-text p:nth-child(1)', 'about.p1', true],
    ['#about .about-text p:nth-child(2)', 'about.p2', true],
    ['#about .about-text p:nth-child(3)', 'about.p3', true],
    /* about meta */
    ['#aboutLocation span:last-child', 'about.loc',    false],
    ['#aboutStatus   span:last-child', 'about.edu',    false],
    ['#aboutEdu      span:last-child', 'about.status', false],
    /* about buttons */
    ['#downloadCvBtn span', 'about.btn.cv',      false],
    ['#aboutContactBtn span', 'about.btn.contact', false],
    /* stat labels */
    ['#stat1 .stat-label', 'stat1.lbl', false], ['#stat2 .stat-label', 'stat2.lbl', false],
    ['#stat3 .stat-label', 'stat3.lbl', false], ['#stat4 .stat-label', 'stat4.lbl', false],
    /* skills tabs */
    ['#tabBackend', 'tab.backend', false], ['#tabFrontend', 'tab.frontend', false], ['#tabTools', 'tab.tools', false],
    /* experience */
    ['#exp1 .tl-role', 'exp1.role', false], ['#exp1 .tl-type', 'exp1.type', false], ['#exp1 .tl-desc', 'exp1.desc', true],
    
    ['#exp2 .tl-role', 'exp2.role', false], ['#exp2 .tl-type', 'exp2.type', false], ['#exp2 .tl-desc', 'exp2.desc', true],

    ['#exp3 .tl-role', 'exp3.role', false], ['#exp3 .tl-type', 'exp3.type', false], ['#exp3 .tl-desc', 'exp3.desc', true],

    ['#exp4 .tl-role', 'exp4.role', false], ['#exp4 .tl-type', 'exp4.type', false], ['#exp4 .tl-desc', 'exp4.desc', true],

    /* certifications / volunteer */
    ['#certsMainTitle',          'certs.title',         false],
    ['#volSectionTitle',         'vol.section.title',   true],
    ['#vol1 .vol-title',         'vol1.title',          false], ['#vol1 .vol-org',  'vol1.org',  false],
    ['#vol1 .vol-desc',          'vol1.desc',           false], ['#vol1 .vol-date span:last-child', 'vol1.date', false],
    ['#vol2 .vol-title',         'vol2.title',          false], ['#vol2 .vol-org',  'vol2.org',  false],
    ['#vol2 .vol-desc',          'vol2.desc',           false], ['#vol2 .vol-date span:last-child', 'vol2.date', false],
    /* projects */
    ['#proj1 .project-type', 'proj1.type', false], ['#proj1 .project-desc', 'proj1.desc', false],
    ['#proj2 .project-type', 'proj2.type', false], ['#proj2 .project-desc', 'proj2.desc', false],
    ['#proj3 .project-type', 'proj3.type', false], ['#proj3 .project-desc', 'proj3.desc', false],
    ['#proj4 .project-type', 'proj4.type', false], ['#proj4 .project-desc', 'proj4.desc', false],
    /* contact */
    ['#contact .contact-info h3',    'contact.h3', false],
    ['#contact .contact-info > p',   'contact.p',  false],
    ['#contactEmail  .ci-label',     'lbl.email',   false],

    ['#contactLinkedin .ci-label',   'lbl.linkedin', false],
    ['#contactGithub .ci-label',     'lbl.github',  false],
    ['label[for="formName"]',        'form.lbl.name',    false],
    ['label[for="formEmail"]',       'form.lbl.email',   false],
    ['label[for="formSubject"]',     'form.lbl.subject', false],
    ['label[for="formMessage"]',     'form.lbl.message', false],
    ['#formSubmitBtn span',          'form.submit',      false],
    ['#formSuccess span',            'form.success',     false],
    /* footer */
    ['#footerText',   'footer.copy',   false],
    ['#footerSuffix', 'footer.suffix', false],
  ];

  /* ── Placeholder map ── */
  const PH = [
    ['#formName',    'form.ph.name'], ['#formEmail',   'form.ph.email'],
    ['#formSubject', 'form.ph.subject'], ['#formMessage', 'form.ph.msg'],
  ];

  let lang = localStorage.getItem('pf-lang') || 'en';
  // Wait for DOM to be fully ready if needed, but since script is at end, it's fine.
  applyLang(lang);

  btn.addEventListener('click', () => {
    lang = lang === 'en' ? 'tr' : 'en';
    applyLang(lang);
    localStorage.setItem('pf-lang', lang);
  });

  function applyLang(l) {
    const t = T[l];
    if (!t) return;

    /* button label */
    if (label) label.textContent = l === 'en' ? 'TR' : 'EN';
    btn.title = l === 'en' ? "Türkçe'ye geç" : 'Switch to English';
    document.documentElement.lang = l === 'en' ? 'en' : 'tr';

    /* existing data-tr / data-en elements (nav, hero, filter btns, experience comps/dates) */
    document.querySelectorAll('[data-tr][data-en]').forEach(el => { el.textContent = el.dataset[l]; });
    document.querySelectorAll('.filter-btn[data-tr]').forEach(el => { el.textContent = el.dataset[l]; });

    /* dictionary map */
    MAP.forEach(([sel, key, isHtml]) => {
      const el = document.querySelector(sel);
      if (!el) {
        // Optional: console.warn('Missing element for translation:', sel);
        return;
      }
      if (t[key] == null) return;
      if (isHtml) el.innerHTML = t[key]; else el.textContent = t[key];
    });

    /* placeholders */
    PH.forEach(([sel, key]) => {
      const el = document.querySelector(sel);
      if (el && t[key]) el.placeholder = t[key];
    });

    /* skill level labels (all .skill-level spans) */
    document.querySelectorAll('.skill-level').forEach(el => {
      const v = el.textContent.trim();
      const isAdv = ['Advanced', 'İleri Seviye'].includes(v);
      el.textContent = isAdv ? t['lvl.advanced'] : t['lvl.intermediate'];
    });

    /* page meta */
    document.title = t['page.title'];
    const dm = document.querySelector('meta[name="description"]');
    if (dm) dm.content = t['meta.desc'];
  }
})();



/* ═══════════════════════════════════════════════════════════
   FAZ 1 — 3D MOUSE TILT on project cards
═══════════════════════════════════════════════════════════ */
(function init3DTilt() {
  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('.project-card');
  const MAX   = 10; // max tilt degrees

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - .5) * 2;   // -1 → +1
      const y = ((e.clientY - r.top)  / r.height - .5) * -2;   // -1 → +1
      card.style.transform = `perspective(800px) rotateY(${x * MAX}deg) rotateX(${y * MAX}deg) translateZ(8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

