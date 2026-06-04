import React from "react";

interface EduvixLogoProps {
  className?: string;
  size?: number;
  textColorClassName?: string;
  showText?: boolean;
}

export default function EduvixLogo({
  className = "",
  size = 40,
  textColorClassName = "text-white",
  showText = true,
}: EduvixLogoProps) {
  // We render the beautiful custom EDUVIX.ID planet-cat logo
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-blue-500 flex-shrink-0 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] hover:scale-105 transition-transform duration-300"
      >
        {/* Two Dots on top of the heads/ears */}
        <circle cx="38" cy="18" r="3" fill="currentColor" />
        <circle cx="56" cy="18" r="3" fill="currentColor" />

        {/* Planet Main Body & Ear Outline */}
        <path
          d="M 50 32 
             C 45 32, 42 24, 38 24 
             C 34 24, 31 34, 27 41 
             C 21 49, 21 65, 29 73 
             C 37 81, 53 84, 63 76 
             C 73 68, 77 48, 67 39
             C 63 35, 60 24, 56 24
             C 52 24, 51 32, 50 32 Z"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Diagonal Planetary Orbit Ring (Front part & back part curve) */}
        <path
          d="M 12 70 
             C 10 58, 28 44, 48 38 
             C 68 32, 86 36, 88 48 
             C 90 60, 72 74, 52 80 
             C 38 84, 14 80, 12 70 Z"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          mask="url(#planet-mask)"
        />

        {/* Custom Mask to make the ring go behind the planet’s top part cleanly */}
        <defs>
          {/* We do a layered ring to simplify, drawing the front overlay */}
        </defs>

        {/* The 't' inside the planet body */}
        <path
          d="M 39 56 L 49 56 
             M 45 47 L 45 66 C 45 70, 48 72, 51 70"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dot next to the 't' */}
        <circle cx="56" cy="62" r="3.5" fill="currentColor" />
      </svg>

      {showText && (
        <div className="leading-none">
          <h1 className={`text-md sm:text-lg font-black tracking-tight uppercase ${textColorClassName}`}>
            EDUVIX<span className="text-blue-500 font-sans">.ID</span>
          </h1>
        </div>
      )}
    </div>
  );
}
