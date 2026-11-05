import { BookOpen, CalendarCheck, LogIn } from "lucide-react";
import {
  AuthHead,
  AuthLinkButton,
  AuthSuccess,
} from "@/components/auth/auth-controls";

const NEXT = [
  { icon: LogIn, text: "Sign in with the email and password you just chose." },
  {
    icon: BookOpen,
    text: "Browse the free library for every subject on your list.",
  },
  {
    icon: CalendarCheck,
    text: "Book a 1:1 session only when you want one. You pay per session.",
  },
];

/** Shown once the account exists: nothing is signed in yet, so it says so and points to the login. */
export function AccountCreated({
  name,
  email,
  subjects,
}: {
  name: string;
  email: string;
  subjects: number;
}) {
  const first = name.trim().split(/\s+/)[0] ?? name;
  return (
    <AuthSuccess>
      <AuthHead
        title={`Welcome to AmentorZ, ${first}!`}
        lead={`Your account is ready${subjects ? `, with ${subjects} ${subjects === 1 ? "subject" : "subjects"} on your learning list` : ""}. Sign in with ${email} to get started.`}
        leadClassName="text-base"
      />
      <ul className="flex flex-col gap-3 rounded-2xl bg-sunken p-4">
        {NEXT.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3 text-sm">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-card text-primary shadow-sm">
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="pt-1.5">{text}</span>
          </li>
        ))}
      </ul>
      <AuthLinkButton href="/login">Continue to sign in</AuthLinkButton>
    </AuthSuccess>
  );
}
