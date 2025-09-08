import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { type VacancyResponse } from "../types";

interface VacancyTabProps {
  vacancy: VacancyResponse;
}

const VacancyTab: React.FC<VacancyTabProps> = ({ vacancy }) => {
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
          {vacancy.description}
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
          Red Flags
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
          {vacancy.red_flags}
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
          Skill Level
        </Typography>
        <Typography variant="body1">{vacancy.skill_lvl}</Typography>
        <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
          Tags
        </Typography>
        <Typography variant="body1">{vacancy.tags.join(", ")}</Typography>
      </Paper>
    </Box>
  );
};

export default VacancyTab;