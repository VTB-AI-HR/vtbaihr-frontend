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
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: 8,
          "& .MuiInputLabel-root": {
            color: "#778093",
          },
          "& .MuiInputLabel-root.Mui-disabled": {
            color: "#778093",
          },
          "& .MuiOutlinedInput-root": {
            border: "none",
            "&.Mui-focused fieldset": {
              border: "none",
            },
            "& fieldset": {
              border: "none",
            },
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        subtitle1: {
          fontWeight: 500,
          fontSize: 14,
        },
        subtitle2: {
          color: '#778093'
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: 12,
          padding: 16,
          boxShadow: 'none'
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
    MuiSlider: {
      styleOverrides: {
        rail: {
          backgroundColor: "#d4d6da",
        },
        track: {
          backgroundColor: "#3361ec", // left side before the thumb
        },
        mark: {
          display: "none", // hide marks
        },
        thumb: {
          backgroundColor: "white",
          height: 28,
          width: 28,
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
        sizeLarge: {
          height: 56,
        },
        sizeMedium: {
          height: 44,
        },
      },
    },
  },
});

export default theme;
