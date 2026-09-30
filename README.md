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

정적 호스팅에는 `dist` 폴더를 사용합니다. 편집 내용은 현재 브라우저에 저장되며 서버 계정 저장은 연결되어 있지 않습니다.

폰트와 외부 아이콘의 라이선스 및 출처는 `dist/assets/fonts`와 `dist/assets/fluent-3d`에 포함되어 있습니다.
