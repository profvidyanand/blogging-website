import { ExtraButtonsForm } from "@/components/admin/extra-buttons-form";
import { PageHeader } from "@/components/admin/page-header";
import { getExtraButtons } from "@/lib/extra-buttons";

export default async function ExtraButtonsPage() {
  const buttons = await getExtraButtons();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Extra buttons"
        description="Manage custom link buttons displayed at the bottom of the About page."
      />
      <ExtraButtonsForm initial={buttons} />
    </div>
  );
}
