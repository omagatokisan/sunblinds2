# SunBlinds — web

Moderní prezentační web (Next.js 15, React 19, Tailwind 4) pro stínění, okna a servis — homepage, katalog produktů, formuláře a volitelná admin CMS.

## Rychlý start (lokálně)

```bash
git clone https://github.com/omagatokisan/sunblinds.git
cd sunblinds
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000).

> **Poznámka:** Ve výchozím stavu zobrazují podstránky (kromě homepage) landing „Aktualizace v přípravě“. Pro plný obsah nastavte `NEXT_PUBLIC_SUBPAGES_CONTENT=1` v `.env.local`.

## Nasazení na Coolify (Docker Compose)

Soubor `docker-compose.yaml` je v kořeni repozitáře — Coolify ho hledá na cestě `/docker-compose.yaml`.

### Nastavení v Coolify

| Pole | Hodnota |
|------|---------|
| Build Pack | **Docker Compose** |
| Base Directory | `/` |
| Docker Compose Location | `/docker-compose.yaml` |
| Branch | `main` |

### Environment Variables (povinné)

| Proměnná | Popis |
|----------|--------|
| `SESSION_SECRET` | Náhodný řetězec min. 32 znaků |
| `ADMIN_PASSWORD` | Heslo admina (min. 10 znaků, při prvním startu vytvoří hash) |
| `NEXT_PUBLIC_SITE_URL` | `https://vase-domena.cz` |
| `NEXT_PUBLIC_SUBPAGES_CONTENT` | `1` — zobrazí plné podstránky místo landing stránky |

### Po deployi

1. Otevřete web na přiřazené doméně.
2. Admin: `/admin/login`
3. Pokud admin nejde, zkontrolujte logy — `ADMIN_PASSWORD` musí být nastavené před prvním startem kontejneru.

Lokální test Dockeru:

```bash
docker compose up --build
```

---

## Nasazení na běžný webhosting (FTP / Apache)

Bez Node.js na serveru — statický export + PHP formuláře.

```bash
npm run build:ftp
```

Vytvoří ZIP v `Desktop/web/` (nebo upravte cestu ve skriptu). Obsah ZIP nahrajte do kořene webhostingu.

1. Upravte [`deploy/site.config.json`](deploy/site.config.json) — doména a e-maily.
2. Spusťte `npm run build:ftp`.
3. Nahrajte obsah ZIP na FTP (v kořeni musí být `index.html` a `.htaccess`).
4. Upravte `api/config.php` na serveru podle potřeby.

Podrobný návod: [`deploy/NAVOD-WEBGLOBE.md`](deploy/NAVOD-WEBGLOBE.md)

> Admin `/admin` na čistém FTP nefunguje (vyžaduje Node.js). Obsah upravujte v `data/cms/content.json` a znovu sestavte export.

## Nasazení na Node.js server

```bash
npm run build
npm run start
```

Nastavte `SESSION_SECRET` a spusťte jednorázově `npm run admin:init` pro CMS přihlášení.

## Stránky

| Cesta | Popis |
|-------|--------|
| `/` | Homepage (plný obsah) |
| `/reseni` | Přehled kategorií |
| `/reseni/[kategorie]/…` | Produkty |
| `/poptavka`, `/kontakt`, `/showroom`, `/servis` | Kontaktní stránky |
| `/admin/login` | CMS (jen Node.js režim) |

## Administrace

1. Zkopírujte `.env.example` → `.env.local`
2. Nastavte `SESSION_SECRET` (min. 32 znaků) a `ADMIN_PASSWORD`
3. Spusťte: `npm run admin:init`

Heslo se ukládá jen jako bcrypt hash do `data/cms/.admin-hash` (v `.gitignore`).

## Obsah

Editovatelný JSON: `data/cms/content.json`

## Sdílení na GitHub (veřejné repo)

Repozitář **nesmí** obsahovat `.env.local`, admin hash ani hesla. Ty jsou v `.gitignore`.

### 1. Vytvořte repo na GitHubu

1. Přihlaste se na [https://github.com](https://github.com)
2. **New repository** → název např. `sunblinds`
3. Zvolte **Public**
4. **Nezaškrtávejte** „Add a README“ (už existuje lokálně)
5. Klikněte **Create repository**

### 2. Nahrajte kód (HTTPS)

V PowerShellu v kořeni projektu:

```powershell
cd "C:\Users\Ludvík Remešek\Desktop\sun\sunblinds"

git init
git add .
git status
git commit -m "Initial commit: SunBlinds web"

git branch -M main
git remote add origin https://github.com/VASE-USERNAME/sunblinds.git
git push -u origin main
```

`VASE-USERNAME` nahraďte svým GitHub účtem.

Při `git push` GitHub požádá o přihlášení — použijte **Personal Access Token** místo hesla ([návod GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)).

### 3. Veřejný HTTPS odkaz

Po pushi bude repo dostupné na:

```text
https://github.com/VASE-USERNAME/sunblinds
```

Klonování:

```text
https://github.com/VASE-USERNAME/sunblinds.git
```

## Licence

Kód je určen pro projekt SunBlinds. Před použitím u jiných klientů upravte obsah, loga a kontaktní údaje.
