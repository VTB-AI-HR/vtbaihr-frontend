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
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: 8,
          "& fieldset": {
            border: "none",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#EDF6FF",
          padding: "4px 4px",
          color: "#3361EC",
          borderRadius: 8,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: "24px",
          "&.MuiChip-clickable:hover": {
            backgroundColor: "#dbeeff", // only darker if clickable
          },
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
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          border: "none",
          borderRadius: "15px",
        },
        grouped: {
          border: "none",
          textTransform: "none",
          borderRadius: "15px",
          "&.Mui-selected": {
            backgroundColor: "#3361EC",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#2549C5",
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#F4F8FB",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
        },
        containedPrimary: {
          backgroundColor: "#3361EC",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#2549C5",
          },
        },
        outlinedPrimary: {
          backgroundColor: "#ffffff",
          color: "#3361EC",
          border: "none",
          "&:hover": {
            backgroundColor: "#f5f7ff", 
            border: "none",
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
