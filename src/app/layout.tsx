import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/theme';

export const metadata: Metadata = { title: 'Dashboard Proto' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}