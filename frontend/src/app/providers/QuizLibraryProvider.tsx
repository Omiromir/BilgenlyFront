import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  QuizLibraryItem,
  QuizLibraryStatus,
  QuizLibraryVisibility,
  QuizQuestionRecord,
  QuizRecord,
} from "../../features/dashboard/components/quiz-library/quizLibraryTypes";
import { isGuidString } from "../../lib/apiClient";
import { createQuiz as createQuizRequest } from "../../features/dashboard/api/quizzesApi";
import { useAuth } from "./AuthProvider";
import { useTeacherClasses } from "./TeacherClassesProvider";
import {
  getScopedStorageValue,
  getUserScopedStorageKey,
  getUserStorageScope,
} from "./userScopedStorage";

const QUIZ_LIBRARY_STORAGE_KEY = "bilgenly_quiz_library";

interface SaveGeneratedQuizInput {
  existingQuizId?: string;
  ownerRole: "teacher" | "student";
  title: string;
  description: string;
  topic: string;
  difficulty: QuizRecord["difficulty"];
  language: string;
  status: QuizLibraryStatus;
  visibility: QuizLibraryVisibility;
  tags: string[];
  sourceLabel: string;
  note?: string;
  questionCount: number;
  durationMinutes: number;
  questions: QuizQuestionRecord[];
  practiceState?: QuizRecord["practiceState"];
}

interface QuizLibraryContextValue {
  quizzes: QuizRecord[];
  saveGeneratedQuiz: (input: SaveGeneratedQuizInput) => QuizRecord;
  ensureQuizHasBackendId: (quizId: string) => Promise<string>;
  getQuizById: (quizId: string) => QuizRecord | undefined;
  syncQuizPracticeState: (
    quizId: string,
    updates: Partial<
      Pick<
        QuizRecord,
        | "practiceState"
        | "practiceProgressLabel"
        | "attemptCount"
        | "averageScore"
      >
    >,
  ) => void;
  publishQuiz: (
    quizId: string,
    viewerRole: "teacher" | "student",
    visibility?: QuizLibraryVisibility,
  ) => void;
  toggleSavedQuiz: (quizId: string, viewerRole: "teacher" | "student") => void;
  deleteQuiz: (quizId: string, viewerRole: "teacher" | "student") => void;
  duplicateQuizToLibrary: (
    quizId: string,
    viewerRole: "teacher" | "student",
  ) => QuizRecord | null;
}

const QuizLibraryContext = createContext<QuizLibraryContextValue | undefined>(
  undefined,
);

interface QuizLibraryProviderProps {
  children: ReactNode;
}

function formatQuizDate(date: Date) {
  return date.toISOString();
}

function getOwnerName(
  role: "teacher" | "student",
  currentUserName?: string | null,
) {
  if (currentUserName?.trim()) {
    return currentUserName.trim();
  }

  return role === "teacher" ? "Unknown teacher" : "You";
}

