"use client";

import Link from "next/link";
import type { GdprConsent } from "@/lib/cms/types";

export function GdprConsentField({
  consent,
  checked,
  onChange,
  required = true,
}: {
  consent: GdprConsent;
  checked: boolean;
  onChange: (v: boolean) => void;
  required?: boolean;
}) {
  return (
    <label className="hd-form-consent flex gap-3 p-4 text-sm leading-relaxed text-muted">
      <input
        type="checkbox"
        required={required}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-brand"
      />
      <span>
        {consent.textBeforeLink}{" "}
        <Link href={consent.linkHref} className="font-semibold text-brand hover:underline" target="_blank">
          {consent.linkLabel}
        </Link>
        .
      </span>
    </label>
  );
}
