"use client";

import React from "react";
import { useRouter } from "next/navigation";

const GreenBtn = ({ title, href, onClick, type = "button" }) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-lg transition shadow-lg shadow-primary/30 cursor-pointer"
    >
      {title}
    </button>
  );
};

export default GreenBtn;