import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BilgenlyLogo } from "../../features/onboarding/BilgenlyLogo";
import { progressMap, totalSteps } from "../../features/onboarding/content";
import { onboardingStyles } from "../../features/onboarding/styles";
import {
  ExperienceStep,
  GoalStep,
  LoadingStep,
  PaceStep,
  RecommendationsStep,
  ReminderStep,
  RoleStep,
  WelcomeStep,
} from "../../features/onboarding/steps";

export default function BilgenlyOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState("welcome");
  const [selected, setSelected] = useState({});
  const [reminderTime, setReminderTime] = useState("12:00 PM");
  const [loadingPct, setLoadingPct] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const go = (next) => {
    setFadeIn(false);
    setTimeout(() => {
      setStep(next);
      setFadeIn(true);
    }, 220);
  };

  useEffect(() => {
    if (step !== "loading") {
      return undefined;
    }

    setLoadingPct(0);

    const interval = setInterval(() => {
      setLoadingPct((current) => {
        if (current >= 100) {
          clearInterval(interval);
          setTimeout(() => go("recommendations"), 400);
          return 100;
        }

        return current + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [step]);

  const progress = progressMap[step] || 0;

  return (
    <div
      className="onboarding-page"
      style={{
        minHeight: "100vh",
        background: "#f8f7ff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        padding: "0",
      }}
    >
      <style>{onboardingStyles}</style>

      <div
        className="onboarding-shell onboarding-header"
        style={{
          width: "100%",
          maxWidth: 440,
          padding: "28px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
          type="button"
        >
          <BilgenlyLogo size={32} />
          <span
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: "#1a1a2e",
              letterSpacing: "-0.02em",
            }}
          >
            Bilgenly
          </span>
        </button>

        {progress > 0 && (
          <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>
            Step {progress} of {totalSteps}
          </span>
        )}
      </div>

      {progress > 0 && (
        <div
          className="onboarding-shell onboarding-progress"
          style={{
            width: "100%",
            maxWidth: 440,
            margin: "12px 0 0",
            padding: "0",
          }}
        >
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(progress / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div
        className="onboarding-shell onboarding-card-wrap"
        style={{
          width: "100%",
          maxWidth: 440,
          marginTop: progress > 0 ? 24 : 40,
          padding: "0 0 60px",
        }}
      >
        <div
          className={fadeIn ? "fade card" : "card"}
          style={{ opacity: fadeIn ? 1 : 0 }}
        >
          {step === "welcome" && <WelcomeStep go={go} />}
          {step === "role" && (
            <RoleStep go={go} selected={selected} setSelected={setSelected} />
          )}
          {step === "goal" && (
            <GoalStep go={go} selected={selected} setSelected={setSelected} />
          )}
          {step === "experience" && (
            <ExperienceStep
              go={go}
              selected={selected}
              setSelected={setSelected}
            />
          )}
          {step === "pace" && (
            <PaceStep go={go} selected={selected} setSelected={setSelected} />
          )}
          {step === "reminder" && (
            <ReminderStep
              go={go}
              reminderTime={reminderTime}
              setReminderTime={setReminderTime}
            />
          )}
          {step === "loading" && <LoadingStep loadingPct={loadingPct} />}
          {step === "recommendations" && <RecommendationsStep go={go} />}
        </div>
      </div>
    </div>
  );
}
