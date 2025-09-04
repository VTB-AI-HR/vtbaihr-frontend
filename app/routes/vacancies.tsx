import React, { useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import "./vacancies.css";
import type { VacancyResponse } from "./types";

const VacanciesList: React.FC = () => {
  const [vacancies, setVacancies] = useState<VacancyResponse[]>([]);
  const [loading, setLoading] = useState(true);

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
      <Typography className='text-center' variant="h5" gutterBottom>
        All Vacancies
      </Typography>
      <Stack spacing={2}>
        {vacancies.map((vacancy) => (
          <Paper key={vacancy.id} elevation={2} sx={{ p: 2, position: "relative" }}>
            <IconButton
              size="small"
              sx={{ position: "absolute", top: 8, right: 8 }}
              onClick={() => handleDelete(vacancy.id)}
            >
              <DeleteIcon color="error" fontSize="medium" />
            </IconButton>
            <Typography variant="h6">{vacancy.name}</Typography>
            <Stack className="tag-chip-container"  direction="row" spacing={1} mt={1} flexWrap="wrap">
              {vacancy.tags.map((tag) => (
                <Chip  className="tag-chip" key={tag} label={tag} />
              ))}
            </Stack>
            <Typography mt={1}>{vacancy.description}</Typography>
            <Typography mt={1} color="error">
              Red Flags: {vacancy.red_flags || "None"}
            </Typography>
            <Typography mt={1}>
              Skill Level: {vacancy.skill_lvl} | Response Time:{" "}
              {vacancy.question_response_time}h
            </Typography>
            <Typography mt={1} color="text.secondary">
              Questions Type: {vacancy.questions_type}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default VacanciesList;
