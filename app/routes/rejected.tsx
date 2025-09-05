import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router";

const rejected: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message || "Your application was not suitable at this time.";

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      textAlign="center"
      p={3}
    >
      <Typography variant="h4" gutterBottom>
        Thank you for your application, but unfortunately, you have not been selected.
      </Typography>
      <Typography variant="body1" color="error" gutterBottom sx={{ maxWidth: "600px" }}>
        {message}
      </Typography>
      <Box mt={4}>
        <Button
          variant="contained"
          onClick={() => navigate("/vacancies")}
        >
          Go Back to Vacancies
        </Button>
      </Box>
    </Box>
  );
};

export default rejected;