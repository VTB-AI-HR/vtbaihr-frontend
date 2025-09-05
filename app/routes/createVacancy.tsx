import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router";
import "./createVacancy.css";
import type { VacancyPayload, SkillLevel } from "../types";

const CreateVacancy: React.FC = () => {
  const [form, setForm] = useState<VacancyPayload>({
    name: "",
    tags: [],
    description: "",
    red_flags: "",
    skill_lvl: "junior",
    question_response_time: 0,
  });

  const [skillInput, setSkillInput] = useState("");
  const navigate = useNavigate();

  const handleChange = (field: keyof VacancyPayload, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (skillInput && !form.tags.includes(skillInput)) {
      handleChange("tags", [...form.tags, skillInput]);
      setSkillInput("");
    }
  };

  const handleDeleteSkill = (skill: string) => {
    handleChange(
      "tags",
      form.tags.filter((t) => t !== skill)
    );
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("https://vtb-aihr.ru/api/vacancy/create", form);
      const vacancyId = res.data?.vacancy_id;
      alert("Vacancy created successfully!");
      if (vacancyId) {
        navigate(`/criteria/${vacancyId}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create vacancy.");
    }
  };

  return (
    <Box maxWidth="600px" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom>
        Create Vacancy
      </Typography>
      <Stack spacing={3}>
        <TextField
          label="Vacancy Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          fullWidth
        />

        <Box>
          <Typography variant="subtitle1">Skills</Typography>
          <Stack direction="row" spacing={1} mt={1}>
            <TextField
              label="Add Skill"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
            />
            <Button onClick={handleAddSkill} variant="contained">
              Add
            </Button>
          </Stack>
          <Stack className="tag-chip-container" direction="row" spacing={1} mt={2} flexWrap="wrap">
            {form.tags.map((skill) => (
              <Chip
                className="tag-chip"
                key={skill}
                label={skill}
                onDelete={() => handleDeleteSkill(skill)}
              />
            ))}
          </Stack>
        </Box>

        <TextField
          label="Description"
          multiline
          minRows={3}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          fullWidth
        />

        <TextField
          label="Red Flags"
          multiline
          minRows={2}
          value={form.red_flags}
          onChange={(e) => handleChange("red_flags", e.target.value)}
          fullWidth
        />

        <TextField
          select
          label="Skill Level"
          value={form.skill_lvl}
          onChange={(e) =>
            handleChange("skill_lvl", e.target.value as SkillLevel)
          }
          fullWidth
        >
          <MenuItem value="junior">Junior</MenuItem>
          <MenuItem value="middle">Middle</MenuItem>
          <MenuItem value="senior">Senior</MenuItem>
        </TextField>

        <TextField
          type="number"
          label="Response Time (hours)"
          value={form.question_response_time}
          onChange={(e) =>
            handleChange("question_response_time", Number(e.target.value))
          }
          fullWidth
        />

        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </Stack>
    </Box>
  );
};

export default CreateVacancy;
