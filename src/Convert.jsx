import React, { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

function Convert(props) {
  const [loaded, setLoaded] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef(null);
  const messageRef = useRef(null);

  const { recordedChunks } = props;

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      console.log("message", message);
      // if (messageRef.current) messageRef.current.innerHTML = message;
    });
    ffmpeg.on("progress", ({ time }) => {
      if (messageRef.current)
        messageRef.current.innerHTML =
          "Time: " + Math.floor(time / 1000) + " seconds";
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

  const transcode = async () => {
    const blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    const url = URL.createObjectURL(blob);
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile("input.webm", await fetchFile(url));
    await ffmpeg.exec(["-i", "input.webm", "output.mp4"]);
    const fileData = await ffmpeg.readFile("output.mp4");
    const data = new Uint8Array(fileData);
    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
      setIsProcessed(true);
    }
  };

  const handleDownload = React.useCallback(async () => {
    if (recordedChunks.length) {
      const url = videoRef.current.src;
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "react-webcam-stream-capture.mp4";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }, [recordedChunks]);

  React.useEffect(() => {
    load();
  }, []);

  return loaded ? (
    <>
      <h2 className="text-1xl uppercase underline mb-2">Preview</h2>
      {recordedChunks.length > 0 && (
        <button
          className="mt-2 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
          onClick={transcode}
        >
          Convert to mp4
        </button>
      )}
      <video
        ref={videoRef}
        controls
        style={{ display: isProcessed ? "block" : "none" }}
        className="w-80"
      />
      {!isProcessed && (
        <div
          role="status"
          className="flex items-center justify-center h-64 w-80 max-w-sm bg-gray-300 rounded-lg dark:bg-gray-700"
        >
          <svg
            className="w-14 h-14 text-gray-200 dark:text-gray-600"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 20"
          >
            <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
            <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM9 13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2Zm4 .382a1 1 0 0 1-1.447.894L10 13v-2l1.553-1.276a1 1 0 0 1 1.447.894v2.764Z" />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      )}

      <p className="my-2" ref={messageRef}></p>
      {isProcessed && (
        <button
          className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          onClick={handleDownload}
        >
          Download
        </button>
      )}
    </>
  ) : (
    <>
      <h4>Loading module...</h4>
      <button
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        onClick={load}
      >
        Load ffmpeg-core
      </button>
    </>
  );
}

export default Convert;
