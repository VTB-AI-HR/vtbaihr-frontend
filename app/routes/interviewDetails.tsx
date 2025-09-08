import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import axios from "axios";

interface InterviewData {
  id: number;
  vacancy_id: number;
  candidate_email: string;
  general_result: string;
  strong_areas: string;
  weak_areas: string;
  message_to_hr: string;
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

  const resultColor =
    generalData.general_result === "passed" ? "green" : "red";
  const candidateInfo =
    generalData.candidate_email || "Candidate";
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
    <Box maxWidth="900px" mx="auto" p={3}>
      <Grid container alignItems="center" justifyContent="space-between" mb={3}>
        {/* <Grid item> */}
          <Typography variant="h4" fontWeight="bold">
            Interview
          </Typography>
          <Typography variant="body1" color={resultColor}>
            {generalData.general_result}
          </Typography>
          <Typography variant="body1">{candidateInfo}</Typography>
        {/* </Grid> */}
        {/* <Grid item> */}
          <Button variant="contained" disabled>
            Schedule Interview
          </Button>
        {/* </Grid> */}
      </Grid>
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={handleViewChange}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="result">Interview Result</ToggleButton>
        <ToggleButton value="answers">Answers</ToggleButton>
      </ToggleButtonGroup>

      {view === "result" && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Grid container alignItems="center" justifyContent="space-between" mb={2}>
            {/* <Item> */}
              <Typography variant="h6" fontWeight="bold">Result</Typography>
            {/* </Item>
            <Item> */}
              <Button variant="outlined" disabled>
                Download Result
              </Button>
            {/* </Item> */}
          </Grid>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Strong Areas
              </Typography>
              <Typography>{generalData.strong_areas || "N/A"}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Weak Areas
              </Typography>
              <Typography>{generalData.weak_areas || "N/A"}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Message to HR
              </Typography>
              <Typography>{generalData.message_to_hr || "N/A"}</Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {view === "answers" && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Answers</Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>
            {detailsData.candidate_answers.map((answer) => (
              <Chip
                key={answer.id}
                label={`Question ${answer.question_id}`}
                onClick={() => handleQuestionChange(answer.question_id)}
                color={
                  selectedQuestion === answer.question_id
                    ? "primary"
                    : "default"
                }
              />
            ))}
          </Stack>

          {currentQuestion && (
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold">
                Question
              </Typography>
              <Typography>{currentQuestion.question}</Typography>
              <Typography variant="subtitle1" fontWeight="bold" mt={1}>
                Hint
              </Typography>
              <Typography>{currentQuestion.hint_for_evaluation}</Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Chip label={`Type: ${currentQuestion.question_type}`} />
                <Chip label={`Weight: ${currentQuestion.weight}`} />
                <Chip label={`Time: ${currentQuestion.response_time}s`} />
              </Stack>
            </Box>
          )}

          {currentAnswer && (
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold">
                Message to HR
              </Typography>
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography>{currentAnswer.message_to_hr}</Typography>
              </Alert>
            </Box>
          )}

          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Dialog Transcript
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
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default InterviewDetailsPage;