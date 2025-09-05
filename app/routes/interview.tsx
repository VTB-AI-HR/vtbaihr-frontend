import React, { useState, useEffect, useRef } from "react";
import { Box, Button, CircularProgress, Paper, Typography, Stack } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import axios from "axios";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";

interface InterviewResponse {
  question_id: number;
  message_to_candidate: string;
}

const interview: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState<string>(location.state?.message || "Welcome to your interview.");
  const [currentQuestionId, setCurrentQuestionId] = useState<number>(location.state?.question_id);
  const [vacancyId] = useState<number>(location.state?.vacancy_id);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!interviewId || !vacancyId) {
      navigate("/");
    }
  }, [interviewId, vacancyId, navigate]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        sendAudio(audioBlob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access your microphone. Please allow access and try again.");
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
    formData.append("vacancy_id", vacancyId.toString());
    formData.append("question_id", currentQuestionId.toString());
    formData.append("interview_id", interviewId as string);
    formData.append("audio_file", audioBlob, "audio.wav");

    try {
      const res = await axios.post<InterviewResponse>(
        "https://vtb-aihr.ru/api/vacancy/interview/answer",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(res.data.message_to_candidate);
      setCurrentQuestionId(res.data.question_id);
    } catch (err) {
      console.error(err);
      alert("Failed to submit your response. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box maxWidth="800px" mx="auto" p={3}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          AI Interview
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 4, whiteSpace: "pre-line" }}>
          {message}
        </Typography>
        
        <Box display="flex" justifyContent="center" my={2}>
          {isProcessing ? (
            <Stack direction="row" alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography variant="body1">Processing your response...</Typography>
            </Stack>
          ) : (
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={startRecording}
                disabled={isRecording}
                startIcon={<MicIcon />}
              >
                Start Recording
              </Button>
              <Button
                variant="outlined"
                onClick={stopRecording}
                disabled={!isRecording}
                startIcon={<StopIcon />}
              >
                Stop Recording
              </Button>
            </Stack>
          )}
        </Box>
        
        {isRecording && (
          <Typography variant="body2" color="primary" align="center" mt={2}>
            Recording...
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default interview;