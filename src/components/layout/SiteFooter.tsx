"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MesconLogo } from "@/components/layout/MesconLogo";
import { SunBlindsLogo } from "@/components/layout/SunBlindsLogo";
import { company } from "@/data/company";
import type { Solution } from "@/lib/cms/types";
import { Container } from "@/components/ui/Container";

const COMPANY_LINKS = [
  { href: "/o-nas", label: "O nás" },
  { href: "/showroom", label: "Showroom" },
  { href: "/servis", label: "Servis" },
  { href: "/recenze", label: "Recenze" },
  { href: "/poptavka", label: "Poptávka" },
  { href: "/kontakt", label: "Kontakt" },
];

export function SiteFooter({ solutions }: { solutions: Solution[] }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="site-footer">
      <Container className="site-footer__main" width="wide">
        <div className="site-footer__brand">
          <SunBlindsLogo variant="full" />
          <p className="site-footer__tagline">{company.tagline}</p>
          <div className="site-footer__social">
            <a href={company.social.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer">
              Mapa showroomu
            </a>
            <a href={company.phoneHref}>{company.phone}</a>
          </div>
        </div>

        <div>
          <p className="site-footer__kicker">Řešení</p>
          <ul className="site-footer__list">
            {solutions.map((s) => (
              <li key={s.slug}>
                <Link href={`/reseni/${s.slug}`}>{s.shortTitle}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="site-footer__kicker">Společnost</p>
          <ul className="site-footer__list">
            {COMPANY_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/ochrana-osobnich-udaju">Ochrana údajů</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="site-footer__kicker">Kontakt</p>
          <ul className="site-footer__list site-footer__list--contact">
            <li>
              <a href={company.phoneHref}>{company.phone}</a>
            </li>
            <li>
              <a href={company.emailHref}>{company.email}</a>
            </li>
            <li>
              {company.address.street}
              <br />
              {company.address.zip} {company.address.city}
            </li>
          </ul>
          <p className="site-footer__hours">{company.hours}</p>
        </div>
      </Container>

      <div className="site-footer__bar">
        <Container className="site-footer__bar-inner" width="wide">
          <span>
            © {new Date().getFullYear()} {company.legalName}
          </span>
          <div className="site-footer__credit">
            <span>Web realizace</span>
            <MesconLogo />
          </div>
          <span>Všechna práva vyhrazena</span>
        </Container>
      </div>
    </footer>
  );
}
