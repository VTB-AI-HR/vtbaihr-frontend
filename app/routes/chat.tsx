import { useState, useRef } from "react";

export default function Chat() {
  const [recording, setRecording] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [response, setResponse] = useState<{ text?: string; audioUrl?: string } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      // Open SSE/WebSocket/Fetch streaming to backend
      const ws = new WebSocket("ws://localhost:3000/stream");
      ws.binaryType = "arraybuffer";

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          e.data.arrayBuffer().then((buf) => ws.send(buf));
        }
      };

      mediaRecorder.onstop = () => {
        ws.send("__END__");
        setWaiting(true);

          ws.onmessage = (msg) => {
            try {
              const data = JSON.parse(msg.data);
              if (data.audioBase64) {
                const byteArray = Uint8Array.from(atob(data.audioBase64), c => c.charCodeAt(0));
                const blob = new Blob([byteArray], { type: data.mime || "audio/webm" });
                const url = URL.createObjectURL(blob);
                setResponse({ text: data.text, audioUrl: url });
                console.log('Audio URL:', 'url');
              } else {
                setResponse({ text: data.text });
              }
              setWaiting(false);
            } catch {
              console.error("Invalid response", msg.data);
            }
          };

      };

      mediaRecorder.start(500); // send chunks every 500ms
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
    } catch (err) {
      console.error("Error starting recording", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    setRecording(false);
  };

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <h1 className="text-xl font-bold">Voice Mode</h1>

        <div className="flex gap-4">
          <button
            onClick={startRecording}
            disabled={recording}
            className="bg-green-500 text-white px-6 py-3 rounded-full shadow"
          >
            🎤 Start
          </button>
          <button
            onClick={stopRecording}
            disabled={!recording}
            className="bg-red-500 text-white px-6 py-3 rounded-full shadow"
          >
            ⏹ Stop
          </button>
        </div>

        {waiting && <p className="text-gray-500">Waiting for robot...</p>}

        {response && (
          <div className="flex flex-col items-center gap-2">
            {response.text && <p className="text-gray-900">{response.text}</p>}
            {response.audioUrl && <audio controls src={response.audioUrl} />}
          </div>
        )}
      </div>
    </main>
  );
}
