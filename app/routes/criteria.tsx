import React, { useState } from "react";
import {
  Box,
  Button,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { useParams, useNavigate } from "react-router";
import axios from "axios";

const CRITERIA = [
  { key: "logic_structure_score_weight", label: "Logic Structure" },
  { key: "pause_detection_score_weight", label: "Pause Detection" },
  { key: "soft_skill_score_weight", label: "Soft Skills" },
  { key: "hard_skill_score_weight", label: "Hard Skills" },
  { key: "accordance_xp_vacancy_score_weight", label: "Accordance XP to Vacancy" },
  { key: "accordance_skill_vacancy_score_weight", label: "Accordance Skills to Vacancy" },
  { key: "accordance_xp_resume_score_weight", label: "Accordance XP to Resume" },
  { key: "accordance_skill_resume_score_weight", label: "Accordance Skills to Resume" },
  { key: "red_flag_score_weight", label: "Red Flags" },
];

const Criteria: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [weights, setWeights] = useState<Record<string, number>>(
    CRITERIA.reduce((acc, c) => ({ ...acc, [c.key]: 5 }), {})
  );

  const handleChange = (key: string, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.put("https://vtb-aihr.ru/api/vacancy/criterion-weights/edit", {
        vacancy_id: Number(id),
        ...weights,
      });
      alert("Criteria submitted successfully!");
      navigate(`/questions/${id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit criteria.");
    }
  };

  return (
    <Box maxWidth="600px" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom>
        Criteria Settings
      </Typography>

      <Stack spacing={4}>
        {CRITERIA.map((c) => (
          <Box key={c.key}>
            <Typography>{c.label}</Typography>
            <Slider
              value={weights[c.key]}
              onChange={(_, val) => handleChange(c.key, val as number)}
              step={1}
              min={0}
              max={10}
              valueLabelDisplay="auto"
            />
          </Box>
        ))}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => navigate(`/questions/${id}`)}>
            Skip
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Criteria;
