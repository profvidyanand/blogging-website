/** Public site identity — used in metadata, footer, and static pages. */
export const SITE = {
  name: "Vishvanath Solutions",
  domain: "vishvanathsolutions.com",
  url: "https://vishvanathsolutions.com",
  tagline: "Insights on spirituality, wisdom, and purposeful living.",
  description:
    "Articles and teachings from Prof. Dr. Vidyaprasad Shukla (Swami Vidyanand Paramahans) on spirituality, philosophy, and life guidance.",
  email: "profmastervidyanand@gmail.com",
  client: {
    fullName: "Prof. Dr. Vidya Prasad Shukla",
    sannyasName: "Swami Vidyanand Paramahans",
    title: "Professor (Full)",
    affiliation:
      "Faculty of Engineering and Technology, Mody University of Science and Technology, Lachhmangarh, Sikar",
    credentials: [
      "Ph.D. — Modelling & Computer Simulation, IIT Kanpur",
      "M.Sc. — Applied Mathematics, Avadh University, Faizabad",
      "PG Dip. — Computational Hydraulic Engineering, Delft (Netherlands)",
    ],
    academicEmail: "vpshukla.fet@modyuniversity.ac.in",
    portrait: "/images/prof-vidyanand.png",
    portraitAlt:
      "Professional portrait of Prof. Dr. Vidya Prasad Shukla (Swami Vidyanand Paramahans)",
    profiles: {
      researchGate:
        "https://www.researchgate.net/profile/Vidya-Prasad-Shukla",
      googleScholar:
        "https://scholar.google.com/citations?user=gvV19_8AAAAJ&hl=en",
      mecsPress: "https://www.mecs-press.org/authors/108912.html",
    },
    researchInterests: [
      "Computer Vision",
      "Image Processing",
      "Medical Image Computing",
      "Computer Simulation & Modeling",
      "Cellular Automata",
      "Soft Computing",
      "Operations Research",
      "Mathematical Biology",
    ],
  },
} as const;

export type SocialLinks = {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  linkedin: string;
};

export const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  facebook: "",
  instagram: "",
  twitter: "",
  youtube: "",
  linkedin: "",
};

export type ExtraButton = {
  name: string;
  url: string;
};

export const EXTRA_BUTTONS_COUNT = 5;

export const DEFAULT_EXTRA_BUTTONS: ExtraButton[] = Array.from(
  { length: EXTRA_BUTTONS_COUNT },
  () => ({ name: "", url: "" }),
);

export function normalizeExtraButtons(value: unknown): ExtraButton[] {
  const buttons = Array.isArray(value) ? value : [];
  const normalized: ExtraButton[] = [];

  for (let i = 0; i < EXTRA_BUTTONS_COUNT; i++) {
    const item = buttons[i];
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;
      normalized.push({
        name: typeof record.name === "string" ? record.name : "",
        url: typeof record.url === "string" ? record.url : "",
      });
    } else {
      normalized.push({ name: "", url: "" });
    }
  }

  return normalized;
}

export function getVisibleExtraButtons(buttons: ExtraButton[]): ExtraButton[] {
  return buttons.filter((button) => button.name.trim() && button.url.trim());
}
