// =============================================================
// 설정값 — README에 명시한 대로 자유 변경 가능한 기준값들을 한곳에 모아둠
// =============================================================
const CONFIG = {
  githubUsername: 'solbao-dev', // ← 본인 GitHub 아이디로 교체
  scrollTopThreshold: 300,          // 탑 버튼 등장 기준 (px)
  navBgThreshold: 60,               // 네비게이션 배경 변경 기준 (px)
  revealThreshold: 0.2,             // Intersection Observer threshold
  typingText: '안녕하세요, 윤솔지입니다.',
  typingSpeedMs: 90,
};

// =============================================================
// 1. 다크모드 — 상태: 테마 → 렌더링: data-theme 속성 + 로컬스토리지
// =============================================================
function initThemeToggle() {
  const toggleBtn = document.querySelector('#themeToggle');
  const STORAGE_KEY = 'portfolio-theme';

  // 상태 결정 우선순위: 저장된 값 > 시스템 설정(prefers-color-scheme) > 기본(light)
  const saved = localStorage.getItem(STORAGE_KEY);
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = saved || (systemPrefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next); // 상태 저장 → 새로고침 후에도 유지
  });

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      toggleBtn.setAttribute('aria-pressed', 'true');
      toggleBtn.querySelector('.theme-toggle-icon').textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      toggleBtn.setAttribute('aria-pressed', 'false');
      toggleBtn.querySelector('.theme-toggle-icon').textContent = '🌙';
    }
  }
}

// =============================================================
// 2. 햄버거 메뉴 토글 — 상태: 메뉴 열림/닫힘 → 렌더링: classList.toggle
// =============================================================
function initHamburgerMenu() {
  const hamburger = document.querySelector('#hamburger');
  const nav = document.querySelector('#mainNav');

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // 메뉴 항목 클릭 시 자동으로 닫기 (모바일 UX)
  nav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// =============================================================
// 3. 스크롤 관련 — 네비 배경 변경 + 탑 버튼 노출
//    상태: 스크롤 위치 → 렌더링: classList add/remove
// =============================================================
function initScrollEffects() {
  const header = document.querySelector('#siteHeader');
  const topBtn = document.querySelector('#topBtn');

  const handleScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > CONFIG.navBgThreshold);
    topBtn.hidden = y <= CONFIG.scrollTopThreshold;
    topBtn.classList.toggle('is-visible', y > CONFIG.scrollTopThreshold);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // 초기 상태 반영

  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// =============================================================
// 4. 히어로 타이핑 효과 (보너스)
// =============================================================
function initTypingEffect() {
  const target = document.querySelector('#typingTarget');
  const { typingText, typingSpeedMs } = CONFIG;
  let i = 0;

  const tick = () => {
    if (i <= typingText.length) {
      target.textContent = typingText.slice(0, i);
      i += 1;
      setTimeout(tick, typingSpeedMs);
    }
  };
  tick();
}

// =============================================================
// 5. 스크롤 등장 애니메이션 — Intersection Observer
// =============================================================
function initScrollReveal() {
  const revealEls = document.querySelectorAll(
    '.about-grid, .skills-grid, .projects-grid, .contact-form'
  );
  revealEls.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: CONFIG.revealThreshold }
  );

  revealEls.forEach((el) => observer.observe(el));
}

