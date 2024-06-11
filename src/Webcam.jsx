import React from "react";
import Webcam from "react-webcam";

import mp4Video from "./react-webcam-stream-capture.mp4";

import webmToMp4 from "webm-to-mp4";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const WebcamStreamCapture = () => {
  const webcamRef = React.useRef(null);
  const mediaRecorderRef = React.useRef(null);
  const [capturing, setCapturing] = React.useState(false);
  const [recordedChunks, setRecordedChunks] = React.useState([]);
  const [data, setData] = React.useState(null);

  const myRef = React.useRef(null);

  const handleStartCaptureClick = React.useCallback(() => {
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      //   mimeType: "video/webm",
      mimeType: "video/webm;codecs=h264",
    });
    // Check if recording in video / webm format is possible.
    const isVideoFormatSupported = MediaRecorder.isTypeSupported("video/mp4");
    console.log("isVideoFormatSupported", isVideoFormatSupported);
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = React.useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = React.useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  const handleDownload = React.useCallback(async () => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      setData(url);

      /**  Preload data
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = function (oEvent) {
        var blob = new Blob([oEvent.target.response], { type: "video/webm" });
        myRef.current.src = URL.createObjectURL(blob);
        //video.play()  if you want it to play on load
      };
      xhr.onprogress = function (oEvent) {
        if (oEvent.lengthComputable) {
          var percentComplete = oEvent.loaded / oEvent.total;
          // do something with this
        }
      };
      xhr.send();
      */

      console.log("HERER====", url);

      const ffmpeg = new FFmpeg();
      await ffmpeg.load();

      await ffmpeg.writeFile(
        "input.webm",
        //   url
        await fetchFile(
          "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm"
        )
      );

      console.log("ENd====");
      await ffmpeg.exec(["-i", "input.webm", "output.mp4"]);
      const data = await ffmpeg.readFile("output.mp4");
      myRef.current.src = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
      console.log("myRef.current.src", myRef.current.src);

      //   const a = document.createElement("a");
      //   document.body.appendChild(a);
      //   a.style = "display: none";
      //   a.href = url;
      //   a.download = "react-webcam-stream-capture.webm";
      //   a.click();
      //   window.URL.revokeObjectURL(url);
      //   setRecordedChunks([]);
    }
  }, [recordedChunks]);

  React.useEffect(() => {}, []);

  console.log("recordedChunks", recordedChunks);

  return (
    <>
      <Webcam audio={false} mirrored={true} ref={webcamRef} />
      {capturing ? (
        <button onClick={handleStopCaptureClick}>Stop Capture</button>
      ) : (
        <button onClick={handleStartCaptureClick}>Start Capture</button>
      )}
      {recordedChunks.length > 0 && (
        <button onClick={handleDownload}>Download</button>
      )}
      {/* <video controls src={mp4Video} width="420">
        <a href="https://archive.org/details/BigBuckBunny_124">download it</a>
        and watch it with your favorite video player!
      </video> */}

      <video
        ref={myRef}
        muted="muted"
        controls
        // src="https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4"
        poster="https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217"
        width="420"
        preload="auto"
      >
        {/* Sorry, your browser doesn't support embedded videos, but don't worry,
        you can */}
        <a href="https://archive.org/details/BigBuckBunny_124">download it</a>
        and watch it with your favorite video player!
      </video>
      {data ? (
        <video controls width="350" preload="auto">
          <source src={data} type="video/webm" />
          {/* <source src="/media/cc0-videos/flower.webm" type="video/webm" /> */}
          {/* <source src="/media/cc0-videos/flower.mp4" type="video/mp4" /> */}
          {/* Download the
        <a href="/media/cc0-videos/flower.webm">WEBM</a>
        or
        <a href="/media/cc0-videos/flower.mp4">MP4</a>
        video. */}
        </video>
      ) : null}
    </>
  );
};

export default WebcamStreamCapture;

//   ReactDOM.render(<WebcamStreamCapture />, document.getElementById("root"));

// https://www.npmjs.com/package/react-webcam
