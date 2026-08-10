import { PageHeader } from "@/components/admin/page-header";
import { SocialLinksForm } from "@/components/admin/social-links-form";
import { getSiteSettings } from "@/lib/site-settings";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site settings"
        description="Manage social media links shown on the public website."
      />
      <SocialLinksForm initial={settings} />
    </div>
  );
}
