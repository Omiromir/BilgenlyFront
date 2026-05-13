import { DashboardProfilePage } from "../../../features/dashboard/components/DashboardProfilePage";
import { useDashboardPageMeta } from "../../../features/dashboard/hooks/useDashboardPageMeta";

export function StudentProfilePage() {
  const meta = useDashboardPageMeta();

  return (
    <DashboardProfilePage
      title={meta?.title ?? "My Profile"}
      subtitle={meta?.subtitle ?? ""}
    />
  );
}
