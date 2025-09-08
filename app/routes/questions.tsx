import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { Edit, Delete, AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router";
import axios from "axios";

interface Question {
  id?: number;
  question: string;
  question_type: string;
  hint_for_evaluation: string;
  weight: number;
  response_time: number;
}

const QuestionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vacancyId = Number(id);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [genType, setGenType] = useState("soft");
  const [genCount, setGenCount] = useState(1);
  const [mode, setMode] = useState("manual");

  const [newQuestion, setNewQuestion] = useState<Question>({
    question: "",
    question_type: "soft",
    hint_for_evaluation: "",
    weight: 0,
    response_time: 0,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`https://vtb-aihr.ru/api/vacancy/question/all/${vacancyId}`);
        setQuestions(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch questions");
      }
    };
    fetchQuestions();
  }, [vacancyId]);

  const handleGenerate = async () => {
    try {
      const res = await axios.post("https://vtb-aihr.ru/api/vacancy/question/generate", {
        vacancy_id: vacancyId,
        questions_type: genType,
        count_questions: genCount,
      });

      const generated: Question[] = res.data.questions;
      const saved: Question[] = [];

      for (const q of generated) {
        delete q.id; // Remove any temporary ID before saving
        const saveRes = await axios.post("https://vtb-aihr.ru/api/vacancy/question/add", {
          vacancy_id: vacancyId,
          ...q,
          // response_time: 60, // Default response time for generated questions
        });

        saved.push({
          ...q,
          id: saveRes.data.question_id,
        });
      }

      setQuestions((prev) => [...prev, ...saved]);
    } catch (err) {
      console.error(err);
      alert("Failed to generate questions");
    }
  };

  const handleAddManual = async () => {
    try {
      const res = await axios.post("https://vtb-aihr.ru/api/vacancy/question/add", {
        vacancy_id: vacancyId,
        ...newQuestion,
      });

      const saved: Question = {
        ...newQuestion,
        id: res.data.question_id,
      };

      setQuestions((prev) => [...prev, saved]);
      setNewQuestion({ question: "", question_type: "soft", hint_for_evaluation: "", weight: 0, response_time: 0 });
    } catch (err) {
      console.error(err);
      alert("Failed to add question");
    }
  };

  const handleDelete = async (qid: number) => {
    try {
      await axios.delete(`https://vtb-aihr.ru/api/vacancy/question/delete/${qid}`);
      setQuestions((prev) => prev.filter((q) => q.id !== qid));
    } catch (err) {
      console.error(err);
      alert("Failed to delete question");
    }
  };

  const handleEdit = async (q: Question) => {
    if (!q.id) return;
    try {
      await axios.put("https://vtb-aihr.ru/api/vacancy/question/edit", {
        vacancy_id: vacancyId,
        question_id: q.id,
        ...q,
      });

      setQuestions((prev) =>
        prev.map((qq) => (qq.id === q.id ? { ...qq, ...q } : qq))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to edit question");
    }
  };

  return (
    <Stack direction="row" spacing={3} p={3} sx={{ height: "calc(100vh - 64px)" }}>
      {/* Left side: Question Creation */}
      <Paper elevation={3} sx={{ p: 3, flex: 1, overflowY: "auto" }}>
        <Typography variant="h5" gutterBottom align="center">
          Question Creation
        </Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, newMode) => newMode && setMode(newMode)}
          sx={{ width: "100%", mb: 2 }}
        >
          <ToggleButton value="generate" sx={{ flex: 1 }}>
            <AutoAwesomeIcon sx={{ mr: 1 }} /> Generate
          </ToggleButton>
          <ToggleButton value="manual" sx={{ flex: 1 }}>
            Write Manually
          </ToggleButton>
        </ToggleButtonGroup>
        <Divider sx={{ my: 2 }} />

        {mode === "manual" ? (
          <Stack spacing={2}>
            <TextField
              label="Question"
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
            />
            <TextField
              label="Hint for Evaluation"
              value={newQuestion.hint_for_evaluation}
              onChange={(e) => setNewQuestion({ ...newQuestion, hint_for_evaluation: e.target.value })}
            />
            <TextField
              type="number"
              label="Weight"
              value={newQuestion.weight}
              onChange={(e) => setNewQuestion({ ...newQuestion, weight: Number(e.target.value) })}
            />
            <TextField
              type="number"
              label="Response Time (seconds)"
              value={newQuestion.response_time}
              onChange={(e) => setNewQuestion({ ...newQuestion, response_time: Number(e.target.value) })}
            />
            <TextField
              select
              label="Type"
              value={newQuestion.question_type}
              onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
            >
              <MenuItem value="soft">Soft</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </TextField>
            <Button variant="contained" onClick={handleAddManual}>
              Create
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField
              select
              label="Question Type"
              value={genType}
              onChange={(e) => setGenType(e.target.value)}
            >
              <MenuItem value="soft">Soft</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </TextField>
            <TextField
              type="number"
              label="Count"
              value={genCount}
              onChange={(e) => setGenCount(Number(e.target.value))}
            />
            <Button variant="contained" onClick={handleGenerate}>
              Create
            </Button>
          </Stack>
        )}
        <Button
          fullWidth
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => navigate("/vacancies?isRecruiter=true")}
        >
          Finish
        </Button>
      </Paper>

      {/* Right side: Questions List */}
      <Paper elevation={3} sx={{ p: 3, flex: 1, overflowY: "auto" }}>
        <Typography variant="h5" gutterBottom align="center">
          Questions ({questions.length})
        </Typography>
        <Divider sx={{ my: 2 }} />
        {questions.length === 0 ? (
          <Box p={4} textAlign="center" color="text.secondary">
            <Typography variant="h6">No questions yet</Typography>
            <Typography>Start by creating some!</Typography>
          </Box>
        ) : (
          <List>
            {questions.map((q) => (
              <QuestionListItem
                key={q.id ?? q.question}
                q={q}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            ))}
          </List>
        )}
      </Paper>
    </Stack>
  );
};

