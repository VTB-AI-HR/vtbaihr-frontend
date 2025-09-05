import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router";

const thankyou: React.FC = () => {
  const navigate = useNavigate();

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
        Thank You!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: "600px" }}>
        Your interview is complete. We will review your responses and contact you when a decision has been made.
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

export default thankyou;