// QuestionsPage.tsx
import React, { useState } from "react";
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
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useParams } from "react-router";
import axios from "axios";

interface Question {
  question_id?: number;
  question: string;
  question_type: string;
  hint_for_evaluation: string;
  weight: number;
}

const QuestionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vacancyId = Number(id);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [genType, setGenType] = useState("soft");
  const [genCount, setGenCount] = useState(1);

  const [newQuestion, setNewQuestion] = useState<Question>({
    question: "",
    question_type: "soft",
    hint_for_evaluation: "",
    weight: 0,
  });

  const handleGenerate = async () => {
  try {
    const res = await axios.post("https://vtb-aihr.ru/api/vacancy/question/generate", {
      vacancy_id: vacancyId,
      questions_type: genType,
      count_questions: genCount,
    });

    const generated: Question[] = res.data;

    const saved: Question[] = [];
    for (const q of generated) {
      const saveRes = await axios.post("https://vtb-aihr.ru/api/vacancy/question/add", {
        vacancy_id: vacancyId,
        ...q,
      });

      // combine generated fields with returned ID
      saved.push({
        ...q,
        question_id: saveRes.data.question_id,
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

    // combine backend question_id with the frontend question data
    const saved: Question = {
      ...newQuestion,
      question_id: res.data.question_id,
    };

    setQuestions((prev) => [...prev, saved]);
    setNewQuestion({ question: "", question_type: "soft", hint_for_evaluation: "", weight: 0 });
  } catch (err) {
    console.error(err);
    alert("Failed to add question");
  }
};


  const handleDelete = async (qid: number) => {
    try {
      await axios.delete(`https://vtb-aihr.ru/api/vacancy/question/delete/${qid}`);
      setQuestions((prev) => prev.filter((q) => q.question_id !== qid));
    } catch (err) {
      console.error(err);
      alert("Failed to delete question");
    }
  };


const handleEdit = async (q: Question) => {
  if (!q.question_id) return;
  try {
    await axios.put("https://vtb-aihr.ru/api/vacancy/question/edit", {
      vacancy_id: vacancyId,
      ...q,
    });

    // Update frontend state with the edited question
    setQuestions((prev) =>
      prev.map((qq) => (qq.question_id === q.question_id ? { ...qq, ...q } : qq))
    );
  } catch (err) {
    console.error(err);
    alert("Failed to edit question");
  }
};


  return (
    <Box maxWidth="700px" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom>
        Questions
      </Typography>

      {/* Generate section */}
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
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
          Generate Questions
        </Button>
      </Stack>

      {/* Manual add form */}
      <Typography variant="subtitle1">Add Question Manually</Typography>
      <Stack spacing={2} mb={3}>
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
          select
          label="Type"
          value={newQuestion.question_type}
          onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
        >
          <MenuItem value="soft">Soft</MenuItem>
          <MenuItem value="hard">Hard</MenuItem>
        </TextField>
        <Button variant="contained" onClick={handleAddManual}>
          Add Question
        </Button>
      </Stack>

      {/* Question list */}
      <Typography variant="subtitle1">Questions List</Typography>
       <List>
      {questions.map((q) => (
          <QuestionListItem
            key={q.question_id ?? q.question}
            q={q}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        ))}
      </List>
    </Box>
  );
};

export default QuestionsPage;


function QuestionListItem({ q, handleEdit, handleDelete }: {
  q: Question;
  handleEdit: (q: Question) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
}){
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Question>(q);

  const saveEdit = async () => {
    await handleEdit(editData);
    setIsEditing(false);
  };

  return (
    <ListItem
      key={q.question_id ?? q.question}
      alignItems="flex-start"
      secondaryAction={
        <Stack direction="row" spacing={1}>
          {!isEditing &&
            <IconButton onClick={() => setIsEditing(true)}>
              <Edit />
            </IconButton>
          }
          {q.question_id && !isEditing && (
            <IconButton onClick={() => handleDelete(q.question_id!)}>
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
          secondary={`Hint: ${q.hint_for_evaluation}`}
        />
      )}
    </ListItem>
  );
};