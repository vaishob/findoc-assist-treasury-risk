"use client";

import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
