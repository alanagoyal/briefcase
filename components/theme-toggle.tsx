"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      className="justify-start"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "dark" ? (
        <Sun className="mr-2 h-5 w-5 rotate-0 scale-100 transition-all" />
      ) : (
        <Moon className="mr-2 h-5 w-5 rotate-0 scale-100 transition-all" />
      )}
      Theme
    </Button>
  )
}