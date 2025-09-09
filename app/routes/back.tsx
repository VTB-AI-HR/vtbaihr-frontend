import React, { memo } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";

const Back: React.FC = memo(() => {
  const navigate = useNavigate();

  return (
    <span
    style={{ display: 'inline-flex', marginBottom: 10, cursor: 'pointer', fontSize: '14', color: "#3361EC", fontWeight: 600 }}
      onClick={() => navigate(-1)}
    >
    <ArrowBackIcon style={{marginRight: 5}} />
      Назад
    </span>
  );
});

export default Back;
