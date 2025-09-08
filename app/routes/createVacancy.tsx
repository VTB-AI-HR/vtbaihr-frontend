import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Slider,
  IconButton,
  InputAdornment,
  Collapse,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import { useNavigate } from "react-router";

// This is a type-safe way to define skill levels.
type SkillLevel = "junior" | "middle" | "senior" | "lead";

// Define the shape of the main form data.
interface VacancyPayload {
  name: string;
  tags: string[]; // Tags are now an array
  description: string;
  red_flags: string;
  skill_lvl: SkillLevel;
}

// Define the shape of the resume review criteria data.
interface ReviewWeights {
  hard_skill_weight: number;
  work_xp_weight: number;
  recommendation_weight: number;
  portfolio_weight: number;
}

// Define the shape of the new interview evaluation criteria data.
interface InterviewWeights {
  logic_structure_score_weight: number;
  soft_skill_score_weight: number;
  hard_skill_score_weight: number;
  accordance_xp_vacancy_score_weight: number;
  accordance_skill_vacancy_score_weight: number;
  accordance_xp_resume_score_weight: number;
  accordance_skill_resume_score_weight: number;
  red_flag_score_weight: number;
}

const CreateVacancy: React.FC = () => {
  const [form, setForm] = useState<VacancyPayload>({
    name: "",
    tags: [],
    description: "",
    red_flags: "",
    skill_lvl: "junior",
  });

  const [reviewWeights, setReviewWeights] = useState<ReviewWeights>({
    hard_skill_weight: 0,
    work_xp_weight: 0,
    recommendation_weight: 0,
    portfolio_weight: 0,
  });

  const [interviewWeights, setInterviewWeights] = useState<InterviewWeights>({
    logic_structure_score_weight: 0,
    soft_skill_score_weight: 0,
    hard_skill_score_weight: 0,
    accordance_xp_vacancy_score_weight: 0,
    accordance_skill_vacancy_score_weight: 0,
    accordance_xp_resume_score_weight: 0,
    accordance_skill_resume_score_weight: 0,
    red_flag_score_weight: 0,
  });
  
  const [newTag, setNewTag] = useState("");
  const [showInterviewCriteria, setShowInterviewCriteria] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const navigate = useNavigate();

  // Handle changes for the main vacancy form.
  const handleFormChange = (field: keyof VacancyPayload, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle changes for the review weight sliders.
  const handleReviewWeightChange = (field: keyof ReviewWeights, value: number | number[]) => {
    setReviewWeights((prev) => ({ ...prev, [field]: value as number }));
  };

  // Handle changes for the interview weight sliders.
  const handleInterviewWeightChange = (field: keyof InterviewWeights, value: number | number[]) => {
    setInterviewWeights((prev) => ({ ...prev, [field]: value as number }));
  };

  // Add a new tag from the input field.
  const handleAddTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  // Generate tags from the description by calling the API.
  const handleGenerateTags = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post("https://vtb-aihr.ru/api/vacancy/generate-tags", {
        vacancy_description: form.description,
      });
      const generatedTags = res.data?.tags;
      if (generatedTags && Array.isArray(generatedTags)) {
        // Add new tags to the existing list, avoiding duplicates.
        const combinedTags = [...form.tags, ...generatedTags];
        const uniqueTags = [...new Set(combinedTags)];
        handleFormChange("tags", uniqueTags);
        setMessage({ text: "Tags generated successfully!", type: "success" });
      } else {
        setMessage({ text: "Failed to generate tags. Please try again.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to generate tags. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Delete a tag by filtering the array.
  const handleDeleteTag = (tagToDelete: string) => {
    const updatedTags = form.tags.filter((tag) => tag !== tagToDelete);
    handleFormChange("tags", updatedTags);
  };

  // Main submission handler that chains all API calls.
  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Step 1: Create the vacancy.
      const vacancyRes = await axios.post("https://vtb-aihr.ru/api/vacancy/create", form);
      const vacancyId = vacancyRes.data?.vacancy_id;

      if (!vacancyId) {
        throw new Error("Vacancy ID not returned from API.");
      }

      // Step 2: Save the resume weight criteria.
      const reviewWeightsPayload = {
        vacancy_id: vacancyId,
        ...reviewWeights,
      };
      await axios.post("https://vtb-aihr.ru/api/vacancy/resume-weight/create", reviewWeightsPayload);
      
      // Step 3: Save the interview evaluation criteria.
      const interviewWeightsPayload = {
        vacancy_id: vacancyId,
        ...interviewWeights,
      };
      await axios.post("https://vtb-aihr.ru/api/vacancy/criterion-weight/create", interviewWeightsPayload);

      setMessage({ text: "Vacancy and review criteria saved successfully!", type: "success" });
      
      // Step 4: Navigate to the next page.
      navigate(`/questions/${vacancyId}`);
      
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to save vacancy. Please check your inputs.", type: "error" });
    } finally {
      setLoading(false);
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
          onChange={(e) => handleFormChange("name", e.target.value)}
          fullWidth
        />

        <Box>
          <Typography variant="subtitle1">Tags</Typography>
          <Stack direction="row" spacing={1} mt={1}>
            <TextField
              label="Enter tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddTag();
                }
              }}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleAddTag}>
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button onClick={handleGenerateTags} variant="contained" disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
            {form.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
              />
            ))}
          </Stack>
        </Box>

        <TextField
          label="Description"
          multiline
          minRows={3}
          value={form.description}
          onChange={(e) => handleFormChange("description", e.target.value)}
          fullWidth
        />

        <TextField
          label="Red Flags"
          multiline
          minRows={2}
          value={form.red_flags}
          onChange={(e) => handleFormChange("red_flags", e.target.value)}
          fullWidth
        />

        <TextField
          select
          label="Skill Level"
          value={form.skill_lvl}
          onChange={(e) =>
            handleFormChange("skill_lvl", e.target.value as SkillLevel)
          }
          fullWidth
        >
          <MenuItem value="junior">Junior</MenuItem>
          <MenuItem value="middle">Middle</MenuItem>
          <MenuItem value="senior">Senior</MenuItem>
          <MenuItem value="lead">Lead</MenuItem>
        </TextField>
      </Stack>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Resume Review Criteria
        </Typography>
        <Stack spacing={2} p={2} sx={{ border: '1px solid #ccc', borderRadius: 2 }}>
          {[
            { label: "Hard Skill Weight", field: "hard_skill_weight" },
            { label: "Work Experience Weight", field: "work_xp_weight" },
            { label: "Recommendation Weight", field: "recommendation_weight" },
            { label: "Portfolio Weight", field: "portfolio_weight" },
          ].map(({ label, field }) => (
            <Box key={field} display="flex" flexDirection="column" gap={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography gutterBottom>{label}</Typography>
                <Chip label={reviewWeights[field as keyof ReviewWeights]} color="primary" size="small" />
              </Box>
              <Slider
                value={reviewWeights[field as keyof ReviewWeights]}
                onChange={(e, value) => handleReviewWeightChange(field as keyof ReviewWeights, value)}
                min={0}
                max={5}
                step={1}
                marks
                valueLabelDisplay="off"
              />
            </Box>
          ))}
        </Stack>
      </Box>

      {/* New Interview Evaluation Criteria Section */}
      <Box mt={4}>
        <Box display="flex" alignItems="center" onClick={() => setShowInterviewCriteria(!showInterviewCriteria)} sx={{ cursor: 'pointer' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Interview Evaluation Criteria Settings
          </Typography>
          <IconButton sx={{ transform: showInterviewCriteria ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
            <ExpandMoreIcon />
          </IconButton>
        </Box>
        <Collapse in={showInterviewCriteria}>
          <Box mt={2} p={2} sx={{ border: '1px solid #ccc', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Interview Evaluation Criteria
            </Typography>
            <Stack spacing={2}>
              {[
                { label: "Logic/Structure Score Weight", field: "logic_structure_score_weight" },
                { label: "Soft Skill Score Weight", field: "soft_skill_score_weight" },
                { label: "Hard Skill Score Weight", field: "hard_skill_score_weight" },
                { label: "Accordance XP Vacancy Weight", field: "accordance_xp_vacancy_score_weight" },
                { label: "Accordance Skill Vacancy Weight", field: "accordance_skill_vacancy_score_weight" },
                { label: "Accordance XP Resume Weight", field: "accordance_xp_resume_score_weight" },
                { label: "Accordance Skill Resume Weight", field: "accordance_skill_resume_score_weight" },
                { label: "Red Flag Score Weight", field: "red_flag_score_weight" },
              ].map(({ label, field }) => (
                <Box key={field} display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography gutterBottom>{label}</Typography>
                    <Chip label={interviewWeights[field as keyof InterviewWeights]} color="primary" size="small" />
                  </Box>
                  <Slider
                    value={interviewWeights[field as keyof InterviewWeights]}
                    onChange={(e, value) => handleInterviewWeightChange(field as keyof InterviewWeights, value)}
                    min={0}
                    max={5}
                    step={1}
                    marks
                    valueLabelDisplay="off"
                  />
                </Box>
              ))}
            </Stack>
          </Box>
        </Collapse>
      </Box>

      {message && (
        <Box mt={3} p={2} borderRadius={2} sx={{ backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da" }}>
          <Typography color={message.type === "success" ? "#155724" : "#721c24"}>{message.text}</Typography>
        </Box>
      )}

      <Box mt={4}>
        <Button variant="contained" onClick={handleSubmit} fullWidth disabled={loading}>
          {loading ? "Saving..." : "Save and go to interview questions"}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateVacancy;
