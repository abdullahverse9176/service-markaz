"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const OTP_LENGTH = 6;

/**
 * Six individual digit-box OTP input.
 *
 * Props:
 *   onChange(otp: string)  — called on every keystroke with the current joined value
 *   disabled               — disables all inputs
 *
 * Ref methods:
 *   reset()  — clears all boxes and focuses the first
 */
const OtpBoxInput = forwardRef(function OtpBoxInput({ onChange, disabled }, ref) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef([]);

  useImperativeHandle(ref, () => ({
    reset() {
      const empty = Array(OTP_LENGTH).fill("");
      setDigits(empty);
      onChange?.("");
      inputRefs.current[0]?.focus();
    },
  }));

  const update = (next) => {
    setDigits(next);
    onChange?.(next.join(""));
  };

  const handleChange = (index, value) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    update(next);
    if (char && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      update(pasted.split(""));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex items-center justify-center gap-3" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-7 md:w-12 h-8 md:h-14 text-center text-2xl font-bold border-2 rounded-md md:rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition text-gray-800 bg-gray-50 disabled:opacity-60"
        />
      ))}
    </div>
  );
});

export default OtpBoxInput;
