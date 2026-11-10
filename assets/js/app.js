/* HS 250 Study Site — Shared JS */
/* Theme toggle, scroll progress, anchor rail highlight, MCQ logic */

(function() {
  'use strict';

  // ===== Theme Management =====
  const THEME_KEY = 'hs250-theme';
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  function getInitialTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function initTheme() {
    applyTheme(getInitialTheme());
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  // ===== Scroll Progress =====
  const progressEl = document.querySelector('.scroll-progress');

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    if (progressEl) progressEl.style.setProperty('--progress', `${progress}%`);
  }

  // ===== Anchor Rail Highlight =====
  const anchorLinks = document.querySelectorAll('.anchor-link');
  const sections = document.querySelectorAll('.section[id]');
  let observer = null;

  function initAnchorObserver() {
    if (anchorLinks.length === 0 || sections.length === 0) return;
    const observerOptions = { rootMargin: '-20% 0px -70% 0px', threshold: 0 };
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector(`.anchor-link[href="#${id}"]`);
        if (link) link.classList.toggle('active', entry.isIntersecting);
      });
    }, observerOptions);
    sections.forEach(section => observer.observe(section));
  }

  // Smooth scroll for anchor links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', targetId);
        }
      });
    });
  }

  // ===== MCQ Logic =====
  function initMCQ() {
    document.querySelectorAll('.mcq-card').forEach(card => {
      const radios = card.querySelectorAll('input[type="radio"]');
      const checkBtn = card.querySelector('.mcq-btn.check');
      const resetBtn = card.querySelector('.mcq-btn.reset');
      const explanation = card.querySelector('.mcq-explanation');
      let answered = false;

      // Radio change - just update visual selection, don't validate yet
      radios.forEach(radio => {
        radio.addEventListener('change', () => {
          if (answered) return;
          // Clear previous selection styling
          card.querySelectorAll('.mcq-option').forEach(opt => {
            opt.classList.remove('selected');
          });
          // Mark selected option
          const option = radio.closest('.mcq-option');
          if (option) option.classList.add('selected');
        });
      });

      // Check button - validate answer
      if (checkBtn) {
        checkBtn.addEventListener('click', () => {
          if (answered) return;
          const selected = card.querySelector('input[type="radio"]:checked');
          if (!selected) return;
          
          const option = selected.closest('.mcq-option');
          const isCorrect = selected.value === 'correct';
          
          card.querySelectorAll('.mcq-option').forEach(opt => {
            const r = opt.querySelector('input');
            opt.classList.remove('correct', 'incorrect', 'selected');
            if (r === selected) {
              opt.classList.add(isCorrect ? 'correct' : 'incorrect');
            } else if (r.value === 'correct') {
              opt.classList.add('correct');
            }
          });
          
          if (explanation) {
            explanation.classList.add('show');
            if (!isCorrect) {
              explanation.innerHTML = '<strong>Incorrect.</strong> ' + explanation.dataset.explanation;
            }
          }
          
          answered = true;
          if (checkBtn) checkBtn.disabled = true;
          if (resetBtn) resetBtn.disabled = false;
        });
      }
      
      // Reset button
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          radios.forEach(r => { r.checked = false; r.disabled = false; });
          card.querySelectorAll('.mcq-option').forEach(opt => opt.classList.remove('correct', 'incorrect', 'selected'));
          if (explanation) explanation.classList.remove('show');
          answered = false;
          if (checkBtn) checkBtn.disabled = false;
          if (resetBtn) resetBtn.disabled = true;
        });
      }
    });
  }

  // ===== Reveal Animations =====
  function initReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;
    const ro = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(el => {
      el.style.animationPlayState = 'paused';
      ro.observe(el);
    });
  }

  // ===== Diagram Iframe Auto-Resize =====
  function initDiagramIframes() {
    document.querySelectorAll('.diagram-frame').forEach(function(iframe) {
      function tryInjectAndResize() {
        try {
          var doc = iframe.contentDocument || iframe.contentWindow.document;
          if (doc) {
            // Inject styles to make diagram fill iframe
            var style = doc.createElement('style');
            style.textContent = '\n              * { box-sizing: border-box; }\n              body { padding: 0 !important; margin: 0 !important; min-height: 100vh; display: flex; justify-content: flex-start; align-items: flex-start; }\n              .card { max-width: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 24px !important; min-height: 100vh; width: 100% !important; }\n              .card > * { max-width: 100% !important; }\n              svg { width: 100% !important; height: auto !important; }\n            ';
            doc.head.appendChild(style);
            
            // Force iframe to expand to content height
            function resizeIframe() {
              try {
                var contentHeight = doc.body.scrollHeight || doc.documentElement.scrollHeight;
                if (contentHeight > 0) {
                  iframe.style.height = contentHeight + 'px';
                  iframe.style.minHeight = contentHeight + 'px';
                }
              } catch (e) {}
            }
            
            // Resize after a short delay for layout
            setTimeout(resizeIframe, 100);
            setTimeout(resizeIframe, 500);
            
            // Also resize when images/svg load
            doc.addEventListener('load', resizeIframe, true);
          } catch (e) {
            // Cross-origin or other error, ignore
          }
        }
      }
      
      iframe.addEventListener('load', tryInjectAndResize);
      // Also try immediately in case already loaded
      if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
        tryInjectAndResize();
      }
    });
  }

// ===== Initialize All =====
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSmoothScroll();
    initAnchorObserver();
    initMCQ();
    initReveal();
    initDiagramIframes();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
  });
})();