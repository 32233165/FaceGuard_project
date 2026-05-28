import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

function App() {
  // 웹캠 참조
  const webcamRef = useRef(null);

  // FaceMesh 시작 플래그
  const faceMeshStartedRef = useRef(false);

  // 눈 깜빡임 감지 여부
  const blinkDetectedRef = useRef(false);

  // 분석 시작 시간
  const analysisStartTimeRef = useRef(null);

  // 분석 중인지 여부
  const isAnalyzingRef = useRef(false);

  // 최종 결과 메시지
  const [result, setResult] = useState("분석 시작 버튼을 눌러주세요.");

  const startAnalysis = () => {
    setResult("분석 중입니다. 눈을 한 번 깜빡여주세요.");

    isAnalyzingRef.current = true;
    blinkDetectedRef.current = false;
    analysisStartTimeRef.current = null;
  };

  useEffect(() => {
    if (faceMeshStartedRef.current) return;
    faceMeshStartedRef.current = true;

    let intervalId = null;

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";

    script.onload = () => {
      const faceMesh = new window.FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results) => {
        const landmarks = results.multiFaceLandmarks?.[0];

        const canvas = document.getElementById("canvas");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!landmarks) {
          if (isAnalyzingRef.current) {
            setResult("얼굴을 찾을 수 없습니다.");
          }
          return;
        }

        // =========================
        // 1. landmark 점 그리기
        // =========================
        for (const point of landmarks) {
          ctx.beginPath();
          ctx.arc(
            point.x * canvas.width,
            point.y * canvas.height,
            1.5,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = "#00ffcc";
          ctx.fill();
        }

        // 분석 시작 버튼을 누르지 않았으면 점만 그리고 종료
        if (!isAnalyzingRef.current) return;

        if (!analysisStartTimeRef.current) {
          analysisStartTimeRef.current = Date.now();
        }

        const elapsedTime = Date.now() - analysisStartTimeRef.current;

        // =========================
        // 2. 눈 깜빡임 판별
        // =========================
        const leftEyeTop = landmarks[159];
        const leftEyeBottom = landmarks[145];

        const eyeDistance = Math.abs(leftEyeTop.y - leftEyeBottom.y);
        console.log("눈 깜빡임 정도:", eyeDistance);

        const blinkThreshold = 0.01;

        if (eyeDistance < blinkThreshold) {
          blinkDetectedRef.current = true;
          console.log("눈 깜빡임 감지됨");
        }

        // =========================
        // 3. 5초 후 최종 결과 출력
        // =========================
        if (elapsedTime >= 5000) {
          isAnalyzingRef.current = false;

          if (blinkDetectedRef.current) {
            setResult("실제 사람입니다.");
          } else {
            setResult("실제 사람이 아닙니다.");
          }
        }
      });

      intervalId = setInterval(async () => {
        if (webcamRef.current?.video) {
          const video = webcamRef.current.video;

          if (video.readyState < 2) return;

          await faceMesh.send({
            image: video,
          });
        }
      }, 100);
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

      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
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
      <h1>FaceGuard</h1>

      <p>AI 기반 생체인식 인증 보안 시스템</p>

      <div
        style={{
          position: "relative",
          width: "640px",
          height: "480px",
        }}
      >
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

        <canvas
          id="canvas"
          width={640}
          height={480}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "scaleX(-1)",
          }}
        />
      </div>

      <p>{result}</p>

      <button onClick={startAnalysis}>분석 시작</button>
    </div>
  );
}

export default App;