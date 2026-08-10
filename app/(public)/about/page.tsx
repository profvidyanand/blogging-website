import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Mail,
  Microscope,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getExtraButtons } from "@/lib/extra-buttons";
import { SITE, getVisibleExtraButtons } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${SITE.client.fullName} (${SITE.client.sannyasName}) — professor, researcher, and spiritual guide.`,
};

const careerTimeline = [
  {
    period: "1982 – 2003",
    role: "Senior Research Officer → Chief Research Officer → HOD, Computer Division",
    org: "Central Water and Power Research Station (CWPRS), Pune",
  },
  {
    period: "2003 – 2009",
    role: "Professor",
    org: "Bharathiar Institute of Technology, Sathyamangalam & NIT Durgapur",
  },
  {
    period: "2009 – Present",
    role: "Professor (Full)",
    org: "Faculty of Engineering & Technology, Mody University of Science and Technology, Lachhmangarh",
  },
];

const highlights = [
  { value: "75+", label: "Refereed publications" },
  { value: "29", label: "Technical reports" },
  { value: "40+", label: "Years of research" },
];

const academicProfiles = [
  {
    name: "ResearchGate",
    description: "Publications, citations, and research network",
    href: SITE.client.profiles.researchGate,
    source: "ResearchGate",
  },
  {
    name: "Google Scholar",
    description: "Academic citations and scholarly profile",
    href: SITE.client.profiles.googleScholar,
    source: "Google Scholar",
  },
  {
    name: "MECS Press",
    description: "Author profile and journal publications",
    href: SITE.client.profiles.mecsPress,
    source: "MECS Press",
  },
];

function ProfileLink({
  name,
  description,
  href,
  source,
}: (typeof academicProfiles)[number]) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-hover"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <ExternalLink className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-semibold text-foreground group-hover:text-primary">
            {name}
          </span>
          <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
        <span className="mt-0.5 block text-body-sm text-muted-foreground">
          {description}
        </span>
        <span className="mt-1 block text-caption text-muted-foreground/80">
          Source: {source}
        </span>
      </span>
    </a>
  );
}

export default async function AboutPage() {
  const { client } = SITE;
  const extraButtons = getVisibleExtraButtons(await getExtraButtons());

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-card sm:p-10">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
          <div className="relative size-44 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/20 shadow-lg sm:size-52">
            <Image
              src={client.portrait}
              alt={client.portraitAlt}
              fill
              className="object-cover object-top"
              sizes="(max-width: 640px) 176px, 208px"
              priority
            />
          </div>
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div className="space-y-2">
              <Badge variant="secondary" className="mx-auto lg:mx-0">
                {client.title}
              </Badge>
              <h1 className="text-display text-foreground">{client.fullName}</h1>
              <p className="text-body font-medium text-primary">
                {client.sannyasName}
              </p>
            </div>
            <p className="text-body leading-relaxed text-muted-foreground">
              {client.affiliation}
            </p>
            <ul className="flex flex-wrap justify-center gap-2 lg:justify-start">
              {client.credentials.map((credential) => (
                <li key={credential}>
                  <Badge variant="outline" className="font-normal">
                    <GraduationCap className="mr-1 size-3" />
                    {credential}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4">
        {highlights.map(({ value, label }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-4 text-center shadow-card sm:p-6"
          >
            <p className="text-h2 tabular-nums text-primary">{value}</p>
            <p className="mt-1 text-body-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      {/* Biography */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          <h2 className="text-h2 text-foreground">Biography</h2>
        </div>
        <div className="space-y-4 text-body leading-relaxed text-muted-foreground">
          <p>
            Dr. Vidya Prasad Shukla was born in India in 1954. He earned his
            M.Sc. in Applied Mathematics from Avadh University, Faizabad (1976),
            his Ph.D. in Modelling and Computer Simulation from the Indian
            Institute of Technology Kanpur (1982), and a Postgraduate Diploma in
            Computational Hydraulic Engineering from the International Institute
            of Environmental & Hydraulic Engineering, Delft, the Netherlands
            (1986).
          </p>
          <p>
            From 1982 to 2003, he served at the Central Water and Power Research
            Station (CWPRS), Pune — advancing through roles as Senior Research
            Officer, Chief Research Officer, and Head of the Computer Division.
            He subsequently held professorships at Bharathiar Institute of
            Technology, Sathyamangalam and NIT Durgapur (2003–2009), before
            joining Mody University of Science and Technology, Lachhmangarh, where
            he continues as Professor in the Faculty of Engineering &
            Technology.
          </p>
          <p>
            He has published over 75 papers in refereed journals and conference
            proceedings, authored 29 technical reports on nationally and
            internationally sponsored research projects, and served as editor of
            the book &ldquo;Development of Coastal Engineering&rdquo; published by
            CWPRS, Pune.
          </p>
        </div>
      </section>

      {/* Career */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="size-5 text-primary" />
          <h2 className="text-h2 text-foreground">Career highlights</h2>
        </div>
        <ol className="relative space-y-0 border-l border-border pl-6">
          {careerTimeline.map(({ period, role, org }, index) => (
            <li
              key={period}
              className={cn(
                "relative pb-8 last:pb-0",
                index === careerTimeline.length - 1 && "pb-0",
              )}
            >
              <span className="absolute -left-[calc(0.75rem+1px)] top-1.5 size-2.5 rounded-full border-2 border-primary bg-background" />
              <p className="text-caption font-medium uppercase tracking-wide text-primary">
                {period}
              </p>
              <p className="mt-1 font-semibold text-foreground">{role}</p>
              <p className="mt-0.5 text-body-sm text-muted-foreground">{org}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Research interests */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Microscope className="size-5 text-primary" />
          <h2 className="text-h2 text-foreground">Research interests</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {client.researchInterests.map((interest) => (
            <Badge key={interest} variant="secondary" className="text-body-sm">
              {interest}
            </Badge>
          ))}
        </div>
      </section>

      {/* Academic profiles */}
      <section className="space-y-4">
        <h2 className="text-h2 text-foreground">Academic profiles</h2>
        <p className="text-body text-muted-foreground">
          Explore published research, citations, and scholarly work through these
          verified academic profiles.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {academicProfiles.map((profile) => (
            <ProfileLink key={profile.name} {...profile} />
          ))}
        </div>
      </section>

      {/* Spiritual path */}
      <section className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="text-h2 text-foreground">Spiritual path &amp; teachings</h2>
        <div className="mt-4 space-y-4 text-body leading-relaxed text-muted-foreground">
          <p>
            Beyond his distinguished academic career, Prof. Dr. Vidya Prasad
            Shukla is known in sannyas as{" "}
            <span className="font-medium text-foreground">
              {client.sannyasName}
            </span>
            . As a scholar and spiritual guide, he shares timeless wisdom on
            spirituality, philosophy, and purposeful living — bridging rigorous
            scientific inquiry with deep contemplative insight.
          </p>
          <p>
            Through {SITE.name}, he offers curated articles and teachings
            designed to inform, inspire, and support seekers on their journey of
            inner growth and mindful living.
          </p>
        </div>
      </section>

      {/* Contact & CTA */}
      <section className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Get in touch</h2>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-1 inline-block text-body text-primary hover:underline"
            >
              {SITE.email}
            </a>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Academic:{" "}
              <a
                href={`mailto:${client.academicEmail}`}
                className="text-primary hover:underline"
              >
                {client.academicEmail}
              </a>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className={buttonVariants()}>
            Contact us
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Browse articles
          </Link>
        </div>
      </section>

      {extraButtons.length > 0 ? (
        <section className="flex flex-wrap justify-center gap-3">
          {extraButtons.map((button, index) => (
            <a
              key={`${button.name}-${index}`}
              href={button.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              {button.name}
              <ExternalLink className="ml-1.5 size-3.5" />
            </a>
          ))}
        </section>
      ) : null}
    </div>
  );
}
