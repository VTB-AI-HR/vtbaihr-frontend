import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
  useLocation
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { Box, IconButton, Paper, Button, Typography, Stack } from "@mui/material";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import GroupIcon from '@mui/icons-material/Group';
import LayersIcon from '@mui/icons-material/Layers';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import SearchIcon from '@mui/icons-material/Search';

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.png", type: "image/png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const routesToShowSidebar = ['/createVacancy', '/vacancies', '/resumeScreening'];
  const isSidebarVisible = routesToShowSidebar.some(route => location.pathname.startsWith(route));

  const isResumeScreeningActive = location.pathname.startsWith('/resumeScreening');
  
  if (!isSidebarVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "210px",
        height: "100vh",
        bgcolor: "background.paper",
        boxShadow: 3,
        zIndex: 10,
        pt: 2,
        pl: 1,
        pr: 1
      }}
    >
      <Stack spacing={2} sx={{ width: '100%' }}>
        <Button
          startIcon={<ContentPasteIcon />}
          sx={{
            justifyContent: 'flex-start',
            width: '100%',
            color: isResumeScreeningActive ? 'text.secondary' : 'primary.main',
            backgroundColor: isResumeScreeningActive ? 'inherit' : 'action.selected',
            '&:hover': {
              backgroundColor: isResumeScreeningActive ? 'inherit' : 'action.selected'
            }
          }}
          onClick={() => navigate("/vacancies?isRecruiter=true")}
        >
          <Typography variant="button">Vacancies</Typography>
        </Button>
        <Button
          startIcon={<SearchIcon />}
          sx={{
            justifyContent: 'flex-start',
            width: '100%',
            color: isResumeScreeningActive ? 'primary.main' : 'text.secondary',
            backgroundColor: isResumeScreeningActive ? 'action.selected' : 'inherit',
            '&:hover': {
              backgroundColor: isResumeScreeningActive ? 'action.selected' : 'inherit'
            }
          }}
          onClick={() => navigate("/resumeScreening")}
        >
          <Typography variant="button">Resume Screening</Typography>
        </Button>
      </Stack>
    </Box>
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box position="relative">
        <SideBar />
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            top: 16,
            right: 16,
            p: 0.5,
            zIndex: 10,
            borderRadius: 2
          }}
        >
          <IconButton onClick={() => navigate("/resumeScreening")} aria-label="Mass Resume Screening" sx={{ color: 'primary.main' }}>
            <LayersIcon />
          </IconButton>
          <IconButton onClick={() => navigate("/vacancies?isRecruiter=true")} aria-label="Recruiter View" sx={{ color: 'primary.main' }}>
            <BusinessCenterIcon />
          </IconButton>
          <IconButton onClick={() => navigate("/vacancies")} aria-label="Candidate View" sx={{ color: 'text.secondary' }}>
            <GroupIcon />
          </IconButton>
        </Paper>
        <Outlet />
      </Box>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
