// Copy and links from the landing page design (Figma "Amentorz-webapp", node 1:948). Links point to
// the pages that will exist; the ones not built yet show the app's 404 until then.
export const FACULTY_URL = process.env.NEXT_PUBLIC_FACULTY_URL ?? "";

export const navLinks = [
  { label: "Categories", href: "#categories", menu: true },
  { label: "Find tutors", href: "/tutors" },
  { label: "Free library", href: "/library" },
  { label: "How it works", href: "#how-it-works" },
] as const;

export const loginOptions = [
  { label: "Student login", href: "/login" },
  { label: "Faculty login", href: FACULTY_URL ? `${FACULTY_URL}/login` : "/login" },
] as const;

export const categories = [
  { key: "school", title: "School", summary: "NCERT · ICSE · State Board · Classes 6–12", icon: "icon-book.svg", href: "/library?category=school" },
  { key: "university", title: "University", summary: "B.Sc · B.Com · B.Tech · semester-wise support", icon: "icon-certificate.svg", href: "/library?category=university" },
  { key: "jee-neet", title: "JEE / NEET", summary: "Main · Advanced · NEET UG · previous and sample papers", icon: "icon-chart-bar.svg", href: "/library?category=jee-neet" },
  { key: "skills", title: "Skill Learning", summary: "Research methods · Python · data analysis · spoken English", icon: "icon-users.svg", href: "/library?category=skills" },
] as const;

export const journeySteps = [
  { title: "Tell us what you need" },
  { title: "Choose a tutor" },
  {
    title: "Book one session at a time",
    body: "Choose a slot, add the topic you want covered, and see the fee and 18% GST separately before you pay.",
  },
  { title: "Attend, submit, track" },
] as const;

export const footerColumns = [
  {
    title: "Learn",
    links: [
      ["School — NCERT", "/library?category=school"],
      ["School — ICSE", "/library?category=school"],
      ["School — State Board", "/library?category=school"],
      ["University", "/library?category=university"],
      ["JEE / NEET", "/library?category=jee-neet"],
      ["Research & Skill Learning", "/library?category=skills"],
    ],
  },
  {
    title: "Students",
    links: [
      ["Free library", "/library"],
      ["Find a tutor", "/tutors"],
      ["Book a session", "/tutors"],
      ["Homework help", "/homework-help"],
      ["Progress reports", "/progress-reports"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Amentorz", "/about"],
      ["Become a tutor", FACULTY_URL || "/become-a-tutor"],
      ["Pricing & GST", "/pricing"],
      ["Contact support", "/support"],
    ],
  },
] as const;

export const legalLinks = [
  ["Terms & conditions", "/terms"],
  ["Refund policy", "/refund-policy"],
  ["Child safety policy", "/child-safety"],
  ["Privacy policy", "/privacy"],
] as const;

export const companyLegalLine =
  process.env.NEXT_PUBLIC_COMPANY_LEGAL_LINE ?? `© ${new Date().getFullYear()} Amentorz`;
