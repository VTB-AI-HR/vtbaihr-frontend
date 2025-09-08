import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  TextField,
  Stack,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import FileCopyIcon from '@mui/icons-material/FileCopy';
import axios from "axios";
import type { VacancyResponse } from "../types";
import { useNavigate, useParams } from "react-router";
import VacancyPaper from "../components/vacancy";
import Back from "~/components/back";

const ApplyVacancy: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState<VacancyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    interviewLink?: string;
  } | null>({success: false, interviewLink:'pornhub.com', message: "lorem ipsum dolor sit amet lorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit amet"});

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
    if (!resumeFile) return alert("Please upload a resume file.");

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("vacancy_id", String(vacancy?.id));
    formData.append("candidate_email", candidateEmail);
    formData.append("candidate_resume_file", resumeFile);

    try {
      const res = await axios.post("https://vtb-aihr.ru/api/vacancy/respond", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;
      const passed = data.accordance_xp_vacancy_score >= 3 && data.accordance_skill_vacancy_score >= 3;

      setResult({
        success: passed,
        message: passed
          ? "Нам понравилось ваше резюме, и мы рады пригласить вас пройти интервью. Скопируйте ссылку ниже и перейдите по ней, чтобы начать интервью"
          : "К сожалению, ваше резюме не соответствует требованиям вакансии. Спасибо за отклик.",
        interviewLink: passed ? 'https://vtb-aihr.ru/interview/' + data.interview_link.split('/').at(-1) : undefined,
      });
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

  if (result) {
    return (
      <Box maxWidth="560px" mx="auto" p={3} mb={5}>
        <Back />
        <Typography mb={5} variant="h4" fontWeight={600} gutterBottom>
          Отклик на вакансию
        </Typography>
        <Box mb={4}>
          <VacancyPaper vacancy={vacancy} onDelete={() => { }} />
        </Box>
      <Typography variant="h6" fontSize={24} fontWeight={600} gutterBottom>
        Отклик
      </Typography>

        <Paper
          elevation={3}
          sx={{
            mb: 2,
            p: 3,
            backgroundColor: result.success ? "#EDF6FF" : "#FFF4E5",
            color: result.success ? "#3361EC" : "#663C00",
          }}
        >
          <Typography fontWeight={500}>{result.message}</Typography>


        </Paper >
          {result.success && result.interviewLink && (
            <>
            <TextField
              fullWidth
              value={result.interviewLink}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => navigator.clipboard.writeText(result.interviewLink!)}
                      >
                      <FileCopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              />
          <Typography style={{ marginTop: -4 }} color="#778093" variant="caption">
            Пройти интервью можно только один раз
          </Typography>
              </>

          )}

        {!result.success && (
          <Button
            fullWidth
            size="medium"
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate("/vacancies")}
          >
            К вакансиям
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box maxWidth="560px" mx="auto" p={3}>
      <Back />
      <Typography mb={5} variant="h4" fontWeight={600} gutterBottom>
        Отклик на вакансию
      </Typography>
      <Box mb={4}>
        <VacancyPaper vacancy={vacancy} onDelete={() => { }} />
      </Box>
      <Typography variant="h6" fontSize={24} fontWeight={600} gutterBottom>
        Отклик
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={candidateEmail}
            onChange={(e) => setCandidateEmail(e.target.value)}
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              label="Resume"
              disabled
              value={resumeFile?.name || ""}
              InputProps={{ readOnly: true }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={() => document.getElementById("resume-upload")?.click()}
            >
              Загрузить
            </Button>
          </Stack>

          <input
            id="resume-upload"
            type="file"
            style={{ display: "none" }}
            onChange={(e) => {
              const target = e.target as HTMLInputElement;
              if (target.files) setResumeFile(target.files[0]);
            }}
            accept=".pdf,.docx,.doc,.txt,.rtf"
            required
          />
          <Typography style={{ marginTop: -4 }} color="#778093" variant="caption">
            Формат PDF / DOCX / DOC / TXT / RTF
          </Typography>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Отправить отклик"}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default ApplyVacancy;
