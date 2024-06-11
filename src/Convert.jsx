import React, { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
// import myVideo from "./react-webcam-stream-capture.webm";

function Convert(props) {
  const [loaded, setLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef(null);
  const messageRef = useRef(null);

  const { recordedChunks } = props;
  console.log("recordedChunks inside", recordedChunks);

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    ffmpeg
      .load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
        workerURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          "text/javascript"
        ),
      })
      .then((data) => {
        console.log("Data loaded", data);
        setLoaded(true);
      })
      .catch((err) => {
        console.log("Error", err);
      });
  };

  const transcode = async (videoData) => {
    const blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    const url = URL.createObjectURL(blob);
    const videoURL =
      "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm";
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile("input.webm", await fetchFile(url));
    await ffmpeg.exec(["-i", "input.webm", "output.mp4"]);
    const fileData = await ffmpeg.readFile("output.mp4");
    const data = new Uint8Array(fileData);
    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  return loaded ? (
    <>
      <video ref={videoRef} controls></video>
      <br />
      <button onClick={() => transcode(recordedChunks)}>
        Transcode webm to mp4
      </button>
      <p ref={messageRef}></p>
    </>
  ) : (
    <button onClick={load}>Load ffmpeg-core</button>
  );
}

export default Convert;
