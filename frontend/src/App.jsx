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
          Math.pow((nose.x - mouth.x) * canvas.width, 2) + Math.pow((nose.y - mouth.y) * canvas.height, 2)
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

        const eyeDistanceLeft = Math.abs(leftEyeTop.y - leftEyeBottom.y);
        const eyeDistanceRight = Math.abs(rightEyeTop.y - rightEyeBottom.y);

        console.log("왼쪽 눈 거리:", eyeDistanceLeft);
        console.log("오른쪽 눈 거리:", eyeDistanceRight);
        
        if (eyeDistanceLeft < blinkThreshold || eyeDistanceRight < blinkThreshold) {
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
          border: "2px solid white",
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

      <p
        style={{
          marginTop: "20px",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        {result}
      </p>

      <button
        onClick={startAnalysis}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        분석 시작
      </button>
    </div>
  );
}

export default App;