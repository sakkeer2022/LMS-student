export type StudentIcon = "dashboard" | "sessions" | "library" | "homework" | "progress" | "payments" | "profile";

export type StudentNavigationGroup = {
  label: string;
  items: [title: string, href: string, icon: StudentIcon][];
};

// Destinations and grouping from the Figma "Student sidebar" (LEARN / TRACK / ACCOUNT).
export const studentNavigation: StudentNavigationGroup[] = [
  {
    label: "Learn",
    items: [
      ["Dashboard", "/dashboard", "dashboard"],
      ["My Sessions", "/sessions", "sessions"],
      ["Library", "/library", "library"],
      ["Homework", "/homework", "homework"],
    ],
  },
  {
    label: "Track",
    items: [
      ["Progress", "/progress", "progress"],
      ["Payments", "/payments", "payments"],
    ],
  },
  { label: "Account", items: [["Profile", "/profile", "profile"]] },
];

export const studentPages = studentNavigation.flatMap((group) => group.items);

export function isNavigationActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
