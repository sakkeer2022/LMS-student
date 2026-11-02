import { Text } from "@/components/ui";
import type { LandingData } from "./data";

export function Stats({ stats }: { stats: LandingData["stats"] }) {
  if (stats.length === 0) return null;
  return (
    <dl className="lp-stats">
      {stats.map((stat) => (
        <div key={stat.label} className="lp-stat">
          <Text as="span" className="lp-stat__value">{stat.value}</Text>
          <dt className="lp-stat__label">{stat.label}</dt>
        </div>
      ))}
    </dl>
  );
}
