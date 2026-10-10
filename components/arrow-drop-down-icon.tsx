"use client";

import dynamic from "next/dynamic";

const ArrowDropDownIcon = dynamic(
  () => import("@mui/icons-material/ArrowDropDown"),
  { ssr: false },
);

export default ArrowDropDownIcon;
