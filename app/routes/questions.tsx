import React, { useState, useEffect } from "react";
import {
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
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { Edit, Delete, AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import Back from "./back";

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
  const [loading, setLoading] = useState(false);
  const [isFetchingAllQuestions, setIsFetchingAllQuestions] = useState(true);

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
        setIsFetchingAllQuestions(false)
      } catch (err) {
        console.error(err);
        alert("Failed to fetch questions");
      }
    };
    fetchQuestions();
  }, [vacancyId]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post("https://vtb-aihr.ru/api/vacancy/question/generate", {
        vacancy_id: vacancyId,
        questions_type: genType,
        count_questions: genCount,
      });

      const generated: Question[] = res.data.questions;
      const saved: Question[] = [];

      for (const q of generated) {
        delete q.id;
        const saveRes = await axios.post("https://vtb-aihr.ru/api/vacancy/question/add", {
          vacancy_id: vacancyId,
          ...q,
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
    } finally {
      setLoading(false);
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
    <Stack direction="row" justifyContent='center' spacing={3} p={3} sx={{ height: "calc(100vh - 64px)" }}>
      <div style={{ flex: 1, maxWidth: 610, padding: 24 }}>
        <Back />
        <Typography mb={5} variant="h4" fontWeight={600} gutterBottom>
          Создание вопросов
        </Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, newMode) => newMode && setMode(newMode)}
          sx={{ width: "100%", mb: 4 }}
          disabled={loading}
        >
          <ToggleButton value="generate" sx={{ flex: 1 }}>
            Сгенерировать <AutoAwesomeIcon sx={{ ml: 1 }} />
          </ToggleButton>
          <ToggleButton value="manual" sx={{ flex: 1 }}>
            Создать вручную
          </ToggleButton>
        </ToggleButtonGroup>
        {mode === "manual" ? (
          <Stack spacing={2}>
            <TextField
              label="Вопрос"
              value={newQuestion.question}
              disabled={loading}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
            />
            <TextField
              label="На что обратить внимание"
              value={newQuestion.hint_for_evaluation}
              disabled={loading}
              onChange={(e) => setNewQuestion({ ...newQuestion, hint_for_evaluation: e.target.value })}
            />
            <Stack direction={"row"} spacing={2}>
              <TextField
                select
                fullWidth
                disabled={loading}
                label="Вес"
                value={newQuestion.weight}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, weight: Number(e.target.value) })
                }
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <MenuItem key={i} value={i}>
                    {i}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                disabled={loading}
                label="Что проверяем"
                value={newQuestion.question_type}
                onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
              >
                <MenuItem value="soft">Soft</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </TextField>
            </Stack>
            <TextField
              type="number"
              disabled={loading}
              label="Время на один ответ (минуты)"
              value={newQuestion.response_time}
              onChange={(e) => setNewQuestion({ ...newQuestion, response_time: Number(e.target.value) })}
            />
          </Stack>
        ) : (
          <Stack spacing={2} direction={"column"}>
            <TextField
              fullWidth
              type="number"
              disabled={loading}
              label="Количество"
              value={genCount}
              onChange={(e) => setGenCount(Number(e.target.value))}
            />
            <TextField
              fullWidth
              select
              disabled={loading}
              label="Что проверяем"
              value={genType}
              onChange={(e) => setGenType(e.target.value)}
            >
              <MenuItem value="soft">Soft</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
              <MenuItem value="soft-hard">Soft-Hard</MenuItem>
            </TextField>
          </Stack>
        )}
        <Stack direction="row" spacing={2} alignItems="center" mt={2}>
          <Button
            size="large"
            fullWidth
            variant="contained"
            onClick={mode === 'manual' ? handleAddManual : handleGenerate}
            disabled={loading}
          >
            {mode === 'manual' ? 'Создать' : 'Сгенерировать'}
          </Button>
          <Button
            fullWidth
            size="large"
            variant="outlined"
            onClick={() => navigate("/vacancies?isRecruiter=true")}
            disabled={loading}
          >
            Сохранить и выйти
          </Button>
        </Stack>
      </div>

      {/* Right side: Questions List */}
      <div style={{ flex: 1, maxWidth: 610, padding: 24 }}>
        <Typography mt={5} mb={4} variant="h5" fontWeight={600} gutterBottom>
          Вопросы {!isFetchingAllQuestions && '('}{!isFetchingAllQuestions && questions.length}{loading ? ` + Генерируем ${genCount}` : ""}{!isFetchingAllQuestions && ')'}
        </Typography>
        <div style={{ overflowY: "auto", height: "calc(100vh - 250px)", paddingRight: 8 }}>
          {isFetchingAllQuestions &&<>
            <Skeleton variant="rounded" height={300} style={{marginBottom: 24}}/>
            <Skeleton variant="rounded" height={300} style={{marginBottom: 24}}/>
            <Skeleton variant="rounded" height={300}/>
          </>
          }
          {questions.length === 0 && !loading && !isFetchingAllQuestions ? (
            <Paper>
              <Typography variant="h6">Создайте первый вопрос, он появится здесь</Typography>
            </Paper>
          ) : (
            <List>
              {questions.map((q, index) => (
                <QuestionListItem
                  index={index}
                  key={q.id ?? q.question}
                  q={q}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
              ))}
              {}
              {loading &&
                Array.from({ length: genCount }).map((_, i) => (
                  <ListItem key={`skeleton-${i}`} sx={{ backgroundColor: 'white', borderRadius: 2, mb: 3, flexDirection: 'column' }}>
                    <div style={{ color: '#778093', alignSelf: 'flex-start' }}>
                      Вопрос {questions.length + i + 1}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', padding: 30, gap: 20 }}>
                      <div>
                        Генерация вопроса...
                      </div>
                      <CircularProgress />
                    </div>
                  </ListItem>
                ))
              }
            </List>
          )}
        </div>
      </div>
    </Stack>
  );
};

