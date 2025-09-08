import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Alert,
} from "@mui/material";
import axios from "axios";
import type { InterviewResultDetails } from "../types";

const InterviewDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<InterviewResultDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviewDetails();
  }, [id]);

  const fetchInterviewDetails = async () => {
    if (!id) {
      setError("Interview ID not provided.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get<InterviewResultDetails>(
        `https://vtb-aihr.ru/api/vacancy/interview/${id}/details`
      );
      setDetails(res.data);
    } catch (err) {
      console.error("Failed to fetch interview details:", err);
      setError("Failed to fetch interview details.");
    } finally {
      setLoading(false);
    }
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

  if (!details) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography>No details found for this interview.</Typography>
      </Box>
    );
  }

  const { candidate_answers, interview_messages } = details;

  return (
    <Box maxWidth="800px" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom align="center">
        Interview Details
      </Typography>

      <Stack spacing={3}>
        {candidate_answers.map((answer) => {
          const relatedMessages = interview_messages.filter((msg) =>
            answer.message_ids.includes(msg.id)
          );

          return (
            <Paper key={answer.id} elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Question
              </Typography>
              <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
                {relatedMessages.map((message) => (
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
                        bgcolor: message.role === "user" ? "primary.light" : "grey.300",
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
              <Box mt={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>AI Score: {answer.score}/10</Typography>
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {answer.llm_comment}
                  </Typography>
                </Alert>
                <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                  Response Time: {answer.response_time} seconds
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

export default InterviewDetailsPage;