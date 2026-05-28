"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";

const SECTIONS = [
  { id: "technika", label: "Technika" },
  { id: "design", label: "Varianty" },
  { id: "popis", label: "Popis" },
  { id: "parametry", label: "Parametry" },
  { id: "ke-stazeni", label: "Ke stažení" },
  { id: "souvisejici", label: "Další krok" },
] as const;

type Section = (typeof SECTIONS)[number];

export function ProductSectionNav() {
  const [visible, setVisible] = useState<Section[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const available = SECTIONS.filter((s) => document.getElementById(s.id));
    setVisible(available);
    setActive(available[0]?.id ?? "");
  }, []);

  useEffect(() => {
    if (!visible.length) return;

    const elements = visible.map((s) => document.getElementById(s.id)).filter(Boolean);
    const mobile = window.matchMedia("(max-width: 639px)").matches;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (hit[0]?.target.id) setActive(hit[0].target.id);
      },
      {
        rootMargin: mobile ? "-18% 0px -62% 0px" : "-28% 0px -55% 0px",
        threshold: [0, 0.15, 0.35],
      }
    );

    elements.forEach((el) => observer.observe(el!));
    return () => observer.disconnect();
  }, [visible]);

  if (!visible.length) return null;

  return (
    <nav className="pd-nav" aria-label="Sekce produktu">
      <Container width="wide">
        <div className="pd-nav__inner">
          {visible.map((s) => (
            <Link
              key={s.id}
              href={`#${s.id}`}
              className={`pd-nav__link ${active === s.id ? "is-active" : ""}`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </Container>
    </nav>
  );
}
