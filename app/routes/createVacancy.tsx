import React, { useState, useCallback, memo } from "react";
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
  Tooltip,
  Badge,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from '@mui/icons-material/Info';
import axios from "axios";
import { useNavigate } from "react-router";
import "./createVacancy.css";
import Back from "../components/back";

type SkillLevel = "junior" | "middle" | "senior" | "lead";

interface VacancyPayload {
  name: string;
  tags: string[];
  description: string;
  red_flags: string;
  skill_lvl: SkillLevel | undefined;
}

interface ReviewWeights {
  accordance_xp_vacancy_score_threshold: number;
  accordance_skill_vacancy_score_threshold: number;
  recommendation_weight: number;
  portfolio_weight: number;
}

interface InterviewWeights {
  logic_structure_score_weight: number;
  soft_skill_score_weight: number;
  hard_skill_score_weight: number;
  accordance_xp_resume_score_weight: number;
  accordance_skill_resume_score_weight: number;
  red_flag_score_weight: number;
}

// Memoized components

const VacancyField = memo(
  ({ label, value, onChange, multiline = false }: any) => (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      multiline={multiline}
      minRows={multiline ? 2 : undefined}
    />
  )
);

const SliderField = memo(
  ({ label, value, field, onChange }: { label: string; value: number; field: string; onChange: (field: string, v: number) => void }) => (
    <Box display="flex" flexDirection="column" gap={1}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography gutterBottom>{label}</Typography>
        <Badge
          badgeContent={2}
          color="primary"
          variant="standard"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: 'rgba(237, 246, 255, 1)',
              border: '1px solid rgba(51, 97, 236, 1)',
              color: 'rgba(51, 97, 236, 1)',
              height: 24,
              width: 24,
              borderRadius: 2,
              fontSize: 14,
            },
          }}
        />
      </Box>
      <Slider
        value={value}
        onChange={(_, v) => onChange(field, v as number)}
        min={0}
        max={5}
        step={1}
        marks
        valueLabelDisplay="off"
      />
    </Box>
  )
);

const TagInput = memo(({ newTag, setNewTag, tags, onAdd, onDelete, onGenerate, loading }: any) => (
  <Box>
    <Stack direction="row" spacing={1}>
      <TextField
        label="Тэги"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onAdd();
        }}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={onAdd} sx={{ borderRadius: 2, backgroundColor: "#3361EC", color: "#fff" }}>
                <AddIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button className="generate-button" onClick={onGenerate} variant="contained" disabled={loading}>
        {loading ? "Генерация..." : "Сгенерировать"}
      </Button>
    </Stack>
    <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
      {tags.map((tag: string, index: number) => (
        <Chip key={index} label={tag} onDelete={() => onDelete(tag)} />
      ))}
    </Stack>
  </Box>
));

// Main component

