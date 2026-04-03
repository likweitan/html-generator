import React from "react";
import { Laptop, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const nextTheme = {
    light: "dark",
    dark: "system",
    system: "light",
  }[theme] || "light";

  const label = {
    light: "Light mode",
    dark: "Dark mode",
    system: "Use system theme",
  }[theme] || "Use system theme";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
      title={label}>
      {theme === "light" && <Sun className="h-4 w-4" />}
      {theme === "dark" && <Moon className="h-4 w-4" />}
      {theme === "system" && <Laptop className="h-4 w-4" />}
    </Button>
  );
}
