"use client";

import Image from "next/image";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const heights = { sm: 24, md: 32, lg: 48 };
  const widths = { sm: 90, md: 120, lg: 180 };
  return (
    <Image
      src="/logo-ventia-header.webp"
      alt="VentIA"
      width={widths[size]}
      height={heights[size]}
      priority
    />
  );
}