const CreateVacancy: React.FC = () => {
  const [form, setForm] = useState<VacancyPayload>({
    name: "",
    tags: [],
    description: "",
    red_flags: "",
    skill_lvl: undefined,
  });

  const [reviewWeights, setReviewWeights] = useState<ReviewWeights>({
    accordance_xp_vacancy_score_threshold: 3,
    accordance_skill_vacancy_score_threshold: 3,
    recommendation_weight: 3,
    portfolio_weight: 3,
  });

  const [interviewWeights, setInterviewWeights] = useState<InterviewWeights>({
    logic_structure_score_weight: 3,
    soft_skill_score_weight: 3,
    hard_skill_score_weight: 3,
    accordance_xp_resume_score_weight: 3,
    accordance_skill_resume_score_weight: 3,
    red_flag_score_weight: 3,
  });

  const [newTag, setNewTag] = useState("");
  const [showInterviewCriteria, setShowInterviewCriteria] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const navigate = useNavigate();

  // Handlers with useCallback

  const handleFormChange = useCallback((field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleReviewWeightChange = useCallback((field: string, value: number) => {
    setReviewWeights((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleInterviewWeightChange = useCallback((field: string, value: number) => {
    setInterviewWeights((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  }, [newTag, form.tags]);

  const handleGenerateTags = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post("https://vtb-aihr.ru/api/vacancy/generate-tags", {
        vacancy_description: form.description,
      });
      const generatedTags = res.data?.tags;
      if (generatedTags && Array.isArray(generatedTags)) {
        const combinedTags = [...form.tags, ...generatedTags];
        const uniqueTags = [...new Set(combinedTags)];
        handleFormChange("tags", uniqueTags);
        setMessage({ text: "Tags generated successfully!", type: "success" });
      } else {
        setMessage({ text: "Failed to generate tags.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Failed to generate tags.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [form.description, form.tags, handleFormChange]);

  const handleDeleteTag = useCallback(
    (tagToDelete: string) => {
      const updatedTags = form.tags.filter((tag) => tag !== tagToDelete);
      handleFormChange("tags", updatedTags);
    },
    [form.tags, handleFormChange]
  );

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const vacancyRes = await axios.post("https://vtb-aihr.ru/api/vacancy/create", form);
      const vacancyId = vacancyRes.data?.vacancy_id;
      if (!vacancyId) throw new Error("No vacancy ID");

      await axios.post("https://vtb-aihr.ru/api/vacancy/resume-weights/create", {
        vacancy_id: vacancyId,
        ...reviewWeights,
      });

      await axios.post("https://vtb-aihr.ru/api/vacancy/interview-weights/create", {
        vacancy_id: vacancyId,
        ...interviewWeights,
      });

      setMessage({ text: "Saved successfully!", type: "success" });
      navigate(`/questions/${vacancyId}`);
    } catch (err) {
      setMessage({ text: "Failed to save vacancy.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [form, reviewWeights, interviewWeights, navigate]);

  return (
    <Box maxWidth="560px" mx="auto" mt={4}>
      <Back />
      <Typography mb={5} variant="h4" fontWeight={600} gutterBottom>
        Создание вакансии
      </Typography>

      <Stack spacing={1}>
        <VacancyField label="Название вакансии" value={form.name} onChange={(v: string) => handleFormChange("name", v)} />
        <TagInput
          newTag={newTag}
          setNewTag={setNewTag}
          tags={form.tags}
          onAdd={handleAddTag}
          onDelete={handleDeleteTag}
          onGenerate={handleGenerateTags}
          loading={loading}
        />
        <VacancyField label="Описание вакансии" value={form.description} onChange={(v: string) => handleFormChange("description", v)} multiline />
        <VacancyField label="Красные флаги" value={form.red_flags} onChange={(v: string) => handleFormChange("red_flags", v)} />

        <TextField
          select
          value={form.skill_lvl}
          label="Уровень специалиста"
          onChange={(e) => handleFormChange("skill_lvl", e.target.value as SkillLevel)}
          fullWidth
        >
          {/* <MenuItem disabled value="default">
            Уровень специалиста
          </MenuItem> */}
          <MenuItem value="junior">Junior</MenuItem>
          <MenuItem value="middle">Middle</MenuItem>
          <MenuItem value="senior">Senior</MenuItem>
          <MenuItem value="lead">Lead</MenuItem>
        </TextField>
      </Stack>

      <Box mt={4}>
        <Typography fontWeight={600} variant="h5" gutterBottom>
          Критерии проверки резюме
          <Tooltip
            title="Укажите по шкале от 1 до 5 на какие критерии важно обратить внимание при анализе резюме"
            placement="bottom"
            arrow
          >
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>

        </Typography>
        <Stack mt={3} spacing={2} >
          {[
            { label: "Технические навыки", field: "accordance_skill_vacancy_score_threshold" },
            { label: "Опыт работы", field: "accordance_xp_vacancy_score_threshold" },
            { label: "Рекомендации", field: "recommendation_weight" },
            { label: "Портфолио", field: "portfolio_weight" },
          ].map(({ label, field }) => (
            <SliderField
              key={field}
              label={label}
              field={field}
              value={reviewWeights[field as keyof ReviewWeights]}
              onChange={handleReviewWeightChange}
            />
          ))}
        </Stack>
      </Box>

      <Box mt={4}>
        <Box display="flex" alignItems="center" onClick={() => setShowInterviewCriteria(!showInterviewCriteria)} sx={{ cursor: "pointer" }}>
          <Typography variant="subtitle1" fontSize={16}>
            Настройки критериев оценки интервью
          </Typography>
          <IconButton sx={{ transform: showInterviewCriteria ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
            <ExpandMoreIcon />
          </IconButton>
        </Box>
        <Collapse in={showInterviewCriteria}>
          <Box mt={2}>
            <Typography fontWeight={600} variant="h5" gutterBottom>
              Критерии оценки интервью
            </Typography>
            <Stack mt={3} spacing={2}>
              {[
                { "label": "Оценка логической структуры ответов", "field": "logic_structure_score_weight" },
                { "label": "Оценка софт-скиллов", "field": "soft_skill_score_weight" },
                { "label": "Оценка хард-скиллов", "field": "hard_skill_score_weight" },
                { "label": "Соответствие опыта в резюме кандидата", "field": "accordance_xp_resume_score_weight" },
                { "label": "Соответствие навыков в резюме требованиям кандидата", "field": "accordance_skill_resume_score_weight" },
                { "label": "Оценка красных флагов", "field": "red_flag_score_weight" }
              ].map(({ label, field }) => (
                <SliderField
                  key={field}
                  label={label}
                  field={field}
                  value={interviewWeights[field as keyof InterviewWeights]}
                  onChange={handleInterviewWeightChange}
                />
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

      <Box mt={4} mb={5}>
        <Button variant="contained" onClick={handleSubmit} fullWidth disabled={loading}>
          {loading ? "Сохранение..." : "Сохранить"}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateVacancy;
