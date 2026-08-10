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
    fullName: "Prof. Dr. Vidyaprasad Shukla",
    sannyasName: "Swami Vidyanand Paramahans",
    portrait: "/images/prof-vidyanand.png",
    portraitAlt:
      "Professional portrait of Prof. Dr. Vidyaprasad Shukla (Swami Vidyanand Paramahans)",
  },
} as const;

export type SocialLinks = {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
};

export const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  facebook: "",
  instagram: "",
  twitter: "",
  youtube: "",
};
