import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

function App() {

  // 웹캠 참조
  const webcamRef = useRef(null);
  // FaceMesh 시작 플래그
  const faceMeshStartedRef = useRef(false);
  // 이전 랜드마크 저장
  const previousLandmarksRef = useRef(null);
  const blinkDetectedRef = useRef(false);
  const analysisStartTimeRef = useRef(null);
  const isAnalyzingRef = useRef(false);
  const movementDetectedRef = useRef(false);
  // 결과 메시지
  const [result, setResult] = useState("분석 시작 버튼을 눌러주세요.");

  const startAnalysis = () => {
    setResult("분석 중...");
    isAnalyzingRef.current = false;
    blinkDetectedRef.current = false;
    movementDetectedRef.current = false;
    analysisStartTimeRef.current = null;
    previousLandmarksRef.current = null;
  };
  useEffect(() => {
    if (faceMeshStartedRef.current) return;
    faceMeshStartedRef.current = true;
    let intervalId = null;

    // MediaPipe FaceMesh 스크립트 로드
    const script = document.createElement("script");

    script.src =
      "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";

    script.onload = () => {

      // FaceMesh 객체 생성
      const faceMesh = new window.FaceMesh({

        // MediaPipe 모델 파일 위치
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      // FaceMesh 옵션 설정
      faceMesh.setOptions({

        // 최대 얼굴 수
        maxNumFaces: 1,

        // landmark 정밀도 향상
        refineLandmarks: false, // 테스트용으로 false 설정

        // 얼굴 탐지 최소 정확도
        minDetectionConfidence: 0.5,

        // 얼굴 추적 최소 정확도
        minTrackingConfidence: 0.5,
      });

      // 얼굴 분석 결과 처리
      faceMesh.onResults((results) => {
        const landmarks = results.multiFaceLandmarks?.[0];
        // 분석 결과 랜드마크 출력
        console.log(results.multiFaceLandmarks);

        // canvas 가져오기
        const canvas = document.getElementById("canvas");
        if (!canvas) return;

        // canvas 그리기 context 생성
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 이전 프레임 삭제
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!isAnalyzingRef.current) return;
        if (!analysisStartTimeRef.current) {
          analysisStartTimeRef.current = Date.now();
        }
        const elapsedTime = Date.now() - analysisStartTimeRef.current;

        // 얼굴 landmark 존재 여부 확인
        if (results.multiFaceLandmarks) {
          for (const landmarks of results.multiFaceLandmarks) {
            const leftEyeTop = landmarks[159];
            const leftEyeBottom = landmarks[145];

            const eyeDistance = Math.abs(leftEyeTop.y - leftEyeBottom.y);
            console.log("눈 깜빡임 정도: ", eyeDistance);

            if (eyeDistance < 0.006) {
              blinkDetectedRef.current = true;
            }

            const nose = landmarks[1];
            const previousLandmarks = previousLandmarksRef.current;

            if (previousLandmarks) {
              const previousNose = previousLandmarks[1];
              const noseMovement = Math.abs(nose.x - previousNose.x) + Math.abs(nose.y - previousNose.y);
              console.log("코 움직임 정도: ", noseMovement);

              if (noseMovement > 0.001) {
                movementDetectedRef.current = true;
              }
            }

            if (elapsedTime >= 3000) {
              isAnalyzingRef.current = false;

              if (
                blinkDetectedRef.current === true &&
                movementDetectedRef.current === true
              ) {
                setResult("실제 사람입니다.");
              } else {
                setResult("실제 사람이 아닙니다.");
              }
            }

            previousLandmarksRef.current = landmarks;

            // landmark 점 반복
            for (const point of landmarks) {
              // 점 그리기 시작
              ctx.beginPath();
              // FaceMesh 처리
              ctx.arc(
                point.x * canvas.width,
                point.y * canvas.height,
                // 점 크기
                1.5,
                // 시작 각도
                0,
                // 끝 각도
                2 * Math.PI
              );

              // 점 색상
              ctx.fillStyle = "#00ffcc";
              // 점 채우기
              ctx.fill();
            }
          }
        }
      });

      // 일정 시간 후 얼굴 분석 시작
      const intervalId = setInterval(async () => {

        // 웹캠 연결 확인
        if (webcamRef.current?.video) {
          const video = webcamRef.current.video;

          if (video.readyState < 2) return;

          // 현재 웹캠 화면 분석
          await faceMesh.send({
            image: webcamRef.current.video,
          });
        }

      }, 100); // 100ms마다 분석
    };

    if (document.querySelector(`script[src*="@mediapipe/face_mesh"]`)) {
    script.onload();
    } else {
      document.body.appendChild(script);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      document.body.removeChild(script);
    };
  }, []);

  return (

    // 전체 화면
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        color: "white",

        display: "flex",
        flexDirection: "column",

        alignItems: "center",
        justifyContent: "center",
      }}
    >

      {/* 프로젝트 제목 */}
      <h1>FaceGuard</h1>

      {/* 설명 */}
      <p>
        AI 기반 생체인식 인증 보안 시스템
      </p>

      {/* 웹캠 + canvas 영역 */}
      <div
        style={{
          position: "relative",

          width: "640px",
          height: "480px",
        }}
      >

        {/* 웹캠 */}
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored={true}
          width={640}
          height={480}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />

        {/* 얼굴 landmark 표시 canvas */}
        <canvas
          id="canvas"
          width={640}
          height={480}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "scaleX(-1)", // 웹캠과 동일하게 좌우 반전
          }}
        />
      </div>

      {/* 상태 메시지 */}
      <p> {result} </p>

      <button onClick={startAnalysis}>
        분석 시작
      </button>
    </div>
  );
}

export default App;