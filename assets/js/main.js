/* 365필요한의원 — 최소한의 동작만 담당합니다 (메뉴 · 오늘 진료시간 · 사진 확대) */
(function () {
  // 모바일 메뉴 열기/닫기
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.querySelector('.sr-only').textContent = open ? '메뉴 열기' : '메뉴 닫기';
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && window.innerWidth < 1000) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  // 진료시간 표에서 오늘 요일 표시 (공휴일은 자동 판단하지 않습니다)
  var d = new Date().getDay();
  var today = (d === 0 || d === 6) ? '토·일요일' : '평일';
  document.querySelectorAll('.hours-row[data-day="' + today + '"]').forEach(function (row) { row.classList.add('is-today'); });

  // 진료 공간 사진 확대 (실제 사진 <img>로 교체했을 때 동작)
  var imgs = document.querySelectorAll('.gallery img');
  if (imgs.length && window.HTMLDialogElement) {
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.innerHTML = '<img alt=""><button type="button" aria-label="닫기">×</button>';
    document.body.appendChild(dlg);
    var big = dlg.querySelector('img');
    dlg.querySelector('button').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    imgs.forEach(function (img) {
      img.addEventListener('click', function () {
        big.src = img.currentSrc || img.src;
        big.alt = img.alt;
        dlg.showModal();
      });
    });
  }
})();

/* 첫 화면 사진 슬라이드: 일정 시간마다 다음 사진으로 페이드 */
(function () {
  var box = document.querySelector('.hero-bg, .hero-slides');
  if (!box) return;
  var imgs = box.querySelectorAll('img, video'), dots = (box.closest('.hero') || box).querySelectorAll('.slide-dots li');
  if (imgs.length < 2) return;
  var i = 0, timer;
  function show(n) {
    imgs[i].classList.remove('is-on'); dots[i] && dots[i].classList.remove('is-on');
    i = (n + imgs.length) % imgs.length;
    imgs[i].classList.add('is-on'); dots[i] && dots[i].classList.add('is-on');
    if (imgs[i].tagName === 'VIDEO') { imgs[i].currentTime = 0; imgs[i].play().catch(function () {}); }
  }
  function start() { stop(); timer = setInterval(function () { show(i + 1); }, parseInt(box.dataset.interval, 10) || 2000); }
  function stop() { clearInterval(timer); }
  // 첫 장이 화면에 뜬 뒤에야 넘어가기 시작 (최대 4초 대기)
  var begun = false;
  function begin() { if (begun) return; begun = true; start(); }
  function whenReady(el, fn) {
    if (el.tagName === 'VIDEO') { if (el.readyState >= 3) fn(); else { el.addEventListener('canplay', fn, { once: true }); el.addEventListener('loadeddata', fn, { once: true }); } }
    else { if (el.complete && el.naturalWidth) fn(); else el.addEventListener('load', fn, { once: true }); }
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    whenReady(imgs[0], begin); setTimeout(begin, 4000);
    box.addEventListener('mouseenter', stop);
    box.addEventListener('mouseleave', function () { if (begun) start(); });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  }
})();
