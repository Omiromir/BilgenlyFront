import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../app/providers/AuthProvider";
import {
  buildOnboardingDraftOwnerKey,
  clearOnboardingDraft,
  getOnboardingDraft,
  getRegistrationDraft,
  saveOnboardingDraft,
} from "../../auth/registrationDraft";
import { BilgenlyLogo } from "../../../components/shared/BilgenlyLogo";
import { getDashboardPathByRole } from "../../../lib/auth";
import { progressMap, totalSteps } from "../content";
import { onboardingStyles } from "../styles";
import {
  ExperienceStep,
  GoalStep,
  LoadingStep,
  PaceStep,
  RecommendationsStep,
  ReminderStep,
  RoleStep,
  WelcomeStep,
} from "./Steps";
import type { OnboardingAnswers } from "../../auth/types";
import type { StepKey } from "../types";

function getSafeInitialStep(step?: StepKey): StepKey {
  if (!step || step === "signup" || step === "email") {
    return "welcome";
  }

  return step === "loading" ? "recommendations" : step;
}

function hasRequiredAnswers(answers: OnboardingAnswers): answers is OnboardingAnswers & {
  experience: string;
  goal: string;
  pace: string;
  role: "teacher" | "student";
} {
  return Boolean(
    answers.role &&
      answers.goal &&
      answers.experience &&
      answers.pace,
  );
}

export function BilgenlyOnboarding() {
  const navigate = useNavigate();
  const registrationDraft = getRegistrationDraft();
  const {
    completeOnboardingForAuthenticatedUser,
    completeRegistration,
    currentUser,
    isAuthenticated,
    onboardingCompleted,
  } = useAuth();
  const draftOwnerKey = buildOnboardingDraftOwnerKey({
    registrationEmail: registrationDraft?.email,
    userEmail: currentUser?.email,
    userId: currentUser?.id,
  });
  const persistedDraft = getOnboardingDraft();
  const isDraftOwnerValid =
    !persistedDraft?.ownerKey || persistedDraft.ownerKey === draftOwnerKey;
  const safePersistedDraft = isDraftOwnerValid ? persistedDraft : null;
  const [step, setStep] = useState<StepKey>(() => getSafeInitialStep(safePersistedDraft?.step));
  const [selected, setSelected] = useState<OnboardingAnswers>(() => safePersistedDraft?.answers ?? {});
  const [reminderTime, setReminderTime] = useState(
    () => safePersistedDraft?.reminderTime ?? "12:00 PM",
  );
  const [loadingPct, setLoadingPct] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isAuthenticatedIncompleteUser = isAuthenticated && !onboardingCompleted;

  const go = (next: StepKey) => {
    setFadeIn(false);
    setTimeout(() => {
      setStep(next);
      setFadeIn(true);
    }, 220);
  };

  useEffect(() => {
    if (persistedDraft && !isDraftOwnerValid) {
      clearOnboardingDraft();
      setStep("welcome");
      setSelected({});
      setReminderTime("12:00 PM");
      setSubmitError(null);
    }
  }, [isDraftOwnerValid, persistedDraft]);

  useEffect(() => {
    saveOnboardingDraft({
      answers: selected,
      ownerKey: draftOwnerKey ?? undefined,
      reminderTime,
      step,
      updatedAt: new Date().toISOString(),
    });
  }, [draftOwnerKey, reminderTime, selected, step]);

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

  const handleReminderContinue = () => {
    setSelected((current) => ({
      ...current,
      reminderTime,
    }));
    go("loading");
  };

  const handleReminderSkip = () => {
    setSelected((current) => ({
      ...current,
      reminderTime: null,
    }));
    go("loading");
  };

  const handleFinishOnboarding = async () => {
    if (!hasRequiredAnswers(selected)) {
      setSubmitError("Choose your role and complete the required onboarding steps to continue.");
      return;
    }

    const finalAnswers = {
      experience: selected.experience,
      goal: selected.goal,
      pace: selected.pace,
      reminderTime: selected.reminderTime ?? null,
      role: selected.role,
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const completedUser = registrationDraft
        ? await completeRegistration({
            onboarding: finalAnswers,
            registration: registrationDraft,
          })
        : isAuthenticatedIncompleteUser
          ? await completeOnboardingForAuthenticatedUser(finalAnswers)
          : null;

      if (!completedUser) {
        throw new Error("Your registration draft is missing. Please start from sign up again.");
      }

      clearOnboardingDraft();
      navigate(getDashboardPathByRole(finalAnswers.role), { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  const progress = progressMap[step] || 0;
  const isWelcomeStep = step === "welcome";

  return (
    <div
      className="onboarding-page"
      style={{
        minHeight: "100dvh",
        background: "#f8f7ff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        padding: "0",
      }}
    >
      <style>{onboardingStyles}</style>

      {isWelcomeStep ? (
        <section
          className="welcome-screen"
          style={{
            width: "100%",
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            padding: "28px 0 40px",
          }}
        >
          <div
            className="onboarding-shell"
            style={{
              width: "100%",
              maxWidth: 440,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BilgenlyLogo size={30} />
          </div>

          <div className="welcome-screen__content">
            <div
              className={fadeIn ? "fade welcome-screen__inner" : "welcome-screen__inner"}
              style={{ opacity: fadeIn ? 1 : 0 }}
            >
              <WelcomeStep go={go} />
            </div>
          </div>
        </section>
      ) : (
        <>
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
              }}
            >
              <BilgenlyLogo size={30} />
            </div>

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
              marginTop: 24,
              padding: "0 0 60px",
            }}
          >
            <div
              className={fadeIn ? "fade card" : "card"}
              style={{ opacity: fadeIn ? 1 : 0 }}
            >
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
                  onContinue={handleReminderContinue}
                  onSkip={handleReminderSkip}
                />
              )}
              {step === "loading" && <LoadingStep loadingPct={loadingPct} />}
              {step === "recommendations" && (
                <RecommendationsStep
                  onContinue={handleFinishOnboarding}
                  isLoading={isSubmitting}
                  error={submitError}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
