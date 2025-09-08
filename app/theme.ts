import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  palette: {
    background: {
      default: "#F4F8FB",
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        subtitle1: {
          fontWeight: 500,
          fontSize: 14,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: 12,
          padding: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#EDF6FF",
          padding: "4px 16px",
          color: "#3361EC",
          borderRadius: 8,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: "24px",
        },
      },
    },
    MuiStack: {
      styleOverrides: {
        root: {
          gap: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
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
