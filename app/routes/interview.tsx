import React, { useState, useEffect, useRef } from "react";
import { Box, Button, CircularProgress, Typography, Stack, Paper, IconButton } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SendIcon from '@mui/icons-material/Send';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import { styled, keyframes } from '@mui/system';

// Define the pulsing animation for the recording button
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
`;

// Styled button for recording animation
const RecordingButton = styled(IconButton)(({ theme }) => ({
  animation: `${pulse} 1.5s infinite`,
  backgroundColor: '#ef5350',
  color: 'white',
  '&:hover': {
    backgroundColor: '#d32f2f',
  },
}));

interface Message {
    type: 'bot' | 'user';
    content: string | Blob;
  }


// Main App Component
const InterviewApp = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [interviewData, setInterviewData] = useState({
    currentQuestionId: location.state?.question_id,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the chat when messages change
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initial setup: check for required IDs and add a welcome message
  useEffect(() => {
    if (!interviewId) {
      navigate("/");
      return;
    }
    const initialMessage = location.state?.message || "Добро пожаловать на собеседование. Нажмите кнопку воспроизведения, чтобы начать.";
    setMessages([{ type: 'bot', content: initialMessage }]);
  }, [interviewId, location.state?.message, navigate]);

  const startInterview = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`https://vtb-aihr.ru/api/vacancy/interview/start/${interviewId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to start interview');
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'bot', content: data.message_to_candidate }]);
      setInterviewData(prev => ({ ...prev, currentQuestionId: data.question_id }));
    } catch (err) {
      console.error("Error starting interview:", err);
      setMessages(prev => [...prev, { type: 'bot', content: "Failed to start the interview. Please try again." }]);
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

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setMessages(prev => [...prev, { type: 'user', content: audioBlob }]);
        sendAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setMessages(prev => [...prev, { type: 'bot', content: "Could not access your microphone. Please allow access and try again." }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("question_id", interviewData.currentQuestionId.toString());
    formData.append("interview_id", interviewId === undefined ? "" : interviewId);
    formData.append("audio_file", audioBlob, "audio.webm");

    try {
      const res = await fetch("https://vtb-aihr.ru/api/vacancy/interview/answer", {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to submit response');
      const data = await res.json();

      if (Object.keys(data.interview_result).length > 0) {
        setIsInterviewComplete(true);
        navigate("/thankyou", { state: { result: data.interview_result } });
      } else {
        setMessages(prev => [...prev, { type: 'bot', content: data.message_to_candidate }]);
        setInterviewData(prev => ({ ...prev, currentQuestionId: data.question_id }));
      }
    } catch (err) {
      console.error("Error submitting audio:", err);
      setMessages(prev => [...prev, { type: 'bot', content: "Failed to submit your response. Please try again." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderControls = () => {
    if (isInterviewComplete) {
      return (
        <Typography variant="h6" align="center" color="success">
          Interview Complete! Thank you.
        </Typography>
      );
    }

    if (isProcessing) {
      return <CircularProgress />;
    }

    if (messages.length === 1 && typeof messages[0].content === 'string') {
      return (
        <IconButton
          sx={{ width: 80, height: 80, backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}
          color="primary"
          onClick={startInterview}
        >
          <PlayArrowIcon sx={{ fontSize: 50, color: 'white' }} />
        </IconButton>
      );
    }

    if (isRecording) {
      return (
        <RecordingButton sx={{ width: 80, height: 80 }} onClick={stopRecording}>
          <StopIcon sx={{ fontSize: 50 }} />
        </RecordingButton>
      );
    }

    return (
      <IconButton
        sx={{ width: 80, height: 80, backgroundColor: '#2196f3', '&:hover': { backgroundColor: '#1976d2' } }}
        color="primary"
        onClick={startRecording}
      >
        <MicIcon sx={{ fontSize: 50, color: 'white' }} />
      </IconButton>
    );
  };

  const MessageBubble = ({ message }: {message: Message}) => {
    const isBot = message.type === 'bot';
    const align = isBot ? 'flex-start' : 'flex-end';
    const bgColor = isBot ? '#e0e0e0' : '#dcf8c6';
    const color = 'black';
    const avatarSrc = isBot ? '/favicon.png' : '/user.png';

    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
      if (!audioRef.current) return

      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };

    return (
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent={align}
        sx={{ mb: 2 }}
      >
        {isBot && (
          <Box
            component="img"
            src={avatarSrc}
            alt="avatar"
            sx={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }}
          />
        )}
        <Box
          sx={{
            p: 2,
            borderRadius: '1.5rem',
            backgroundColor: bgColor,
            color: color,
            maxWidth: '70%',
            wordBreak: 'break-word',
            whiteSpace: 'pre-line',
            ...(!isBot && { borderBottomRightRadius: 0 }),
            ...(isBot && { borderBottomLeftRadius: 0 }),
            boxShadow: 1,
            display: 'flex',
            alignItems: 'center',
            minHeight: '2rem'
          }}
        >
          {typeof message.content === 'string' ? (
            <Typography>{message.content}</Typography>
          ) : (
            <>
              <audio ref={audioRef} src={URL.createObjectURL(message.content)} onEnded={() => setIsPlaying(false)} />
              <IconButton onClick={togglePlay} size="small" sx={{ mr: 1 }}>
                {isPlaying ? <PauseIcon /> : <HeadsetMicIcon />}
              </IconButton>
              <Typography variant="body2">
                Audio Message
              </Typography>
            </>
          )}
        </Box>
        {!isBot && (
          <Box
            component="img"
            src={avatarSrc}
            alt="avatar"
            sx={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }}
          />
        )}
      </Stack>
    );
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxWidth: '100%',
      p: 2,
      bgcolor: '#f0f2f5'
    }}>
      <Paper elevation={3} sx={{
        flexGrow: 1,
        overflowY: 'auto',
        p: 2,
        borderRadius: '1rem',
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        <div ref={chatBottomRef} />
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
        {renderControls()}
      </Box>
    </Box>
  );
};

export default InterviewApp;
