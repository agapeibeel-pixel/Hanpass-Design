# Hanpass Creative Studio

한패스 배너와 SNS 디자인을 제작하는 브라우저 기반 디자인 스튜디오입니다.

## 실행

Node.js를 설치한 뒤 다음 명령으로 실행합니다. 별도 패키지 설치는 필요하지 않습니다.

```sh
node browser-server.mjs
```

브라우저에서 http://127.0.0.1:4175/index.html 을 엽니다.

## 주요 기능

- 크기별 디자인 템플릿 및 고해상도 PNG 다운로드
- Pretendard 글꼴, 텍스트 정렬, 단색·그라데이션 편집
- 문구와 이미지 드래그 이동, 요소 삭제 및 실행 취소
- 가로 배너의 로고 → 제목 → 설명 배치와 오른쪽 이미지
- 브라우저 로컬 저장 및 다국어 UI

## 구성

- `dist/`: 배포 가능한 정적 웹사이트 소스와 디자인 자산
- `dist/format-workspace.js`: 편집기 및 배너 렌더링
- `dist/format-workspace.css`: 편집기 스타일
- `browser-server.mjs`: 로컬 확인용 서버

정적 미리보기에서는 브라우저에 저장합니다. Cloudflare 배포에서는 한패스 팀 로그인 후 계정별 디자인이 D1에 저장되고 업로드 이미지는 비공개 R2 버킷에 저장됩니다.

## Cloudflare 운영

```sh
npm ci
npm test
npm run build
npm run db:migrate
npm run deploy
```

- Worker: `hanpass-design`
- D1: `hanpass-design-db` (`DB` 바인딩)
- R2: `hanpass-design-files` (`FILES` 바인딩, 공개 접근 비활성)
- 인증: Cloudflare Access. 회사 이메일 도메인 `hanpass.com`만 허용하며 Worker에서도 JWT 서명·발급자·대상·만료를 검증합니다.
- 필요한 Worker 변수: `ACCESS_TEAM_DOMAIN` (예: 팀명.cloudflareaccess.com), `ACCESS_AUD` (Access 앱 Audience).
- Access 설정이 없거나 인증되지 않은 요청에는 디자인 파일 및 API를 제공하지 않습니다.
- 사용자마다 자신의 작업·이미지만 조회하고 수정합니다. 팀 공용 편집은 별도 공유 기능이 필요합니다.
- 저장 실패 시 브라우저에 임시 보관하고 재시도합니다. 동시 편집 충돌 시 기존 서버 데이터를 덮어쓰지 않습니다.
- 기존 localhost 또는 다른 사이트의 브라우저 저장 데이터는 도메인별로 분리되어 자동 이전되지 않습니다.

GitHub 연동 시 Cloudflare Workers Builds에서 이 저장소의 `main`을 연결하고 배포 명령은 `npm run deploy`를 사용합니다. D1 스키마 변경이 있는 커밋은 배포 전에 `npm run db:migrate`로 적용합니다.

회사 인증서를 사용하는 Windows PC에서는 필요하면 PowerShell에서 `$env:NODE_USE_SYSTEM_CA='1'`을 설정한 뒤 Wrangler를 실행합니다. TLS 검증은 끄지 않습니다.

폰트와 외부 아이콘의 라이선스 및 출처는 `dist/assets/fonts`와 `dist/assets/fluent-3d`에 포함되어 있습니다.
