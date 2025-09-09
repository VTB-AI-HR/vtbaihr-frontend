import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import type { VacancyResponse } from "../types";

interface EvaluationResult {
  candidate_email: string;
  candidate_name: string;
  candidate_phone: string;
  accordance_xp_vacancy_score: number;
  accordance_skill_vacancy_score: number;
}

const ResumeScreeningPage: React.FC = () => {
  const { vacancy_id: urlVacancyId } = useParams<{ vacancy_id: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vacancies, setVacancies] = useState<VacancyResponse[]>([]);
  const [selectedVacancyId, setSelectedVacancyId] = useState<number | string>(
    urlVacancyId || ""
  );
  const [files, setFiles] = useState<File[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>(
    []
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [openModal, setOpenModal] = useState(false);
  const [passed, setPassed] = useState(0);
  const [failed, setFailed] = useState(0);

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const res = await axios.get<VacancyResponse[]>(
          "https://vtb-aihr.ru/api/vacancy/all"
        );
        setVacancies(res.data);
        if (urlVacancyId && res.data.some((v) => v.id === +urlVacancyId)) {
          setSelectedVacancyId(+urlVacancyId);
        }
      } catch (err) {
        setError("Failed to fetch vacancies.");
        console.error("Failed to fetch vacancies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVacancies();
  }, [urlVacancyId]);

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "application/rtf",
    ];
    const validFiles = Array.from(newFiles).filter((file) =>
      allowedTypes.includes(file.type)
    );
    setFiles(validFiles);
    setEvaluationResults([]);
  };

  const handleEvaluate = async () => {
    if (files.length === 0 || !selectedVacancyId) return;

    const formData = new FormData();
    formData.append("vacancy_id", selectedVacancyId.toString());
    files.forEach((file) => formData.append("candidate_resume_files", file));

    try {
      setLoading(true);
      const res = await axios.post<{ evaluation_resumes: EvaluationResult[] }>(
        "https://vtb-aihr.ru/api/vacancy/evaluate-resumes",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const successful = res.data.evaluation_resumes;
      setEvaluationResults(successful);

      const passedCount = successful.length;
      const failedCount = files.length - passedCount;

      setPassed(passedCount);
      setFailed(failedCount);
      setOpenModal(true);
    } catch (err) {
      setError("Failed to evaluate resumes.");
      console.error("Evaluation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setOpenModal(false);
    setFiles([]);
    setEvaluationResults([]);
  };

  const selectedVacancyTitle = vacancies.find(
    (v) => v.id === selectedVacancyId
  )?.name;

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

  return (
    <Box maxWidth="560px" mx="auto" p={0}>
      <Typography mt={5} mb={1} variant="subtitle2" fontWeight={600}>
        Первичная проверка кандидата
      </Typography>
      <Typography mb={6} variant="h4" fontWeight={600} gutterBottom>
        Проверка резюме
      </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Вакансия</InputLabel>
          <Select
            value={selectedVacancyId}
            label="Select Vacancy"
            onChange={(e) => setSelectedVacancyId(e.target.value as number)}
          >
            {vacancies.map((vacancy) => (
              <MenuItem key={vacancy.id} value={vacancy.id}>
                {vacancy.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          textAlign: "center",
          cursor: "pointer",
          borderStyle: "dashed",
          borderColor: "grey.400",
          "&:hover": { borderColor: "primary.main" },
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileChange(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          hidden
          multiple
          onChange={(e) => handleFileChange(e.target.files)}
          accept=".pdf,.docx,.doc,.txt,.rtf"
          ref={fileInputRef}
        />
        <Typography variant="body1">
          Добавьте файлы резюме кандидатов здесь или нажмите, чтобы выбрать
        </Typography>
        <Typography variant="caption" color="text.secondary">
          (Поддерживаемые форматы: PDF, DOCX, DOC, TXT, RTF)
        </Typography>
      </Paper>

      <Box mt={2}>
        {evaluationResults.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>XP Score</TableCell>
                  <TableCell>Skill Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {evaluationResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{result.candidate_name}</TableCell>
                    <TableCell>{result.candidate_email}</TableCell>
                    <TableCell>{result.accordance_xp_vacancy_score}</TableCell>
                    <TableCell>
                      {result.accordance_skill_vacancy_score}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          files.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Выбранные файлы:
              </Typography>
              <ul>
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </Box>
          )
        )}
      </Box>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
        onClick={handleEvaluate}
        disabled={!selectedVacancyId || files.length === 0}
      >
        Начать проверку резюме
      </Button>

    <Dialog open={openModal} onClose={handleDone} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h4" fontWeight={600} >
        Результат проверки резюме
        </Typography>
        </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2, mt: 1 }}>
          <Paper elevation={1} sx={{ p: 2, flexGrow: 1, mr: 1 }}>
            <Typography color="#12A543" variant="subtitle1">Прошли проверку</Typography>
            <Typography variant="h6">{passed}</Typography>
          </Paper>
          <Paper elevation={1} sx={{ p: 2, flexGrow: 1, ml: 1 }}>
            <Typography color="#F22B03" variant="subtitle1">Не прошли проверку</Typography>
            <Typography variant="h6">{failed}</Typography>
          </Paper>
        </Box>
        <Paper>
        <Typography variant="body2" >
          Всем успешно прошедшим проверку кандидатам было отправлено приглашение на
          прохождение интервью
        </Typography>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button size="large" variant="contained" onClick={handleDone} fullWidth>
          Готово
        </Button>
      </DialogActions>
    </Dialog>

    </Box>
  );
};

export default ResumeScreeningPage;
