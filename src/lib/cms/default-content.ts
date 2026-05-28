import catalogJson from "./catalog.generated.json";
import { SAMPLE_REVIEWS } from "./sample-reviews";
import type { ProductGroup, SiteContent, Solution } from "./types";
import { newId } from "./types";

const catalog = catalogJson as { slug: string; productGroups: ProductGroup[] }[];

const solutionMeta: Record<
  string,
  Omit<Solution, "productGroups" | "textBlocks"> & { heroImage: string }
> = {
  "venkovni-stineni": {
    slug: "venkovni-stineni",
    title: "Venkovní stínění",
    shortTitle: "Venkovní",
    summary: "Žaluzie, rolety a screeny pro kontrolu světla, tepla a soukromí.",
    heroImage: "https://sunblinds.cz/images/produkt/small/1684261049.jpg",
    intro:
      "Venkovní stínění chrání interiér před přehříváním, zvyšuje soukromí a dotváří architekturu domu.",
    benefits: [
      "Nižší tepelná zátěž v létě",
      "Sladění s barvou fasády",
      "Ruční i motorické ovládání",
      "Zaměření a servis z jedné dílny",
    ],
    idealFor: ["Rodinné domy", "Novostavby", "Rekonstrukce"],
    mosaicLayout: "featured",
  },
  "interierove-stineni": {
    slug: "interierove-stineni",
    title: "Interiérové stínění",
    shortTitle: "Interiér",
    summary: "Žaluzie, roletky a plisé pro pohodlí, soukromí a atmosféru místnosti.",
    heroImage: "https://sunblinds.cz/images/slider_2/slide2/textilni_roletky.webp",
    intro:
      "Interiérové stínění sladíme s interiérem — typ, látku i ovládání volíme podle místnosti.",
    benefits: ["Široký výběr látek", "Řešení den / noc", "Montáž do rámu i nad otvor", "Ukázky ve showroomu"],
    idealFor: ["Byty", "Rodinné domy", "Kanceláře"],
    mosaicLayout: "default",
  },
  "stineni-teras": {
    slug: "stineni-teras",
    title: "Stínění teras",
    shortTitle: "Terasy",
    summary: "Pergoly a markýzy pro pohodlnější venkovní život.",
    heroImage: "https://sunblinds.cz/images/slider_2/slide3/hlinikove_pergoly.webp",
    intro: "Navrhujeme stínění teras podle orientace, větru a způsobu využití prostoru.",
    benefits: ["Návrh podle orientace", "Boční stínění", "Sladění s domem", "Konzultace na místě"],
    idealFor: ["Zahrady", "Balkony", "Komerční terasy"],
  },
  "okna-a-dvere": {
    slug: "okna-a-dvere",
    title: "Okna a dveře",
    shortTitle: "Okna",
    summary: "Výplně otvorů sladěné s domem, stíněním a technickými požadavky.",
    heroImage: "https://sunblinds.cz/images/slider_2/slide4/okna-a-dvere-okna.webp",
    intro: "Okna a dveře řešíme včas — ovlivňují komfort, fasádu i budoucí montáž stínění.",
    benefits: ["Výběr profilu", "Barevné sladění", "Návaznost na stínění", "Zaměření"],
    idealFor: ["Novostavby", "Rekonstrukce"],
  },
  "site-proti-hmyzu": {
    slug: "site-proti-hmyzu",
    title: "Sítě proti hmyzu",
    shortTitle: "Sítě",
    summary: "Rámové, plisé a rolovací sítě pro okna i dveře.",
    heroImage: "https://sunblinds.cz/images/produkt/small/1684261049.jpg",
    intro: "Sítě umožní větrat bez kompromisů — pro okna, dveře i posuvné systémy.",
    benefits: ["Pevné i snímatelné", "Posuvné portály", "Sladění profilů", "Servis"],
    idealFor: ["Rodinné domy", "Chaty"],
  },
  "samonosne-systemy": {
    slug: "samonosne-systemy",
    title: "Samonosné systémy",
    shortTitle: "Samonosné",
    summary: "Venkovní stínění bez stavební přípravy v překladu.",
    heroImage: "https://sunblinds.cz/images/slider_1/big/rovo_2.png",
    intro: "Ideální pro dodatečnou montáž kvalitního venkovního stínění.",
    benefits: ["Montáž na fasádu", "Dodatečná instalace", "Motorizace", "Jednotný vzhled"],
    idealFor: ["Rekonstrukce", "Rodinné domy"],
  },
  "garazova-vrata": {
    slug: "garazova-vrata",
    title: "Garážová vrata",
    shortTitle: "Garáž",
    summary: "Sekční a rolovací vrata pro spolehlivý každodenní provoz.",
    heroImage: "https://sunblinds.cz/images/produkt/small/1684088668.jpg",
    intro: "Garážová vrata navrhujeme podle dispozice garáže a stylu domu.",
    benefits: ["Sekční i rolovací", "Tichý pohon", "Bezpečnost", "Servis"],
    idealFor: ["Rodinné domy", "Dvojgaráže"],
  },
};

