import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import App from './App.jsx'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#22c55e', // --accent
    },
    background: {
      default: '#0a0a0a', // --bg-primary
      paper: '#141414',   // --bg-secondary
    },
    text: {
      primary: '#f5f5f5', // --text-primary
      secondary: '#a3a3a3', // --text-secondary
    },
    divider: '#262626', // --border
  },
  typography: {
    fontFamily: [
      'Plus Jakarta Sans',
      'Inter',
      'sans-serif'
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#141414',
          border: '1px solid #262626',
          borderRadius: '16px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#141414',
          backgroundImage: 'none',
          border: '1px solid #262626',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#1a1a1a',
            '& fieldset': {
              borderColor: '#262626',
            },
            '&:hover fieldset': {
              borderColor: '#404040',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#22c55e',
            },
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          verticalAlign: 'middle',
          display: 'inline-flex',
          alignSelf: 'center'
        },
      },
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