export default QuestionsPage;

function QuestionListItem({ q, handleEdit, handleDelete }: {
  q: Question;
  handleEdit: (q: Question) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Question>(q);

  const saveEdit = async () => {
    await handleEdit(editData);
    setIsEditing(false);
  };

  return (
    <ListItem
      alignItems="flex-start"
      sx={{ border: "1px solid #e0e0e0", borderRadius: 1, mb: 1 }}
      secondaryAction={
        <Stack direction="row" spacing={1}>
          {!isEditing &&
            <IconButton onClick={() => setIsEditing(true)}>
              <Edit />
            </IconButton>
          }
          {q.id && !isEditing && (
            <IconButton onClick={() => handleDelete(q.id!)}>
              <Delete />
            </IconButton>
          )}
        </Stack>
      }
    >
      {isEditing ? (
        <Stack spacing={1} width="100%">
          <TextField
            label="Question"
            value={editData.question}
            onChange={(e) => setEditData({ ...editData, question: e.target.value })}
          />
          <TextField
            label="Hint"
            value={editData.hint_for_evaluation}
            onChange={(e) => setEditData({ ...editData, hint_for_evaluation: e.target.value })}
          />
          <TextField
            type="number"
            label="Weight"
            value={editData.weight}
            onChange={(e) => setEditData({ ...editData, weight: Number(e.target.value) })}
          />
          <TextField
            type="number"
            label="Response Time (seconds)"
            value={editData.response_time}
            onChange={(e) => setEditData({ ...editData, response_time: Number(e.target.value) })}
          />
          <TextField
            select
            label="Type"
            value={editData.question_type}
            onChange={(e) => setEditData({ ...editData, question_type: e.target.value })}
          >
            <MenuItem value="soft">Soft</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
          </TextField>
          <Button variant="contained" size="small" onClick={saveEdit}>
            Save
          </Button>
        </Stack>
      ) : (
        <ListItemText
          primary={`${q.question} (${q.question_type}, weight: ${q.weight})`}
          secondary={`Hint: ${q.hint_for_evaluation}, Response Time: ${q.response_time}s`}
        />
      )}
    </ListItem>
  );
}