function buildSolutions(): Solution[] {
  return catalog.map((entry) => {
    const meta = solutionMeta[entry.slug];
    if (!meta) throw new Error(`Missing meta for ${entry.slug}`);
    return {
      ...meta,
      textBlocks: [],
      productGroups: entry.productGroups,
    };
  });
}

export const defaultContent: SiteContent = {
  version: 3,
  reviewsEnabled: true,
  gdprConsent: {
    textBeforeLink: "Odesláním formuláře souhlasím se zpracováním osobních údajů za účelem vyřízení poptávky. Podrobnosti naleznete v dokumentu",
    linkLabel: "Zásady zpracování osobních údajů",
    linkHref: "/ochrana-osobnich-udaju",
  },
  showroom: {
    title: "Showroom Praha – Libuš",
    intro:
      "Na místě si porovnáte látky, profily a ukázky systémů. Návštěvu doporučujeme domluvit předem — poradíme efektivněji.",
    heroImage: "https://sunblinds.cz/images/slider_2/slide2/textilni_roletky.webp",
    addressLine1: "Libušská 313/104",
    addressLine2: "142 00 Praha-Libuš",
    hours: "Po–Pá 9:00–17:00 (doporučujeme předchozí domluvu)",
    phone: "+420 777 878 130",
    email: "info@sunblinds.cz",
    lat: 49.997269,
    lng: 14.468276,
    highlights: [
      { id: newId("hl"), title: "Vzorky látek", text: "Interiérové stínění — barvy a propustnost naživo." },
      { id: newId("hl"), title: "Profily oken", text: "Ukázky výplní otvorů a sladění s fasádou." },
      { id: newId("hl"), title: "Venkovní systémy", text: "Porovnání žaluzií, rolet a screenů." },
      { id: newId("hl"), title: "Konzultace projektu", text: "Návaznost stínění, oken a servisu v jednom." },
    ],
    textBlocks: [],
  },
  privacy: {
    title: "Zásady zpracování osobních údajů",
    intro:
      "Společnost sunblinds s.r.o. zpracovává osobní údaje v souladu s nařízením GDPR a platnými právními předpisy České republiky.",
    updatedLabel: "Poslední aktualizace: květen 2026",
    sections: [
      {
        id: newId("priv"),
        title: "Správce údajů",
        content:
          "Správcem je sunblinds s.r.o., Libušská 313/104, 142 00 Praha-Libuš, IČ a kontaktní údaje uvedené na webu.",
      },
      {
        id: newId("priv"),
        title: "Účel zpracování",
        content:
          "Údaje z poptávkových a kontaktních formulářů zpracováváme za účelem odpovědi na dotaz, přípravy nabídky, domluvy schůzky a plnění smlouvy.",
      },
      {
        id: newId("priv"),
        title: "Doba uchování",
        content:
          "Údaje uchováváme po dobu nezbytnou k vyřízení poptávky a dále po dobu trvání smluvního vztahu a zákonných archivačních lhůt.",
      },
      {
        id: newId("priv"),
        title: "Vaše práva",
        content:
          "Máte právo na přístup, opravu, výmaz, omezení zpracování, námitku a stížnost u ÚOOÚ. Kontakt: info@sunblinds.cz.",
      },
    ],
  },
  inquiryOptions: {
    mountingTypes: [
      "Do okenního rámu",
      "Nad okenní otvor",
      "Do stropu / na stěnu",
      "Do fasády / překladu",
      "Neznám / poradit",
    ],
    controlTypes: ["Ruční", "Motorické", "Smart / automatika", "Neznám / poradit"],
    locationTypes: ["Obývací pokoj", "Ložnice", "Kuchyně", "Koupelna", "Kancelář", "Terasa / exteriér", "Jiné"],
  },
  home: {
    heroTitle: "Stínění a okna — zaměření, montáž i servis z Libuše",
    heroLead:
      "Venkovní i interiérové stínění, výplně otvorů a garážová vrata. Poradíme na místě nebo v showroomu, připravíme nabídku a realizaci zajistí náš tým.",
    solutionsTitle: "Vyberte oblast, kterou řešíte",
    solutionsDescription:
      "Každá kategorie vede na konkrétní produkty s parametry montáže. Nevíte, kam zařadit váš požadavek? Zavolejte — upřesníme to za pár minut.",
    whyTitle: "Proč řešit stínění u nás",
    responseTime: "V pracovní dny voláme zpět do 24 hodin.",
  },
  contact: {
    heroTitle: "Jsme tu pro vás — osobně i na dálku",
    heroLead:
      "Preferujeme předchozí domluvu návštěvy showroomu. Pro rychlou odpověď využijte telefon, formulář nebo nezávaznou poptávku.",
    formTitle: "Napište nám",
    formLead: "Odpovíme co nejdříve v pracovní dny. Pro konkrétní produkt využijte také poptávkový formulář.",
  },
  aboutPage: {
    heroLead:
      "Od první konzultace v Libuši po montáž a servis — jeden tým pro stínění, okna, sítě a garážová vrata v Praze a okolí.",
    introTitle: "Specialisté na stínění — ne jen prodej boxů",
    introLead: "SunBlinds stojí na praxi z terénu: zaměření, návrh montáže, dodávka a následná péče.",
    introBody:
      "Pomáháme majitelům rodinných domů, developérům i firmám vybrat systém podle orientace oken, typu fasády a způsobu používání místností. Nejvíc zkušeností máme se samonosnými venkovními systémy Rovo, Zivo a Rafe — montují se na fasádu bez stavební přípravy v překladu. Stejný tým řeší interiérové stínění, výplně otvorů, sítě proti hmyzu i garážová vrata.",
    storyTitle: "Proč spolupracovat právě s námi",
    storyBody:
      "Nabídku nestavíme z obecného ceníku — vychází z rozměrů, přístupu k fasádě a z toho, jak chcete stínění ovládat. Ve showroomu v Libuši porovnáte látky, barvy RAL a ukázky profilů. Po montáži zůstáváme dostupní pro seřízení, výměnu dílů nebo modernizaci motorického ovládání. Servis zvládneme i u techniky dodané jinde, pokud to typ systému dovolí.",
    stats: [
      { id: newId("stat"), value: "7", label: "oblastí řešení v katalogu" },
      { id: newId("stat"), value: "Libuš", label: "showroom u Prahy" },
      { id: newId("stat"), value: "24 h", label: "zpětné volání v pracovní dny" },
      { id: newId("stat"), value: "1 tým", label: "od zaměření po servis" },
    ],
    scopeTitle: "Co u nás vyřešíte",
    scopeLead:
      "Každá oblast vede na konkrétní produkty s parametry montáže — od samonosných systémů po garážová vrata.",
    showroomTitle: "Showroom v Praze-Libuši — rozhodnutí na místě",
    showroomBody:
      "Vzorky látek, profily oken a ukázky venkovních systémů. Návštěvu si domluvte předem — připravíme podklady podle vašeho projektu a typu stavby.",
    servisTitle: "Servis, který navazuje na montáž",
    servisBody:
      "Seřízení žaluzií a rolet, výměna látek, opravy pohonů i garážových vrat. Po nahlášení projdeme rozsah, domluvíme termín výjezdu a na místě doladíme detaily.",
  },
  servisPage: {
    heroTitle: "Servis a následná péče",
    heroLead:
      "Profesionální záruční i pozáruční servis pro stínící techniku, okna, dveře, garážová vrata a pergoly.",
    intro:
      "Naše služby servisu zahrnují opravy, údržbu i modernizaci různých systémů, čímž prodlužujeme jejich životnost a zajišťujeme bezproblémový provoz. Ať už potřebujete rychlou opravu závady, pravidelnou údržbu nebo vylepšení stávajícího systému, jsme tu pro vás.",
    servicedTags: ["Stínící technika", "Okna a dveře", "Pergoly", "Garážová vrata"],
    categories: [
      {
        id: newId("sc"),
        title: "Servis stínící techniky",
        shortText: "Opravy a údržba venkovních i vnitřních žaluzií, rolet, markýz a screenových rolet.",
        longText:
          "Nejčastěji řešíme výměnu poškozených lamel, opravu ovládacích mechanismů, seřízení pohonů či výměnu motorů u elektrických systémů. Pravidelný servis zajistí hladký chod a dlouhou životnost vaší stínící techniky.",
        icon: "shading",
      },
      {
        id: newId("sc"),
        title: "Servis oken a dveří",
        shortText: "Seřízení oken a dveří, výměna těsnění, opravy kování a klik.",
        longText:
          "Pokud vaše okna či dveře špatně těsní nebo drhnou při otevírání, zajistíme jejich správné nastavení, aby opět fungovaly jako nové. Servisem prodloužíme jejich životnost a zlepšíme tepelnou i zvukovou izolaci.",
        icon: "windows",
      },
      {
        id: newId("sc"),
        title: "Servis pergol",
        shortText: "Kompletní servis hliníkových i dřevěných pergol, markýz a bočního stínění.",
        longText:
          "Zajišťujeme výměny poškozených lamel, opravy motorických prvků a seřízení posuvných střech. Dále nabízíme servis markýz a bočního stínění, které mohou časem ztrácet napnutí nebo mít problémy s ovládáním.",
        icon: "pergola",
      },
      {
        id: newId("sc"),
        title: "Servis garážových vrat",
        shortText: "Seřízení pružin, výměna koleček, opravy pohonů a celková revize.",
        longText:
          "Garážová vrata vyžadují pravidelnou údržbu pro zajištění bezpečnosti a spolehlivého provozu. Pokud vaše vrata drhnou, vydávají neobvyklé zvuky nebo se špatně zavírají, neváhejte nás kontaktovat.",
        icon: "garage",
      },
    ],
    pricingTitle: "Ceník servisních prací oken a dveří",
    pricingNote:
      "Ostatní práce budou kalkulovány dle skutečného rozsahu prací a na základě předchozí domluvy. Ceny jsou orientační bez DPH.",
    pricingRows: [
      { id: newId("pr"), service: "Pohotovostní výjezd (Praha a okolí do 20 km, v den nahlášení)", price: "2 400 Kč" },
      { id: newId("pr"), service: "Detekce závady (zjištění příčiny pro objednání dílů)", price: "960 Kč" },
      { id: newId("pr"), service: "Výměna těsnění u oken, dveří apod.", price: "140 Kč / 1 bm" },
      { id: newId("pr"), service: "Opravy vnitřních žaluzií dle rozsahu prací", price: "180 – 600 Kč" },
      { id: newId("pr"), service: "Ošetření těsnící gumy nanosilikonem", price: "24 Kč / 1 bm" },
      { id: newId("pr"), service: "Výjezd mimo perimetr (Praha + 20 km)", price: "8 Kč / km", note: "Za každý km nad rámec perimetru" },
    ],
  },
  reviews: SAMPLE_REVIEWS,
  departments: [
    {
      id: "servis",
      label: "Servisní linka",
      phone: "+420 777 878 131",
      hours: "Po–Pá 8:00–16:30",
      hint: "Opravy, seřízení a záruční servis nainstalovaných systémů.",
    },
    {
      id: "obchod",
      label: "Obchodní oddělení",
      phone: "+420 777 878 130",
      hours: "Po–Pá 9:00–17:00",
      hint: "Poptávky, konzultace a obecné dotazy k nabídce.",
    },
    {
      id: "showroom",
      label: "Showroom Praha – Libuš",
      phone: "+420 777 878 132",
      hours: "Po–Pá 9:00–17:00 (po domluvě)",
      hint: "Návštěva showroomu a výběr materiálů na místě.",
    },
    {
      id: "venkovni",
      label: "Venkovní stínění",
      phone: "+420 777 878 133",
      hours: "Po–Pá 9:00–17:00",
      hint: "Žaluzie, rolety, screeny a parapetní systémy.",
    },
    {
      id: "interier",
      label: "Interiérové stínění",
      phone: "+420 777 878 134",
      hours: "Po–Pá 9:00–17:00",
      hint: "Vnitřní žaluzie, roletky, plisé a vertikální systémy.",
    },
  ],
  technicians: [
    {
      id: "horak",
      name: "Martin Horák",
      role: "Vedoucí servisu",
      photo: "/images/technicians/martin-horak.png",
      shortBio: "15 let praxe se stíněním a motorickými systémy.",
      fullBio:
        "Martin koordinuje servisní tým a specializuje se na diagnostiku motorických žaluzií a screenů.",
    },
    {
      id: "novakova",
      name: "Petra Nováková",
      role: "Servisní technik – interiér",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      shortBio: "Textilní roletky, plisé a látkové žaluzie.",
      fullBio: "Petra řeší seřízení interiérových systémů a výměnu látek.",
    },
    {
      id: "svoboda",
      name: "Jan Svoboda",
      role: "Servisní technik – venkovní systémy",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
      shortBio: "Venkovní žaluzie, rolety a garážová vrata.",
      fullBio: "Jan je v terénu u rodinných domů a větších objektů.",
    },
    {
      id: "kralova",
      name: "Eva Králová",
      role: "Koordinace servisních zakázek",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      shortBio: "Plánování výjezdů a komunikace se zákazníky.",
      fullBio: "Eva je první kontakt pro servisní požadavky.",
    },
  ],
  servisBlocks: [
    { id: newId("sb"), title: "Seřízení a opravy stínění", text: "Žaluzie, rolety, screeny — mechanické i motorické systémy." },
    { id: newId("sb"), title: "Výměna látek a dílů", text: "Obnova textilních rolet a plisé podle aktuální nabídky." },
    { id: newId("sb"), title: "Sítě proti hmyzu", text: "Výměna sítoviny, oprava rámů a posuvných systémů." },
    { id: newId("sb"), title: "Garážová vrata", text: "Seřízení, opravy pohonu a bezpečnostních prvků." },
  ],
  solutions: buildSolutions(),
  processSteps: [
    {
      id: newId("ps"),
      step: "01",
      title: "Hovor nebo návštěva",
      text: "Projdeme typ stavby, rozměry a představu. Doporučíme, zda stačí showroom nebo je potřeba zaměření.",
    },
    {
      id: newId("ps"),
      step: "02",
      title: "Zaměření",
      text: "Technik ověří stav otvorů, fasády a možnosti vedení kabeláže.",
    },
    {
      id: newId("ps"),
      step: "03",
      title: "Nabídka",
      text: "Do týdne obvykle dodáme cenovou nabídku s typem montáže, barvou a ovládáním.",
    },
    {
      id: newId("ps"),
      step: "04",
      title: "Montáž a servis",
      text: "Realizaci domluvíme v termínu. Po instalaci zůstáváme k dispozici pro seřízení a opravy.",
    },
  ],
  pillars: [
    {
      id: newId("pl"),
      title: "Samonosné systémy a kompletní realizace",
      text: "Od zaměření po montáž a servis — jeden tým, jedna odpovědnost.",
    },
    {
      id: newId("pl"),
      title: "Showroom v Praze-Libuši",
      text: "Látky, profily a systémy si porovnáte naživo před objednávkou.",
    },
    {
      id: newId("pl"),
      title: "Servis po montáži",
      text: "Seřízení, opravy a modernizace — i u techniky, kterou jsme dodali jinde, po posouzení.",
    },
  ],
  faq: [
    {
      id: newId("faq"),
      question: "Musím nejdřív přijet do showroomu?",
      answer:
        "Ne. U jednoduchých dotazů stačí telefon. Showroom doporučujeme, když vybíráte látky, barvy nebo porovnáváte více systémů najednou.",
    },
    {
      id: newId("faq"),
      question: "Jak rychle dostanu nabídku?",
      answer:
        "Po zaměření obvykle do pěti pracovních dnů. U menších zakázek, kde stačí rozměry z projektu, může být orientační cena i dříve.",
    },
    {
      id: newId("faq"),
      question: "Montujete i na starší dům bez přípravy v překladu?",
      answer:
        "Ano — samonosné systémy Rovo, Zivo a Rafe montujeme na fasádu bez stavební úpravy ostění. Vhodnost ověříme při zaměření.",
    },
  ],
  references: [
    {
      id: newId("ref"),
      title: "Rekonstrukce rodinného domu",
      location: "Praha-západ",
      scope: "Samonosné rolety Rovo, 12 oken",
      text: "Fasáda bez přípravy v překladu — boxy na omítce, barva RAL podle omítky. Montáž proběhla za tři dny.",
      image: "/images/references/ref-01.png",
    },
    {
      id: newId("ref"),
      title: "Novostavba s celkovým stíněním",
      location: "Středočeský kraj",
      scope: "Rafe + Zivo, 18 oken",
      text: "Kombinace venkovních žaluzií a screenů podle orientace fasády. U jižní strany screeny, u východní a západní plná žaluzie.",
      image: "/images/references/ref-02.png",
    },
    {
      id: newId("ref"),
      title: "Rodinný dům — interiér",
      location: "Praha-východ",
      scope: "Textilní a screenové rolety",
      text: "Stínění obývacího pokoje a ložnic včetně zatemnění v dětských pokojích. Látky vybrané ve showroomu podle vzorků.",
      image: "/images/references/ref-04.png",
    },
    {
      id: newId("ref"),
      title: "Bytový dům — společné prostory",
      location: "Praha 4",
      scope: "Screenové rolety, 24 oken",
      text: "Jednotný vzhled fasády pro SVJ — stejná barva profilů, motorické ovládání v společných částech a manuál v bytech.",
      image: "/images/references/ref-03.png",
    },
    {
      id: newId("ref"),
      title: "Stínění terasy u rodinného domu",
      location: "Středočeský kraj",
      scope: "Hliníková pergola + screen",
      text: "Krytá terasa s posuvným stíněním pro letní provoz. Propojení s venkovními rolety na oknech obývacího pokoje.",
      image: "/images/references/ref-06.png",
    },
    {
      id: newId("ref"),
      title: "Developer — etapa rodinných domů",
      location: "Středočeský kraj",
      scope: "Okna, dveře a venkovní stínění",
      text: "Kompletní výplně oken a dveří včetně venkovních rolet pro 14 domů. Koordinace montáží s fasádou a termíny výstavby.",
      image: "/images/references/ref-05.png",
    },
  ],
};
