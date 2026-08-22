import { AlertCircle } from "lucide-react";

export default function AuthField({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  error,
  hint,
  trailing,
  className,
  inputClassName,
  required,
  ...props
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-bold text-cocoa mb-1.5">
        {label}
        {required ? (
          <span className="ms-1 text-error" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`w-full rounded-2xl border-2 border-clay/20 bg-white px-4 py-3 text-cocoa placeholder:text-cocoa-soft/60 transition-colors focus:border-terra focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40 ${
            trailing ? "pe-12" : ""
          } ${inputClassName ?? ""}`}
          {...props}
        />

        {trailing ? (
          <span className="absolute end-0 top-1/2 -translate-y-1/2 flex items-center">
            {trailing}
          </span>
        ) : null}
      </div>

      {hint ? (
        <p className="text-[13px] text-cocoa-soft mt-1.5 leading-relaxed">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          className="flex items-center gap-1.5 text-error text-[13px] mt-1.5"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
