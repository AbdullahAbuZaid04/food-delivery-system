"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
    // TODO: أرسل الخطأ لخدمة monitoring (Sentry أو ما شابه) قبل الإطلاق النهائي.
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          backgroundColor: "#FBF6EC",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "420px" }}>
          <h1
            style={{
              fontSize: "clamp(22px, 3.4vw, 30px)",
              fontWeight: 800,
              color: "#2A241C",
              margin: "0 0 12px",
            }}
          >
            صار في مشكلة بتحميل الموقع
          </h1>
          <p
            style={{
              color: "#6E6255",
              lineHeight: 1.7,
              margin: "0 0 24px",
            }}
          >
            بنعتذر عن هالإزعاج — صار خطأ غير متوقع أثناء تحميل الصفحة. جرّب
            تحاول مرة تانية.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              backgroundColor: "#B84A26",
              color: "#FBF6EC",
              fontWeight: 700,
              fontSize: "16px",
              padding: "14px 32px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
            }}
          >
            حاول مرة تانية
          </button>
        </div>
      </body>
    </html>
  );
}
