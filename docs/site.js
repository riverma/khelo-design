/* The Khelo documentation site's only script. It remembers the chosen
   aesthetic, copies snippets on request, and runs the demos, each of which
   responds only to a press. No timers that recur, nothing that appears
   on its own. */

(function () {
  'use strict';

  var KEY = 'khelo-theme';
  var root = document.documentElement;

  function apply(theme) {
    root.classList.remove('khelo-mela', 'khelo-raat');
    root.classList.add('khelo-' + theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'raat' ? '#14103a' : '#fbf0d9');
    document.querySelectorAll('[data-theme-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-theme-btn') === theme ? 'true' : 'false');
    });
  }

  /* A stored choice wins. With none, follow the operating system, live. */
  var stored;
  try { stored = localStorage.getItem(KEY); } catch (e) { stored = null; }
  var dark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  if (stored === 'mela' || stored === 'raat') {
    apply(stored);
  } else {
    apply(dark && dark.matches ? 'raat' : 'mela');
    if (dark && dark.addEventListener) {
      dark.addEventListener('change', function (e) {
        var chosen;
        try { chosen = localStorage.getItem(KEY); } catch (err) { chosen = null; }
        if (!chosen) apply(e.matches ? 'raat' : 'mela');
      });
    }
  }

  function press(group, btn) {
    group.querySelectorAll('[aria-pressed]').forEach(function (b) {
      b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
    });
  }

  /* Finite set: Next walks through, the end is a real ending. */
  function finiteStep(box, i) {
    var cards = box.querySelectorAll('.finite__card');
    var dots = box.querySelectorAll('.kh-steps li');
    var total = cards.length;
    var end = box.querySelector('[data-finite-end]');
    var next = box.querySelector('[data-finite-next]');
    cards.forEach(function (c, n) { c.hidden = n !== i; });
    dots.forEach(function (d, n) {
      d.removeAttribute('aria-current');
      if (n < i || i >= total) d.setAttribute('data-done', ''); else d.removeAttribute('data-done');
      if (n === i) d.setAttribute('aria-current', 'step');
    });
    end.hidden = i < total;
    next.hidden = i >= total;
    box.querySelector('[data-finite-label]').textContent = i < total ? (i + 1) + ' of ' + total : 'All ' + total + ' done';
    box.setAttribute('data-i', String(i));
  }

  document.addEventListener('click', function (e) {
    var t = e.target;

    var themeBtn = t.closest('[data-theme-btn]');
    if (themeBtn) {
      var th = themeBtn.getAttribute('data-theme-btn');
      apply(th);
      try { localStorage.setItem(KEY, th); } catch (err) { /* private mode: fine */ }
      return;
    }

    var copy = t.closest('[data-copy]');
    if (copy) {
      var pre = copy.parentElement.querySelector('pre');
      if (pre && navigator.clipboard) {
        navigator.clipboard.writeText(pre.textContent).then(function () {
          var was = copy.textContent;
          copy.textContent = 'Copied';
          /* One shot, tied to the press that caused it. */
          setTimeout(function () { copy.textContent = was; }, 1400);
        }, function () {});
      }
      return;
    }

    var chip = t.closest('[data-chips] .kh-chip');
    if (chip) { press(chip.parentElement, chip); return; }

    var tile = t.closest('[data-tiles] .kh-tile');
    if (tile) { tile.setAttribute('aria-pressed', tile.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); return; }

    var paint = t.closest('[data-paint]');
    if (paint) { press(paint.parentElement, paint); return; }

    var dot = t.closest('.rangoli__dot');
    if (dot) {
      var box = dot.closest('[data-rangoli]');
      var cur = box.querySelector('[data-paint][aria-pressed="true"]');
      var c = cur ? cur.getAttribute('data-paint') : 'genda';
      if (dot.getAttribute('data-c') === c) {
        dot.removeAttribute('data-c'); dot.setAttribute('aria-pressed', 'false');
      } else {
        dot.setAttribute('data-c', c); dot.setAttribute('aria-pressed', 'true');
      }
      return;
    }
    var clear = t.closest('[data-rangoli-clear]');
    if (clear) {
      clear.closest('[data-rangoli]').querySelectorAll('.rangoli__dot').forEach(function (d) {
        d.removeAttribute('data-c'); d.setAttribute('aria-pressed', 'false');
      });
      return;
    }

    var nx = t.closest('[data-finite-next]');
    if (nx) { var f = nx.closest('[data-finite]'); finiteStep(f, Number(f.getAttribute('data-i') || 0) + 1); return; }
    var rs = t.closest('[data-finite-restart]');
    if (rs) { finiteStep(rs.closest('[data-finite]'), 0); }
  });
})();
