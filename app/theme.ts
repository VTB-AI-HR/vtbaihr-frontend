import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: "#3361EC",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#2549C5",
          },
        },
      },
    },
  },
});

export default theme;


