import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Button,
  TextField,
  Input,
  Stack
} from "@mui/material";
import axios from "axios";
import type { VacancyResponse } from "../types";
import { useNavigate, useParams } from "react-router";
import VacancyPaper from "../components/vacancy";

const ApplyVacancy: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState<VacancyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    fetchVacancy();
  }, [id]);

  const fetchVacancy = async () => {
    try {
      setLoading(true);
      const res = await axios.get<VacancyResponse[]>(
        "https://vtb-aihr.ru/api/vacancy/all"
      );
      const foundVacancy = res.data.find(v => v.id === parseInt(id as string));
      setVacancy(foundVacancy || null);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch vacancy details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resumeFile) {
      alert("Please upload a resume file.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("vacancy_id", String(vacancy?.id));
    formData.append("candidate_email", candidateEmail);
    formData.append("candidate_resume_file", resumeFile);

    try {
      const res = await axios.post("https://vtb-aihr.ru/api/vacancy/interview/start", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;
      if (data.is_suitable) {
        navigate(`/interview/${data.interview_id}`, {
          state: {
            message: data.message_to_candidate,
            question_id: data.question_id,
            vacancy_id: vacancy?.id,
          },
        });
      } else {
        navigate("/rejected", { state: { message: data.message_to_candidate } });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!vacancy) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography variant="h6" color="text.secondary">
          Vacancy not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth="800px" mx="auto" p={3}>
      <Typography align="center" variant="h5" gutterBottom>
        Apply for Vacancy
      </Typography>
      <Box mb={4}>
        <VacancyPaper vacancy={vacancy} onDelete={() => {}} />
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Application Form
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Candidate Email"
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              required
            />
            <Typography variant="subtitle1">Upload Resume (PDF/DOCX/DOC/TXT/RTF)</Typography>
            <Input
              type="file"
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target.files) {
                  setResumeFile(target.files[0]);
                }
              }}
              required
              inputProps={{ accept: ".pdf,.docx,.doc,.txt,.rtf" }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Submit Application"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ApplyVacancy;