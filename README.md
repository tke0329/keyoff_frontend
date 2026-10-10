# KEYOFF frontend

Next.js App Router / React / TypeScript.

## Run

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `BACKEND_URL` (default: http://localhost:8080). Restart Next.js after changes. All pages use actual backend data; there are no sample datasets or fallback profiles. Empty datasets show an empty state; connection failures show a retry screen. Home is a brand introduction and makes no backend requests.

## Routes

- `/`: brand introduction.
- `/artists`: artist roster, sorted by administrator-assigned order, then slug; pagination.
- `/artists/[slug]`: public profile, career history, own music; verified owner edit button.
- `/catalog`: paginated music across all artists. Every track identifies its artist and links to their profile. No first-five-artist or eight-track cutoff.
- `/about`: brand introduction and philosophy.
- `/login`: direct-address login for both roles. ADMIN goes to `/admin`, ARTIST goes to their own profile.
- `/admin`: ADMIN-only artist creation, activation/deactivation, password reset and numeric display order management. Duplicate orders use slug as a deterministic tie breaker. Slug URLs remain stable.
- `/profile/edit`: ARTIST-only own profile and career CRUD.

Public header navigation has HOME/CATALOG/ARTISTS/ABOUT. No login, signup or administrator shortcut. Public signup is not provided; administrators create artist accounts.

## Authentication and API

The server stores the access token in an HttpOnly, SameSite=Lax session cookie (Secure in production). Role and slug are obtained from authenticated backend `/api/v1/auth/me`, never by trusting browser input or decoding an unverified token. Both the server-rendered admin page and admin mutation proxy verify ADMIN; the backend also enforces ADMIN. Mutations check request Origin against Host. Profile and career writes remain restricted to the authenticated artist. Use HTTPS in production.

The backend includes a display-order migration, authenticated session identity, admin order endpoint and a public catalog endpoint. Restart/update the backend with these changes before using the frontend. Existing artists retain order 0 after migration; real records are not deleted when removing frontend samples.

Backend media streams through a same-origin route with Range forwarding. Images accept HTTP(S) or backend media paths. Playlist upload/management is a separate phase; public playback uses already-registered media.

## Validation

```sh
npm run lint
npm run build -- --webpack
```

Webpack is available when the local environment restricts Turbopack's internal build ports.

Validated: frontend lint and webpack production build; 154 backend tests including session roles, admin order authorization, catalog pagination and migration validation; frontend connected to the actual backend in an isolated in-memory H2 database for admin login routing, account creation, status/password/order writes and unauthorized-request rejection. Admin layout was checked on desktop and at 390px width. The temporary verification data is not used by the application.

## Profile and career editing

Profile editing uses separate Profile/Image and Career/History tabs. Career records appear as horizontal rows with category labels and no viewing filters; only the new or selected record opens its form. Category options match the backend RecordType enum: SONG, AWARD, EDUCATION, CAREER and PROJECT. Existing records migrate to CAREER. Legacy creates without a category default to CAREER; legacy updates preserve the stored category.

Images can be dropped on the image area or chosen with the file picker. JPG/PNG up to 8MB are accepted; the backend validates real content, dimensions and ownership. Uploading shows a preview and blocks profile saving until it finishes. Clicking Profile Save applies the uploaded image to the public profile. Uploading or removing a selection does not immediately change the public profile.

Verified this change: frontend lint and production build; backend career category and full existing integration tests; migration preserves pre-category records; actual backend in a separate in-memory DB for categorized career writes and image upload/save/download; browser file picker upload, profile save and dropdown-based record registration; 390px mobile layout. No verification profiles or images are included in production data.

이력 관리: 숫자 입력 없이 카드 손잡이 드래그(터치 포함) 또는 방향키로 정렬하며, 이동 후 즉시 전체 순서를 저장합니다. 공개 이력에는 카테고리 필터를 표시하지 않습니다. 목록의 삭제 버튼은 확인 후 삭제합니다. 등록·수정 폼이 열려 있는 동안에는 순서 변경과 목록 삭제를 숨겨 동시 변경을 방지합니다.

공개 프로필과 편집 목록은 학력 → 경력 → 프로젝트 → 수상 → 참여곡 순서로 구획을 표시하며, 해당 이력이 없는 구획은 생략합니다. 카드 정렬은 같은 카테고리 안에서 이루어지고, 다른 카테고리의 이력과 카테고리 값은 유지합니다. 드래그 카드가 포인터를 따라 움직이며 주변 카드는 240ms 위치 전환으로 자리를 비웁니다. 모션 줄이기 설정에서는 위치 전환 애니메이션을 생략합니다.

프로필 편집 탭 03은 플레이리스트 관리 화면입니다. Spotify 곡 링크를 입력하면 제목을 자동으로 가져오고, 가수명은 직접 입력합니다. 저장한 곡은 공개 프로필과 Catalog에 표시됩니다. 새 음원 파일 업로드는 지원하지 않습니다. 이전에 업로드한 곡은 계속 조회·재생할 수 있으며 수정할 때 Spotify 링크로 전환합니다. 전환이나 곡 삭제는 과거 파일을 자동 삭제하지 않습니다.

이력 날짜 방식은 RANGE(기간) / SINGLE(단일 날짜)로 저장합니다. SINGLE은 startDate 하나만 사용하고 endDate는 비워야 합니다. 기존 데이터는 V6 마이그레이션으로 RANGE가 되며 기존 날짜가 보존됩니다. 날짜 방식 없이 들어오는 기존 수정 요청은 저장된 방식을 유지합니다. 이력 수정 버튼은 수정 폼으로 스크롤하고 제목 입력란에 초점을 둡니다.

검증 범위와 결과는 백엔드 `TESTING.md`와 `docs/SPOTIFY_LINK_INTEGRATION.md`를 참고하세요.
