import { useEffect, useState } from "react";
import logoPng from "../../assets/logo.png";

interface SplashScreenProps {
  visible: boolean;
}

export function SplashScreen({ visible }: SplashScreenProps) {
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    } else {
      const t = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
      }}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Outer pulse ring */}
        <span
          style={{
            position: "absolute",
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "rgba(91, 76, 240, 0.15)",
            animation: "bilgenly-pulse-outer 2s ease-in-out infinite",
          }}
        />
        {/* Inner pulse ring */}
        <span
          style={{
            position: "absolute",
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(91, 76, 240, 0.25)",
            animation: "bilgenly-pulse-inner 2s ease-in-out infinite 0.3s",
          }}
        />
        {/* Logo */}
        <img
          src={logoPng}
          alt="Bilgenly"
          style={{
            width: 52,
            height: 52,
            position: "relative",
            zIndex: 1,
            animation: "bilgenly-logo-breathe 2s ease-in-out infinite",
          }}
        />
      </div>

      <span
        style={{
          marginTop: 24,
          fontSize: 22,
          fontWeight: 600,
          color: "var(--foreground)",
          letterSpacing: "-0.3px",
          animation: "bilgenly-fade-in 0.6s ease forwards",
        }}
      >
        Bilgenly
      </span>

      <style>{`
        @keyframes bilgenly-pulse-outer {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes bilgenly-pulse-inner {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 0.2; }
        }
        @keyframes bilgenly-logo-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes bilgenly-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
