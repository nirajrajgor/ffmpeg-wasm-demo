import WebcamStreamCapture from "./WebcamStreamCapture.jsx";

function App() {
  return (
    <>
      <WebcamStreamCapture />
      <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded md:my-10 dark:bg-gray-700" />
      <div className="text-center mb-4">
        <a
          href="https://github.com/nirajrajgor/ffmpeg-wasm-demo"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          Github
        </a>
      </div>
    </>
  );
}

export default App;
