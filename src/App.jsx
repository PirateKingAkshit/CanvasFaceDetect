import { IoMdCloudUpload } from "react-icons/io"; // Icon for upload button
import { FaPlay, FaPause, FaBackward, FaForward } from "react-icons/fa"; // Icons for play, pause, backward, and forward buttons
import * as faceapi from "face-api.js"; // Face detection library
import { useEffect, useRef, useState } from "react"; // React hooks

function App() {
  const videoRef = useRef(null); // Reference to the video element
  const [selectedFile, setSelectedFile] = useState(null); // State to store the selected video file
  const [isPlaying, setIsPlaying] = useState(false); // State to track if the video is playing
  const [showControls, setShowControls] = useState(false); // State to control display of playback controls

  // Function to update the displayed file name in the label after selecting a video file
  const updateFileName = (input) => {
    const label = input.nextElementSibling;
    const fileName = input.files[0]?.name || "Select a file";
    label.textContent = fileName;
    setSelectedFile(input.files[0]);
  };

  // Function to handle the video upload and start face detection
  const handleUpload = () => {
    const video = videoRef.current;
    if (!selectedFile || !video) {
      alert("Please Upload Video");
      return;
    }

    const videoSrc = URL.createObjectURL(selectedFile);
    video.src = videoSrc;
    video.addEventListener("loadeddata", () => {
      setIsPlaying(true);
      setShowControls(true);
      detectFace();
    });
  };

  // Function to load face detection models on component mount
  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);
    };
    loadModels();
  }, []);

  // Effect to handle play and pause events of the video
  useEffect(() => {
    const video = videoRef.current;

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    if (video) {
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);

      return () => {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
      };
    }
  }, []);

  // Function to perform face detection on the video frames
  const detectFace = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = faceapi.createCanvasFromMedia(video);
    const videoContainer = document.querySelector(".video_container");
    videoContainer.appendChild(canvas);

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 100);
  };

  // Function to toggle video play and pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  // Function to handle forwarding the video by 5 seconds
  const handleForward = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime += 5; // Forward by 5 seconds, you can adjust as needed
    }
  };

  // Function to handle rewinding the video by 5 seconds
  const handleBackward = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime -= 5; // Backward by 5 seconds, you can adjust as needed
    }
  };

  return (
    <>
      {/* Upload Container start */}
      <div className="upload_container">
        <input
          type="file"
          id="fileInput"
          className="file-input"
          accept="video/*"
          onChange={(e) => {
            updateFileName(e.target);
          }}
        />
        <label htmlFor="fileInput" className="file-label">
          Select Video
        </label>
        <button className="upload_button" onClick={handleUpload}>
          <IoMdCloudUpload style={{ fontSize: "20px", marginRight: "5px" }} />
          Upload
        </button>
      </div>
      <div className="divider"></div>
      {/* Upload Container end */}

      <div className="video_container">
        <video
          ref={videoRef}
          id="videoElementId"
          className="videoElement"
          width="600px"
          height="450px"
          autoPlay
          muted
        ></video>
      </div>
      {/* Display playback controls */}
      {showControls && (
        <div className="play_pause_button">
          <button onClick={handleBackward}><FaBackward/></button>
          <button onClick={togglePlay}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={handleForward}><FaForward/></button>
        </div>
      )}
    </>
  );
}

export default App;




