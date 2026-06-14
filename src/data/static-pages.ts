export interface StaticPage {
  id: string;
  title: string;
  blurb: string;
  href: string;
  search: boolean;
  sidebar: boolean;
  footer: boolean;
}

export const STATIC_PAGES: StaticPage[] = [
  {
    id: "curriculum",
    title: "Curriculum",
    blurb: "All lessons grouped by track.",
    href: "/",
    search: true,
    sidebar: false,
    footer: true,
  },
  {
    id: "cookbook",
    title: "Cookbook",
    blurb: "Copy-paste starter prompts.",
    href: "/cookbook",
    search: true,
    sidebar: true,
    footer: true,
  },
  {
    id: "glossary",
    title: "Glossary",
    blurb: "Definitions for the AI terms tutorials drop without warning.",
    href: "/glossary",
    search: true,
    sidebar: true,
    footer: true,
  },
  {
    id: "whats-next",
    title: "What's next",
    blurb: "Where to go after you've finished the tutorial.",
    href: "/whats-next",
    search: true,
    sidebar: false,
    footer: false,
  },
];
