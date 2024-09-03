'use client'

import React, { useEffect } from 'react'

export default function AnimatedLoadingIcon() {
  useEffect(() => {
    const styles = `
      @keyframes traceBriefcase {
        0% {
          stroke-dashoffset: 100;
        }
        100% {
          stroke-dashoffset: 0;
        }
      }

      .animate-trace-briefcase {
        stroke-dasharray: 100;
        animation: traceBriefcase 1.5s linear infinite;
      }
    `

    const styleSheet = document.createElement("style")
    styleSheet.type = "text/css"
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)

    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  return (
    <div className="flex items-center justify-center h-10 w-10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#briefcaseGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-trace-briefcase"
      >
        <defs>
          <linearGradient id="briefcaseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8EC5FC" />
            <stop offset="50%" stopColor="#3675f1" />
            <stop offset="100%" stopColor="#2556e4" />
          </linearGradient>
        </defs>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    </div>
  )
}