function normalizeTags(tags: string[]) {
  const seen = new Set<string>();

  return tags.filter((tag) => {
    const normalized = tag.trim().toLowerCase();

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

function sanitizeQuizRecord(quiz: QuizRecord): QuizRecord {
  return {
    ...quiz,
    tags: normalizeTags(quiz.tags ?? []),
  };
}

function toCreateQuizQuestionType(
  question: QuizQuestionRecord,
) {
  if (question.questionType === "True/False") {
    return "TrueFalse";
  }

  return "MCQ";
}

function getCorrectAnswerIndexes(question: QuizQuestionRecord) {
  if (question.selectionMode === "multiple" && question.correctIndexes?.length) {
    return question.correctIndexes;
  }

  return [question.correctIndex];
}

function loadQuizLibraryFromStorage(scope: string) {
  const mergedByQuizId = new Map<string, QuizRecord>();
  const legacyScopedKeys: string[] = [];
  const mergeQuizRecords = (records: QuizRecord[]) => {
    records.forEach((quiz) => {
      if (typeof quiz?.id !== "string" || !quiz.id) {
        return;
      }

      const candidateQuiz = sanitizeQuizRecord(quiz);
      const existingQuiz = mergedByQuizId.get(candidateQuiz.id);

      if (!existingQuiz) {
        mergedByQuizId.set(candidateQuiz.id, candidateQuiz);
        return;
      }

      const existingUpdatedAt = new Date(existingQuiz.updatedAt).getTime();
      const candidateUpdatedAt = new Date(candidateQuiz.updatedAt).getTime();

      if (
        Number.isNaN(existingUpdatedAt) ||
        candidateUpdatedAt >= existingUpdatedAt
      ) {
        mergedByQuizId.set(candidateQuiz.id, candidateQuiz);
      }
    });
  };

  const sharedValue = getScopedStorageValue(QUIZ_LIBRARY_STORAGE_KEY, scope);

  if (sharedValue) {
    try {
      const parsed = JSON.parse(sharedValue) as QuizRecord[];

      if (Array.isArray(parsed)) {
        mergeQuizRecords(parsed);
      }
    } catch {
      localStorage.removeItem(QUIZ_LIBRARY_STORAGE_KEY);
    }
  }

  for (let index = 0; index < localStorage.length; index += 1) {
    const storageKey = localStorage.key(index);

    if (!storageKey || !storageKey.startsWith(`${QUIZ_LIBRARY_STORAGE_KEY}:`)) {
      continue;
    }

    legacyScopedKeys.push(storageKey);

    const scopedValue = localStorage.getItem(storageKey);

    if (!scopedValue) {
      continue;
    }

    try {
      const parsed = JSON.parse(scopedValue) as QuizRecord[];

      if (!Array.isArray(parsed)) {
        continue;
      }

      mergeQuizRecords(parsed);
    } catch {
      continue;
    }
  }

  if (!mergedByQuizId.size) {
    return null;
  }

  const mergedValue = JSON.stringify(Array.from(mergedByQuizId.values()));
  localStorage.setItem(QUIZ_LIBRARY_STORAGE_KEY, mergedValue);
  legacyScopedKeys.forEach((storageKey) => localStorage.removeItem(storageKey));

  return mergedValue;
}

export function mapQuizRecordToLibraryItem(
  quiz: QuizRecord,
  viewerRole: "teacher" | "student",
  currentUserId?: string | null,
): QuizLibraryItem {
  const isOwner = currentUserId
    ? quiz.ownerUserId
      ? quiz.ownerUserId === currentUserId
      : quiz.ownerRole === viewerRole
    : quiz.ownerRole === viewerRole;

  return {
    id: quiz.id,
    ownerUserId: quiz.ownerUserId,
    title: quiz.title,
    description: quiz.description,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    language: quiz.language,
    creatorName:
      viewerRole === "student" && quiz.ownerRole === "student"
        ? "You"
        : quiz.ownerName,
    questionCount: quiz.questionCount,
    durationMinutes: quiz.durationMinutes,
    updatedAt: quiz.updatedAt,
    status: quiz.status,
    visibility: quiz.visibility,
    tags: normalizeTags(quiz.tags),
    sourceLabel: quiz.sourceLabel,
    note: quiz.note,
    isOwner,
    isSaved: !isOwner && quiz.savedByRoles?.includes(viewerRole),
    isGeneratedByCurrentUser: viewerRole === "student" && isOwner,
    learnerCount: quiz.learnerCount,
    averageScore: quiz.averageScore,
    saveCount: quiz.savedByRoles?.length ?? quiz.saveCount,
    attemptCount: quiz.attemptCount,
    practiceState: quiz.practiceState,
    practiceProgressLabel: quiz.practiceProgressLabel,
  };
}

export function getQuizLibraryItemsForRole(
  quizzes: QuizRecord[],
  viewerRole: "teacher" | "student",
  currentUserId?: string | null,
) {
  return quizzes
    .filter((quiz) => {
      if (quiz.ownerRole === viewerRole) {
        return true;
      }

      return quiz.visibility === "public" && quiz.status === "published-public";
    })
    .map((quiz) => mapQuizRecordToLibraryItem(quiz, viewerRole, currentUserId));
}

export function QuizLibraryProvider({ children }: QuizLibraryProviderProps) {
  const { currentUser, role, token } = useAuth();
  const { syncAssignedQuizDetails } = useTeacherClasses();
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hydratedScope, setHydratedScope] = useState<string | null>(null);
  const storageScope = useMemo(
    () =>
      getUserStorageScope({
        userId: currentUser?.id,
        email: currentUser?.email,
        role,
        token,
      }),
    [currentUser?.email, currentUser?.id, role, token],
  );
  const storageKey = useMemo(
    () => getUserScopedStorageKey(QUIZ_LIBRARY_STORAGE_KEY, storageScope),
    [storageScope],
  );

  // Keep sync function up-to-date via ref to avoid infinite loops
  const syncAssignedQuizDetailsRef = useRef(syncAssignedQuizDetails);
  useEffect(() => {
    syncAssignedQuizDetailsRef.current = syncAssignedQuizDetails;
  }, [syncAssignedQuizDetails]);

  useEffect(() => {
    setQuizzes([]);
    setIsHydrated(false);
    setHydratedScope(null);

    const savedValue = loadQuizLibraryFromStorage(storageScope);

    if (!savedValue) {
      setHydratedScope(storageScope);
      setIsHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(savedValue) as QuizRecord[];
      setQuizzes(Array.isArray(parsed) ? parsed.map(sanitizeQuizRecord) : []);
    } catch {
      setQuizzes([]);
    } finally {
      setHydratedScope(storageScope);
      setIsHydrated(true);
    }
  }, [storageScope]);

  useEffect(() => {
    if (!isHydrated || hydratedScope !== storageScope) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(quizzes));
  }, [hydratedScope, isHydrated, quizzes, storageKey, storageScope]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    quizzes.forEach((quiz) => {
      syncAssignedQuizDetailsRef.current(quiz.id, {
        title: quiz.title,
        topic: quiz.topic,
        questionCount: quiz.questions.length || quiz.questionCount,
      });
    });
  }, [isHydrated, quizzes]);

  const value = useMemo<QuizLibraryContextValue>(
    () => ({
      quizzes,
      saveGeneratedQuiz: (input) => {
        const now = new Date();
        const quiz: QuizRecord = {
          id:
            input.existingQuizId ??
            `quiz-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
          ownerUserId: currentUser?.id,
          ownerRole: input.ownerRole,
          ownerName: getOwnerName(input.ownerRole, currentUser?.fullName),
          title: input.title.trim(),
          description: input.description.trim(),
          topic: input.topic.trim(),
          difficulty: input.difficulty,
          language: input.language,
          questionCount: input.questionCount,
          durationMinutes: input.durationMinutes,
          updatedAt: formatQuizDate(now),
          status: input.status,
          visibility: input.visibility,
          tags: normalizeTags(input.tags),
          sourceLabel: input.sourceLabel,
          note: input.note,
          questions: input.questions,
          practiceState: input.practiceState,
        };

        setQuizzes((current) => {
          const existingIndex = current.findIndex(
            (item) => item.id === quiz.id,
          );

          if (existingIndex === -1) {
            return [quiz, ...current];
          }

          const currentQuiz = current[existingIndex];
          const next = [...current];
          next[existingIndex] = {
            ...currentQuiz,
            ...quiz,
            savedByRoles: currentQuiz.savedByRoles,
            sourceQuizId: currentQuiz.sourceQuizId,
            practiceState: currentQuiz.practiceState ?? input.practiceState,
            practiceProgressLabel: currentQuiz.practiceProgressLabel,
            attemptCount: currentQuiz.attemptCount,
            averageScore: currentQuiz.averageScore,
          };
          return next;
        });
        return quiz;
      },
      ensureQuizHasBackendId: async (quizId) => {
        if (isGuidString(quizId)) {
          return quizId;
        }

        const sourceQuiz = quizzes.find((quiz) => quiz.id === quizId);

        if (!sourceQuiz) {
          throw new Error("Unable to find that quiz in your library.");
        }

        if (
          sourceQuiz.ownerRole !== "teacher" ||
          (sourceQuiz.ownerUserId && sourceQuiz.ownerUserId !== currentUser?.id)
        ) {
          throw new Error("Only teacher quizzes can be assigned to classes.");
        }

        const createdQuiz = await createQuizRequest({
          title: sourceQuiz.title,
          description: sourceQuiz.description,
          isPublic: sourceQuiz.visibility === "public",
          questions: sourceQuiz.questions.map((question, index) => {
            const correctIndexes = getCorrectAnswerIndexes(question);

            return {
              text: question.text,
              questionType: toCreateQuizQuestionType(question),
              position: index,
              answers: question.options.map((option, optionIndex) => ({
                text: option,
                isCorrect: correctIndexes.includes(optionIndex),
              })),
            };
          }),
        });

        setQuizzes((current) =>
          current.map((quiz) =>
            quiz.id === quizId
              ? {
                  ...quiz,
                  id: createdQuiz.id,
                  ownerName: createdQuiz.createdBy || quiz.ownerName,
                  visibility: createdQuiz.isPublic ? "public" : "private",
                  status: createdQuiz.isPublic
                    ? "published-public"
                    : quiz.status === "draft" || quiz.status === "generated" || quiz.status === "edited"
                      ? "published-private"
                      : quiz.status,
                  updatedAt: createdQuiz.createdAt || quiz.updatedAt,
                  note: "Synced to the backend so it can be assigned to classes.",
                }
              : quiz,
          ),
        );

        return createdQuiz.id;
      },
      getQuizById: (quizId) => quizzes.find((quiz) => quiz.id === quizId),
      syncQuizPracticeState: (quizId, updates) => {
        setQuizzes((current) =>
          current.map((quiz) =>
            quiz.id === quizId
              ? {
                  ...quiz,
                  ...updates,
                }
              : quiz,
          ),
        );
      },
      publishQuiz: (quizId, viewerRole, visibility) => {
        setQuizzes((current) =>
          current.map((quiz) => {
            if (quiz.id !== quizId || quiz.ownerRole !== viewerRole) {
              return quiz;
            }

            const nextVisibility = visibility ?? quiz.visibility;
            const nextStatus =
              nextVisibility === "public"
                ? "published-public"
                : "published-private";

            return {
              ...quiz,
              visibility: nextVisibility,
              status: nextStatus,
              updatedAt: formatQuizDate(new Date()),
              note:
                nextStatus === "published-public"
                  ? "Published to the public library from your draft library."
                  : "Published privately and visible only in your owner views.",
            };
          }),
        );
      },
      toggleSavedQuiz: (quizId, viewerRole) => {
        setQuizzes((current) =>
          current.map((quiz) => {
            if (quiz.id !== quizId || quiz.ownerRole === viewerRole) {
              return quiz;
            }

            const savedByRoles = new Set(quiz.savedByRoles ?? []);
            if (savedByRoles.has(viewerRole)) {
              savedByRoles.delete(viewerRole);
            } else {
              savedByRoles.add(viewerRole);
            }

            return {
              ...quiz,
              savedByRoles: Array.from(savedByRoles),
            };
          }),
        );
      },
      deleteQuiz: (quizId, viewerRole) => {
        setQuizzes((current) =>
          current.filter(
            (quiz) => !(quiz.id === quizId && quiz.ownerRole === viewerRole),
          ),
        );
      },
      duplicateQuizToLibrary: (quizId, viewerRole) => {
        const source = quizzes.find((quiz) => quiz.id === quizId);

        if (!source) {
          return null;
        }

        const now = new Date();
        const duplicate: QuizRecord = {
          ...source,
          id: `quiz-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
          ownerUserId: currentUser?.id,
          ownerRole: viewerRole,
          ownerName: getOwnerName(viewerRole, currentUser?.fullName),
          sourceQuizId: source.id,
          savedByRoles: [],
          title: `${source.title} Copy`,
          updatedAt: formatQuizDate(now),
          status: "draft",
          visibility: "private",
          sourceLabel: `Duplicated from ${source.ownerName}'s public quiz`,
          note: "This duplicated quiz is now your editable draft copy.",
          tags: normalizeTags(source.tags),
          questions: source.questions.map((question) => ({
            ...question,
            options: [...question.options],
          })),
          practiceState: viewerRole === "student" ? "ready" : undefined,
          practiceProgressLabel: undefined,
          attemptCount: undefined,
          averageScore: undefined,
        };

        setQuizzes((current) => [duplicate, ...current]);
        return duplicate;
      },
    }),
    [currentUser?.fullName, currentUser?.id, quizzes],
  );

  return (
    <QuizLibraryContext.Provider value={value}>
      {children}
    </QuizLibraryContext.Provider>
  );
}

export function useQuizLibrary() {
  const context = useContext(QuizLibraryContext);

  if (!context) {
    throw new Error("useQuizLibrary must be used within QuizLibraryProvider.");
  }

  return context;
}
