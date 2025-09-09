import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  Box,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import axios from "axios";
import CandidatesTab from "./CandidatesTab";
import VacancyTab from "./VacancyTab";
import QuestionsTab from "./QuestionsTab";
import { type VacancyResponse, type CandidateEvaluation } from "../types";

const VacancyPage: React.FC = () => {
  const { vacancy_id: urlVacancyId } = useParams<{ vacancy_id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box maxWidth="1200px" mx="auto" p={3}>
      <Typography variant="h4" gutterBottom align="center">
        {vacancy.name}
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab
            label={
              <Badge badgeContent={candidates.length} color="primary">
                Кандидаты
              </Badge>
            }
          />
          <Tab label="Вакансия" />
          <Tab label="Вопросы" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <CandidatesTab candidates={candidates}
        />
      )}
      {tab === 1 && <VacancyTab vacancy={vacancy} />}
      {tab === 2 && <QuestionsTab vacancyId={urlVacancyId} />}
    </Box>
  );
};

export default VacancyPage;