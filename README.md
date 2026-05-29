# FaceGuard — FaceMesh 기반 생체인식 보안 시스템

> MediaPipe FaceMesh를 활용하여 얼굴 랜드마크와 눈 깜빡임을 분석하고, 실제 사용자(Live User)와 사진 위조 공격(Photo Spoofing Attack)을 구분하는 라이브니스 검증 시스템입니다.

---

# 프로젝트 개요

일반적인 얼굴 인식 시스템은 사용자의 사진만으로도 인증이 가능하다는 보안 취약점이 존재합니다.

FaceGuard는 이러한 문제를 해결하기 위해 MediaPipe FaceMesh를 활용하여 얼굴 랜드마크를 분석하고, 얼굴 움직임과 눈 깜빡임을 기반으로 실제 사용자 여부를 판별하는 생체인식 보안 시스템입니다.

사용자의 얼굴 비율 변화량과 눈 깜빡임을 함께 분석하여 사진 공격(Photo Spoofing Attack)을 탐지합니다.

---

# 주요 기능

- **실시간 얼굴 검출** : 웹캠 영상을 통한 얼굴 탐지
- **FaceMesh 랜드마크 추출** : 얼굴 랜드마크 468개 실시간 분석
- **랜드마크 시각화** : Canvas 기반 랜드마크 렌더링
- **얼굴 비율 분석** : 눈, 코, 입 랜드마크를 이용한 비율 계산
- **최대 비율 변화량 측정** : 얼굴 움직임 기반 라이브니스 분석
- **눈 깜빡임 검출** : 눈 랜드마크 거리 기반 Blink Detection
- **라이브니스 검증** : 얼굴 움직임 + 눈 깜빡임 동시 검증
- **사진 공격 탐지** : 실제 얼굴과 정적 이미지를 구분

---

# 시스템 아키텍처

```text
Webcam Input
      │
      ▼
MediaPipe FaceMesh
      │
      ▼
468 Face Landmarks
      │
      ├─────────────┐
      ▼             ▼
Face Ratio      Blink Detection
 Analysis
      │             │
      └──────┬──────┘
             ▼
    Liveness Verification
             │
             ▼
 Real User / Photo Attack
```

---

# 기술 스택

| 영역 | 기술 |
|--------|--------|
| Frontend | React, Vite, JavaScript |
| Computer Vision | MediaPipe FaceMesh |
| Webcam | react-webcam |
| Rendering | HTML5 Canvas |

---

# 시스템 동작 과정

## 1. 얼굴 검출

웹캠을 통해 사용자의 얼굴을 탐지합니다.

## 2. 랜드마크 추출

MediaPipe FaceMesh를 이용하여 얼굴 랜드마크 468개를 추출합니다.

## 3. 얼굴 비율 계산

사용하는 주요 랜드마크

- 왼쪽 눈
- 오른쪽 눈
- 코
- 입

비율 계산식

```text
ratio = (코-입 거리) / (양쪽 눈 거리)
```

## 4. 눈 깜빡임 검출

눈 위·아래 랜드마크 사이 거리를 계산하여 깜빡임을 감지합니다.

```text
eyeDistance < 0.022
```

## 5. 라이브니스 검증

다음 조건을 모두 만족해야 실제 사용자로 판정합니다.

```text
최대 비율 변화량 >= 2
눈 깜빡임 감지
```

---

# AI 도구 활용 전략 (Prompting Log)

본 프로젝트는 ChatGPT를 AI 개발 보조 도구로 활용하여 구현하였습니다.

| 목적 | 활용 프롬프트 |
|--------|--------|
| FaceMesh 연동 | React 환경에서 MediaPipe FaceMesh를 사용하는 방법 |
| 랜드마크 렌더링 | FaceMesh landmark 좌표를 Canvas에 렌더링하는 방법 |
| 눈 깜빡임 검출 | FaceMesh를 이용한 Blink Detection 구현 방법 |
| 임계값 설정 | 실제 얼굴과 사진 입력 데이터를 기반으로 적절한 임계값 설정 방법 |

---

# 프로젝트 구조

```text
frontend
├── src
│   ├── App.jsx
│   └── main.jsx
├── public
├── package.json
└── vite.config.js
```

---

# 실행 방법 (How to Run)

## 프로젝트 클론

```bash
git clone <repository-url>
```

## 프로젝트 이동

```bash
cd frontend
```

## 패키지 설치

```bash
npm install
```

## 개발 서버 실행

```bash
npm run dev
```

## 접속 주소

```text
http://localhost:5173
```

---

# 구현 완료 기능

- 웹캠 연결
- 얼굴 검출
- FaceMesh 연동
- 랜드마크 시각화
- 얼굴 비율 변화량 분석
- 눈 깜빡임 검출
- 라이브니스 검증
- 실제 얼굴 / 사진 공격 판별

---

# 판별 기준

| 조건 | 기준 |
|--------|--------|
| 얼굴 움직임 | 최대 비율 변화량 ≥ 2 |
| 눈 깜빡임 | Eye Distance < 0.022 |
| 최종 판정 | 두 조건 모두 만족 시 실제 사용자 |

---

# 향후 개선 계획

- AutoEncoder 기반 위조 얼굴 탐지
- 영상 재생 공격(Video Replay Attack) 탐지
- 딥러닝 기반 Liveness Detection 적용
- 다양한 조명 환경에서의 정확도 향상
- 모바일 환경 지원

---

# 기대 효과

- 생체인식 인증 보안 강화
- 사진 위조 공격 방어
- 실제 사용자 검증
- 안전한 얼굴 인증 환경 구축

---

# Developer

**FaceGuard Project**

AI 기반 생체인식 인증 보안 시스템