export default QuestionsPage;

function QuestionListItem({ q, index, handleEdit, handleDelete }: {
  q: Question;
  index: number;
  handleEdit: (q: Question) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<Question>(q);

  const saveEdit = async () => {
    await handleEdit(editData);
    setOpen(false);
  };

  return (
    <>
      <ListItem
        alignItems="flex-start"
        sx={{ backgroundColor: 'white', borderRadius: 2, mb: 3 }}
      >
        <ListItemText
          primary={
            <div>
              <div style={{ color: '#778093' }}>
                Вопрос {index + 1}
              </div>
              {`${q.question} (${q.question_type}, weight: ${q.weight})`}
            </div>
          }
          secondary={
            <>
              Подсказка: {q.hint_for_evaluation}
              <Stack direction="row" mt={2} flexWrap="wrap">
                <Chip label={'Навык: ' + q.question_type} />
                <Chip label={'Вес: ' + q.weight} />
                <Chip label={q.response_time + ' мин'} />
              </Stack>
            </>
          }
        />
        <Stack direction="row">
          <IconButton onClick={() => { setEditData(q); setOpen(true); }}>
            <Edit />
          </IconButton>
          {q.id && (
            <IconButton onClick={() => handleDelete(q.id!)}>
              <Delete />
            </IconButton>
          )}
        </Stack>
      </ListItem>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Редактировать вопрос</DialogTitle>
        <DialogContent
        >
          <Stack spacing={2} mt={1}>
            <TextField
              label="Вопрос"
              value={editData.question}
              onChange={(e) => setEditData({ ...editData, question: e.target.value })}
              fullWidth
            />
            <TextField
              label="На что обратить внимание"
              value={editData.hint_for_evaluation}
              onChange={(e) => setEditData({ ...editData, hint_for_evaluation: e.target.value })}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                select
                fullWidth
                label="Вес"
                value={editData.weight}
                onChange={(e) => setEditData({ ...editData, weight: Number(e.target.value) })}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <MenuItem key={i} value={i}>{i}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Что проверяем"
                value={editData.question_type}
                onChange={(e) => setEditData({ ...editData, question_type: e.target.value })}
              >
                <MenuItem value="soft">Soft</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </TextField>
            </Stack>
            <TextField
              type="number"
              label="Время на один ответ (минуты)"
              value={editData.response_time}
              onChange={(e) => setEditData({ ...editData, response_time: Number(e.target.value) })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" fullWidth onClick={saveEdit}>Сохранить</Button>
          <Button variant="outlined" fullWidth onClick={() => setOpen(false)}>Назад</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