// =============================================================
// 6. GitHub API 연동 — 상태: idle/loading/success/error/empty
//    → 렌더링: Projects 섹션의 상태별 UI 전환
// =============================================================
function initProjects() {
  const statusEl = document.querySelector('#projectsStatus');
  const errorEl = document.querySelector('#projectsError');
  const emptyEl = document.querySelector('#projectsEmpty');
  const gridEl = document.querySelector('#projectsGrid');
  const retryBtn = document.querySelector('#retryBtn');
  const filtersEl = document.querySelector('#projectFilters');

  let allRepos = [];       // fetch로 받아온 원본 데이터
  let activeLang = 'all';  // 필터 상태

  const setUiState = (state) => {
    // 상태 하나만 화면에 남기고 나머지는 숨김 (상태 → 렌더링의 핵심)
    statusEl.hidden = state !== 'loading';
    errorEl.hidden = state !== 'error';
    emptyEl.hidden = state !== 'empty';
    gridEl.hidden = state !== 'success';
  };

  async function fetchRepos() {
    setUiState('loading');
    try {
      const res = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/repos?sort=updated&per_page=12`);

      if (!res.ok) {
        // 403 = 레이트 리밋, 404 = 아이디 오류 등 — README 주의사항 반영
        throw new Error(`GitHub API 응답 오류: ${res.status}`);
      }

      const data = await res.json();
      allRepos = data
        .filter((repo) => !repo.fork) // 포크 저장소는 제외
        .map(({ id, name, description, html_url, language, stargazers_count }) => ({
          id, name, description, html_url, language, stargazers_count,
        }));

      if (allRepos.length === 0) {
        setUiState('empty');
        return;
      }

      renderFilters(allRepos);
      renderRepos(allRepos);
      setUiState('success');
    } catch (err) {
      console.error('[fetchRepos] 실패:', err);
      setUiState('error');
    }
  }

  function renderFilters(repos) {
    const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))];
    if (languages.length <= 1) {
      filtersEl.hidden = true;
      return;
    }
    filtersEl.hidden = false;
    filtersEl.innerHTML = `<button class="filter-btn is-active" data-lang="all" type="button">All</button>`
      + languages.map((lang) => `<button class="filter-btn" data-lang="${lang}" type="button">${lang}</button>`).join('');

    filtersEl.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeLang = btn.dataset.lang;
        filtersEl.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
        const filtered = activeLang === 'all'
          ? allRepos
          : allRepos.filter((r) => r.language === activeLang); // 배열 메서드: filter
        renderRepos(filtered);
      });
    });
  }

  function renderRepos(repos) {
    gridEl.innerHTML = repos.map((repo) => {
      const { name, description, html_url, language, stargazers_count } = repo; // 구조분해 할당
      return `
        <article class="project-card">
          <h3><a href="${html_url}" target="_blank" rel="noopener noreferrer">${name}</a></h3>
          <p>${description ? escapeHtml(description) : '설명이 없는 저장소입니다.'}</p>
          <div class="project-meta">
            ${language ? `<span class="lang">${language}</span>` : ''}
            <span>★ ${stargazers_count}</span>
          </div>
        </article>
      `;
    }).join(''); // 템플릿 리터럴로 카드 HTML 동적 생성
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  retryBtn.addEventListener('click', fetchRepos);
  fetchRepos();
}

// =============================================================
// 7. 폼 유효성 검사 — 상태: 각 필드 유효성 → 렌더링: 에러 메시지 표시/숨김
// =============================================================
function initContactForm() {
  const form = document.querySelector('#contactForm');
  const successEl = document.querySelector('#formSuccess');
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const fields = {
    name: { input: form.name, errorEl: document.querySelector('#nameError') },
    email: { input: form.email, errorEl: document.querySelector('#emailError') },
    message: { input: form.message, errorEl: document.querySelector('#messageError') },
  };

  const validators = {
    name: (value) => (value.trim() ? '' : '이름을 입력해주세요.'),
    email: (value) => {
      if (!value.trim()) return '이메일을 입력해주세요.';
      if (!EMAIL_REGEX.test(value)) return '올바른 이메일 형식이 아닙니다.';
      return '';
    },
    message: (value) => (value.trim() ? '' : '메시지를 입력해주세요.'),
  };

  function validateField(key) {
    const { input, errorEl } = fields[key];
    const message = validators[key](input.value);
    input.closest('.form-field').classList.toggle('has-error', Boolean(message));
    errorEl.textContent = message;
    return !message;
  }

  // 입력 중 실시간 검증 (input 이벤트)
  Object.keys(fields).forEach((key) => {
    fields[key].input.addEventListener('input', () => validateField(key));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // 기본 제출(페이지 새로고침) 방지

    const results = Object.keys(fields).map(validateField);
    const isValid = results.every(Boolean);

    if (!isValid) {
      successEl.hidden = true;
      return;
    }

    // 실제 전송 대신 성공 상태로 전환 (Formspree/EmailJS 연동 시 이 지점에서 fetch 호출)
    successEl.hidden = false;
    form.reset();
    Object.values(fields).forEach(({ errorEl }) => { errorEl.textContent = ''; });
    Object.values(fields).forEach(({ input }) => input.closest('.form-field').classList.remove('has-error'));
  });
}

// =============================================================
// 8. 기타 초기화
// =============================================================
function initFooterYear() {
  document.querySelector('#year').textContent = new Date().getFullYear();
}

// =============================================================
// 진입점
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initHamburgerMenu();
  initScrollEffects();
  initTypingEffect();
  initScrollReveal();
  initProjects();
  initContactForm();
  initFooterYear();
});
// =============================================================
// ★ 이 파일의 핵심 구조 — 이벤트 → 상태 → 화면변화
// =============================================================
// 1. initThemeToggle()
//    이벤트: 🌙 버튼 클릭
//    상태:   dark ↔ light 값 변경 + localStorage 저장
//    화면:   <html>의 data-theme 속성 변경 → CSS 변수 전체 전환
//
// 2. initHamburgerMenu()
//    이벤트: ☰ 버튼 클릭
//    상태:   nav에 'is-open' 클래스 붙었다 떨어졌다
//    화면:   메뉴가 오른쪽에서 슬라이드로 나타나고 사라짐
//
// 3. initScrollEffects()
//    이벤트: 스크롤
//    상태:   scrollY가 60px/300px 넘었는지 여부
//    화면:   네비 배경 변경 + ↑ 버튼 등장
//
// 4. initProjects() → setUiState()
//    이벤트: 페이지 로드 (GitHub API 자동 호출)
//    상태:   loading / success / error / empty 중 하나
//    화면:   해당 상태 UI만 보이고 나머지 3개는 hidden
//
// 5. initContactForm()
//    이벤트: 폼 제출 버튼 클릭
//    상태:   각 필드 유효성 true/false
//    화면:   에러 메시지 표시 또는 성공 메시지 표시
// =============================================================