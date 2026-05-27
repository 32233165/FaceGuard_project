# FaceGuard

AI 기반 생체인식 인증 보안 시스템

웹캠 입력과 MediaPipe FaceMesh를 활용하여  
실제 얼굴과 사진 입력을 구분하기 위한  
생체 반응 기반 인증 시스템입니다.

---

# 프로젝트 소개

기존 얼굴 인증 시스템은 편리하지만  
사진이나 화면을 이용한 위조 공격(Spoofing)에 취약하다는 문제가 있습니다.

FaceGuard는 웹캠 기반 얼굴 분석과  
FaceMesh landmark 추출을 통해  
실제 사용자의 생체 반응을 분석하여  
사진 기반 위조 공격을 탐지하는 것을 목표로 합니다.

---

# 프로젝트 목표

- 웹캠 기반 실시간 얼굴 분석 구현
- MediaPipe FaceMesh landmark 추출
- 실제 얼굴과 사진 입력 구분
- 생체 반응 기반 인증 시스템 구현
- 얼굴 spoofing 공격 탐지

---

# 현재 구현 기능

- 웹캠 실시간 입력
- MediaPipe FaceMesh 연동
- 얼굴 landmark 추출
- Canvas 기반 landmark 시각화
- 눈 깜빡임 기반 실제 얼굴 판단
- 실시간 얼굴 분석 처리

---

# 시스템 동작 과정

1. 웹캠 영상 입력
2. MediaPipe FaceMesh 분석
3. 얼굴 landmark 좌표 추출
4. 눈 landmark 거리 계산
5. 눈 깜빡임 감지
6. 실제 얼굴 여부 판단

---

# 사용 기술

## Frontend

- React
- Vite
- react-webcam

## AI / Vision

- MediaPipe FaceMesh

## Rendering

- HTML5 Canvas

---

# 프로젝트 구조

```bash
frontend/
 ┣ src/
 ┃ ┣ App.jsx
 ┃ ┗ main.jsx
 ┣ public/
 ┣ package.json
 ┗ vite.config.js
```

---

# 실행 방법

## 패키지 설치

```bash
npm install
```

## 프로젝트 실행

```bash
npm run dev
```

---

# 핵심 기능 설명

## FaceMesh landmark 추출

웹캠 영상을 MediaPipe FaceMesh에 전달하여  
실시간 얼굴 landmark 좌표를 추출합니다.

---

## Landmark 시각화

추출된 landmark 좌표를 Canvas 위에 렌더링하여  
얼굴 특징점을 실시간으로 시각화합니다.

---

## 눈 깜빡임 기반 생체 반응 분석

눈 위/아래 landmark 거리 변화를 분석하여  
실제 사용자의 눈 깜빡임 여부를 판단합니다.

사진은 눈 깜빡임 변화가 없기 때문에  
생체 반응 기반 실제 얼굴 인증 요소로 활용할 수 있습니다.

---

# 트러블슈팅

## MediaPipe 연결 오류

### 문제

MediaPipe FaceMesh script 로드 시  
WASM 관련 오류 발생

### 원인

FaceMesh 초기화 중복 실행

### 해결

- useEffect 중복 실행 방지 처리 적용
- FaceMesh script 중복 로드 방지

---

## Landmark 위치 오류

### 문제

Canvas landmark 위치 불일치 발생

### 원인

FaceMesh landmark는 정규화 좌표(0~1)를 사용

### 해결

canvas width/height 기준으로 좌표 변환 처리

---

## 화면 잔상 발생

### 문제

이전 프레임 landmark가 화면에 남아있음

### 원인

Canvas 초기화 누락

### 해결

```js
ctx.clearRect(0, 0, canvas.width, canvas.height);
```

---

# 향후 계획

- 얼굴 회전 분석 기능 추가
- 얼굴 움직임 패턴 분석
- AutoEncoder 기반 이상 탐지 적용
- 사진 및 영상 spoofing 탐지 고도화
- 실시간 인증 정확도 향상

---

# 시연 화면

## 웹캠 입력 및 FaceMesh landmark 분석

(이미지 추가 예정)

---

# 기대 효과

- 얼굴 인증 보안 강화
- 사진 기반 spoofing 공격 방지
- 생체 반응 기반 인증 시스템 구현
- 실시간 얼굴 인증 기술 활용 가능

---
