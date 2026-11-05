import type { LandingData } from "./data";

export function Stats({ stats }: { stats: LandingData["stats"] }) {
  if (stats.length === 0) return null;
  return (
    <dl className="mx-auto flex max-w-[1191px] justify-center gap-3.5 px-20 pb-32 max-[1100px]:flex-wrap max-[1100px]:px-5 max-[1100px]:pb-20">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-1 basis-0 flex-col items-center gap-[18px] px-3.5 not-first:border-l not-first:border-neutral-700 max-[640px]:basis-[45%] max-[640px]:border-l-0!"
        >
          <span className="text-[56.686px] leading-[70.857px] font-semibold tracking-[-2.8343px] whitespace-nowrap">
            {stat.value}
          </span>
          <dt className="text-center text-xl leading-[34px] text-muted-foreground capitalize">{stat.label}</dt>
        </div>
      ))}
    </dl>
  );
}
