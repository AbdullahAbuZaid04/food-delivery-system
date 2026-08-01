"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import AuthField from "@components/auth/AuthField";

export default function PasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  ...props
}) {
  const [show, setShow] = useState(false);

  return (
    <AuthField
      id={id}
      label={label}
      type={show ? "text" : "password"}
      placeholder={placeholder}
      autoComplete={autoComplete}
      trailing={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "إخفاء كلمة السر" : "إظهار كلمة السر"}
          className="w-11 h-11 flex items-center justify-center rounded-full text-clay hover:text-terra transition-colors"
        >
          {show ? (
            <EyeOff className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Eye className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      }
      {...props}
    />
  );
}
