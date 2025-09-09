import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Alert,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Grid,
  ListItemText,
  IconButton,
} from "@mui/material";
import axios from "axios";
import Back from "./back";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

interface InterviewData {
  id: number;
  vacancy_id: number;
  candidate_email: string;
  candidate_phone: string;
  candidate_name: string;
  candidate_telegram_login: string;
  candidate_resume_fid: string;
  candidate_resume_filename: string;
  accordance_xp_vacancy_score: number;
  accordance_skill_vacancy_score: number;
  red_flag_score: number;
  hard_skill_score: number;
  soft_skill_score: number;
  logic_structure_score: number;
  accordance_xp_resume_score: number;
  accordance_skill_resume_score: number;
  strong_areas: string;
  weak_areas: string;
  approved_skills: string[];
  general_score: number;
  general_result: string;
  message_to_candidate: string;
  message_to_hr: string;
  created_at: string;
}

interface InterviewDetails {
  candidate_answers: CandidateAnswer[];
  interview_messages: InterviewMessage[];
}

interface CandidateAnswer {
  id: number;
  question_id: number;
  response_time: number;
  message_ids: number[];
  message_to_hr: string;
  score: number;
}

interface InterviewQuestion {
  id: number;
  question: string;
  hint_for_evaluation: string;
  weight: number;
  question_type: string;
  response_time: number;
}

interface InterviewMessage {
  id: number;
  interview_id: number;
  question_id: number;
  role: string;
  text: string;
  audio_name?: string;
  audio_fid?: string;
  created_at: string;
}

