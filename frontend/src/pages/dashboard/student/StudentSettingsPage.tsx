import { DashboardSettingsPage } from "../../../features/dashboard/components/DashboardSettingsPage";
import { useDashboardPageMeta } from "../../../features/dashboard/hooks/useDashboardPageMeta";
import { dashboardSettingsMetadata } from "../../../features/dashboard/settings/settingsMetadata";

export function StudentSettingsPage() {
  const meta = useDashboardPageMeta();

  return (
    <DashboardSettingsPage
      title={meta?.title ?? "Settings"}
      subtitle={meta?.subtitle ?? ""}
      metadata={dashboardSettingsMetadata}
    />
  );
}
