/** Dočasný landing místo podstránek — zapněte: NEXT_PUBLIC_SUBPAGES_LANDING=1 */
export const SUBPAGES_LANDING_ONLY =
  process.env.NEXT_PUBLIC_SUBPAGES_LANDING === "1";

export function isSubpageLandingOnly(pathname: string): boolean {
  if (!SUBPAGES_LANDING_ONLY) return false;
  if (pathname === "/") return false;
  if (pathname.startsWith("/admin")) return false;
  return true;
}
