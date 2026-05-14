import { AuthProvider } from "./providers/AuthProvider";
import { NotificationsProvider } from "./providers/NotificationsProvider";
import { QuizLibraryProvider } from "./providers/QuizLibraryProvider";
import { QuizSessionProvider } from "./providers/QuizSessionProvider";
import { StudentAttemptsProvider } from "./providers/StudentAttemptsProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { SettingsProvider } from "./providers/SettingsProvider";
import { TeacherClassesProvider } from "./providers/TeacherClassesProvider";
import { AppRoutes } from "./routes/AppRoutes";
import { Toaster } from "../components/ui/sonner";
import { useSettings } from "./providers/SettingsProvider";

function AppToaster() {
  const { resolvedTheme } = useSettings();

  return <Toaster closeButton position="top-right" richColors theme={resolvedTheme} />;
}

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <SettingsProvider>
          <NotificationsProvider>
            <TeacherClassesProvider>
              <QuizLibraryProvider>
                <QuizSessionProvider>
                  <StudentAttemptsProvider>
                    <AppRoutes />
                    <AppToaster />
                  </StudentAttemptsProvider>
                </QuizSessionProvider>
              </QuizLibraryProvider>
            </TeacherClassesProvider>
          </NotificationsProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
