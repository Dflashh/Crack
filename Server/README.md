# CRACK :: Server Check

크랙에서 사용하는 Claude·Gemini 모델을 **사용자가 버튼을 누른 순간에만** 공식 API로 호출해 TTFT, TPS, 전체 시간, IGX 방식 점수를 표시하는 정적 웹앱입니다.

- 중앙 측정 서버 없음
- 자동 갱신 없음
- 각 사용자가 자신의 Anthropic / Gemini API 키 사용
- 선택한 모델만 화면에 표시하고 조회
- 모델별 허용 최저 추론 설정
- 1회 측정 또는 3회 중앙값
- iOS 글래스 스타일 반응형 UI

## 포함 모델

| 크랙 이름 | 실제 모델 | API 모델 ID |
|---|---|---|
| 페이블챗 1.0 | Claude Fable 5 | `claude-fable-5` |
| 하이퍼챗 3.0 | Claude Opus 5 | `claude-opus-5` |
| 하이퍼챗 2.0 | Claude Opus 4.8 | `claude-opus-4-8` |
| 하이퍼챗 1.5 | Claude Opus 4.7 | `claude-opus-4-7` |
| 하이퍼챗 1.0 | Claude Opus 4.6 | `claude-opus-4-6` |
| 슈퍼챗 3.0 | Claude Sonnet 5 | `claude-sonnet-5` |
| 슈퍼챗 2.5 | Claude Sonnet 4.6 | `claude-sonnet-4-6` |
| 슈퍼챗 2.0 | Claude Sonnet 4.5 | `claude-sonnet-4-5-20250929` |
| 프로챗 2.5 | Gemini 3.1 Pro | `gemini-3.1-pro-preview` |
| 프로챗 1.0 | Gemini 2.5 Pro | `gemini-2.5-pro` |
| 파워챗 | Gemini 2.5 Flash | `gemini-2.5-flash` |

## GitHub Pages 배포

1. 새 GitHub 저장소를 만듭니다.
2. 이 폴더의 `index.html`, `styles.css`, `app.js`를 저장소 루트에 올립니다.
3. 저장소 **Settings → Pages**로 이동합니다.
4. **Build and deployment → Deploy from a branch**를 선택합니다.
5. Branch를 `main`, 폴더를 `/ (root)`로 설정하고 저장합니다.
6. 표시된 GitHub Pages 주소로 접속합니다.

별도의 npm 설치나 빌드 과정은 없습니다.

## 로컬 실행

브라우저 보안 정책 때문에 `file://`로 직접 열지 말고 간단한 로컬 서버를 사용하세요.

```bash
python -m http.server 8080
```

그 후 `http://localhost:8080`으로 접속합니다.

## API 키 저장 방식

설정에서 저장을 켜면 API 키가 해당 브라우저의 `localStorage`에 평문으로 저장됩니다. 키는 앱 제작자의 서버로 전송되지 않고 다음 공식 API로만 전송됩니다.

- `https://api.anthropic.com`
- `https://generativelanguage.googleapis.com`

공용 PC에서는 저장 옵션을 끄는 것을 권장합니다. 브라우저 확장 프로그램이나 악성 스크립트가 저장소를 읽을 수 있으므로, 가능하면 이 용도만을 위한 지출 한도가 낮은 별도 API 키를 사용하세요.

## 측정값

- **응답 시작(TTFT)**: 요청 직전부터 첫 번째 실제 텍스트 조각이 도착할 때까지
- **TPS**: API가 반환한 출력 토큰 수 ÷ 첫 텍스트 이후 스트림 종료까지의 시간
- **전체 시간**: 요청 직전부터 스트림 종료까지
- **IGX 점수**: 원본 IGX 프론트 소스의 구간·선형 보간 규칙을 재현

점수 기준:

- 지연 시간: 2초 이하 50점, 3.5초 30점, 7초 0점
- TPS: 33 이상 50점, 17.5 30점, 10 10점
- 지연이 7초 초과 또는 TPS가 10 미만이면 총점 최대 40점

## 추론 최소화 설정

- Fable 5: 적응형 사고를 끌 수 없어 `effort: low`
- Opus 5 / Sonnet 5: `thinking: disabled`, `effort: low`
- Opus 4.6~4.8 / Sonnet 4.6: thinking 필드 생략(OFF), `effort: low`
- Sonnet 4.5: thinking 미사용
- Gemini 3.1 Pro: `thinkingLevel: low`
- Gemini 2.5 Pro: `thinkingBudget: 128`
- Gemini 2.5 Flash: `thinkingBudget: 0`

## 모델 추가·수정

`app.js` 상단의 `MODELS` 배열을 편집하면 됩니다. 크랙 상품명, API 모델 ID, 제공사, 색상, 추론 설정이 모두 그곳에 있습니다.

## 주의사항

- 이 수치는 전 세계 공통 절대값이 아니라 **현재 사용자 위치·API 계정·서비스 등급·순간 부하**가 포함된 결과입니다.
- Gemini 프리뷰 모델 또는 방금 출시된 Claude 모델은 계정별로 접근 권한이 아직 열리지 않았을 수 있습니다.
- API 제공사가 파라미터나 모델 ID를 변경하면 `MODELS` 또는 요청 코드를 업데이트해야 합니다.
- Fable 5처럼 숨은 사고 토큰이 포함되는 모델은 다른 모델과 TPS를 완벽하게 동일 조건으로 비교하기 어렵습니다.

## 라이선스

개인·비상업적 수정과 배포에 자유롭게 사용하세요. 프로젝트 이름과 모델 상표는 각 소유자에게 귀속됩니다.
