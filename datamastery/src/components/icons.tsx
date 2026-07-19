import React from "react"

export type IconProps = React.SVGProps<SVGSVGElement>

export const Icons = {
  // Map Apple card slot to Python & Pandas logos side-by-side
  apple: ({ className, ...props }: IconProps) => (
    <div className="flex gap-2 items-center">
      {/* Python Logo */}
      <svg className="size-6 text-neutral-700 dark:text-neutral-100 [@media(min-width:500px)]:size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2C9.5 2 7.5 3.5 7.5 6h3v1h-5C3.5 7 2 9 2 11.5S3.5 16 5.5 16h1v-2.5c0-1.9 1.6-3.5 3.5-3.5h5c1.9 0 3.5-1.6 3.5-3.5V5.5C18.5 3.5 16.5 2 12 2z" />
        <path d="M12 22c2.5 0 4.5-1.5 4.5-4h-3v-1h5c2 0 3.5-2 3.5-4.5S20.5 8 18.5 8h-1v2.5c0 1.9-1.6 3.5-3.5 3.5h-5c-1.9 0-3.5 1.6-3.5 3.5v1C9.5 20.5 11.5 22 12 22z" />
        <circle cx="9" cy="4" r="0.5" fill="currentColor" />
        <circle cx="15" cy="20" r="0.5" fill="currentColor" />
      </svg>
      {/* Pandas Logo */}
      <svg className="size-6 text-neutral-700 dark:text-neutral-100 [@media(min-width:500px)]:size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
      </svg>
    </div>
  ),

  // Map GitHub card slot to NumPy & Matplotlib logos side-by-side
  gitHub: ({ className, ...props }: IconProps) => (
    <div className="flex gap-2 items-center">
      {/* NumPy Logo */}
      <svg className="size-6 text-neutral-700 dark:text-neutral-100 [@media(min-width:500px)]:size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12l8.73-5.04M12 22.08V12" />
      </svg>
      {/* Matplotlib Logo */}
      <svg className="size-6 text-neutral-700 dark:text-neutral-100 [@media(min-width:500px)]:size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 3v18h18" />
        <path d="M18 9l-5 6-4-4-3 3" />
        <circle cx="18" cy="9" r="1" fill="currentColor" />
        <circle cx="13" cy="15" r="1" fill="currentColor" />
        <circle cx="9" cy="11" r="1" fill="currentColor" />
      </svg>
    </div>
  ),

  // Map OpenAI card slot to Pyodide & Monaco Editor logos side-by-side
  openai: ({ className, ...props }: IconProps) => (
    <div className="flex gap-2 items-center">
      {/* Pyodide Logo */}
      <svg className="size-6 text-neutral-700 dark:text-neutral-100 [@media(min-width:500px)]:size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M3.22 3.22l2.12 2.12M18.66 18.66l2.12 2.12M2 12h3M19 12h3M3.22 20.78l2.12-2.12M18.66 5.34l2.12-2.12" />
      </svg>
      {/* Monaco Logo */}
      <svg className="size-6 text-neutral-700 dark:text-neutral-100 [@media(min-width:500px)]:size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M8 9l-4 3 4 3M16 15l4-3-4-3M14 6l-4 12" />
      </svg>
    </div>
  )
}
