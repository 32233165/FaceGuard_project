import { useEffect, useRef } from "react";
import Webcam from "react-webcam";

function App() {

  // 웹캠 참조
  const webcamRef = useRef(null);

  useEffect(() => {

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
        refineLandmarks: true,

        // 얼굴 탐지 최소 정확도
        minDetectionConfidence: 0.5,

        // 얼굴 추적 최소 정확도
        minTrackingConfidence: 0.5,
      });

      // 얼굴 분석 결과 처리
      faceMesh.onResults((results) => {

        // canvas 가져오기
        const canvas = document.getElementById("canvas");

        // canvas 그리기 context 생성
        const ctx = canvas.getContext("2d");

        // 이전 프레임 삭제
        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        // 얼굴 landmark 존재 여부 확인
        if (results.multiFaceLandmarks) {

          // 얼굴마다 반복
          for (const landmarks of results.multiFaceLandmarks) {

            // landmark 점 반복
            for (const point of landmarks) {

              // 점 그리기 시작
              ctx.beginPath();

              // FaceMesh 처리
              ctx.arc(
                point.x * canvas.width,
                point.y * canvas.height,

                // 점 크기
                3,

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
      setInterval(async () => {

        // 웹캠 연결 확인
        if (webcamRef.current?.video) {

          // 현재 웹캠 화면 분석
          await faceMesh.send({
            image: webcamRef.current.video,
          });
        }

      }, 100);
    };

    // script를 body에 추가
    document.body.appendChild(script);

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
            transform: "scaleX(-1)",
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
          }}
        />
      </div>

      {/* 상태 메시지 */}
      <p>
        얼굴 Landmark 분석 중...
      </p>
    </div>
  );
}

export default App;