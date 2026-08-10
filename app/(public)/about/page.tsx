import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${SITE.client.fullName} (${SITE.client.sannyasName}) and Vishvanath Solutions.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-3 text-center sm:text-left">
        <h1 className="text-display text-foreground">About</h1>
        <p className="text-body text-muted-foreground">
          Welcome to {SITE.name} — a platform for thoughtful articles on
          spirituality, wisdom, and purposeful living.
        </p>
      </header>

      <section className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
        <div className="relative size-48 shrink-0 overflow-hidden rounded-2xl border border-border shadow-card sm:size-56">
          <Image
            src={SITE.client.portrait}
            alt={SITE.client.portraitAlt}
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 192px, 224px"
            priority
          />
        </div>
        <div className="space-y-4 text-center sm:text-left">
          <div>
            <h2 className="text-h2 text-foreground">{SITE.client.fullName}</h2>
            <p className="mt-1 text-body font-medium text-primary">
              {SITE.client.sannyasName}
            </p>
          </div>
          <p className="text-body leading-relaxed text-muted-foreground">
            Prof. Dr. Vidyaprasad Shukla, known in sannyas as Swami Vidyanand
            Paramahans, is a scholar and spiritual guide dedicated to sharing
            timeless wisdom with seekers around the world. Through articles,
            teachings, and guided reflection, he offers practical insight for
            living with clarity, compassion, and purpose.
          </p>
          <p className="text-body leading-relaxed text-muted-foreground">
            This website brings together curated writings across multiple
            categories — each crafted to inform, inspire, and support your
            journey of inner growth.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="text-h2 text-foreground">Our mission</h2>
        <p className="mt-3 text-body leading-relaxed text-muted-foreground">
          {SITE.name} exists to make authentic spiritual and philosophical
          guidance accessible to everyone. We believe that well-written,
          carefully researched articles can illuminate the path toward a more
          mindful and meaningful life.
        </p>
      </section>

      <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
        <Link href="/contact" className={buttonVariants()}>
          Get in touch
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Browse articles
        </Link>
      </div>
    </div>
  );
}
