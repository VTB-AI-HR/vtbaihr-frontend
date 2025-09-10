// src/components/VacancyPaper.tsx
import React from 'react';
import {
  Box,
  Chip,
  Stack,
  Typography,
  Paper,
  IconButton,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { VacancyResponse } from "../types";
import { useNavigate } from "react-router";
import "./vacancyCard.css";

interface VacancyPaperProps {
  vacancy: VacancyResponse;
  isRecruiter?: boolean;
  onDelete: (id: number) => void;
}

const Vacancy: React.FC<VacancyPaperProps> = ({ vacancy, isRecruiter, onDelete }) => {
  const navigate = useNavigate();
  const [showAllTags, setShowAllTags] = React.useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);
  const [isDescriptionLong, setIsDescriptionLong] = React.useState(false);
  const measureRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const computed = window.getComputedStyle(el);
    const lineHeight = parseFloat(computed.lineHeight || "0");
    if (lineHeight > 0) {
      const lines = Math.round(el.scrollHeight / lineHeight);
      setIsDescriptionLong(lines > 6);
    } else {
      // Fallback: assume long if content overflows ~6 line heights of body2 (approx)
      const approxLineHeight = 20; // px fallback
      setIsDescriptionLong(el.scrollHeight > approxLineHeight * 6);
    }
  }, [vacancy.description]);

  const handleApply = () => {
    navigate(`/apply/${vacancy.id}`);
  };

  const handleEdit = () => {
    navigate(`/questions/${vacancy.id}`);
  };

  const handleDelete = () => {
    onDelete(vacancy.id);
  };

  const handleViewResults = () => {
    navigate(`/vacancy/${vacancy.id}`);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, position: "relative" }}>
      <Typography style={{
        textTransform: 'capitalize'
      }} variant="subtitle1" color="primary">
        {vacancy.skill_lvl}
      </Typography>
      {isRecruiter === true && (
        <>
          <IconButton
            size="small"
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={handleDelete}
          >
            <DeleteIcon fontSize="medium" />
          </IconButton>
          <IconButton
            size="small"
            sx={{ position: "absolute", top: 8, right: 48 }}
            onClick={handleEdit}
          >
            <EditIcon fontSize="medium" />
          </IconButton>
        </>
      )}
      <Typography variant="h6">{vacancy.name}</Typography>
      <Box mt={1} position="relative">
        <Typography
          variant='body2'
          sx={
            isDescriptionLong && !isDescriptionExpanded
              ? {
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }
              : undefined
          }
        >
          {vacancy.description}
        </Typography>
        {isDescriptionLong && !isDescriptionExpanded && (
          <>
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 40,
                background: (theme) =>
                  `linear-gradient(to top, ${theme.palette.background.paper}, rgba(0,0,0,0))`,
                pointerEvents: "none",
              }}
            />
            <Button
              size="small"
              variant="text"
              onClick={() => setIsDescriptionExpanded(true)}
              sx={{ mt: 0.5, p: 0, minWidth: 0 }}
            >
              Показать больше
            </Button>
          </>
        )}
        {/* Hidden measurer for accurate line count at current width */}
        <Box
          ref={measureRef}
          sx={{
            position: "absolute",
            visibility: "hidden",
            pointerEvents: "none",
            left: 0,
            right: 0,
            whiteSpace: "normal",
          }}
        >
          <Typography variant='body2'>{vacancy.description}</Typography>
        </Box>
      </Box>
      <Stack direction="row" mt={2} flexWrap="wrap">
        {(showAllTags || vacancy.tags.length <= 4
          ? vacancy.tags
          : vacancy.tags.slice(0, 3)
        ).map((tag) => (
          <Chip className="tag-chip" key={tag} label={tag} />
        ))}
        {!showAllTags && vacancy.tags.length > 4 && (
          <Chip
            className="tag-chip"
            key="more-tags"
            label={`+${vacancy.tags.length - 3}`}
            onClick={() => setShowAllTags(true)}
            clickable
            // variant="outlined"
          />
        )}
      </Stack>
      {
        isRecruiter !== undefined &&
        <Box mt={3} display="flex" gap={2}>
          {isRecruiter === false && (
            <Button
              size="medium"
              variant="contained" onClick={handleApply}>
              Перейти к вакансии
            </Button>
          )}
          {isRecruiter === true && (
            <Button
              size="medium"
              variant="contained" onClick={handleViewResults}>
              Посмотреть отклики
            </Button>
          )}
        </Box>
      }
    </Paper>
  );
};

export default Vacancy;