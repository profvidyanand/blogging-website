import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${SITE.client.fullName} at ${SITE.name}.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <header className="space-y-3 text-center sm:text-left">
        <h1 className="text-display text-foreground">Contact</h1>
        <p className="text-body text-muted-foreground">
          We welcome your questions, feedback, and inquiries. Reach out using
          the details below.
        </p>
      </header>

      <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="flex gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Email</h2>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-1 inline-block text-body text-primary hover:underline"
            >
              {SITE.email}
            </a>
            <p className="mt-1 text-body-sm text-muted-foreground">
              For general inquiries, speaking requests, and media contact.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Phone className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Phone</h2>
            <a
              href={`tel:${SITE.phone.replace(/\s/g, "")}`}
              className="mt-1 inline-block text-body text-primary hover:underline"
            >
              {SITE.phone}
            </a>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Call or message for urgent inquiries.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Website</h2>
            <a
              href={SITE.url}
              className="mt-1 inline-block text-body text-primary hover:underline"
            >
              {SITE.domain}
            </a>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Official website of {SITE.name}.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-body-sm text-muted-foreground sm:text-left">
        You can also explore our{" "}
        <Link href="/about" className="text-primary hover:underline">
          About page
        </Link>{" "}
        to learn more about {SITE.client.fullName}.
      </p>
    </div>
  );
}
