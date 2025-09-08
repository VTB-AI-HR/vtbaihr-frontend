// src/components/VacancyPaper.tsx
import React from 'react';
import {
  Box,
  Chip,
  Stack,
  Typography,
  Paper,
  IconButton,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { VacancyResponse } from "../types";
import { useNavigate } from "react-router";
import "./vacancy.css";

interface VacancyPaperProps {
  vacancy: VacancyResponse;
  isRecruiter?: boolean;
  onDelete: (id: number) => void;
}

const Vacancy: React.FC<VacancyPaperProps> = ({ vacancy, isRecruiter, onDelete }) => {
  const navigate = useNavigate();

  const handleApply = () => {
    navigate(`/apply/${vacancy.id}`);
  };

  const handleEdit = () => {
    navigate(`/questions/${vacancy.id}`);
  };

  const handleDelete = () => {
    onDelete(vacancy.id);
  };

  const handleViewResults = () => {
    navigate(`/vacancy/${vacancy.id}`);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, position: "relative" }}>
      <Typography style={{
        textTransform: 'capitalize'
      }} variant="subtitle1" color="primary">
        {vacancy.skill_lvl}
      </Typography>
      {isRecruiter === true && (
        <>
          <IconButton
            size="small"
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={handleDelete}
          >
            <DeleteIcon fontSize="medium" />
          </IconButton>
          <IconButton
            size="small"
            sx={{ position: "absolute", top: 8, right: 48 }}
            onClick={handleEdit}
          >
            <EditIcon fontSize="medium" />
          </IconButton>
        </>
      )}
      <Typography variant="h6">{vacancy.name}</Typography>
      <Typography variant='body2' mt={1}>{vacancy.description}</Typography>
      <Stack direction="row" mt={2} flexWrap="wrap">
        {vacancy.tags.map((tag) => (
          <Chip className="tag-chip" key={tag} label={tag} />
        ))}
      </Stack>
      {
        isRecruiter !== undefined &&
        <Box mt={3} display="flex" gap={2}>
          {isRecruiter === false && (
            <Button
              size="medium"
              variant="contained" onClick={handleApply}>
              Перейти к вакансии
            </Button>
          )}
          {isRecruiter === true && (
            <Button
              size="medium"
              variant="contained" onClick={handleViewResults}>
              Посмотреть отклики (кол-во)
            </Button>
          )}
        </Box>
      }
    </Paper>
  );
};

export default Vacancy;