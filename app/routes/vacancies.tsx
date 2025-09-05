// src/components/VacanciesList.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import type { VacancyResponse } from "../types";
import { useNavigate, useSearchParams } from "react-router";
import VacancyPaper from "../components/vacancy";

const VacanciesList: React.FC = () => {
  const [vacancies, setVacancies] = useState<VacancyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRecruiter = searchParams.get('isRecruiter') === 'true';

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      const res = await axios.get<VacancyResponse[]>(
        "https://vtb-aihr.ru/api/vacancy/all"
      );
      setVacancies(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch vacancies.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vacancy?")) return;

    try {
      await axios.delete(`https://vtb-aihr.ru/api/vacancy/delete/${id}`);
      setVacancies(vacancies.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete vacancy.");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth="800px" mx="auto" p={3}>
      <Typography align="center" variant="h5" gutterBottom>
        All Vacancies
      </Typography>
      <Stack spacing={2}>
        {vacancies.map((vacancy) => (
          <VacancyPaper
            key={vacancy.id}
            vacancy={vacancy}
            isRecruiter={isRecruiter}
            onDelete={handleDelete}
          />
        ))}
      </Stack>
      {isRecruiter && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/createVacancy")}
          >
            Add a new vacancy
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default VacanciesList;