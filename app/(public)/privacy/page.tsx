import type { Metadata } from "next";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE.name}.`,
};

export default function PrivacyPage() {
  const updated = "August 10, 2026";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-display text-foreground">Privacy Policy</h1>
        <p className="text-body-sm text-muted-foreground">
          Last updated: {updated}
        </p>
      </header>

      <div className="max-w-none space-y-6 text-body leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-h2 text-foreground">Overview</h2>
          <p>
            {SITE.name} ({SITE.domain}) respects your privacy. This policy
            describes what information we collect when you visit our website and
            how we use it.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2 text-foreground">Information we collect</h2>
          <p>
            When you browse our website, we may collect anonymous usage data
            such as pages visited and article read counts. If you contact us by
            email, we receive the information you choose to share.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2 text-foreground">Cookies and local storage</h2>
          <p>
            We use browser session storage to avoid counting repeat article
            views within the same session. We do not use third-party advertising
            cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2 text-foreground">Third-party services</h2>
          <p>
            Our website may link to external platforms such as social media
            sites. Those services have their own privacy policies, which we
            encourage you to review.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2 text-foreground">Contact</h2>
          <p>
            For privacy-related questions, please email us at{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="text-primary hover:underline"
            >
              {SITE.email}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
