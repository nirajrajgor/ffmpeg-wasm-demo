import React from "react";
import Webcam from "react-webcam";
import Convert from "./Convert.jsx";

const WebcamStreamCapture = () => {
  const webcamRef = React.useRef(null);
  const mediaRecorderRef = React.useRef(null);
  const [capturing, setCapturing] = React.useState(false);
  const [recordedChunks, setRecordedChunks] = React.useState([]);

  const handleStartCaptureClick = React.useCallback(() => {
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = React.useCallback(
    ({ data }) => {
      if (data.size > 0) {
        // To record all the frames
        // setRecordedChunks((prev) => prev.concat(data));
        // To record only the last frame
        setRecordedChunks([data]);
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = React.useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  return (
    <>
      <section className="flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-2">Webcam</h2>
        <Webcam
          audio={false}
          mirrored={true}
          ref={webcamRef}
          className="w-80"
        />
        <div className="flex pt-2">
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 disabled:cursor-not-allowed disabled:opacity-75"
            onClick={handleStartCaptureClick}
            disabled={capturing}
          >
            Start Capture
          </button>
          <button
            className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 disabled:cursor-not-allowed disabled:opacity-75"
            onClick={handleStopCaptureClick}
            disabled={!capturing}
          >
            Stop Capture
          </button>
        </div>
      </section>
      <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
      <section className="flex flex-col items-center justify-center">
        <Convert recordedChunks={recordedChunks} />
      </section>
    </>
  );
};

export default WebcamStreamCapture;
