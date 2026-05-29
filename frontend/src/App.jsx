import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);
  const faceMeshStartedRef = useRef(false);

  const initialRatioRef = useRef(null);
  const ratioChangeCountRef = useRef(0);

  const analysisStartTimeRef = useRef(null);
  const isAnalyzingRef = useRef(false);

  const blinkDetectedRef = useRef(false);

  const maxRatioDifferenceRef = useRef(0);

  const [result, setResult] = useState("분석 시작 버튼을 눌러주세요.");

  const startAnalysis = () => {
    setResult("분석 중입니다. 얼굴을 움직이거나 눈을 깜빡여주세요.");

    isAnalyzingRef.current = true;
    initialRatioRef.current = null;
    ratioChangeCountRef.current = 0;
    analysisStartTimeRef.current = null;
    maxRatioDifferenceRef.current = 0;

    blinkDetectedRef.current = false;
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
        minDetectionConfidence: 0.3,
        minTrackingConfidence: 0.3,
      });

      faceMesh.onResults((results) => {
        const canvas = document.getElementById("canvas");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const landmarks = results.multiFaceLandmarks?.[0];

        if (!landmarks) {
          if (isAnalyzingRef.current) {
            setResult("얼굴을 찾을 수 없습니다.");
          }
          return;
        }

        // landmark 점 그리기
        ctx.fillStyle = "#00ffcc";

        for (const point of landmarks) {
          ctx.beginPath();
          ctx.arc(
            point.x * canvas.width,
            point.y * canvas.height,
            3,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }

        // 분석 버튼 누르기 전에는 점만 표시
        if (!isAnalyzingRef.current) return;

        if (!analysisStartTimeRef.current) {
          analysisStartTimeRef.current = Date.now();
        }
        const elapsedTime = Date.now() - analysisStartTimeRef.current;

        // 왼쪽 눈
        const leftEye = landmarks[33];
        // 오른쪽 눈
        const rightEye = landmarks[263];
        // 코
        const nose = landmarks[1];
        // 입
        const mouth = landmarks[13];

        const eyeDistance = Math.sqrt(
          Math.pow(leftEye.x - rightEye.x, 2) + Math.pow(leftEye.y - rightEye.y, 2)
        );

        const noseMouthDistance = Math.sqrt(
          Math.pow((nose.x - mouth.x) * canvas.width, 2)
           + Math.pow((nose.y - mouth.y) * canvas.height, 2)
        );

        const ratio = noseMouthDistance / eyeDistance;

        if (initialRatioRef.current === null) {
          initialRatioRef.current = ratio;
        }

        const ratioDifference = Math.abs(ratio - initialRatioRef.current);

        // 눈 깜빡임 판별
        const leftEyeTop = landmarks[159];
        const leftEyeBottom = landmarks[145];
        const rightEyeTop = landmarks[386];
        const rightEyeBottom = landmarks[374];
        const blinkThreshold = 0.022; // 눈 깜빡임 감지 임계값

        const eyeDistanceLeft = 
          Math.abs(leftEyeTop.y - leftEyeBottom.y);
        const eyeDistanceRight = 
          Math.abs(rightEyeTop.y - rightEyeBottom.y);

        console.log("왼쪽 눈 거리:", eyeDistanceLeft);
        console.log("오른쪽 눈 거리:", eyeDistanceRight);
        
        if (eyeDistanceLeft < blinkThreshold || 
          eyeDistanceRight < blinkThreshold) {
          blinkDetectedRef.current = true;
          console.log("눈 깜빡임 감지됨");
        }

        // 최대 비율 변화량 업데이트
        if (ratioDifference > maxRatioDifferenceRef.current) {
          maxRatioDifferenceRef.current = ratioDifference;
        }

        console.log("현재 비율:", ratio);
        console.log("비율 변화량:", ratioDifference);
        console.log("최대 비율 변화량:", maxRatioDifferenceRef.current);

        // 판별 결과
        if (elapsedTime >= 3000) {
          isAnalyzingRef.current = false;

          if (maxRatioDifferenceRef.current >= 2 && blinkDetectedRef.current){
            setResult("실제 사람입니다.");
          } else {
            setResult ("공격으로 의심됩니다. 다시 시도해주세요.");
          }
        }
      });

      intervalId = setInterval(async () => {
        const video = webcamRef.current?.video;

        if (!video) return;
        if (video.readyState < 2) return;

        await faceMesh.send({ image: video });
      }, 150);
    };

    document.body.appendChild(script);

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
      background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e3a8a 100%)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      padding: "30px",
    }}
  >
    <h1
      style={{
        fontSize: "48px",
        marginBottom: "8px",
        letterSpacing: "1px",
      }}
    >
      FaceGuard
    </h1>

    <p
      style={{
        fontSize: "20px",
        color: "#cbd5e1",
        marginBottom: "30px",
      }}
    >
      생체인식 인증 보안 시스템
    </p>

    <div
      style={{
        padding: "18px",
        borderRadius: "24px",
        background: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.45)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "640px",
          height: "480px",
          borderRadius: "18px",
          overflow: "hidden",
          border: "2px solid rgba(255, 255, 255, 0.7)",
          backgroundColor: "#000",
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
            width: "640px",
            height: "480px",
            zIndex: 1,
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
            width: "640px",
            height: "480px",
            zIndex: 10,
            pointerEvents: "none",
            transform: "scaleX(-1)",
          }}
        />
      </div>
    </div>

    <div
      style={{
        marginTop: "24px",
        padding: "14px 32px",
        borderRadius: "999px",
        background:
          result.includes("실제") 
            ? "rgba(34, 197, 94, 0.2)" 
            : result.includes("공격") 
            ? "rgba(239, 68, 68, 0.2)" 
            : "rgba(255, 255, 255, 0.12)",
        border:
          result.includes("실제") 
            ? "1px solid #22c55e" 
            : result.includes("공격") 
            ? "1px solid #ef4444" 
            : "1px solid rgba(255, 255, 255, 0.3)",
        fontSize: "24px",
        fontWeight: "bold",
      }}
    >
      {result}
    </div>

    <button
      onClick={startAnalysis}
      style={{
        marginTop: "20px",
        padding: "14px 36px",
        fontSize: "18px",
        fontWeight: "bold",
        color: "white",
        background: "linear-gradient(135deg, #2563eb, #06b6d4)",
        border: "none",
        borderRadius: "999px",
        cursor: "pointer",
        boxShadow: "0 10px 30px rgba(37, 99, 235, 0.4)",
      }}
    >
      분석 시작
    </button>
  </div>
);
}

export default App;