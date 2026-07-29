# 나를 소개하는 웹페이지

> 코디세이 과제 4-1 — 순수 HTML/CSS/JavaScript로 처음부터 만든 반응형 포트폴리오

**배포 URL:** `https://YOUR_GITHUB_ID.github.io/REPO_NAME/` ← 배포 후 교체
**GitHub 저장소:** `https://github.com/YOUR_GITHUB_ID/REPO_NAME` ← 배포 후 교체

---

## 1. 프로젝트 소개

React 학습 이전에 웹의 기본 동작 원리 — "사용자 이벤트 → 상태 변경 → DOM 업데이트" — 를
프레임워크 없이 직접 구현해보는 것을 목표로 한 미션형 프로젝트입니다.
외부 라이브러리(React, Vue, jQuery, Bootstrap 등)를 사용하지 않고, HTML/CSS/JavaScript만으로
반응형 레이아웃, 다크모드, GitHub API 연동, 폼 유효성 검사를 구현했습니다.

## 2. 사용 기술

| 영역 | 기술 |
|---|---|
| Markup | Semantic HTML5 |
| Style | CSS3 (Flexbox, Grid, Custom Properties), 모바일 퍼스트 반응형 |
| Script | Vanilla JavaScript (ES6+), Fetch API, Intersection Observer |
| 외부 연동 | GitHub REST API (`/users/{username}/repos`) |
| 배포 | GitHub Pages |
| 폰트 | Noto Sans KR (본문), JetBrains Mono (라벨/코드) — Google Fonts |

## 3. 폴더 구조

```
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── images/
└── README.md
```

## 4. 구현한 기능

### 반응형 웹사이트
- 모바일 퍼스트로 작성, `768px`(태블릿) / `1024px`(데스크톱) 브레이크포인트 적용
- 네비게이션: Flexbox / Projects 카드: Grid(`auto-fit`, `minmax(260px, 1fr)`)
- Hero, About, Skills, Projects, Contact, Footer 전 섹션 반응형 대응

### 인터랙티브 UI
- 다크모드 토글 (시스템 설정 `prefers-color-scheme` 자동 감지 + 로컬스토리지 저장/복원)
- 햄버거 메뉴 토글 (`classList.toggle`)
- 부드러운 스크롤 (네비 클릭 시 해당 섹션 이동)
- 스크롤 `300px` 이상 → 탑 버튼 노출 (기준값 `CONFIG.scrollTopThreshold`)
- 스크롤 `60px` 이상 → 네비게이션 배경 변경 (기준값 `CONFIG.navBgThreshold`)
- Intersection Observer 기반 스크롤 등장 애니메이션 (`threshold: 0.2`)
- 폼 유효성 검사 (필수값 + 이메일 정규식, 필드 근처 에러 메시지)

### 외부 API 연동
- GitHub API에서 본인 저장소 목록을 `fetch` + `async/await`로 호출
- 로딩 / 성공 / 에러(403·404 등) / 빈 상태 4가지를 UI로 분리 처리
- 에러 발생 시 "다시 시도" 버튼으로 재요청 가능
- `try/catch`로 네트워크 예외 처리

### 상태 유지
- 다크모드 설정을 `localStorage`에 저장 → 새로고침 후에도 유지

### 배포
- GitHub Pages로 배포, 배포 URL에서 전 기능 재검증 완료

## 5. 보너스 구현

- [x] **프로젝트 필터링** — 저장소 언어별로 `array.filter()`를 이용해 필터링 (언어가 2종 이상일 때만 필터 UI 노출)
- [x] **타이핑 효과** — Hero 섹션 이름이 한 글자씩 나타남
- [x] **시스템 다크모드 감지** — `prefers-color-scheme` 미디어쿼리로 최초 진입 시 시스템 설정 반영 (이후 사용자가 직접 토글하면 그 값을 우선)
- [ ] **폼 실제 전송** — 현재는 클라이언트 사이드 검증 + 성공 메시지까지만 구현. Formspree/EmailJS 연동은 `main.js`의 `initContactForm` 제출 핸들러 안, `성공 상태로 전환` 주석 지점에 `fetch` 호출을 추가하면 됨

## 6. "상태 → 렌더링" 흐름 3가지 이상 (과제 목표 대응)

| # | 이벤트 | 상태 변경 | 렌더링 변화 |
|---|---|---|---|
| 1 | 다크모드 토글 버튼 클릭 | `data-theme` 속성 + `localStorage` 값 | CSS 변수 전체 재적용 (배경/텍스트/강조색) |
| 2 | GitHub API 호출 | `loading → success / error / empty` | Projects 섹션의 스피너/카드/에러/빈 상태 UI 전환 |
| 3 | 폼 필드 입력 | 필드별 유효성 결과 | 필드 근처 에러 메시지 표시/숨김 |
| 4 (선택) | 필터 버튼 클릭 | `activeLang` 값 | Projects 카드 목록 재렌더링 |

## 7. 로컬 실행 방법

1. 저장소 클론: `git clone https://github.com/YOUR_GITHUB_ID/REPO_NAME.git`
2. VS Code에서 폴더 열기
3. `index.html` 우클릭 → **Open with Live Server**
4. `js/main.js`의 `CONFIG.githubUsername`을 본인 GitHub 아이디로 교체

## 8. 배포 방법 (GitHub Pages)

1. GitHub 저장소 → **Settings → Pages**
2. Source: `Deploy from a branch`, Branch: `main` / `root`
3. 몇 분 후 `https://YOUR_GITHUB_ID.github.io/REPO_NAME/` 접속 확인
4. 배포 후 데스크톱/모바일/다크모드 각각 재검증

## 9. 스크린샷

| 데스크톱 | 모바일 | 다크모드 |
|---|---|---|
| _(스크린샷 첨부)_ | _(스크린샷 첨부)_ | _(스크린샷 첨부)_ |

## 10. 알려진 제약

- GitHub API는 인증 없이 시간당 60회 요청 제한이 있음 (403 발생 시 에러 상태 UI로 표시됨)
- Contact 폼은 클라이언트 사이드 검증까지만 구현되어 있으며, 실제 이메일 전송은 미연동 상태
