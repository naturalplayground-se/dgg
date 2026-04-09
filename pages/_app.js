import * as React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import theme from '../src/theme';
import createEmotionCache from '../src/createEmotionCache';

const clientSideEmotionCache = createEmotionCache();

const PASS_HASH = '8d361906156e8391b8db69ca33e7ae9406dbd55d6a10f161b1a41096a3be260e';

async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function AuthGate({ children }) {
  const [authed, setAuthed] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [error, setError] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('dg_auth') === 'true') {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hash = await hashPassword(input);
    if (hash === PASS_HASH) {
      sessionStorage.setItem('dg_auth', 'true');
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (checking) return null;

  if (!authed) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
        <Paper sx={{ p: 5, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>Design Generator</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Enter password to continue</Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              error={error}
              helperText={error ? 'Wrong password' : ''}
              autoFocus
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth size="large">
              Enter
            </Button>
          </form>
        </Paper>
      </Box>
    );
  }

  return children;
}

export default function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthGate>
          <Component {...pageProps} />
        </AuthGate>
      </ThemeProvider>
    </CacheProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};
