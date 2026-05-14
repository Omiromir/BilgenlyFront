import type { OnboardingAnswers } from "../auth/types";

export type StepKey =
  | "signup"
  | "email"
  | "welcome"
  | "role"
  | "goal"
  | "experience"
  | "pace"
  | "reminder"
  | "loading"
  | "recommendations";

export type SelectedAnswers = Pick<
  OnboardingAnswers,
  "role" | "goal" | "experience" | "pace"
>;

export interface ChoiceOption {
  id: string;
  emoji: string;
  label: string;
  sub: string;
}

export interface RecommendationCard {
  emoji: string;
  tag: string;
  tagColor: string;
  title: string;
  sub: string;
  time: string;
}
