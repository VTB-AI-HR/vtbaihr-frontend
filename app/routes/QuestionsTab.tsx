import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import axios from "axios";
import { type Question } from "../types";

interface QuestionsTabProps {
  vacancyId: string;
}

const QuestionsTab: React.FC<QuestionsTabProps> = ({ vacancyId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await axios.get<Question[]>(
          `https://vtb-aihr.ru/api/vacancy/question/all/${vacancyId}`
        );
        setQuestions(res.data);
      } catch (err) {
        setError("Failed to fetch questions.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [vacancyId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Вопрос</TableCell>
              <TableCell>Подсказка проверки</TableCell>
              <TableCell>Вес</TableCell>
              <TableCell>Типа</TableCell>
              <TableCell>Время на ответ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.map((q) => (
              <TableRow key={q.id}>
                <TableCell>{q.question}</TableCell>
                <TableCell>{q.hint_for_evaluation}</TableCell>
                <TableCell>{q.weight}</TableCell>
                <TableCell>{q.question_type}</TableCell>
                <TableCell>{q.response_time} мин</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QuestionsTab;
