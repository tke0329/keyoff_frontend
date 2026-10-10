"use client";

import dynamic from "next/dynamic";

const ArrowOutwardIcon = dynamic(
  () => import("@mui/icons-material/ArrowOutward"),
  { ssr: false },
);

export default ArrowOutwardIcon;
