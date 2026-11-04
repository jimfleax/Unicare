"use client";

import React, { type CSSProperties } from "react";
import { LazyMotion, domAnimation, m } from "motion/react";

export interface Step {
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple" | "red" | "green";
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface StepPosition {
  className?: string;
  rotate?: string;
}

export interface HowItWorksProps {
  features?: Step[];
  className?: string;
  stepPositions?: StepPosition[];
}

interface CardProps {
  number: string;
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple" | "red" | "green";
  className?: string;
  rotate?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

const Pin = ({ className }: { className?: string }) => (
  <div className="relative w-7 h-7 mx-auto mb-3 flex items-center justify-center z-20">
    {/* Soft pin ambient shadow */}
    <div className="absolute inset-0 rounded-full blur-[3px] bg-black/35 translate-y-1 scale-90" />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`relative z-10 transition-transform duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] ${className || ""}`}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
    </svg>
  </div>
);

const Card = ({
  number,
  title,
  description,
  colorTheme = "blue",
  className,
  rotate,
  colors: customColors,
}: CardProps) => {
  const themeClassMap: Record<string, string> = {
    orange: "hiw-theme-orange",
    blue: "hiw-theme-blue",
    purple: "hiw-theme-purple",
    red: "hiw-theme-red",
    green: "hiw-theme-green",
  };

  const themeClass = themeClassMap[colorTheme] || themeClassMap.blue;
  const isCustom = !!customColors;

  return (
    <div
      className={`group relative w-full max-w-[340px] mx-auto md:max-w-none md:w-[310px] transition-all duration-300 hover:z-30 hover:scale-105 ${rotate || ""} ${className || ""}`}
    >
      <div className="hiw-card-shell p-2.5 rounded-[24px] border transition-all duration-300">
        <Pin className={`${isCustom ? (customColors.text || "") : themeClass} group-hover:scale-110`} />
        <div
          className={`${!isCustom ? themeClass : `${customColors.bg} ${customColors.border}`} border rounded-[16px] p-5 h-full flex flex-col relative overflow-hidden backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`${isCustom ? customColors.text : ""} text-3xl md:text-4xl font-extrabold tracking-tight font-display`}
              style={{
                fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif",
              }}
            >
              {number}
            </span>
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border border-current bg-white/40 dark:bg-black/30"
            >
              STEP
            </span>
          </div>
          <h3 className="hiw-card-title text-lg md:text-xl font-bold leading-snug tracking-tight mb-2 font-display">
            {title}
          </h3>
          <p className="hiw-card-desc text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-[28px] md:left-[8%]", rotate: "md:rotate-6 rotate-0" },
  { className: "md:absolute md:top-[170px] md:right-[8%]", rotate: "md:-rotate-6 rotate-0" },
  { className: "md:absolute md:top-[480px] md:left-[8%]", rotate: "md:rotate-6 rotate-0" },
  { className: "md:absolute md:top-[630px] md:right-[8%]", rotate: "md:-rotate-6 rotate-0" },
  { className: "md:absolute md:top-[940px] md:left-[8%]", rotate: "md:rotate-6 rotate-0" },
];

export default function HowItWorks({
  features,
  className,
  stepPositions,
}: HowItWorksProps) {
  const defaultFeatures: Step[] = [
    {
      title: "Create Account",
      description:
        "Sign up in minutes. Enter your details and verify your email to get started.",
      colorTheme: "orange",
    },
    {
      title: "Verify Identity",
      description:
        "Complete your profile verification to ensure secure transactions and compliance.",
      colorTheme: "blue",
    },
    {
      title: "Select Plan",
      description:
        "Choose from a variety of investment plans tailored to your financial goals.",
      colorTheme: "purple",
    },
    {
      title: "Analyze & Invest",
      description:
        "Review returns and make your first investment with confidence.",
      colorTheme: "orange",
    },
    {
      title: "Track Growth",
      description:
        "Monitor your portfolio in real-time and watch your wealth grow over time.",
      colorTheme: "blue",
    },
  ];

  const data = features && features.length > 0 ? features : defaultFeatures;
  const positions = stepPositions || DEFAULT_CARD_POSITIONS;

  let height = 1260;
  if (data.length === 1) height = 400;
  else if (data.length === 2) height = 480;
  else if (data.length === 3) height = 800;
  else if (data.length === 4) height = 960;
  else height = 1260;

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={`bg-transparent max-md:pt-6 max-md:pb-16 md:py-16 px-4 md:px-8 relative ${className || ""}`}
      >
        {/* Subtle radial dotted backdrop */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 text-neutral-400 dark:text-neutral-500"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 65% 55% at 50% 50%, black 35%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 50%, black 35%, transparent 100%)",
          }}
        />

        <div className="from-background to-transparent pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r" />
        <div className="from-background to-transparent pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div
            className="how-it-works-canvas relative w-full max-w-[1000px] mx-auto flex flex-col space-y-8 md:space-y-0 md:block h-auto"
            style={
              {
                "--md-height": `${height}px`,
              } as CSSProperties
            }
          >
            {data.length > 1 && (
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block z-0"
                viewBox={`0 0 1000 ${height}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="hiw-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="25%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#c084fc" />
                    <stop offset="75%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>

                {(() => {
                  const pathD = data.reduce((acc, _, index) => {
                    if (index >= data.length - 1) return acc;
                    if (index === 0)
                      return "M 235 40 C 490 40, 520 182, 765 182"; // 1 -> 2
                    if (index === 1)
                      return acc + " C 940 280, 80 390, 235 492"; // 2 -> 3
                    if (index === 2)
                      return acc + " C 490 492, 520 642, 765 642"; // 3 -> 4
                    if (index === 3)
                      return acc + " C 940 740, 80 850, 235 952"; // 4 -> 5
                    return acc;
                  }, "");

                  return (
                    <>
                      {/* Ambient glow underlay path */}
                      <path
                        d={pathD}
                        stroke="url(#hiw-gradient)"
                        strokeWidth="8"
                        strokeOpacity="0.2"
                        fill="none"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                      {/* Animated dashed line */}
                      <m.path
                        d={pathD}
                        stroke="url(#hiw-gradient)"
                        strokeWidth="3.5"
                        strokeDasharray="9 7"
                        fill="none"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        initial={{ strokeDashoffset: 0 }}
                        animate={{
                          strokeDashoffset: -160,
                        }}
                        transition={{
                          duration: 3.5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </>
                  );
                })()}
              </svg>
            )}

            {data.map((step, index) => {
              const position = positions[index % positions.length];

              return (
                <Card
                  key={step.title}
                  number={`0${index + 1}`}
                  title={step.title}
                  description={step.description}
                  colorTheme={step.colorTheme || "blue"}
                  colors={step.colors}
                  rotate={position.rotate}
                  className={position.className}
                />
              );
            })}
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
