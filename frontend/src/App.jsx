import { useEffect, useRef } from "react";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);

  useEffect(() => {
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
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results) => {
        if (results.multiFaceLandmarks?.length > 0) {
          console.log("얼굴 감지됨");
        } else {
          console.log("얼굴 없음");
        }
      });

      setInterval(async () => {
        if (webcamRef.current?.video) {
          await faceMesh.send({
            image: webcamRef.current.video,
          });
        }
      }, 100);
    };

    document.body.appendChild(script);
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
      <p>MediaPipe FaceMesh 연결 테스트</p>

      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored={true}
        width={640}
        height={480}
      />

      <p>F12 → Console에서 얼굴 감지 여부 확인</p>
    </div>
  );
}

export default App;