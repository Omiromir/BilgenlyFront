import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  PencilLine,
  PlayCircle,
  RefreshCw,
  XCircle,
} from "../../../components/icons/AppIcons";
import { cn } from "../../../components/ui/utils";
import {
  DashboardBadge,
  DashboardButton,
  DashboardSurface,
  dashboardInsetBlockClassName,
} from "../../dashboard/components/DashboardPrimitives";
import type {
  GenerationState,
  ParsedSource,
  QuizBuilderCopy,
  ValidationIssue,
} from "../quizBuilderTypes";

interface QuizBuilderGenerateStageProps {
  contextValue: string;
  copy: QuizBuilderCopy;
  elapsedSeconds: number;
  generationDurationLabel: string | null;
  generationError: string | null;
  generationState: GenerationState;
  handleCancelGeneration: () => void;
  handleGenerateQuiz: () => void;
  handleOpenQuizFlow: (targetStatus: "draft") => void;
  handleRetryGeneration: () => void;
  mode: "teacher" | "student";
  parsedSource: ParsedSource | null;
  questionsCount: number;
  setGenerationState: (value: GenerationState) => void;
  setHasEnteredReview: (value: boolean) => void;
  validationIssues: ValidationIssue[];
}

export function QuizBuilderGenerateStage({
  contextValue,
  copy,
  elapsedSeconds,
  generationDurationLabel,
  generationError,
  generationState,
  handleCancelGeneration,
  handleGenerateQuiz,
  handleOpenQuizFlow,
  handleRetryGeneration,
  mode,
  parsedSource,
  questionsCount,
  setGenerationState,
  setHasEnteredReview,
  validationIssues,
}: QuizBuilderGenerateStageProps) {
  return (
    <DashboardSurface
      asChild
      radius="xl"
      padding="lg"
      variant={generationState === "running" ? "accent" : "card"}
    >
      <section className="space-y-5">
        {generationState === "running" ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-[1.45rem] font-semibold text-[var(--dashboard-text-strong)]">
                  Generating quiz draft
                </h2>
                <p className="mt-2 text-[15px] leading-7 text-[var(--dashboard-text-soft)]">
                  Bilgenly is parsing, generating, and assembling the draft. This stage
                  replaces configuration until the draft is ready.
                </p>
              </div>
              <DashboardBadge tone="brand" size="md">
                {elapsedSeconds}s elapsed
              </DashboardBadge>
            </div>

            <div className="space-y-4 rounded-[24px] border border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-elevated)] px-5 py-5 shadow-[var(--dashboard-shadow-card)]">
              <div className="h-3 overflow-hidden rounded-full bg-[var(--dashboard-surface-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--dashboard-brand)] transition-all"
                  style={{
                    width: `${Math.min(96, 24 + elapsedSeconds * 18)}%`,
                  }}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { label: "Parsing source", ready: elapsedSeconds >= 1 },
                  { label: "Generating questions", ready: elapsedSeconds >= 2 },
                  { label: "Assembling draft", ready: elapsedSeconds >= 3 },
                ].map((step) => (
                  <div
                    key={step.label}
                    className={cn(
                      "rounded-[18px] border px-4 py-4",
                      step.ready
                        ? "border-[var(--dashboard-brand)] bg-[var(--dashboard-brand-soft-alt)]"
                        : "border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-muted)]",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {step.ready ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-[var(--dashboard-brand)]" />
                      ) : (
                        <LoaderCircle className="h-4.5 w-4.5 animate-spin text-[var(--dashboard-text-faint)]" />
                      )}
                      <span className="text-sm font-semibold text-[var(--dashboard-text-strong)]">
                        {step.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm leading-6 text-[var(--dashboard-text-soft)]">
                  The AI is assistive here. You will still review wording, correctness,
                  and student readability before the quiz is used.
                </p>
                <DashboardButton
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={handleCancelGeneration}
                >
                  Cancel
                </DashboardButton>
              </div>
            </div>
          </>
        ) : null}

        {generationState === "cancelled" ? (
          <div className="rounded-[24px] border border-[var(--dashboard-warning)] bg-[var(--dashboard-warning-soft)]/60 px-5 py-5">
            <div className="flex items-center gap-3 text-[var(--dashboard-warning)]">
              <AlertCircle className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Generation paused</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--dashboard-text-soft)]">
              Your source and settings are still in place. Restart generation whenever
              you are ready.
            </p>
            <div className="mt-5 flex gap-3">
              <DashboardButton type="button" size="lg" onClick={handleRetryGeneration}>
                <RefreshCw className="h-4.5 w-4.5" />
                Resume generation
              </DashboardButton>
              <DashboardButton
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => setGenerationState("idle")}
              >
                Back to settings
              </DashboardButton>
            </div>
          </div>
        ) : null}

        {generationState === "failed" ? (
          <div className="rounded-[24px] border border-[var(--dashboard-danger)] bg-[var(--dashboard-danger-soft)]/50 px-5 py-5">
            <div className="flex items-center gap-3 text-[var(--dashboard-danger)]">
              <XCircle className="h-5 w-5" />
              <h2 className="text-lg font-semibold">
                Quiz generation needs another attempt
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--dashboard-text-soft)]">
              {generationError}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--dashboard-text-soft)]">
              No data was lost. Try reducing the number of questions or replacing weak
              source sections first.
            </p>
            <div className="mt-5 flex gap-3">
              <DashboardButton type="button" size="lg" onClick={handleRetryGeneration}>
                <RefreshCw className="h-4.5 w-4.5" />
                Retry
              </DashboardButton>
              <DashboardButton
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => setGenerationState("idle")}
              >
                Back to settings
              </DashboardButton>
            </div>
          </div>
        ) : null}

        {generationState === "success" && questionsCount > 0 ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[var(--dashboard-success)]" />
                  <h2 className="text-[1.45rem] font-semibold text-[var(--dashboard-text-strong)]">
                    Quiz draft ready for review
                  </h2>
                </div>
                <p className="mt-3 text-[15px] leading-7 text-[var(--dashboard-text-soft)]">
                  {copy.successDescription}
                </p>
              </div>
              <DashboardBadge
                tone={validationIssues.length > 0 ? "warning" : "success"}
                size="md"
              >
                {validationIssues.length > 0
                  ? "Needs review"
                  : mode === "student"
                    ? "Practice ready"
                    : "Ready to save"}
              </DashboardBadge>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className={dashboardInsetBlockClassName}>
                <p className="text-sm text-[var(--dashboard-text-soft)]">
                  Questions generated
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--dashboard-text-strong)]">
                  {questionsCount}
                </p>
              </div>
              <div className={dashboardInsetBlockClassName}>
                <p className="text-sm text-[var(--dashboard-text-soft)]">
                  {mode === "student" ? copy.contextLabel : "Source summary"}
                </p>
                <p className="mt-2 font-semibold text-[var(--dashboard-text-strong)]">
                  {mode === "student" ? contextValue : parsedSource?.label}
                </p>
              </div>
              <div className={dashboardInsetBlockClassName}>
                <p className="text-sm text-[var(--dashboard-text-soft)]">
                  Generation time
                </p>
                <p className="mt-2 font-semibold text-[var(--dashboard-text-strong)]">
                  {generationDurationLabel}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <DashboardButton
                type="button"
                size="lg"
                variant={mode === "student" ? "primary" : "soft"}
                onClick={() => handleOpenQuizFlow("draft")}
              >
                <PlayCircle className="h-4.5 w-4.5" />
                {copy.launchLabel}
              </DashboardButton>
              <DashboardButton
                type="button"
                size="lg"
                variant={mode === "student" ? "secondary" : "primary"}
                onClick={() => {
                  setHasEnteredReview(true);
                }}
              >
                <PencilLine className="h-4.5 w-4.5" />
                {mode === "student" ? "Review Practice Set" : "Review Questions"}
              </DashboardButton>
              <DashboardButton
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleGenerateQuiz}
              >
                <RefreshCw className="h-4.5 w-4.5" />
                Regenerate
              </DashboardButton>
            </div>
          </>
        ) : null}
      </section>
    </DashboardSurface>
  );
}
