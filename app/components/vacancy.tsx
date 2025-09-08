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
import AssessmentIcon from '@mui/icons-material/Assessment';
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
    navigate(`/criteria/${vacancy.id}`);
  };

  const handleDelete = () => {
    onDelete(vacancy.id);
  };

  const handleViewResults = () => {
    navigate(`/vacancy/${vacancy.id}`);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, position: "relative" }}>
      {isRecruiter === true && (
        <>
          <IconButton
            size="small"
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={handleDelete}
          >
            <DeleteIcon color="error" fontSize="medium" />
          </IconButton>
          <IconButton
            size="small"
            sx={{ position: "absolute", top: 8, right: 48 }}
            onClick={handleEdit}
          >
            <EditIcon color="primary" fontSize="medium" />
          </IconButton>
        </>
      )}
      <Typography variant="h6">{vacancy.name}</Typography>
      <Stack className="tag-chip-container" direction="row" spacing={1} mt={1} flexWrap="wrap">
        {vacancy.tags.map((tag) => (
          <Chip className="tag-chip" key={tag} label={tag} />
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
      <Box mt={2} display="flex" gap={2}>
        {isRecruiter === false && (
          <Button variant="contained" onClick={handleApply}>
            Apply
          </Button>
        )}
        {isRecruiter === true && (
          <Button variant="contained" startIcon={<AssessmentIcon />} onClick={handleViewResults}>
            Interview Results
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default Vacancy;