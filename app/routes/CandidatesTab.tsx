import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
} from "@mui/material";
import { type CandidateEvaluation } from "../types";

interface CandidatesTabProps {
  candidates: CandidateEvaluation[];
//   vacancyId: string;
}

const statusMap: { [key: string]: { label: string; color: "success" | "warning" | "error" | "default" } } = {
  next: { label: "Next", color: "success" },
  rejected: { label: "Rejected", color: "error" },
  in_process: { label: "In Process", color: "warning" },
};

const CandidatesTab: React.FC<CandidatesTabProps> = ({
  candidates,
//   vacancyId,
}) => {
  const [filters, setFilters] = useState({
    candidate: "",
    resumeAssessment: "",
    interviewAssessment: "",
    status: "",
  });

  const handleFilterChange = (event: React.ChangeEvent<{ value: unknown; name?: string; }>) => {
    setFilters({
      ...filters,
      [event.target.name as string]: event.target.value,
    });
  };

  const filteredCandidates = candidates.filter((c) => {
    const candidateMatch = c.candidate_name || 'no name'
      .toLowerCase()
      .includes(filters.candidate.toLowerCase()) || c.candidate_email.toLowerCase().includes(filters.candidate.toLowerCase());
    const resumeMatch =
      !filters.resumeAssessment || c.accordance_xp_vacancy_score >= +filters.resumeAssessment;
    const interviewMatch =
      !filters.interviewAssessment || c.general_score >= +filters.interviewAssessment;
    const statusMatch = !filters.status || c.general_result === filters.status;

    return candidateMatch && resumeMatch && interviewMatch && statusMatch;
  });

  return (
    <Box>
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Candidate (name/email)"
          name="candidate"
          value={filters.candidate}
          onChange={handleFilterChange}
          fullWidth
        />
        <TextField
          label="Resume Assessment (score >=)"
          name="resumeAssessment"
          value={filters.resumeAssessment}
          onChange={handleFilterChange}
          type="number"
          fullWidth
        />
        <TextField
          label="Interview Assessment (score >=)"
          name="interviewAssessment"
          value={filters.interviewAssessment}
          onChange={handleFilterChange}
          type="number"
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            name="status"
            value={filters.status}
            // @ts-ignore-next-line
            onChange={handleFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="next">Next</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="in_process">In Process</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Candidate</TableCell>
              <TableCell>Email + Phone</TableCell>
              <TableCell>Resume Assessment</TableCell>
              <TableCell>Interview Assessment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCandidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>{candidate.candidate_name}</TableCell>
                <TableCell>
                  <Typography variant="body2">{candidate.candidate_email}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {candidate.candidate_phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography>XP Score: {candidate.accordance_xp_vacancy_score}</Typography>
                    <Typography>Skill Score: {candidate.accordance_skill_vacancy_score}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{candidate.general_score}</TableCell>
                <TableCell>
                  <Chip
                    label={statusMap[candidate.general_result]?.label || candidate.general_result}
                    color={statusMap[candidate.general_result]?.color || "default"}
                  />
                </TableCell>
                <TableCell>
                  {candidate.general_result === "next" && (
                    <Button variant="contained" size="small">
                      Send Invitation
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CandidatesTab;