"use client";

import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const maxWidthMap = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
};

export default function Container({ children, size = "lg", className = "" }: ContainerProps) {
  const maxW = maxWidthMap[size];
  return (
    <div className={`px-4 sm:px-6 lg:px-10 xl:px-16 py-6 sm:py-8 ${className}`}>
      <div className={`${maxW} mx-auto w-full`}>{children}</div>
    </div>
  );
}
