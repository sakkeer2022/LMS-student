import Image from "next/image";
import type { LandingStat } from "@/features/landing/data";

const ROW_ONE = [4, 1, 2, 3];
const ROW_TWO = [5, 6, 7, 8];

function PhotoRow({ photos, className }: { photos: number[]; className: string }) {
  return (
    <div aria-hidden className={`absolute flex items-center gap-2 ${className}`}>
      {photos.map((n) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={n}
          src={`/auth/photo-${n}.png`}
          alt=""
          className="h-[175px] w-[185px] max-w-none bg-[#d9d9d9] object-cover"
        />
      ))}
    </div>
  );
}

function Glow({ className }: { className: string }) {
  return (
    <div aria-hidden className={`absolute flex h-[526px] w-[602px] items-center justify-center ${className}`}>
      <div className="relative h-[204px] w-[601px] rotate-[37.28deg]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/auth/glow.svg" alt="" className="absolute inset-x-[-44.21%] inset-y-[-130.27%] block max-w-none" />
      </div>
    </div>
  );
}

function Fade({ className }: { className: string }) {
  return <div aria-hidden className={`absolute h-[86px] w-[769px] bg-[#18082f] blur-[28.8px] ${className}`} />;
}

/**
 * The purple brand side of the sign-in and sign-up screens. The pitch is passed in; the proof figures come
 * from the backend (none exist yet, so none show) and are never written here.
 */
export function BrandPanel({
  eyebrow,
  title,
  copy,
  stats,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  stats: LandingStat[];
}) {
  return (
    <aside className="relative hidden shrink-0 flex-col justify-between overflow-hidden bg-[#18082f] p-14 lg:flex lg:basis-[620px]">
      <PhotoRow photos={ROW_ONE} className="top-[133px] left-[-115px] opacity-[0.14]" />
      <PhotoRow photos={ROW_TWO} className="top-[320px] left-[-211px] opacity-10" />
      <Fade className="top-[446px] left-[-26px]" />
      <Fade className="top-[98px] left-[-98px]" />
      <Glow className="top-[700px] left-[-211px]" />
      <Glow className="top-[-249px] left-[287px]" />
      <div className="relative flex flex-col gap-[88px]">
        <div>
          <Image src="/auth/logo.svg" alt="Amentorz" width={122} height={18} priority unoptimized />
        </div>
        <div className="flex flex-col gap-5 text-purple-100">
          <p className="text-xs font-semibold tracking-[0.02em]">{eyebrow}</p>
          <p className="text-4xl leading-11 font-bold tracking-[-0.015em] text-white">{title}</p>
          <p className="text-lg leading-7">{copy}</p>
        </div>
      </div>
      {stats.length > 0 && (
        <div className="relative flex flex-col gap-[54px]">
          <dl className="flex gap-8 text-center">
            {stats.slice(0, 3).map((stat) => (
              <div key={stat.label} className="flex min-w-0 flex-1 flex-col gap-0.5">
                <dd className="order-first text-3xl font-bold tracking-[-0.01em] text-white">{stat.value}</dd>
                <dt className="text-xs text-purple-100">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      )}
    </aside>
  );
}
