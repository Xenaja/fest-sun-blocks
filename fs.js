/* fest-sun-blocks · fs.js
   Встраиваемые блоки для лендингов событий ретрит-центра «Энергия Солнца».
   На странице Тильды (блок T123):
     <div class="fs-block" data-block="prices" data-event="energiya-solntsa" data-audience="new"></div>
     <script src="https://xenaja.github.io/fest-sun-blocks/fs.js"></script>
   Скрипт подключается один раз и рендерит все .fs-block на странице.
   Тексты и цены – только в JSON/MD репозитория, код блоков их не содержит. */
(function () {
  'use strict';

  // Меняется при каждом обновлении данных: по нему сбрасывается кэш JSON и MD
  var VERSION = '2026.10.22-7';

  if (window.FestSun) { window.FestSun.scan(); return; }

  var script = document.currentScript || (function () {
    var s = document.querySelectorAll('script[src*="fs.js"]');
    return s[s.length - 1];
  })();
  var BASE = ((script && script.src) || '').replace(/[?#].*$/, '').replace(/[^\/]*$/, '');

  // ------------------------------------------------------------ загрузка

  var cache = {};
  function load(path, kind) {
    var key = kind + ':' + path;
    if (!cache[key]) {
      cache[key] = fetch(BASE + path + '?v=' + VERSION).then(function (r) {
        if (!r.ok) throw new Error(path + ' – ' + r.status);
        return kind === 'json' ? r.json() : r.text();
      });
    }
    return cache[key];
  }
  function opt(p) { return p.then(null, function () { return null; }); }

  function loadEvent(id) {
    if (!/^[a-z0-9-]+$/.test(id || '')) return Promise.reject(new Error('неверный data-event: ' + id));
    return load('events/' + id + '/event.json', 'json').then(function (ev) {
      ev._dir = 'events/' + id + '/';
      return ev;
    });
  }

  // Текст события, если его нет – общий
  function loadContent(ev, rel) {
    return opt(load(ev._dir + rel, 'text')).then(function (t) {
      return t != null ? t : load('shared/' + rel, 'text');
    });
  }

  var themes = {};
  function ensureTheme(name) {
    if (!themes[name]) {
      themes[name] = new Promise(function (resolve) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = BASE + 'themes/' + name + '.css?v=' + VERSION;
        link.onload = link.onerror = function () { resolve(); };
        setTimeout(resolve, 3000);
        document.head.appendChild(link);
      });
    }
    return themes[name];
  }

  // ------------------------------------------------------------ утилиты

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; }
  function asset(dir, p) {
    if (!p) return '';
    if (/^(https?:)?\/\//.test(p) || p.charAt(0) === '/') return p;
    return BASE + dir + p;
  }
  function section(inner, extra) {
    return '<section class="fs-section' + (extra ? ' ' + extra : '') + '"><div class="fs-inner">' + inner + '</div></section>';
  }
  function title(t) { return t ? '<h2 class="fs-title">' + inline(t) + '</h2>' : ''; }
  function lead(lines) {
    if (!lines) return '';
    if (!Array.isArray(lines)) lines = [lines];
    return '<div class="fs-lead">' + lines.map(function (l) { return '<p>' + inline(l) + '</p>'; }).join('') + '</div>';
  }

  // ------------------------------------------------------------ мини-markdown

  function inline(s) {
    return esc(s)
      .replace(/\[\[([^\]]+)\]\]\(([^)\s]+)\)/g, function (_, t, u) {
        return '<a class="fs-btn" href="#" data-fs-link="' + u + '">' + t + '</a>';
      })
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|#|mailto:|tel:)[^\s)]+)\)/g, function (_, t, u) {
        var ext = /^https?:/.test(u);
        return '<a href="' + u + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + t + '</a>';
      });
  }

  var CARDS_OPEN = '\u0000cards', CARDS_CLOSE = '\u0000/cards';
  var CALLOUT_OPEN = '\u0000callout', CALLOUT_CLOSE = '\u0000/callout';
  var LIST_LINE = /^\s*([-*]|\d+[.)])\s+/;
  var STRUCT = /^(cards|cards-2|center|features|steps|buttons|bar)$/;

  // ::: partner / ::: new – только для своей аудитории (абзацы выделяются карточкой,
  // одиночные пункты списка просто продолжают список); ::: cards – сетка карточек
  function fences(src, aud) {
    var root = [], stack = [];
    function target() {
      for (var i = stack.length - 1; i >= 0; i--) if (stack[i].buf) return stack[i].buf;
      return root;
    }
    function release(f) {
      var t = target();
      var onlyList = f.buf.every(function (l) { return !l.trim() || LIST_LINE.test(l); });
      var whole = f.buf.some(function (l) { return /^##\s/.test(l); });
      var box = !onlyList && !whole;
      if (box) t.push(CALLOUT_OPEN);
      Array.prototype.push.apply(t, f.buf);
      if (box) t.push(CALLOUT_CLOSE);
    }
    src.replace(/\r/g, '').split('\n').forEach(function (line) {
      var open = line.match(/^:::\s*([\w-]+)\s*$/);
      var hidden = stack.some(function (f) { return f.hide; });
      if (open) {
        var kind = open[1];
        if (STRUCT.test(kind)) {
          if (!hidden) target().push('\u0000' + kind);
          stack.push({ kind: kind, hide: false });
        } else {
          var hide = hidden || aud !== kind;
          stack.push({ kind: kind, hide: hide, buf: hide ? null : [] });
        }
        return;
      }
      if (/^:::\s*$/.test(line)) {
        var f = stack.pop();
        if (!f) return;
        if (STRUCT.test(f.kind)) { if (!hidden) target().push('\u0000/' + f.kind); }
        else if (f.buf) release(f);
        return;
      }
      if (!hidden) target().push(line);
    });
    while (stack.length) { var rest = stack.pop(); if (rest.buf) release(rest); }
    return root;
  }

  function blocks(lines) {
    var html = '', para = [], list = null, quote = [], run = [], nest = [], inCard = false, afterTitle = false;
    function flushRun() {
      if (!run.length) return;
      html += run.length > 1 ? '<div class="fs-cols">' + run.join('') + '</div>' : run[0];
      run = [];
    }
    function out(x) { flushRun(); html += x; }
    function flushPara() {
      if (!para.length) return;
      var text = inline(para.join(' '));
      para = [];
      if (afterTitle) { out('<p class="fs-lead-p">' + text + '</p>'); afterTitle = false; }
      else if (nest.length) out('<p>' + text + '</p>');
      else run.push('<p>' + text + '</p>');
    }
    function flushList() {
      if (!list) return;
      out('<' + list.tag + ' class="fs-list">' + list.items.map(function (i) { return '<li>' + inline(i) + '</li>'; }).join('') + '</' + list.tag + '>');
      list = null;
      afterTitle = false;
    }
    function flushQuote() { if (quote.length) { out('<blockquote class="fs-quote">' + blocks(quote) + '</blockquote>'); quote = []; afterTitle = false; } }
    function flush() { flushPara(); flushList(); flushQuote(); }
    function closeCard() { if (inCard) { html += '</div>'; inCard = false; } }

    lines.forEach(function (line) {
      var m;
      var mk = line.match(/^\u0000(cards|cards-2|callout|center|features|steps|buttons|bar)$/);
      if (mk) {
        flush();
        out('<div class="' + (mk[1] === 'cards-2' ? 'fs-cards fs-cards--2' : 'fs-' + mk[1]) + '">');
        nest.push(mk[1]);
        afterTitle = false;
        return;
      }
      if (/^\u0000\/(cards|cards-2|callout|center|features|steps|buttons|bar)$/.test(line)) {
        flush();
        if (/^\u0000\/cards/.test(line)) closeCard();
        out('</div>');
        nest.pop();
        return;
      }
      if (/^>/.test(line)) { flushPara(); flushList(); quote.push(line.replace(/^>\s?/, '')); return; }
      flushQuote();
      if ((m = line.match(/^(#{2,3})\s+(.+)$/))) {
        flush();
        if (/^cards/.test(nest[nest.length - 1] || '') && m[1] === '###') {
          closeCard();
          out('<div class="fs-card"><h3 class="fs-card__title">' + inline(m[2]) + '</h3>');
          inCard = true;
          afterTitle = false;
        } else if (m[1] === '##') {
          out('<h2 class="fs-title">' + inline(m[2]) + '</h2>');
          afterTitle = !nest.length;
        } else {
          out('<h3 class="fs-h3">' + inline(m[2]) + '</h3>');
          afterTitle = false;
        }
        return;
      }
      if ((m = line.match(/^\s*[-*]\s+(.+)$/))) { flushPara(); if (!list || list.tag !== 'ul') { flushList(); list = { tag: 'ul', items: [] }; } list.items.push(m[1]); return; }
      if ((m = line.match(/^\s*\d+[.)]\s+(.+)$/))) { flushPara(); if (!list || list.tag !== 'ol') { flushList(); list = { tag: 'ol', items: [] }; } list.items.push(m[1]); return; }
      if (!line.trim()) { flushPara(); flushList(); return; }
      flushList();
      para.push(line.trim());
    });
    flush();
    flushRun();
    closeCard();
    while (nest.length) { html += '</div>'; nest.pop(); }
    return html;
  }

  function md(src, aud) { return '<div class="fs-md">' + blocks(fences(src || '', aud)) + '</div>'; }

  // ------------------------------------------------------------ бот и ref

  function getRef() {
    var ref = null;
    try {
      var m = location.search.match(/[?&]ref=([^&#]*)/);
      if (m) ref = decodeURIComponent(m[1]).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 50) || null;
    } catch (e) { /* битый параметр – игнорируем */ }
    try {
      if (ref) localStorage.setItem('fs_ref', ref);
      else ref = localStorage.getItem('fs_ref');
    } catch (e) { /* хранилище недоступно */ }
    return ref;
  }

  // t.me/<бот>?start=e_fest  или  e_fest__s_<ref> (формат бота sun-reg-bot)
  function botLink(ev, tag) {
    if (!ev.bot || !ev.bot.telegram) return null;
    var start = ev.bot.start || '';
    var source = [tag, getRef()].filter(Boolean).join('-');
    if (source && start) start = (start + '__s_' + source).slice(0, 64);
    return ev.bot.telegram + (start ? '?start=' + encodeURIComponent(start) : '');
  }

  function isFormLink(h) {
    return !!h && (/^#popup:myform/.test(h) || /vk\.com\/app6013442/.test(h) || /(^|\/\/)(api\.)?wa\.me\//.test(h));
  }

  var reflinkUrl = null;
  function rewriteLinks() {
    if (!reflinkUrl) return;
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!isFormLink(a.getAttribute('href'))) continue;
      a.setAttribute('href', reflinkUrl);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      a.setAttribute('data-fs-ref', '1');
    }
  }
  function startReflinks(url) {
    var first = !reflinkUrl;
    reflinkUrl = url;
    rewriteLinks();
    if (!first) return;
    // Тильда дорисовывает блоки позже – следим за страницей
    var timer = null;
    if (window.MutationObserver) {
      new MutationObserver(function () {
        clearTimeout(timer);
        timer = setTimeout(rewriteLinks, 100);
      }).observe(document.body, { childList: true, subtree: true });
    }
    // Подстраховка: если ссылку не успели заменить, перехватываем клик
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || !isFormLink(a.getAttribute('href'))) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      var w = window.open(reflinkUrl, '_blank');
      if (w) { try { w.opener = null; } catch (err) { /* ок */ } } else { location.href = reflinkUrl; }
    }, true);
  }

  // ------------------------------------------------------------ блоки

  var BLOCKS = {};

  var DEFAULT_VARIANT = { masters: 'dark', alumni: 'dark', hero: 'dark' };

  // data-fs-link у кнопок: bot / bot:master → ссылка на бота события, остальное как есть
  function resolveLinks(el, ev) {
    [].forEach.call(el.querySelectorAll('[data-fs-link]'), function (a) {
      var t = a.getAttribute('data-fs-link');
      var m = t.match(/^bot(?::([\w-]+))?$/);
      var url = m ? botLink(ev, m[1]) : t;
      if (!url) return;
      a.setAttribute('href', url);
      if (/^https?:/.test(url)) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
    });
  }

  // Первый экран: event.json → hero
  BLOCKS.hero = function (c) {
    var h = c.ev.hero;
    if (!h) throw new Error('нет hero в event.json');
    var bg = h.image ? ' style="--fs-hero-img:url(\'' + esc(asset(c.ev._dir, h.image)) + '\')"' : '';
    var dates = (h.dates || []).map(function (d) { return '<li>' + inline(d) + '</li>'; }).join('');
    var btns = (h.buttons || []).map(function (b) {
      return '<a class="fs-btn" href="#" data-fs-link="' + esc(b.link || 'bot') + '">' + esc(b.text) + '</a>';
    }).join('');
    return '<section class="fs-section fs-hero' + (h.image ? ' fs-hero--img' : '') + '"' + bg + '><div class="fs-inner fs-hero__inner">' +
      (h.eyebrow ? '<p class="fs-hero__eyebrow">' + inline(h.eyebrow) + '</p>' : '') +
      '<h1 class="fs-hero__title">' + (h.kicker ? '<span class="fs-hero__kicker">' + inline(h.kicker) + '</span> ' : '') +
        '<span class="fs-hero__main">' + inline(h.title) + '</span></h1>' +
      (h.lead ? '<p class="fs-hero__lead">' + inline(h.lead) + '</p>' : '') +
      (dates ? '<ul class="fs-hero__dates">' + dates + '</ul>' : '') +
      (btns ? '<div class="fs-buttons fs-hero__btns">' + btns + '</div>' : '') +
    '</div></section>';
  };


  BLOCKS.text = function (c) {
    var name = (c.el.getAttribute('data-name') || 'about').replace(/[^a-z0-9_-]/gi, '');
    return loadContent(c.ev, 'content/' + name + '.md').then(function (src) {
      var meta = frontMatter(src);
      var html = md(meta.body, c.aud);
      if (html === '<div class="fs-md"></div>') {
        // Весь текст – для другой аудитории: блок просто не показываем
        return { html: '', after: function (el) { el.style.display = 'none'; } };
      }
      if (meta.layout === 'split') return section(splitLayout(html), 'fs-text fs-text--split');
      if (meta.layout === 'plate') return section('<div class="fs-plate">' + html + '</div>', 'fs-text fs-text--plate');
      return section(html, 'fs-text');
    });
  };

  // Настройки в начале .md:  ---\nlayout: split\n---
  function frontMatter(src) {
    var m = (src || '').replace(/\r/g, '').match(/^---\n([\s\S]*?)\n---\n?/);
    var meta = { body: m ? src.replace(/\r/g, '').slice(m[0].length) : src || '' };
    if (m) m[1].split('\n').forEach(function (l) {
      var kv = l.match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/);
      if (kv) meta[kv[1]] = kv[2];
    });
    return meta;
  }

  // layout: split – слева заголовок и вводная фраза, справа остальной текст
  function splitLayout(html) {
    var box = document.createElement('div');
    box.innerHTML = html;
    var mdEl = box.firstChild;
    var head = mdEl.querySelector(':scope > .fs-title');
    var leadEl = mdEl.querySelector(':scope > .fs-lead-p');
    var left = '', right = '';
    [].forEach.call(mdEl.children, function (ch) {
      if (ch === head || ch === leadEl) return;
      right += ch.outerHTML;
    });
    left = (head ? head.outerHTML : '') + '<span class="fs-split__bar" aria-hidden="true"></span>' + (leadEl ? leadEl.outerHTML : '');
    return '<div class="fs-md fs-split"><div class="fs-split__left">' + left + '</div><div class="fs-split__right">' + right + '</div></div>';
  }

  function faqItems(src, aud) {
    if (!src) return [];
    var lines = fences(src, aud), items = [], cur = null;
    lines.forEach(function (l) {
      var m = l.match(/^##\s+(.+)$/);
      if (m) { cur = { q: m[1], a: [] }; items.push(cur); } else if (cur) cur.a.push(l);
    });
    return items;
  }

  BLOCKS.faq = function (c) {
    return Promise.all([
      opt(load(c.ev._dir + 'content/faq.md', 'text')),
      opt(load('shared/content/faq-common.md', 'text'))
    ]).then(function (r) {
      var items = faqItems(r[0], c.aud).concat(faqItems(r[1], c.aud));
      if (!items.length) throw new Error('нет вопросов');
      return section(
        title(c.el.getAttribute('data-title') || 'Вопросы и ответы') +
        '<div class="fs-faq">' + items.map(function (it) {
          return '<details class="fs-faq__item"><summary class="fs-faq__q">' + inline(it.q) + '</summary>' +
            '<div class="fs-faq__a"><div class="fs-md">' + blocks(it.a) + '</div></div></details>';
        }).join('') + '</div>', 'fs-faq-section');
    });
  };

  BLOCKS.prices = function (c) {
    var fee = c.ev.fee;
    if (!fee || !fee.waves) throw new Error('нет fee в event.json');
    var cur = fee.current_wave || 1;
    var labels = fee.labels || {};
    var auds = c.aud ? [c.aud] : ['partner', 'new'];
    var link = botLink(c.ev) || '#';

    var plans = auds.map(function (aud) {
      var rows = fee.waves.map(function (w, i) {
        var n = i + 1, price = w[aud];
        var state = n < cur ? ' is-past' : n === cur ? ' is-current' : '';
        var sum = price === 0
          ? '<span class="fs-sum fs-sum--gift">В подарок</span>'
          : '<span class="fs-sum">' + (price == null ? '–' : money(price)) + '</span>';
        return '<li class="fs-wave' + state + '"><span class="fs-wave__label">' + esc(w.label) +
          (n === cur ? ' <span class="fs-now">сейчас</span>' : '') + '</span>' + sum + '</li>';
      }).join('');
      var note = aud === 'new' && fee.new_note ? '<p class="fs-plan__note">' + inline(fee.new_note) + '</p>' : '';
      return '<div class="fs-plan' + (aud === 'partner' ? ' fs-plan--accent' : '') + '">' +
        '<h3 class="fs-plan__who">' + esc(labels[aud] || aud) + '</h3>' +
        '<ul class="fs-waves">' + rows + '</ul>' + note + '</div>';
    }).join('');

    return section(
      title(fee.title || 'Стоимость') + lead(fee.lead) +
      (fee.gift ? '<p class="fs-gift">' + inline(fee.gift) + '</p>' : '') +
      '<div class="fs-plans fs-plans--' + auds.length + '">' + plans + '</div>' +
      '<div class="fs-after">' +
        (fee.installment ? '<p class="fs-after__note">' + inline(fee.installment) + '</p>' : '') +
        '<a class="fs-btn" href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(fee.button || 'Участвую') + '</a>' +
      '</div>', 'fs-prices');
  };

  BLOCKS.specials = function (c) {
    var sp = c.ev.specials;
    if (!sp || !sp.items) throw new Error('нет specials в event.json');
    return load('shared/specials.json', 'json').then(function (all) {
      var byId = {};
      all.forEach(function (s) { byId[s.id] = s; });
      var cur = (c.ev.fee && c.ev.fee.current_wave) || 1;
      var waves = (c.ev.fee && c.ev.fee.waves) || [];
      var items = sp.items.map(function (it) {
        var id = typeof it === 'string' ? it : it.id;
        var base = byId[id] || { name: id };
        return { name: base.name, desc: base.desc, prices: (typeof it === 'object' && it.prices) || sp.prices || [] };
      });
      // "title": "" в event.json – без заголовка (если он уже есть на странице Тильды)
      var spTitle = c.el.getAttribute('data-title') || ('title' in sp ? sp.title : 'Спецпрограммы');
      var cols = items.reduce(function (n, it) { return Math.max(n, it.prices.length); }, 0);
      function waveName(i) { return (waves[i] && (waves[i].short || waves[i].label)) || (i + 1) + '-я волна'; }
      function cls(i) { return i + 1 < cur ? ' is-past' : i + 1 === cur ? ' is-current' : ''; }
      function cell(p) { return p == null ? '–' : money(p); }

      var head = '<tr><th scope="col">Программа</th>';
      for (var i = 0; i < cols; i++) head += '<th scope="col" class="fs-num' + cls(i) + '">' + esc(waveName(i)) + (i + 1 === cur ? '<span class="fs-now">сейчас</span>' : '') + '</th>';
      head += '</tr>';
      var body = items.map(function (it) {
        var r = '<tr><th scope="row"><span class="fs-sp__name">' + esc(it.name) + '</span>' + (it.desc ? '<span class="fs-sp__desc">' + inline(it.desc) + '</span>' : '') + '</th>';
        for (var j = 0; j < cols; j++) r += '<td class="fs-num' + cls(j) + '">' + cell(it.prices[j]) + '</td>';
        return r + '</tr>';
      }).join('');

      var mobile = items.map(function (it) {
        return '<div class="fs-sp-card"><div class="fs-sp__name">' + esc(it.name) + '</div>' +
          (it.desc ? '<div class="fs-sp__desc">' + inline(it.desc) + '</div>' : '') +
          '<ul class="fs-sp-card__prices">' + it.prices.map(function (p, k) {
            return '<li class="' + cls(k).trim() + '"><span>' + esc(waveName(k)) + '</span><b>' + cell(p) + '</b></li>';
          }).join('') + '</ul></div>';
      }).join('');

      return section(
        title(spTitle) + lead(sp.lead) +
        '<div class="fs-table-wrap fs-sp-table"><table class="fs-table">' + '<thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
        '<div class="fs-sp-cards">' + mobile + '</div>', 'fs-specials' + (spTitle ? '' : ' fs-notitle'));
    });
  };

  BLOCKS.rooms = function (c) {
    return load('shared/center.json', 'json').then(function (center) {
      var durs = c.ev.durations && c.ev.durations.length ? c.ev.durations : [7];
      var people = center.people || [1, 2, 3, 4];
      var rooms = center.rooms || [];

      function price(room, n, d) {
        if (room.fixed && room.fixed[d] && room.fixed[d][n] != null) return room.fixed[d][n];
        var day = room.per_day && room.per_day[n];
        return day == null ? null : day * d;
      }
      function tbody(d) {
        return rooms.map(function (r) {
          return '<tr><th scope="row"><span class="fs-room__name">' + esc(r.name) + '</span>' +
            (r.building ? '<span class="fs-room__bld">' + esc(r.building) + '</span>' : '') + '</th>' +
            people.map(function (n) { var p = price(r, n, d); return '<td class="fs-num">' + (p == null ? '–' : money(p)) + '</td>'; }).join('') + '</tr>';
        }).join('');
      }
      function cards(d) {
        return rooms.map(function (r) {
          return '<div class="fs-room-card"><span class="fs-room__name">' + esc(r.name) + '</span>' +
            (r.building ? '<span class="fs-room__bld">' + esc(r.building) + '</span>' : '') +
            '<ul class="fs-room-card__prices">' + people.map(function (n) {
              var p = price(r, n, d);
              return p == null ? '' : '<li><span>' + n + ' чел.</span><b>' + money(p) + '</b></li>';
            }).join('') + '</ul></div>';
        }).join('');
      }
      function dayWord(n) {
        var m10 = n % 10, m100 = n % 100;
        return m10 === 1 && m100 !== 11 ? 'день' : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? 'дня' : 'дней';
      }

      var tabs = durs.length > 1
        ? '<div class="fs-tabs" role="group" aria-label="Длительность">' + durs.map(function (d, i) {
            return '<button type="button" class="fs-tab" data-dur="' + d + '" aria-pressed="' + (i === 0) + '">' + d + ' ' + dayWord(d) + '</button>';
          }).join('') + '</div>'
        : '<p class="fs-tabs-single">' + durs[0] + ' ' + dayWord(durs[0]) + '</p>';

      var gallery = rooms.filter(function (r) { return r.photos && r.photos.length; }).map(function (r) {
        return '<div class="fs-room">' +
          '<div class="fs-gal" aria-label="Фото: ' + esc(r.name) + '">' +
            '<div class="fs-gal__track">' + r.photos.map(function (p, i) {
              return '<img src="' + esc(asset('shared/', p)) + '" alt="' + esc(r.name) + ', фото ' + (i + 1) + '" loading="lazy" decoding="async">';
            }).join('') + '</div>' +
            (r.photos.length > 1
              ? '<button type="button" class="fs-gal__btn fs-gal__btn--prev" aria-label="Предыдущее фото">‹</button>' +
                '<button type="button" class="fs-gal__btn fs-gal__btn--next" aria-label="Следующее фото">›</button>' +
                '<div class="fs-gal__dots">' + r.photos.map(function (_, i) { return '<span' + (i ? '' : ' class="is-on"') + '></span>'; }).join('') + '</div>'
              : '') +
          '</div>' +
          '<div class="fs-room__cap"><span class="fs-room__name">' + esc(r.name) + '</span>' +
          (r.building ? '<span class="fs-room__bld">' + esc(r.building) + '</span>' : '') + '</div></div>';
      }).join('');

      var html = section(
        title(c.el.getAttribute('data-title') || center.rooms_title || 'Проживание') + tabs +
        '<div class="fs-table-wrap"><table class="fs-table fs-rooms-table"><thead><tr><th scope="col">Номер</th>' +
        people.map(function (n) { return '<th scope="col" class="fs-num">' + n + ' чел.</th>'; }).join('') +
        '</tr></thead><tbody>' + tbody(durs[0]) + '</tbody></table></div>' +
        '<div class="fs-room-cards">' + cards(durs[0]) + '</div>' +
        (center.rooms_note ? '<p class="fs-note">' + inline(center.rooms_note) + '</p>' : '') +
        (gallery ? '<div class="fs-rooms">' + gallery + '</div>' : ''), 'fs-rooms-section');

      return { html: html, after: function (el) {
        el.addEventListener('click', function (e) {
          var t = e.target.closest('.fs-tab');
          if (!t) return;
          [].forEach.call(el.querySelectorAll('.fs-tab'), function (b) { b.setAttribute('aria-pressed', String(b === t)); });
          var d = +t.getAttribute('data-dur');
          el.querySelector('.fs-rooms-table tbody').innerHTML = tbody(d);
          el.querySelector('.fs-room-cards').innerHTML = cards(d);
        });
        [].forEach.call(el.querySelectorAll('.fs-gal'), initGallery);
      } };
    });
  };

  function initGallery(g) {
    var track = g.querySelector('.fs-gal__track');
    var dots = g.querySelectorAll('.fs-gal__dots span');
    function go(dir) { track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' }); }
    var prev = g.querySelector('.fs-gal__btn--prev'), next = g.querySelector('.fs-gal__btn--next');
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', function () {
      var i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      for (var k = 0; k < dots.length; k++) dots[k].className = k === i ? 'is-on' : '';
    }, { passive: true });
  }

  // ---- мастера

  function frameSVG() {
    var c = 200, s = '<circle class="fs-fr-ring" cx="200" cy="200" r="194"/><circle class="fs-fr-halo" cx="200" cy="200" r="150"/>';
    [0, 90, 180, 270].forEach(function (a) {
      var g = 'transform="rotate(' + a + ' 200 200)"';
      s += '<path class="fs-fr-fill" ' + g + ' d="M200 18 L232 50 L168 50 Z"/>';
      s += '<path class="fs-fr-line" ' + g + ' d="M76 108 V76 H108"/>';
      s += '<path class="fs-fr-fill" ' + g + ' d="M80 80 H100 L80 100 Z"/>';
    });
    [-112, -68, -22, 22, 68, 112, 158, 202].forEach(function (deg) {
      for (var i = -1; i <= 1; i++) {
        var a = (deg + i * 5) * Math.PI / 180, r1 = 152, r2 = 178 - Math.abs(i) * 6;
        s += '<line class="fs-fr-ray" x1="' + (c + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (c - r1 * Math.cos(a)).toFixed(1) +
          '" x2="' + (c + r2 * Math.sin(a)).toFixed(1) + '" y2="' + (c - r2 * Math.cos(a)).toFixed(1) + '"/>';
      }
    });
    return '<svg viewBox="0 0 400 400" aria-hidden="true">' + s + '</svg>';
  }

  function photo(m, cls) {
    if (!m.photo) {
      var ini = m.name.split(/\s+/).map(function (w) { return w.charAt(0); }).slice(0, 2).join('').toUpperCase();
      return '<div class="' + cls + ' fs-ph--empty">' + esc(ini) + '</div>';
    }
    var style = (m.pos ? 'object-position:' + m.pos + ';' : '') +
      (m.zoom ? 'transform:scale(' + (+m.zoom) + ');transform-origin:' + (m.pos || '50% 50%') + ';' : '');
    return '<div class="' + cls + '"><img src="' + esc(asset('shared/', m.photo)) + '" alt="' + esc(m.name) + '" decoding="async" style="' + esc(style) + '"></div>';
  }

  // «Заглушка: …» в данных мастера на сайт не выводим – пустое поле просто не показывается
  var STUB = /^\s*Заглушка/;
  function noStub(m) {
    var o = {};
    for (var k in m) o[k] = typeof m[k] === 'string' && STUB.test(m[k]) ? '' : m[k];
    return o;
  }

  function mastersFor(c, ids) {
    return load('shared/masters.json', 'json').then(function (all) {
      var byId = {};
      all.forEach(function (m) { byId[m.id] = m; });
      return (ids || []).map(function (e) {
        var id = typeof e === 'string' ? e : e.id;
        var audience = (typeof e === 'object' && e.audience) || 'all';
        if (audience !== 'all' && c.aud && audience !== c.aud) return null;
        return byId[id] ? noStub(byId[id]) : null;
      }).filter(Boolean);
    });
  }

  function openMaster(c, m) {
    var theme = c.el.getAttribute('data-fs-theme');
    var modal = document.createElement('div');
    modal.className = 'fs-root fs-theme-' + theme + ' fs-modal';
    modal.innerHTML =
      '<div class="fs-modal__bg" data-close></div>' +
      '<div class="fs-modal__box" role="dialog" aria-modal="true" aria-label="' + esc(m.name) + '">' +
        '<button type="button" class="fs-modal__x" aria-label="Закрыть" data-close>×</button>' +
        // Фото в окне целиком (contain), поля – размытая копия того же снимка: лица не обрезаются
        (m.photo ? '<div class="fs-modal__media"><img class="fs-modal__blur" src="' + esc(asset('shared/', m.photo_full || m.photo)) + '" alt="" aria-hidden="true">' +
          '<img class="fs-modal__photo" src="' + esc(asset('shared/', m.photo_full || m.photo)) + '" alt="' + esc(m.name) + '"></div>' : '') +
        '<div class="fs-modal__body"><h3 class="fs-modal__name">' + esc(m.name) + '</h3>' +
          (m.regalia ? '<p class="fs-modal__reg">' + esc(m.regalia) + '</p>' : '') +
          '<div class="fs-modal__text"><p class="fs-muted">Загружаем…</p></div></div>' +
      '</div>';
    document.body.appendChild(modal);
    var lastFocus = document.activeElement;
    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function close() {
      document.removeEventListener('keydown', onKey);
      modal.parentNode && modal.parentNode.removeChild(modal);
      document.body.style.overflow = prevOverflow;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    modal.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    modal.querySelector('.fs-modal__x').focus();

    // Общий текст мастера + дополнение события (events/<id>/content/masters/<мастер>.md), если есть
    Promise.all([
      load('shared/content/masters/' + m.id + '.md', 'text'),
      opt(load(c.ev._dir + 'content/masters/' + m.id + '.md', 'text'))
    ]).then(function (r) {
      // Имя уже в шапке окна – первый заголовок ## с именем не повторяем
      var src = r[0].replace(/^\s*##\s+.+\n/, '');
      if (STUB.test(src)) throw new Error('заглушка');
      if (r[1]) src += '\n\n' + r[1];
      modal.querySelector('.fs-modal__text').innerHTML = md(src, c.aud);
    }, function () {
      modal.querySelector('.fs-modal__text').innerHTML = m.short ? '<div class="fs-md"><p>' + inline(m.short) + '</p></div>' : '';
    });
  }

  function bindMasters(c, list) {
    return function (el) {
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-master]');
        if (b) openMaster(c, list[+b.getAttribute('data-master')]);
      });
      // Фото для окна грузим заранее, при наведении
      el.addEventListener('mouseover', function (e) {
        var b = e.target.closest('[data-master]');
        if (!b || b._warm) return;
        b._warm = 1;
        var m = list[+b.getAttribute('data-master')];
        if (m.photo_full) new Image().src = asset('shared/', m.photo_full);
      });
    };
  }

  BLOCKS.masters = function (c) {
    return mastersFor(c, c.ev.masters).then(function (list) {
      if (!list.length) throw new Error('нет мастеров');
      var mb = c.ev.masters_block || {};
      var frame = frameSVG();
      var cards = list.map(function (m, i) {
        return '<div class="fs-master">' +
          '<div class="fs-master__frame">' + frame + photo(m, 'fs-ph') + '</div>' +
          '<h3 class="fs-master__name">' + esc(m.name) + '</h3>' +
          (m.regalia ? '<p class="fs-master__reg">' + esc(m.regalia) + '</p>' : '') +
          (m.short ? '<p class="fs-master__short">' + inline(m.short) + '</p>' : '') +
          (m.short ? '<span class="fs-master__line"></span>' +
          '<button type="button" class="fs-master__more" data-master="' + i + '">Подробнее</button>' : '') + '</div>';
      }).join('');
      return {
        html: section(title(c.el.getAttribute('data-title') || mb.title || 'Мастера') + lead(mb.lead) +
          '<div class="fs-masters" style="--fs-cols:' + (list.length === 5 || list.length === 6 ? 3 : Math.min(list.length, 4)) + '">' + cards + '</div>', 'fs-masters-section'),
        after: bindMasters(c, list)
      };
    });
  };

  BLOCKS.alumni = function (c) {
    return mastersFor(c, c.ev.alumni).then(function (list) {
      if (!list.length) throw new Error('нет alumni в event.json');
      var items = list.map(function (m, i) {
        return '<li><button type="button" class="fs-alum" data-master="' + i + '">' + photo(m, 'fs-alum__ph') +
          '<span class="fs-alum__name">' + esc(m.name) + '</span></button></li>';
      }).join('');
      return {
        html: section(title(c.el.getAttribute('data-title') || 'У нас уже выступали') +
          '<ul class="fs-alumni">' + items + '</ul>', 'fs-alumni-section'),
        after: bindMasters(c, list)
      };
    });
  };

  BLOCKS.reflinks = function (c) {
    var url = botLink(c.ev);
    if (!url) throw new Error('нет bot в event.json');
    startReflinks(url);
    c.el.hidden = true;
    return '';
  };

  // ------------------------------------------------------------ рендер

  function fail(el, err) {
    el.style.display = 'none';
    el.innerHTML = '';
    if (window.console) console.warn('[fest-sun-blocks]', el.getAttribute('data-block'), err && err.message || err);
  }

  function render(el) {
    el.setAttribute('data-fs-done', '1');
    var type = el.getAttribute('data-block');
    var evId = el.getAttribute('data-event');
    if (!BLOCKS[type]) return fail(el, new Error('неизвестный блок ' + type));
    var ctx = { el: el, aud: el.getAttribute('data-audience') || null };

    loadEvent(evId).then(function (ev) {
      ctx.ev = ev;
      var theme = (ev.theme || evId).replace(/[^a-z0-9-]/gi, '');
      el.setAttribute('data-fs-theme', theme);
      return ensureTheme(theme).then(function () {
        el.classList.add('fs-root', 'fs-theme-' + theme, 'fs-b-' + type);
        var variant = el.getAttribute('data-variant') || DEFAULT_VARIANT[type];
        if (variant) el.classList.add('fs-variant-' + variant);
        return BLOCKS[type](ctx);
      });
    }).then(function (out) {
      if (type === 'reflinks') return;
      var res = typeof out === 'string' ? { html: out } : out;
      el.innerHTML = res.html;
      resolveLinks(el, ctx.ev);
      if (res.after) res.after(el);
    }).then(null, function (err) { fail(el, err); });
  }

  function scan() {
    injectCSS();
    var list = document.querySelectorAll('.fs-block:not([data-fs-done])');
    for (var i = 0; i < list.length; i++) render(list[i]);
  }

  // ------------------------------------------------------------ стили
  // Только через переменные --fs-*; значения задаёт тема (themes/<theme>.css)

  function injectCSS() {
    if (document.getElementById('fs-style')) return;
    var css = [
      ':where(.fs-root){--fs-bg:Canvas;--fs-bg-soft:Canvas;--fs-fg:CanvasText;--fs-title:CanvasText;--fs-muted:GrayText;--fs-line:GrayText;',
      '--fs-dark-bg:CanvasText;--fs-dark-fg:Canvas;--fs-dark-title:Canvas;--fs-dark-muted:GrayText;--fs-dark-line:GrayText;--fs-dark-card-bg:CanvasText;',
      '--fs-card-bg:CanvasText;--fs-card-fg:Canvas;--fs-card-title:Canvas;--fs-card-line:GrayText;--fs-accent:CanvasText;--fs-gold:Highlight;--fs-highlight:Highlight;--fs-highlight-fg:HighlightText;',
      '--fs-ray:Highlight;--fs-ring:GrayText;--fs-past:GrayText;--fs-btn-bg:CanvasText;--fs-btn-fg:Canvas;--fs-btn-bg-hover:CanvasText;--fs-btn-border:0;--fs-btn-font:inherit;--fs-btn-weight:600;--fs-btn-size:15px;--fs-btn-case:uppercase;--fs-btn-spacing:.06em;--fs-btn-pad:16px 40px;--fs-btn-shadow:none;',
      '--fs-radius:0px;--fs-btn-radius:6px;--fs-shadow:none;--fs-font-head:inherit;--fs-font-body:inherit;--fs-head-weight:700;--fs-title-size:clamp(26px,3vw,32px);--fs-width:1100px;--fs-pad-y:80px;--fs-pad-y-mobile:56px}',

      '.fs-root.fs-variant-dark{--fs-bg:var(--fs-dark-bg);--fs-fg:var(--fs-dark-fg);--fs-title:var(--fs-dark-title);--fs-muted:var(--fs-dark-muted);--fs-line:var(--fs-dark-line);--fs-card-bg:var(--fs-dark-card-bg);--fs-past:var(--fs-dark-muted)}',
      '.fs-root.fs-variant-soft{--fs-bg:var(--fs-bg-soft)}',
      '.fs-root,.fs-root *,.fs-root *::before,.fs-root *::after{box-sizing:border-box}',
      '.fs-root{display:block;max-width:100%;overflow-x:hidden}',
      '.fs-block[id]{scroll-margin-top:var(--fs-anchor-offset,80px)}',
      '.fs-section{background:var(--fs-bg);color:var(--fs-fg);font-family:var(--fs-font-body);padding:var(--fs-pad-y) 16px;-webkit-text-size-adjust:100%}',
      '.fs-inner{max-width:var(--fs-width);margin:0 auto}',
      '.fs-section.fs-notitle{padding-top:16px}',
      '.fs-title{font-family:var(--fs-font-head);font-weight:var(--fs-head-weight);font-size:var(--fs-title-size);line-height:1.15;text-transform:uppercase;text-align:center;color:var(--fs-title);margin:0 0 20px;text-wrap:balance;overflow-wrap:break-word}',
      '.fs-lead{max-width:720px;margin:0 auto 40px;text-align:center;font-size:17px;line-height:1.6}',
      '.fs-lead p{margin:0 0 8px}.fs-lead strong{font-weight:600}',
      '.fs-muted,.fs-note{color:var(--fs-muted)}',
      '.fs-note{text-align:center;font-size:15px;line-height:1.5;margin:18px auto 0;max-width:720px}',

      /* markdown */
      '.fs-md{font-size:17px;line-height:1.65}',
      '.fs-md>p,.fs-md>.fs-list,.fs-md>.fs-h3,.fs-md>.fs-quote{max-width:760px;margin-left:auto;margin-right:auto}',
      '.fs-md p{margin-top:0;margin-bottom:16px}',
      '.fs-md .fs-lead-p{font-size:20px;line-height:1.65;text-align:center;max-width:820px;margin:0 auto 30px}',
      '.fs-md>.fs-cols{max-width:980px;margin:0 auto}',
      '.fs-text .fs-cols{column-count:2;column-gap:56px}',
      '.fs-cols p{break-inside:avoid}',
      '.fs-callout{position:relative;max-width:860px;margin:30px auto 8px;padding:30px 36px;background:var(--fs-card-bg);color:var(--fs-card-fg);border-radius:var(--fs-radius);box-shadow:var(--fs-shadow);font-size:17px}',
      '.fs-callout::before,.fs-callout::after{content:"";position:absolute;width:24px;height:24px;border:0 solid var(--fs-highlight)}',
      '.fs-callout::before{top:0;left:0;border-top-width:3px;border-left-width:3px}',
      '.fs-callout::after{bottom:0;right:0;border-bottom-width:3px;border-right-width:3px}',
      '.fs-callout>:last-child{margin-bottom:0}',
      '.fs-callout .fs-h3,.fs-callout .fs-title{color:var(--fs-card-title);margin-top:0}',
      '.fs-center{text-align:center;max-width:760px;margin:0 auto}',
      '.fs-cards.fs-cards--2{grid-template-columns:repeat(2,minmax(0,1fr))}','.fs-md a.fs-btn{text-decoration:none}','.fs-features+.fs-center,.fs-steps+.fs-center{margin-top:26px}',
      '.fs-buttons{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:18px;margin:30px auto 6px}',
      '.fs-buttons p{display:contents}',
      '.fs-buttons .fs-btn~.fs-btn{background:transparent;color:inherit;border-color:var(--fs-btn-bg);box-shadow:none}',
      '.fs-buttons .fs-btn~.fs-btn:hover{background:var(--fs-btn-bg);color:var(--fs-btn-fg)}',
      '.fs-hero{position:relative;background:var(--fs-hero-bg,var(--fs-bg));padding-top:calc(var(--fs-pad-y) + 70px);padding-bottom:calc(var(--fs-pad-y) + 30px);text-align:center;overflow:hidden}',
      '.fs-hero--img{background:linear-gradient(var(--fs-hero-overlay,rgba(0,0,0,.45)),var(--fs-hero-overlay,rgba(0,0,0,.45))),var(--fs-hero-img) center/cover no-repeat}',
      '.fs-hero__inner{position:relative;max-width:900px}',
      '.fs-hero__eyebrow{margin:0 auto 26px;max-width:760px;font-size:13px;font-weight:600;letter-spacing:.16em;line-height:1.6;text-transform:uppercase;color:var(--fs-gold)}',
      '.fs-hero__title{margin:0;font-family:var(--fs-font-head);font-weight:var(--fs-head-weight);color:var(--fs-title);text-wrap:balance}',
      '.fs-hero__kicker{display:block;font-size:var(--fs-hero-kicker-size,clamp(20px,2.4vw,26px));line-height:1.3;color:var(--fs-hero-kicker-color,var(--fs-gold));margin-bottom:14px;text-transform:uppercase;letter-spacing:.04em}',
      '.fs-hero__main{display:block;font-size:var(--fs-hero-main-size,clamp(32px,4.6vw,54px));line-height:1.15}',
      '.fs-hero__lead{max-width:760px;margin:26px auto 0;font-size:18px;line-height:1.65;opacity:.92}',
      '.fs-hero__dates{list-style:none;display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:34px 0 0;padding:0}',
      '.fs-hero__dates li{padding:9px 18px;border:1px solid var(--fs-line);border-radius:40px;font-size:15px;font-weight:500;white-space:nowrap}',
      '.fs-hero__btns{margin-top:38px}',
      '.fs-bar{max-width:980px;margin:0 auto;padding:0 0 26px;border-bottom:1px solid var(--fs-gold);text-align:center}',
      '.fs-bar .fs-title{text-transform:none;font-size:clamp(24px,2.8vw,32px);margin:0 0 16px}',
      '.fs-bar>.fs-list{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:8px 0;max-width:none;margin:0}',
      '.fs-bar>.fs-list>li{margin:0;padding:0;font-size:14px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;line-height:1.4}',
      '.fs-bar>.fs-list>li::before{display:none}',
      '.fs-bar>.fs-list>li+li::before{content:"";display:inline-block;position:static;width:6px;height:6px;margin:0 16px;border:0;border-radius:50%;background:var(--fs-gold);vertical-align:middle;transform:translateY(-1px)}',
      '.fs-section.fs-text:has(>.fs-inner>.fs-md>.fs-bar:only-child){padding-top:40px;padding-bottom:40px}',
      '.fs-plate{position:relative;background:var(--fs-bg-soft);border-radius:var(--fs-radius);box-shadow:var(--fs-shadow);padding:60px 56px 52px}',
      '.fs-plate::before,.fs-plate::after{content:"";position:absolute;width:30px;height:30px;border:0 solid var(--fs-highlight)}',
      '.fs-plate::before{top:0;left:0;border-top-width:3px;border-left-width:3px}',
      '.fs-plate::after{bottom:0;right:0;border-bottom-width:3px;border-right-width:3px}',
      '.fs-plate .fs-h3{text-align:center;margin-top:44px;margin-bottom:22px}',
      '.fs-features>.fs-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;max-width:none;margin:0}',
      '.fs-features>.fs-list>li{margin:0;padding:24px 26px;background:var(--fs-bg);border:1px solid var(--fs-line);border-top:3px solid var(--fs-highlight);border-radius:var(--fs-radius);font-size:16px;line-height:1.6}',
      '.fs-features>.fs-list>li::before{display:none}',
      '.fs-features>.fs-list>li:last-child:nth-child(odd){grid-column:1/-1}',
      '.fs-features>.fs-list>li>strong:first-child{display:block;font-family:var(--fs-font-head);font-weight:var(--fs-head-weight);font-size:var(--fs-feature-title-size,21px);line-height:1.3;letter-spacing:var(--fs-feature-title-spacing,0);text-transform:var(--fs-feature-title-case,none);color:var(--fs-title);margin-bottom:8px}',
      '.fs-steps>ol.fs-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px;max-width:none;margin:0;counter-reset:fs}',
      '.fs-steps>ol.fs-list>li{margin:0;padding:64px 0 0;font-size:16px;line-height:1.6;position:relative}',
      '.fs-steps>ol.fs-list>li::before{content:counter(fs);top:0;left:0;width:46px;height:46px;border-radius:50%;background:var(--fs-card-bg);color:var(--fs-highlight);display:flex;align-items:center;justify-content:center;font-family:var(--fs-font-head);font-size:22px;font-weight:700}',
      '.fs-steps>ol.fs-list>li::after{content:"";position:absolute;top:23px;left:58px;right:-16px;height:1px;background:var(--fs-line)}',
      '.fs-steps>ol.fs-list>li:last-child::after{display:none}',
      '.fs-plate .fs-center{margin-top:40px}',
      '.fs-split{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:56px;align-items:start;max-width:var(--fs-width);margin:0 auto}',
      '.fs-split__left{position:sticky;top:24px}',
      '.fs-split .fs-title{text-align:left;margin-bottom:22px}',
      '.fs-split__bar{display:block;width:64px;height:3px;background:var(--fs-highlight);margin:0 0 24px}',
      '.fs-split .fs-lead-p{font-family:var(--fs-font-head);font-size:clamp(21px,2.2vw,25px);line-height:1.5;color:var(--fs-title);text-align:left;max-width:none;margin:0}',
      '.fs-split__right{padding-top:8px;font-size:17px;line-height:1.75}',
      '.fs-split__right>*{max-width:none!important;margin-left:0!important;margin-right:0!important}',
      '.fs-split .fs-cols{column-count:1!important}',
      '.fs-split .fs-callout{background:none;color:inherit;box-shadow:none;border-radius:0;padding:22px 0 0;margin-top:26px;border-top:1px solid var(--fs-line);font-size:16px;line-height:1.65}',
      '.fs-split .fs-callout::before,.fs-split .fs-callout::after{display:none}',
      '.fs-split .fs-callout .fs-h3{font-size:20px;color:var(--fs-title);margin:0 0 8px}',
      '.fs-md strong{font-weight:600}.fs-md a{color:inherit;text-decoration:underline;text-underline-offset:3px}',
      '.fs-h3{font-family:var(--fs-font-head);font-weight:var(--fs-head-weight);font-size:clamp(20px,2.2vw,24px);line-height:1.25;color:var(--fs-title);margin:32px auto 12px}',
      '.fs-list{list-style:none;padding:0;margin:0 0 18px}',
      '.fs-list li{position:relative;padding:0 0 0 24px;margin:0 0 10px}',
      'ul.fs-list>li::before{content:"";position:absolute;left:0;top:.55em;border:5px solid transparent;border-left:8px solid var(--fs-gold)}',
      'ol.fs-list{counter-reset:fs}ol.fs-list>li{counter-increment:fs}ol.fs-list>li::before{content:counter(fs) ".";position:absolute;left:0;font-weight:600;color:var(--fs-title)}',
      '.fs-quote{margin:28px auto;padding:4px 0 4px 22px;border-left:3px solid var(--fs-gold);font-size:18px}',
      '.fs-quote p:last-child{margin-bottom:0}',
      '.fs-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:20px;margin:28px 0}',
      '.fs-cards:has(>.fs-card:nth-child(3):last-child){grid-template-columns:repeat(3,minmax(0,1fr))}',
      '.fs-card{position:relative;min-width:0;background:var(--fs-card-bg);color:var(--fs-card-fg);border-radius:var(--fs-radius);box-shadow:var(--fs-shadow);padding:34px 26px 20px}',
      '.fs-card::before{content:"";position:absolute;top:0;left:26px;border:9px solid transparent;border-top:12px solid var(--fs-gold)}',
      '.fs-card__title{font-family:var(--fs-font-head);font-weight:var(--fs-head-weight);font-size:24px;line-height:1.2;color:var(--fs-card-title);margin:0 0 12px}',
      '.fs-card .fs-list li{padding:12px 0;margin:0;border-top:1px solid var(--fs-card-line);font-size:16px;line-height:1.45}',
      '.fs-card .fs-list li::before{display:none}.fs-card p{font-size:15px}',

      /* кнопка */
      '.fs-btn{display:inline-block;background:var(--fs-btn-bg);color:var(--fs-btn-fg);border:var(--fs-btn-border);border-radius:var(--fs-btn-radius);padding:var(--fs-btn-pad);font-family:var(--fs-btn-font);font-size:var(--fs-btn-size);font-weight:var(--fs-btn-weight);line-height:1.2;letter-spacing:var(--fs-btn-spacing);text-transform:var(--fs-btn-case);text-decoration:none;box-shadow:var(--fs-btn-shadow);transition:background .2s,transform .2s,box-shadow .2s}',
      '.fs-btn:hover{background:var(--fs-btn-bg-hover);transform:translateY(-1px)}',
      '.fs-root :focus-visible{outline:2px solid var(--fs-gold);outline-offset:3px}',

      /* стоимость */
      '.fs-gift{display:table;margin:0 auto 28px;padding:12px 24px;border-radius:var(--fs-btn-radius);background:var(--fs-highlight);color:var(--fs-highlight-fg);font-weight:600;text-align:center;line-height:1.4}',
      '.fs-plans{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}',
      '.fs-plans--1{grid-template-columns:minmax(0,1fr);max-width:540px;margin:0 auto}',
      '.fs-plan{position:relative;min-width:0;padding:36px 32px 26px;border:1.5px solid var(--fs-accent);border-radius:var(--fs-radius);box-shadow:var(--fs-shadow);background:var(--fs-bg)}',
      '.fs-plan--accent{background:var(--fs-card-bg);color:var(--fs-card-fg);border-color:var(--fs-card-bg)}',
      '.fs-plan__who{font-family:var(--fs-font-head);font-weight:var(--fs-head-weight);font-size:24px;line-height:1.2;color:var(--fs-title);margin:0 0 18px}',
      '.fs-plan--accent .fs-plan__who{color:var(--fs-card-title)}',
      '.fs-waves{list-style:none;margin:0;padding:0}',
      '.fs-wave{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 0;border-top:1px solid var(--fs-line)}',
      '.fs-plan--accent .fs-wave{border-top-color:var(--fs-card-line)}',
      '.fs-wave__label{font-size:16px;font-weight:500;line-height:1.35;min-width:0}',
      '.fs-sum{font-family:var(--fs-font-head);font-weight:var(--fs-head-weight);font-size:28px;line-height:1;white-space:nowrap;font-variant-numeric:tabular-nums}',
      '.fs-sum--gift{color:var(--fs-title)}.fs-plan--accent .fs-sum--gift{color:var(--fs-highlight)}',
      '.fs-wave.is-past .fs-sum,.fs-wave.is-past .fs-wave__label{text-decoration:line-through;opacity:.5}',
      '.fs-now{display:inline-block;vertical-align:middle;margin-left:8px;padding:3px 9px;border-radius:20px;background:var(--fs-highlight);color:var(--fs-highlight-fg);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;line-height:1.3}',
      '.fs-wave.is-current .fs-wave__label{font-weight:600}',
      '.fs-plan__note{margin:16px 0 0;font-size:14px;line-height:1.45;opacity:.75}',
      '.fs-after{text-align:center;margin-top:34px}',
      '.fs-after__note{margin:0 0 20px;font-size:16px;line-height:1.5}',

      /* таблицы */
      '.fs-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}',
      '.fs-table{width:100%;border-collapse:collapse;font-size:16px;line-height:1.4}',
      '.fs-table th,.fs-table td{padding:14px 12px;border-bottom:1px solid var(--fs-line);text-align:left;vertical-align:middle}',
      '.fs-table thead th{font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--fs-muted)}',
      '.fs-table .fs-num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}',
      '.fs-table td.is-current,.fs-table th.is-current{background:var(--fs-bg-soft);font-weight:600}',
      '.fs-table td.is-past{color:var(--fs-past);text-decoration:line-through}',
      '.fs-table thead th.is-current{color:var(--fs-title)}',
      '.fs-table .fs-now{margin:4px 0 0 8px}',
      '.fs-sp__name,.fs-room__name{display:block;font-weight:600}',
      '.fs-sp__desc,.fs-room__bld{display:block;font-size:14px;font-weight:400;color:var(--fs-muted);margin-top:2px}',
      '.fs-sp-cards{display:none}',
      '.fs-sp-card{padding:18px 0;border-bottom:1px solid var(--fs-line)}',
      '.fs-sp-card__prices{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 0;padding:0}',
      '.fs-sp-card__prices li{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:2px;padding:8px 10px;border:1px solid var(--fs-line);border-radius:var(--fs-radius);font-size:12px;color:var(--fs-muted)}',
      '.fs-sp-card__prices b{font-size:15px;white-space:nowrap;color:var(--fs-fg);font-variant-numeric:tabular-nums}',
      '.fs-sp-card__prices li.is-current{border-color:var(--fs-highlight);background:var(--fs-bg-soft)}',
      '.fs-sp-card__prices li.is-past b{text-decoration:line-through;color:var(--fs-past)}',

      /* проживание */
      '.fs-tabs{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin:0 0 26px}',
      '.fs-tab{font:inherit;font-size:15px;font-weight:500;padding:10px 22px;border:1.5px solid var(--fs-accent);border-radius:var(--fs-btn-radius);background:transparent;color:var(--fs-fg);cursor:pointer}',
      '.fs-tab[aria-pressed="true"]{background:var(--fs-card-bg);border-color:var(--fs-card-bg);color:var(--fs-card-fg)}',
      '.fs-tabs-single{text-align:center;margin:0 0 22px;color:var(--fs-muted)}',
      '.fs-rooms-table th[scope=row]{min-width:140px}',
      '.fs-room-cards{display:none}',
      '.fs-room-card{padding:16px 0;border-bottom:1px solid var(--fs-line)}',
      '.fs-room-card__prices{list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:12px 0 0;padding:0}',
      '.fs-room-card__prices li{display:flex;flex-direction:column;gap:2px;padding:8px 10px;border:1px solid var(--fs-line);border-radius:var(--fs-radius);font-size:12px;color:var(--fs-muted)}',
      '.fs-room-card__prices b{font-size:16px;color:var(--fs-fg);font-variant-numeric:tabular-nums}',
      '.fs-rooms{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:24px;margin-top:44px}',
      '.fs-room{min-width:0}',
      '.fs-gal{position:relative;aspect-ratio:4/3;max-width:100%;overflow:hidden;border-radius:var(--fs-radius);background:var(--fs-bg-soft)}',
      '.fs-gal__track{display:flex;height:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch}',
      '.fs-gal__track::-webkit-scrollbar{display:none}',
      '.fs-gal__track img{flex:0 0 100%;width:100%;height:100%;object-fit:cover;scroll-snap-align:start;display:block}',
      '.fs-gal__btn{position:absolute;top:50%;transform:translateY(-50%);width:38px;height:38px;border:0;border-radius:50%;background:var(--fs-bg);color:var(--fs-fg);font-size:24px;line-height:1;cursor:pointer;opacity:.85}',
      '.fs-gal__btn--prev{left:10px}.fs-gal__btn--next{right:10px}',
      '.fs-gal__dots{position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;gap:6px;pointer-events:none}',
      '.fs-gal__dots span{width:7px;height:7px;border-radius:50%;background:var(--fs-bg);opacity:.5}',
      '.fs-gal__dots span.is-on{opacity:1}',
      '.fs-room__cap{padding:12px 2px 0}',

      /* мастера */
      // flex, а не grid: неполный последний ряд встаёт по центру
      '.fs-masters{--fs-gx:40px;display:flex;flex-wrap:wrap;justify-content:center;gap:50px var(--fs-gx);max-width:calc(var(--fs-cols,4) * 290px);margin:44px auto 0}',
      '.fs-master{display:flex;flex-direction:column;min-width:0;flex:0 0 calc((100% - (var(--fs-cols,4) - 1) * var(--fs-gx)) / var(--fs-cols,4))}',
      '.fs-master__frame{position:relative;width:100%;max-width:340px;aspect-ratio:1;margin:0 auto}',
      '.fs-master__frame svg{position:absolute;inset:0;width:100%;height:100%}',
      '.fs-fr-ring{fill:none;stroke:var(--fs-ring);stroke-width:1.5}',
      '.fs-fr-halo{fill:none;stroke:var(--fs-line);stroke-width:30;opacity:.5}',
      '.fs-fr-fill{fill:var(--fs-gold)}.fs-fr-line{fill:none;stroke:var(--fs-gold);stroke-width:2}',
      '.fs-fr-ray{stroke:var(--fs-ray);stroke-width:1.6;stroke-linecap:round}',
      '.fs-ph,.fs-alum__ph{position:absolute;left:50%;top:50%;width:64%;height:64%;transform:translate(-50%,-50%);border-radius:50%;overflow:hidden}',
      '.fs-ph img,.fs-alum__ph img{display:block;width:100%;height:100%;object-fit:cover}',
      '.fs-ph--empty{display:flex;align-items:center;justify-content:center;background:var(--fs-card-bg);color:var(--fs-gold);font-family:var(--fs-font-head);font-size:44px}',
      '.fs-master__name{font-family:var(--fs-font-head);font-weight:var(--fs-head-weight);font-size:24px;line-height:1.25;color:var(--fs-title);margin:26px 0 0}',
      '.fs-master__reg{font-size:14px;line-height:1.45;color:var(--fs-muted);margin:6px 0 0}',
      '.fs-master__short{font-size:15px;line-height:1.5;margin:12px 0 0}',
      '.fs-master__line{display:block;width:56px;height:1px;background:var(--fs-fg);opacity:.5;margin:18px 0 14px}',
      '.fs-master__more{align-self:flex-start;background:none;border:0;padding:0;font:inherit;font-size:16px;letter-spacing:.06em;color:var(--fs-fg);opacity:.85;cursor:pointer;transition:color .2s}',
      '.fs-master__more:hover{color:var(--fs-gold);opacity:1}',
      '.fs-alumni{list-style:none;display:flex;gap:28px;overflow-x:auto;scroll-snap-type:x proximity;justify-content:safe center;margin:36px 0 0;padding:0 0 8px;scrollbar-width:thin}',
      '.fs-alumni li{flex:0 0 auto;scroll-snap-align:start}',
      '.fs-alum{display:flex;flex-direction:column;align-items:center;gap:12px;width:140px;background:none;border:0;padding:0;font:inherit;color:var(--fs-fg);cursor:pointer}',
      '.fs-alum__ph{position:relative;left:auto;top:auto;transform:none;width:120px;height:120px;border:2px solid var(--fs-gold)}',
      '.fs-alum__ph.fs-ph--empty{font-size:30px}',
      '.fs-alum__name{font-size:15px;line-height:1.35;text-align:center}',

      /* окно мастера */
      '.fs-modal{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;font-family:var(--fs-font-body);overflow:hidden}',
      '.fs-modal__bg{position:absolute;inset:0;background:var(--fs-dark-bg);opacity:.85}',
      '.fs-modal__box{position:relative;width:100%;max-width:820px;max-height:92vh;overflow:auto;background:var(--fs-bg);color:var(--fs-fg);border-radius:var(--fs-radius);box-shadow:var(--fs-shadow)}',
      '.fs-modal__x{position:sticky;top:12px;float:right;margin:12px 12px -56px 0;z-index:2;width:44px;height:44px;border:0;border-radius:50%;background:var(--fs-bg);color:var(--fs-fg);font-size:28px;line-height:44px;cursor:pointer}',
      '.fs-modal__media{position:relative;height:460px;overflow:hidden;background:var(--fs-dark-bg)}',
      '.fs-modal__blur{position:absolute;inset:-40px;width:calc(100% + 80px);height:calc(100% + 80px);object-fit:cover;filter:blur(28px);opacity:.75}',
      '.fs-modal__photo{position:relative;display:block;width:100%;height:100%;object-fit:contain}',
      '.fs-modal__body{padding:48px 56px 52px}',
      '.fs-modal__name{font-family:var(--fs-font-head);font-weight:var(--fs-head-weight);font-size:36px;line-height:1.2;text-align:center;color:var(--fs-title);margin:0}',
      '.fs-modal__reg{text-align:center;color:var(--fs-muted);margin:8px 0 0;font-size:15px}',
      '.fs-modal__text{margin-top:28px}',
      '.fs-modal .fs-md{font-size:17px}.fs-modal .fs-md .fs-title{font-size:26px;text-transform:none;margin-top:28px}',

      /* вопросы */
      '.fs-faq{max-width:820px;margin:36px auto 0;border-top:1px solid var(--fs-line)}',
      '.fs-faq__item{border-bottom:1px solid var(--fs-line)}',
      '.fs-faq__q{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px 0;font-size:18px;font-weight:600;line-height:1.4}',
      '.fs-faq__q::-webkit-details-marker{display:none}',
      '.fs-faq__q::after{content:"+";flex:none;font-size:26px;font-weight:300;line-height:1;color:var(--fs-title);transition:transform .2s}',
      '.fs-faq__item[open] .fs-faq__q::after{transform:rotate(45deg)}',
      '.fs-faq__a{padding:0 0 20px}.fs-faq__a .fs-md{font-size:16px}.fs-faq__a .fs-md>*{max-width:none}',

      '@media (max-width:1000px){.fs-masters{--fs-cols:2 !important;--fs-gx:28px;row-gap:44px}}',
      '@media (max-width:760px){',
        '.fs-section{padding:var(--fs-pad-y-mobile) 16px}',
        '.fs-plans{grid-template-columns:minmax(0,1fr);gap:18px}',
        '.fs-plan{padding:30px 20px 20px}.fs-plan__who{font-size:24px}.fs-sum{font-size:24px}',
        '.fs-md,.fs-lead{font-size:16px}',
        '.fs-md .fs-lead-p{font-size:17px;margin-bottom:22px}',
        '.fs-text .fs-cols{column-count:1}',
        '.fs-split{grid-template-columns:minmax(0,1fr);gap:24px}.fs-split__left{position:static}',
        '.fs-split__right{font-size:16px;padding-top:0}.fs-split .fs-lead-p{font-size:20px}',
        '.fs-plate{padding:44px 20px 36px}',
        '.fs-cards.fs-cards--2{grid-template-columns:minmax(0,1fr)}',
        '.fs-buttons{flex-direction:column;align-items:stretch}.fs-buttons .fs-btn{text-align:center}',
        '.fs-hero{padding-top:calc(var(--fs-pad-y-mobile) + 60px);padding-bottom:var(--fs-pad-y-mobile)}',
        '.fs-hero__lead{font-size:16px}',
        '.fs-cards:has(>.fs-card:nth-child(3):last-child){grid-template-columns:minmax(0,1fr)}',
        '.fs-bar>.fs-list{gap:8px}.fs-bar>.fs-list>li{font-size:12px;padding:6px 12px;border:1px solid var(--fs-gold);border-radius:var(--fs-btn-radius)}',
        '.fs-bar>.fs-list>li+li::before{display:none}',
        '.fs-features>.fs-list{grid-template-columns:minmax(0,1fr);gap:12px}',
        '.fs-features>.fs-list>li{padding:20px 18px}',
        '.fs-steps>ol.fs-list{grid-template-columns:minmax(0,1fr);gap:18px}',
        '.fs-steps>ol.fs-list>li{padding:8px 0 0 62px;min-height:46px}',
        '.fs-steps>ol.fs-list>li::after{display:none}',
        '.fs-callout{padding:26px 20px;font-size:16px}',
        '.fs-modal{padding:0}.fs-modal__box{max-height:100%;height:100%;border-radius:0}',
        '.fs-modal__media{height:min(62vh,420px)}.fs-modal__body{padding:32px 20px 40px}.fs-modal__name{font-size:28px}',
      '}',
      '@media (max-width:600px){',
        '.fs-sp-table{display:none}.fs-sp-cards{display:block}',
        '.fs-masters{--fs-cols:1 !important;max-width:none;row-gap:40px;margin-top:32px}',
        '.fs-master{display:grid;grid-template-columns:120px minmax(0,1fr);column-gap:18px;align-items:center}',
        '.fs-master__frame{grid-row:1/span 2;width:120px;margin:0}',
        '.fs-master__name{margin:0;font-size:20px;align-self:end;overflow-wrap:anywhere}',
        '.fs-master__reg{margin:4px 0 0;align-self:start}',
        '.fs-master__name:last-child{grid-row:1/span 2;align-self:center}',
        '.fs-master__short,.fs-master__line,.fs-master__more{grid-column:1/-1}',
        '.fs-master__short{margin-top:16px}.fs-master__line{margin:14px 0 10px}.fs-master__more{justify-self:start}',
        '.fs-table{font-size:14px}.fs-table th,.fs-table td{padding:12px 8px}',
        '.fs-rooms-section .fs-table-wrap{display:none}.fs-room-cards{display:block;border-top:1px solid var(--fs-line)}',
        '.fs-faq__q{font-size:16px}',
      '}',
      '@media (prefers-reduced-motion:reduce){.fs-root *{transition:none!important;scroll-behavior:auto!important}}'
    ].join('\n');
    var st = document.createElement('style');
    st.id = 'fs-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  // Ссылки на якоря блоков (кнопка меню «Участвую» → href="#prices"): плавная прокрутка
  // с отступом под закреплённое меню Тильды. Остальные обработчики Тильды не трогаем.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!/^[\w-]+$/.test(id)) return;
    var target = document.getElementById(id);
    if (!target || !target.classList.contains('fs-block')) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try { history.replaceState(null, '', '#' + id); } catch (err) { /* ок */ }
  });

  window.FestSun = { scan: scan, version: VERSION };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan);
  else scan();
})();