const InterviewDetailsPage: React.FC = () => {
  const { vacancy_id, interview_id } = useParams<{ vacancy_id: string, interview_id: string }>();
  const [generalData, setGeneralData] = useState<InterviewData | null>(null);
  const [detailsData, setDetailsData] = useState<InterviewDetails | null>(null);
  const [questionsData, setQuestionsData] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"result" | "answers">("result");
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [playingAudio, setPlayingAudio] = useState<{ id: number; role: string } | null>(null);

  const getAudioUrl = (audio_fid: string, audio_name: string) => {
    return `https://vtb-aihr.ru/api/vacancy/interview/audio/${audio_fid}/${audio_name}`;
  };

  const togglePlay = (messageId: number, audioUrl: string, role: string) => {
    if (!audioPlayerRef.current) return;

    if (playingAudio?.id === messageId) {
      audioPlayerRef.current.pause();
      setPlayingAudio(null);
    } else {
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play();
      setPlayingAudio({ id: messageId, role });
    }
  };

  useEffect(() => {
    fetchData();
  }, [interview_id]);

  const fetchData = async () => {
    if (!interview_id) {
      setError("Interview ID not provided.");
      setLoading(false);
      return;
    }
    try {
      const [generalRes, detailsRes] = await Promise.all([
        axios.get<InterviewData[]>(
          `https://vtb-aihr.ru/api/vacancy/interview/vacancy/${vacancy_id}`
        ),
        axios.get<InterviewDetails>(
          `https://vtb-aihr.ru/api/vacancy/interview/${interview_id}/details`
        ),
      ]);

      const interviewItem = generalRes.data.find(item => String(item.id) === interview_id);
      if (interviewItem) {
        setGeneralData(interviewItem);
        const questionsRes = await axios.get<InterviewQuestion[]>(
          `https://vtb-aihr.ru/api/vacancy/question/all/${interviewItem.vacancy_id}`
        );
        setQuestionsData(questionsRes.data);
      }
      setDetailsData(detailsRes.data);
      if (detailsRes.data.candidate_answers.length > 0) {
        setSelectedQuestion(detailsRes.data.candidate_answers[0].question_id);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to fetch interview details.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: "result" | "answers"
  ) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleQuestionChange = (questionId: number) => {
    setSelectedQuestion(questionId);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!generalData || !detailsData) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography>No details found for this interview.</Typography>
      </Box>
    );
  }

  const currentAnswer = detailsData.candidate_answers.find(
    (answer) => answer.question_id === selectedQuestion
  );
  const currentQuestion = questionsData.find(
    (q) => q.id === selectedQuestion
  );
  const currentMessages = detailsData.interview_messages.filter(
    (msg) => msg.question_id === selectedQuestion
  );

  return (
    <Box maxWidth="1200px" mx="auto" p={3}>
      <Back />
      {generalData.general_result && (
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{
            fontWeight: '500',
            fontSize: 18,
            color: (() => {
              switch (generalData.general_result) {
                case "next":
                  return "green";
                case "rejected":
                  return "red";
                default:
                  return "orange";
              }
            })(),
          }}
        >
          {(() => {
            switch (generalData.general_result) {
              case "next":
                return "Интервью пройдено";
              case "rejected":
                return "Кандидат не прошел";
              case "in_process":
                return "Интервью в прогрессе";
              case "disputable":
                return "Спорный результат";
              default:
                return generalData.general_result;
            }
          })()}
        </Typography>
      )}
      <Grid container alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          {generalData.candidate_name || generalData.candidate_email}
        </Typography>
      </Grid>
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={handleViewChange}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="result">Результат интервью</ToggleButton>
        <ToggleButton value="answers">Ответы на вопросы</ToggleButton>
      </ToggleButtonGroup>

      {view === "result" && (
        <>
          <Grid container alignItems="center" justifyContent="space-between" mb={2} mt={2}>
            <Typography variant="h6" fontWeight="bold">Отчёт</Typography>

            <Button
              variant="contained"
              onClick={() => {
                if (generalData?.candidate_resume_fid && generalData?.candidate_resume_filename) {
                  const url = `https://vtb-aihr.ru/api/vacancy/interview/resume/${generalData.candidate_resume_fid}/${generalData.candidate_resume_filename}`;
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", generalData.candidate_resume_filename);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
            >
              Скачать резюме
            </Button>
          </Grid>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Сильные стороны
                </Typography>
                <Typography>{generalData.strong_areas || "N/A"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Слабые сороны
                </Typography>
                <Typography>{generalData.weak_areas || "N/A"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Подтвержденные навыки
                </Typography>
                {generalData.approved_skills && generalData.approved_skills.length > 0 ? (
                  <Stack mt={2} direction="row" flexWrap="wrap">
                    {generalData.approved_skills.map((skill, index) => (
                      <Chip key={index} label={skill} />
                    ))}
                  </Stack>
                ) : (
                  <Typography>N/A</Typography>
                )}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Сообщение нанимающему менеджеру
                </Typography>
                <Typography>{generalData.message_to_hr || "N/A"}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Фидбек для кандидата
                </Typography>
                <Typography>{generalData.message_to_candidate || "N/A"}</Typography>
              </Box>
            </Stack>
          </Paper>
        </>
      )}

      {view === "answers" && (
        <>
          <Typography variant="h5" fontWeight="bold" mb={2}>Ответы на вопросы</Typography>
          <ToggleButtonGroup
            value={selectedQuestion}
            exclusive
            onChange={(_e, value) => {
              if (value !== null) handleQuestionChange(value);
            }}
            sx={{ mb: 3, flexWrap: "wrap" }}
          >
          {[...new Set(detailsData.candidate_answers.map(a => a.question_id))].map((qid, index) => (
            <ToggleButton sx={{ width: 40, height: 30 }} key={qid} value={qid}>
              {index + 1}
            </ToggleButton>
          ))}
          </ToggleButtonGroup>

          {currentQuestion && (
            <Box mb={3}>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                Вопрос
              </Typography>
              <Paper>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight="500" fontSize={16}>
                      {currentQuestion.question}
                    </Typography>
                  }
                  secondary={
                    <>
                      Подсказка: {currentQuestion.hint_for_evaluation}
                      <Stack direction="row" mt={2} flexWrap="wrap">
                        <Chip label={'Навык: ' + currentQuestion.question_type} />
                        <Chip label={'Вес: ' + currentQuestion.weight} />
                        <Chip label={currentQuestion.response_time + ' мин'} />
                      </Stack>
                    </>
                  }
                />
              </Paper>
            </Box>
          )}

          {currentAnswer && (
            <Box mb={3}>
              <Typography variant="h6" fontWeight="bold">
                Оценка ответа
              </Typography>
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography>{currentAnswer.message_to_hr}</Typography>
              </Alert>
            </Box>
          )}

          <Typography variant="h6" fontWeight="bold" mb={1}>
            Транскрипт интервью
          </Typography>
          <Box
            sx={{
              maxHeight: "400px",
              overflowY: "auto",
              pr: 1,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              p: 2,
            }}
          >
            {currentMessages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    bgcolor: message.role === "user" ? "primary.light" : "grey.200",
                    color: message.role === "user" ? "primary.contrastText" : "text.primary",
                    p: 1.5,
                    borderRadius: "15px",
                    maxWidth: "70%",
                    wordBreak: "break-word",
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    {message.audio_fid && message.audio_name && (
                      <IconButton
                        size="small"
                        onClick={() => togglePlay(message.id, getAudioUrl(message.audio_fid!, message.audio_name!), message.role)}
                        sx={{ p: 0.5 }}
                      >
                        <audio ref={audioPlayerRef} onEnded={() => setPlayingAudio(null)} />
                        {playingAudio?.id === message.id ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default InterviewDetailsPage;