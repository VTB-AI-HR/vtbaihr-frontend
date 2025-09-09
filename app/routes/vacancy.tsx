import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  Box,
  Typography,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import axios from "axios";
import CandidatesTab from "./CandidatesTab";
import VacancyTab from "./VacancyTab";
import QuestionsTab from "./QuestionsTab";
import { type VacancyResponse, type CandidateEvaluation } from "../types";
import Back from "./back";

const VacancyPage: React.FC = () => {
  const { vacancy_id: urlVacancyId } = useParams<{ vacancy_id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<number>(0);
  const [vacancy, setVacancy] = useState<VacancyResponse | null>(null);
  const [candidates, setCandidates] = useState<CandidateEvaluation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vacanciesRes, candidatesRes] = await Promise.all([
          axios.get<VacancyResponse[]>("https://vtb-aihr.ru/api/vacancy/all"),
          axios.get<CandidateEvaluation[]>(
            `https://vtb-aihr.ru/api/vacancy/interview/vacancy/${urlVacancyId}`
          ),
        ]);

        const selectedVacancy = vacanciesRes.data.find(
          (v) => v.id === Number(urlVacancyId)
        );
        if (!selectedVacancy) {
          setError("Vacancy not found.");
          return;
        }

        setVacancy(selectedVacancy);
        setCandidates(candidatesRes.data);
      } catch (err) {
        setError("Failed to fetch data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (urlVacancyId) {
      fetchData();
    } else {
      setError("Vacancy ID not provided.");
      setLoading(false);
    }
  }, [urlVacancyId]);

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

  if (!vacancy) {
    return null;
  }

  const handleTabChange = (_event: React.MouseEvent<HTMLElement>, newValue: number | null) => {
    if (newValue !== null) setTab(newValue);
  };

  return (
    <Box maxWidth="1200px" mx="auto" p={3}>
      <Back />
      {vacancy.skill_lvl && (
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{
            fontWeight: '500',
            fontSize: 18,
            color: '#3361EC',
          }}
        >
          {vacancy.skill_lvl}
        </Typography>
      )}
      <Typography mb={3} variant="h4" fontWeight="bold" gutterBottom>
        {vacancy.name}
      </Typography>
      <ToggleButtonGroup
        value={tab}
        exclusive
        onChange={handleTabChange}
        sx={{ mb: 3, flexWrap: "nowrap", width: 560 }}
      >
        <ToggleButton fullWidth value={0}>Кандидаты</ToggleButton>
        <ToggleButton fullWidth value={1}>Вакансия</ToggleButton>
        <ToggleButton fullWidth value={2}>Вопросы</ToggleButton>
      </ToggleButtonGroup>

      {tab === 0 && (
        <CandidatesTab candidates={candidates} />
      )}
      {tab === 1 && <VacancyTab vacancy={vacancy} />}
      {tab === 2 && <QuestionsTab vacancyId={urlVacancyId!} />}
    </Box>
  );
};

export default VacancyPage;