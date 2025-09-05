import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
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
  TableSortLabel,
  Button,
} from "@mui/material";
import axios from "axios";
import type { InterviewResult } from "../types";

// A type definition for sorting
type SortableKeys = keyof InterviewResult;

const VacancyInterviewsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<InterviewResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortableKeys>("general_score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchInterviews();
  }, [id]);

  const fetchInterviews = async () => {
    if (!id) {
      setError("Vacancy ID not provided.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get<InterviewResult[]>(
        `https://vtb-aihr.ru/api/vacancy/interview/all/${id}`
      );
      setInterviews(res.data);
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
      setError("Failed to fetch interview results.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: SortableKeys) => {
    const isAsc = sortBy === column && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortBy(column);
  };

  const sortedInterviews = [...interviews].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const handleRowClick = (interviewId: number) => {
    navigate(`/interviewDetails/${interviewId}`);
  };

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
    <Box maxWidth="1200px" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom align="center">
        Interview Results for Vacancy {id}
      </Typography>
      {interviews.length === 0 ? (
        <Typography align="center" mt={4}>
          No interview results available for this vacancy yet.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "candidate_email"}
                    direction={sortDirection}
                    onClick={() => handleSort("candidate_email")}
                  >
                    Candidate Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "general_score"}
                    direction={sortDirection}
                    onClick={() => handleSort("general_score")}
                  >
                    General Score
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "general_result"}
                    direction={sortDirection}
                    onClick={() => handleSort("general_result")}
                  >
                    Result
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "red_flag_score"}
                    direction={sortDirection}
                    onClick={() => handleSort("red_flag_score")}
                  >
                    Red Flag Score
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "hard_skill_score"}
                    direction={sortDirection}
                    onClick={() => handleSort("hard_skill_score")}
                  >
                    Hard Skill Score
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "soft_skill_score"}
                    direction={sortDirection}
                    onClick={() => handleSort("soft_skill_score")}
                  >
                    Soft Skill Score
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "created_at"}
                    direction={sortDirection}
                    onClick={() => handleSort("created_at")}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedInterviews.map((interview) => (
                <TableRow key={interview.id} hover onClick={() => handleRowClick(interview.id)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{interview.candidate_email}</TableCell>
                  <TableCell>{interview.general_score}</TableCell>
                  <TableCell>{interview.general_result}</TableCell>
                  <TableCell>{interview.red_flag_score}</TableCell>
                  <TableCell>{interview.hard_skill_score}</TableCell>
                  <TableCell>{interview.soft_skill_score}</TableCell>
                  <TableCell>{new Date(interview.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default VacancyInterviewsPage;