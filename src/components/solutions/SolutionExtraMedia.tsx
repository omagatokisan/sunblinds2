export type SolutionExtraIconVariant = "catalog" | "inquiry";

type SolutionExtraMediaProps = {
  variant: SolutionExtraIconVariant;
};

export function SolutionExtraMedia({ variant }: SolutionExtraMediaProps) {
  return (
    <div className="hd-solution-card__media hd-solution-card__media--icon">
      <div className="hd-solution-card__icon-grid" aria-hidden />
      <span className="hd-solution-card__icon-frame">
        {variant === "catalog" ? <AllSolutionsIcon /> : <InquiryIcon />}
      </span>
      <div className="hd-solution-card__shade" aria-hidden />
    </div>
  );
}

function AllSolutionsIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="7" y="7" width="14" height="14" stroke="currentColor" strokeWidth="1.5" />
      <rect x="27" y="7" width="14" height="14" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="27" width="14" height="14" stroke="currentColor" strokeWidth="1.5" />
      <rect x="27" y="27" width="14" height="14" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M34 31h4v4M36 29v8M32 33h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InquiryIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="11" y="9" width="26" height="30" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 9V6h14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 19h14M17 25h14M17 31h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M30 34l2.5 2.5L38 31"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="35" cy="35" r="7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
