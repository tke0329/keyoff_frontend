"use client";

import dynamic from "next/dynamic";

const ArrowDropUpIcon = dynamic(
  () => import("@mui/icons-material/ArrowDropUp"),
  { ssr: false },
);

export default ArrowDropUpIcon;
