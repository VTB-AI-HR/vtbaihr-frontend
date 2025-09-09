import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { styled, keyframes } from "@mui/system";
import AutorenewIcon from "@mui/icons-material/Autorenew";

// Pulsing animation
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
`;

const RecordingButton = styled(IconButton)(() => ({
  animation: `${pulse} 1.5s infinite`,
  backgroundColor: "#ef5350",
  color: "white",
  "&:hover": {
    backgroundColor: "#d32f2f",
  },
}));

// ---------------- Types ----------------
interface Message {
  type: "bot" | "user";
  text: string;
  audioUrl?: string;
  style?: 'bold' | 'normal';
}

export interface StartInterviewResponse {
  message_to_candidate: string;
  total_question: number;
  question_id: number;
  llm_audio_filename: string;
  llm_audio_fid: string;
}

export interface Question {
  id: number;
  vacancy_id: number;
  question: string;
  hint_for_evaluation: string;
  weight: number;
  question_type: "soft" | "hard" | 'soft-hard';
  response_time: number;
  created_at: string;
}

export interface SubmitAnswerResponse {
  question_id: number;
  message_to_candidate: string;
  interview_result: Record<string, unknown>;
  llm_audio_filename?: string;
  llm_audio_fid?: string;
}

// ---------------- Countdown Component ----------------
const CountdownTimer = ({
  initialSeconds,
  onExpire,
}: {
  initialSeconds: number;
  onExpire?: () => void;
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSeconds(initialSeconds);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [initialSeconds, onExpire]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return <Typography variant="h6" align="center" fontWeight={600} mb={2}>Время на ответ: {formatTime(seconds)}</Typography>;
};

// ---------------- Component ----------------
const InterviewApp = () => {
  const { interview_id, vacancy_id } = useParams<{ interview_id: string, vacancy_id: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewState, setInterviewState] = useState<StartInterviewResponse | null>(null);
  const [showEndInterviewModal, setShowEndInterviewModal] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [currentQuestionTime, setCurrentQuestionTime] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial welcome
  useEffect(() => {
    const welcomeMessage = `Здравствуйте!\nПоздравляю с прохождением до этапа интервью.\n\nВам будут заданы вопросы с целью проверить ваши навыки и опыт.\n\nКак будете готовы — нажмите кнопку “Начать интервью”`;
    setMessages([{ type: "bot", text: welcomeMessage, style: 'normal' }]);
  }, []);

  const fetchCurrentQuestionTime = useCallback(async () => {
    try {
      const res = await fetch(`https://vtb-aihr.ru/api/vacancy/question/all/${vacancy_id}`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      const questions: Question[] = await res.json();
      const current = questions.find((q) => q.id === interviewState?.question_id);
      setCurrentQuestionTime(current?.response_time && current.response_time * 60 || 120);
    } catch (err) {
      console.error(err);
      setCurrentQuestionTime(120);
    }
  }, [interviewState?.question_id]);

  // ---------------- API ----------------
  const startInterview = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`https://vtb-aihr.ru/api/vacancy/interview/start/${interview_id}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to start interview");
      const data: StartInterviewResponse = await res.json();
      setInterviewState(data);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: data.message_to_candidate,
          audioUrl: data.llm_audio_fid ? `https://vtb-aihr.ru/api/vacancy/interview/audio/${data.llm_audio_fid}/${data.llm_audio_filename}` : undefined,
        },
      ]);
      fetchCurrentQuestionTime();
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { type: "bot", text: "Failed to start the interview. Please try again." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const userMessage: Message = { type: "user", text: "Ответ записан", audioUrl: URL.createObjectURL(audioBlob) };
        setMessages((prev) => [...prev, userMessage]);
        sendAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { type: "bot", text: "Could not access your microphone. Please allow access and try again." }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current!);
    }
  };

  const sendAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("question_id", String(interviewState?.question_id || ""));
    formData.append("interview_id", interview_id || "");
    formData.append("audio_file", audioBlob, "audio.webm");

    try {
      const res = await fetch("https://vtb-aihr.ru/api/vacancy/interview/answer", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to submit response");
      const data: SubmitAnswerResponse = await res.json();

      if (Object.keys(data.interview_result).length > 0) {
        setIsInterviewComplete(true);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: `Спасибо за прохождение интервью!\nМы проанализируем ваши ответы и свяжемся с вами в случае положительного решения`,
            style: 'normal'
          },
        ]);

      } else {
        setInterviewState((prev) => ({
          ...prev!,
          question_id: data.question_id,
          message_to_candidate: data.message_to_candidate,
          llm_audio_filename: data.llm_audio_filename!,
          llm_audio_fid: data.llm_audio_fid!,
        }));
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: data.message_to_candidate,
            audioUrl: data.llm_audio_fid ? `https://vtb-aihr.ru/api/vacancy/interview/audio/${data.llm_audio_fid}/${data.llm_audio_filename}` : undefined,
          },
        ]);
        if (vacancy_id) fetchCurrentQuestionTime();
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { type: "bot", text: "Failed to submit your response. Please try again." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndInterviewEarly = () => navigate("/vacancies");

  // ---------------- UI ----------------
  const MessageBubble = ({ message }: { message: Message }) => {
    const isBot = message.type === "bot";
    const align = isBot ? "flex-start" : "flex-end";
    const bgColor = isBot ? "white" : "#EDF6FF";
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
      if (!audioRef.current) return;
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };

    return (
      <Stack direction="row" alignItems="flex-start" justifyContent={align} sx={{ mb: 2 }}>
        {isBot && <Box component="img" src="/favicon.png" alt="avatar" sx={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />}
        <Paper sx={{ backgroundColor: bgColor, color: "black", flexDirection: "row", flexGrow: 1 }}>
          <Typography sx={{ whiteSpace: 'pre-line', fontWeight: message.style === 'normal' ? 500 : 600 }}>{message.text}</Typography>
          {message.audioUrl && (
            <>
              <audio ref={audioRef} src={message.audioUrl} onEnded={() => setIsPlaying(false)} />
              <Typography onClick={togglePlay} variant="body2" sx={{ mr: 1, cursor: 'pointer', fontWeight: 500, color: '#3361EC', display: 'flex', alignItems: 'center', mt: 1 }}>
                <IconButton size="small" sx={{
                  height: 22,
                  width: 22,
                  mr: 1,
                  backgroundColor: "#3361EC",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#2549C5", // slightly darker for hover
                  },
                }}>
                  {isPlaying ? <PauseIcon style={{height: 18}} /> : <PlayArrowIcon style={{height: 18}} />}
                </IconButton>
                {isBot ? "Прослушать вопрос" : "Прослушать ответ"}
              </Typography>
            </>
          )}
        </Paper>
        {!isBot && <Box component="img" src="/user.png" alt="avatar" sx={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />}
      </Stack>
    );
  };

  const renderControls = () => {
    if (isInterviewComplete) return (
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <Button fullWidth size="large" variant="contained" color="primary" onClick={() => navigate("/vacancies")}>Вернуться к вакансиям</Button>
      </Box>
    );

    if (!interviewState && messages.length > 0) return (
      <Box sx={{ width: "100%", justifyContent: "center" }}>
        <Typography display="block" align="center" mb={1} color="#778093" variant="caption">Пройти интервью можно только один раз</Typography>
        <Button variant="contained" color="primary" onClick={startInterview} size="large" fullWidth>Начать интервью</Button>
      </Box>
    );

    if (isRecording) return (
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h6" fontWeight={600} mb={1}>{`${Math.floor(recordingTime / 60).toString().padStart(2, "0")}:${(recordingTime % 60).toString().padStart(2, "0")}`}</Typography>
        <RecordingButton sx={{ width: 80, height: 80 }} onClick={stopRecording}><StopIcon sx={{ fontSize: 50 }} /></RecordingButton>
      </Box>
    );

    return (
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <Button variant="outlined" color="error" onClick={() => setShowEndInterviewModal(true)}>Завершить досрочно</Button>
        {isProcessing ? (
          <Button variant="contained" color="primary" endIcon={<AutorenewIcon />}>Обработка ответа</Button>
        ) : (
          <Button variant="contained" color="primary" startIcon={<MicIcon />} onClick={startRecording}>Записать ответ</Button>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", maxWidth: 560, mx: "auto" }}>
      <Typography mb={3} mt={3} variant="h4" fontWeight={600} gutterBottom>Интервью</Typography>
      <Box sx={{ flexGrow: 1, overflowY: "auto", borderRadius: "1rem", mb: 2, display: "flex", flexDirection: "column" }}>
        {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
        <div ref={chatBottomRef} />
      </Box>
      {currentQuestionTime !== null && !isInterviewComplete && <CountdownTimer initialSeconds={currentQuestionTime} />}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 100 }}>{renderControls()}</Box>

      <Dialog open={showEndInterviewModal} onClose={() => setShowEndInterviewModal(false)}>
        <DialogTitle>Завершение интервью</DialogTitle>
        <DialogContent>
          <Typography>Вы уверены, что хотите завершить интервью досрочно? На прохождение интервью даётся только одна попытка.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEndInterviewModal(false)}>Назад</Button>
          <Button onClick={handleEndInterviewEarly} color="error" autoFocus>Завершить досрочно</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewApp;
