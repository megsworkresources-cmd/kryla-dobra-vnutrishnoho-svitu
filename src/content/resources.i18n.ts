/**
 * Ukrainian Family Resource Center data. Bilingual by design (each entry carries
 * its own Ukrainian and English text), so it lives in an `.i18n.` file the
 * dictionary test treats as translation source. Never invent contacts: unknown
 * values stay `undefined` and render as "Не підтверджено / Not confirmed".
 */
export type Bi = { uk: string; en: string };
export const VERIFIED_ON = "2026-11-20";

export const CATEGORIES = {
  kids: { uk: "Ментальне здоров’я дітей", en: "Children’s mental health" },
  teens: { uk: "Підтримка підлітків", en: "Youth support" },
  protection: { uk: "Захист і безпека дітей", en: "Child protection & safety" },
  parenting: { uk: "Батьківство і стосунки в родині", en: "Parenting & family relationships" },
  education: { uk: "Освіта й онлайн-навчання", en: "Education & online learning" },
  early: { uk: "Розвиток малюків", en: "Early childhood development" },
  sel: {
    uk: "Емоції та соціальні навички",
    en: "Emotional regulation & social-emotional learning",
  },
  grief: { uk: "Травма, горе і втрата", en: "Trauma, grief & bereavement" },
  violence: {
    uk: "Булінг, насильство і їх запобігання",
    en: "Bullying, abuse & violence prevention",
  },
  neuro: { uk: "Нейрорізноманіття і розвиток", en: "Neurodiversity & developmental support" },
  sen: {
    uk: "Особливі освітні потреби та інвалідність",
    en: "Special educational needs & disabilities",
  },
  abroad: { uk: "Українські родини за кордоном", en: "Ukrainian families abroad" },
  displaced: {
    uk: "Переміщення, біженці, гуманітарна допомога",
    en: "Displacement, refugee & humanitarian support",
  },
  legal: { uk: "Правова допомога і права дитини", en: "Family legal help & children’s rights" },
  health: { uk: "Медицина і здоров’я", en: "Medical & healthcare" },
  youth: { uk: "Молодь і життєві навички", en: "Youth empowerment & life skills" },
  culture: {
    uk: "Українська мова, культура і громада",
    en: "Ukrainian language, culture & community",
  },
  crisis: { uk: "Екстрена і кризова допомога", en: "Emergency & crisis support" },
} satisfies Record<string, Bi>;
export type Category = keyof typeof CATEGORIES;

export const AGES = {
  a0: { uk: "0–3 роки", en: "0–3 years" },
  a4: { uk: "4–6 років", en: "4–6 years" },
  a7: { uk: "7–12 років", en: "7–12 years" },
  a13: { uk: "13–17 років", en: "13–17 years" },
  a18: { uk: "18–24 роки", en: "18–24 years" },
  parents: { uk: "Батьки й опікуни", en: "Parents & caregivers" },
  pros: { uk: "Фахівці й педагоги", en: "Professionals & educators" },
} satisfies Record<string, Bi>;
export type Age = keyof typeof AGES;

export const REGIONS = {
  ua: { uk: "Україна", en: "Ukraine" },
  online: { uk: "Онлайн, міжнародно", en: "Online, international" },
  us: { uk: "США", en: "United States" },
  eu: { uk: "Європейський Союз", en: "European Union" },
  pl: { uk: "Польща", en: "Poland" },
  de: { uk: "Німеччина", en: "Germany" },
  uk: { uk: "Велика Британія", en: "United Kingdom" },
  ca: { uk: "Канада", en: "Canada" },
  other: { uk: "Інші країни", en: "Other countries" },
} satisfies Record<string, Bi>;
export type Region = keyof typeof REGIONS;

export const SERVICES = {
  free: { uk: "Безкоштовно", en: "Free" },
  paid: { uk: "Платно", en: "Paid" },
  funded: { uk: "Залежить від фінансування", en: "Funding-dependent" },
  online: { uk: "Онлайн", en: "Online" },
  inperson: { uk: "Очно", en: "In person" },
  hotline: { uk: "Гаряча лінія", en: "Hotline" },
  individual: { uk: "Індивідуальна консультація", en: "Individual consultation" },
  group: { uk: "Групова підтримка", en: "Group support" },
  learn: { uk: "Освітні матеріали", en: "Educational resources" },
  legal: { uk: "Правова допомога", en: "Legal assistance" },
  emergency: { uk: "Екстрена допомога", en: "Emergency assistance" },
} satisfies Record<string, Bi>;
export type Service = keyof typeof SERVICES;

export interface Contact {
  label: Bi;
  tel?: string;
  note?: Bi;
}
export interface Resource {
  id: string;
  name: Bi;
  desc: Bi;
  url: string;
  cats: Category[];
  ages: Age[];
  regions: Region[];
  services: Service[];
  langs: Array<"uk" | "en" | "de" | "ru">;
  /** Cost is only stated when the organisation publishes it. */
  cost?: "free" | "paid" | "funded";
  contacts?: Contact[];
  /** "ok": site opened in our check; "blocked": official site refused automated checks. */
  check: "ok" | "blocked";
  /** Peer support / information only, not professional care. */
  kind: "professional" | "peer" | "info" | "government";
}

const UA: Region[] = ["ua"];
const b = (uk: string, en: string): Bi => ({ uk, en });

export const RESOURCES: Resource[] = [
  {
    id: "voices",
    name: b("Голоси дітей", "Voices of Children"),
    url: "https://voices.org.ua/en",
    desc: b(
      "Благодійний фонд: психологічна й психосоціальна підтримка дітей і родин, яких торкнулася війна — індивідуально, онлайн і в регіональних центрах, також для батьків.",
      "Charitable foundation offering psychological and psychosocial support to war-affected children and families — individually, online and in regional centres, including support for parents.",
    ),
    cats: ["kids", "grief", "parenting", "crisis"],
    ages: ["a4", "a7", "a13", "parents"],
    regions: UA,
    services: ["hotline", "online", "inperson", "individual", "group"],
    langs: ["uk"],
    check: "ok",
    kind: "professional",
    contacts: [
      {
        label: b("Гаряча лінія", "Helpline"),
        tel: "0800210106",
        note: b("09:00–20:00, лише в Україні", "09:00–20:00, within Ukraine only"),
      },
    ],
  },
  {
    id: "unicef-ua",
    name: b("ЮНІСЕФ Україна", "UNICEF Ukraine"),
    url: "https://www.unicef.org/ukraine/en",
    desc: b(
      "Освіта, захист, здоров’я і психосоціальна підтримка дітей; поради для батьків і підтримка переміщених родин.",
      "Education, protection, health and psychosocial support for children; parenting advice and help for displaced families.",
    ),
    cats: ["parenting", "kids", "protection", "displaced", "early"],
    ages: ["a0", "a4", "a7", "a13", "parents"],
    regions: ["ua", "online"],
    services: ["learn", "inperson"],
    langs: ["uk", "en"],
    check: "ok",
    kind: "info",
  },
  {
    id: "unicef-hub",
    name: b("Простір для батьків ЮНІСЕФ", "UNICEF Parenting Hub"),
    url: "https://www.unicef.org/ukraine/en/parenting-hub",
    desc: b(
      "Поради про розвиток дитини, позитивне виховання, межі й спілкування, зокрема в часи стресу.",
      "Guidance on child development, positive parenting, boundaries and communication, including in stressful times.",
    ),
    cats: ["parenting", "early", "sel"],
    ages: ["parents"],
    regions: ["ua", "online"],
    services: ["learn", "online"],
    langs: ["uk", "en"],
    check: "ok",
    kind: "info",
  },
  {
    id: "unicef-war",
    name: b(
      "ЮНІСЕФ: підтримка дітей і батьків під час війни",
      "UNICEF: supporting parents and children during war",
    ),
    url: "https://www.unicef.org/ukraine/en/parents-children-support-during-war",
    desc: b(
      "Матеріали про те, як підтримати дитину й себе під час війни.",
      "Materials on supporting your child and yourself during war.",
    ),
    cats: ["grief", "parenting", "kids"],
    ages: ["parents"],
    regions: ["ua", "online"],
    services: ["learn", "online"],
    langs: ["uk", "en"],
    check: "ok",
    kind: "info",
  },
  {
    id: "spilno",
    name: b("Дитячі простори «Спільно» (ЮНІСЕФ)", "UNICEF Child Spaces (Spilno)"),
    url: "https://www.unicef.org/ukraine/en/child-spaces",
    desc: b(
      "Безпечні простори з творчими заняттями, іграми та психосоціальною підтримкою; інформація про найближчі центри.",
      "Safe spaces with creative activities, games and psychosocial support; information about local centres.",
    ),
    cats: ["kids", "early", "sel", "displaced"],
    ages: ["a4", "a7", "a13", "parents"],
    regions: UA,
    services: ["inperson", "group"],
    langs: ["uk"],
    check: "ok",
    kind: "info",
  },
  {
    id: "supportme",
    name: b("SupportME", "SupportME"),
    url: "https://www.supportme.org.ua/",
    desc: b(
      "Платформа для підлітків і батьків: стрес, тривога, стосунки, булінг, здоров’я; консультації фахівців, коли вони доступні; матеріали для підлітків за кордоном.",
      "Platform for teenagers and parents: stress, anxiety, relationships, bullying, health; specialist consultations when available; materials for teens abroad.",
    ),
    cats: ["teens", "violence", "youth", "abroad"],
    ages: ["a13", "a18", "parents"],
    regions: ["ua", "online"],
    services: ["online", "learn", "individual"],
    langs: ["uk"],
    check: "ok",
    kind: "info",
  },
  {
    id: "poruch",
    name: b("ПОРУЧ", "Poruch"),
    url: "https://poruch.me/",
    desc: b(
      "Психосоціальні групи підтримки для підлітків, батьків і фахівців: стійкість і подолання стресу війни.",
      "Psychosocial support groups for teenagers, parents and professionals: resilience and coping with war-related stress.",
    ),
    cats: ["teens", "parenting", "sel"],
    ages: ["a13", "parents", "pros"],
    regions: ["ua", "online"],
    services: ["group", "online"],
    langs: ["uk"],
    check: "ok",
    kind: "peer",
    contacts: [
      {
        label: b("Для підлітків", "For teenagers"),
        note: b("poruch.me/teenagers", "poruch.me/teenagers"),
      },
    ],
  },
  {
    id: "uamh",
    name: b("UA Mental Help", "UA Mental Help"),
    url: "https://www.uamentalhelp.org/en",
    desc: b(
      "Фонд ментального здоров’я: консультації психологів і психіатрів, кризова підтримка, групи, програми для дітей і молоді, онлайн-чат.",
      "Mental health foundation: psychological and psychiatric consultations, crisis support, groups, programmes for children and youth, online chat.",
    ),
    cats: ["kids", "teens", "crisis", "parenting"],
    ages: ["a7", "a13", "a18", "parents"],
    regions: ["ua", "online"],
    services: ["hotline", "online", "individual", "group"],
    langs: ["uk", "en"],
    check: "ok",
    kind: "professional",
    contacts: [
      {
        label: b("Гаряча лінія", "Hotline"),
        tel: "0800331200",
        note: b("щодня 10:00–21:00", "daily 10:00–21:00"),
      },
    ],
  },
  {
    id: "genua",
    name: b("Gen.Ukrainian", "Gen.Ukrainian"),
    url: "https://genukrainian.com.ua/",
    desc: b(
      "Програми психологічного відновлення та терапевтичні табори для дітей, які пережили війну.",
      "Psychological recovery programmes and therapeutic camps for children affected by war.",
    ),
    cats: ["kids", "grief"],
    ages: ["a7", "a13"],
    regions: UA,
    services: ["inperson", "group"],
    langs: ["uk"],
    check: "ok",
    kind: "professional",
  },
  {
    id: "childmind",
    name: b("Child Mind Institute", "Child Mind Institute"),
    url: "https://childmind.org/care/ukraine-mental-health-resources/",
    desc: b(
      "Міжнародна некомерційна організація: матеріали українською про тривогу, травму, депресію та поради для батьків і фахівців.",
      "International nonprofit: Ukrainian-language materials on anxiety, trauma, depression and guidance for caregivers and professionals.",
    ),
    cats: ["kids", "grief", "neuro", "parenting"],
    ages: ["parents", "pros"],
    regions: ["online"],
    services: ["learn", "online"],
    langs: ["uk", "en"],
    check: "blocked",
    kind: "info",
  },
  {
    id: "npa",
    name: b("Національна психологічна асоціація", "National Psychological Association of Ukraine"),
    url: "https://npa-ua.org/",
    desc: b(
      "Професійна асоціація психологів: інформація про психологічну підтримку та освіта з ментального здоров’я.",
      "Professional association: information about psychological support and mental health education.",
    ),
    cats: ["crisis", "kids"],
    ages: ["parents", "pros"],
    regions: UA,
    services: ["hotline", "learn"],
    langs: ["uk"],
    check: "ok",
    kind: "professional",
    contacts: [
      {
        label: b("Лінія підтримки", "Support line"),
        tel: "0800100102",
        note: b("Години роботи не підтверджено", "Hours not confirmed"),
      },
    ],
  },
  {
    id: "teenergizer",
    name: b("Teenergizer", "Teenergizer"),
    url: "https://teenergizer.org/",
    desc: b(
      "Молодіжна ініціатива: консультації психологів, коли доступні, підтримка ровесників, самооцінка, стосунки.",
      "Youth initiative: psychological consultations where available, peer support, self-esteem, relationships.",
    ),
    cats: ["teens", "youth"],
    ages: ["a13", "a18"],
    regions: ["ua", "online"],
    services: ["online", "individual", "group"],
    langs: ["uk", "ru", "en"],
    check: "ok",
    kind: "peer",
  },
  {
    id: "krisenchat",
    name: b("krisenchat", "krisenchat"),
    url: "https://krisenchat.de/",
    desc: b(
      "Цифрове психологічне консультування в чаті для молоді. Доступ українською та умови варто перевірити на сайті.",
      "Digital chat counselling for young people. Check Ukrainian-language access and eligibility on the site.",
    ),
    cats: ["teens", "crisis", "abroad"],
    ages: ["a13", "a18"],
    regions: ["de"],
    services: ["online"],
    langs: ["de"],
    check: "ok",
    kind: "professional",
  },
  {
    id: "lastrada",
    name: b("Ла Страда-Україна", "La Strada Ukraine"),
    url: "https://la-strada.org.ua/en/",
    desc: b(
      "Захист прав дітей, запобігання насильству, торгівлі людьми та булінгу; психологічні й правові консультації.",
      "Protects children’s rights and prevents violence, trafficking and bullying; psychological and legal consultations.",
    ),
    cats: ["protection", "violence", "legal", "crisis"],
    ages: ["a7", "a13", "a18", "parents"],
    regions: UA,
    services: ["hotline", "legal", "individual", "free"],
    langs: ["uk", "en"],
    cost: "free",
    check: "ok",
    kind: "professional",
    contacts: [
      {
        label: b("Лінія для дітей і молоді", "Children’s and youth hotline"),
        tel: "116111",
        note: b("безкоштовно, анонімно, в Україні", "free, anonymous, within Ukraine"),
      },
      { label: b("Лінія для дітей і молоді", "Children’s and youth hotline"), tel: "0800500225" },
      {
        label: b("Насильство і торгівля людьми", "Domestic violence & trafficking"),
        tel: "116123",
      },
      {
        label: b(
          "Насильство і торгівля людьми (інший номер)",
          "Domestic violence & trafficking (alternative number)",
        ),
        tel: "0800500335",
      },
    ],
  },
  {
    id: "childrights",
    name: b("Українська мережа за права дитини", "Ukrainian Child Rights Network"),
    url: "https://childrights.org.ua/",
    desc: b(
      "Мережа організацій: захист дітей, збереження родин, сімейні форми опіки, допомога переміщеним дітям.",
      "Network of organisations: child protection, family preservation, family-based care, help for displaced children.",
    ),
    cats: ["protection", "legal", "displaced"],
    ages: ["parents", "pros"],
    regions: UA,
    services: ["learn"],
    langs: ["uk"],
    check: "ok",
    kind: "info",
  },
  {
    id: "sos",
    name: b("SOS Дитячі містечка Україна", "SOS Children’s Villages Ukraine"),
    url: "https://www.sos-ukraine.org/",
    desc: b(
      "Зміцнення родин, сімейна альтернативна опіка, психосоціальна допомога вразливим родинам.",
      "Family strengthening, family-based alternative care and psychosocial help for vulnerable families.",
    ),
    cats: ["protection", "parenting"],
    ages: ["a0", "a4", "a7", "a13", "parents"],
    regions: UA,
    services: ["inperson"],
    langs: ["uk"],
    check: "ok",
    kind: "professional",
  },
  {
    id: "childrenofwar",
    name: b("Діти війни", "Children of War"),
    url: "https://childrenofwar.gov.ua/",
    desc: b(
      "Офіційний державний портал: зниклі, депортовані й переміщені діти, як повідомити, офіційні контакти.",
      "Official government portal: missing, deported and displaced children, how to report, official contacts.",
    ),
    cats: ["protection", "displaced", "crisis"],
    ages: ["parents"],
    regions: UA,
    services: ["learn"],
    langs: ["uk", "en"],
    check: "ok",
    kind: "government",
  },
  {
    id: "magnolia",
    name: b("Магнолія", "Magnolia"),
    url: "https://magnolia.org.ua/",
    desc: b(
      "Пошук зниклих дітей, захист дітей та інформація для родин.",
      "Help with missing children, child protection and information for families.",
    ),
    cats: ["protection", "crisis"],
    ages: ["parents"],
    regions: UA,
    services: ["emergency"],
    langs: ["uk"],
    check: "ok",
    kind: "info",
  },
  {
    id: "saveukraine",
    name: b("Save Ukraine", "Save Ukraine"),
    url: "https://saveukraine.org/",
    desc: b(
      "Допомога дітям і родинам, яких торкнулася війна: возз’єднання, евакуація, відновлення, психосоціальна підтримка.",
      "Help for war-affected children and families: reunification, evacuation, recovery and psychosocial support.",
    ),
    cats: ["protection", "displaced", "grief"],
    ages: ["parents"],
    regions: UA,
    services: ["inperson"],
    langs: ["uk", "en"],
    check: "ok",
    kind: "info",
  },
  {
    id: "r2p",
    name: b("Право на захист", "Right to Protection"),
    url: "https://r2p.org.ua/",
    desc: b(
      "Правова та гуманітарна допомога, підтримка переміщених осіб, інформація про права і послуги.",
      "Legal and humanitarian help, support for displaced people, information on rights and services.",
    ),
    cats: ["legal", "displaced", "protection"],
    ages: ["parents"],
    regions: UA,
    services: ["legal"],
    langs: ["uk"],
    check: "ok",
    kind: "professional",
  },
  {
    id: "p4ec",
    name: b("Партнерство «Кожній дитині»", "Partnership for Every Child"),
    url: "https://p4ec.org.ua/",
    desc: b(
      "Сімейні форми виховання, зміцнення родин і запобігання розлученню дітей з родиною.",
      "Family-based care, family strengthening and preventing unnecessary family separation.",
    ),
    cats: ["protection", "parenting"],
    ages: ["parents", "pros"],
    regions: UA,
    services: ["learn"],
    langs: ["uk"],
    check: "ok",
    kind: "info",
  },
  {
    id: "eschool",
    name: b("Всеукраїнська школа онлайн", "All-Ukrainian Online School"),
    url: "https://lms.e-school.net.ua/",
    desc: b(
      "Шкільна програма онлайн: відеоуроки, тести, матеріали для дистанційного навчання.",
      "Ukrainian school curriculum online: video lessons, tests and remote learning materials.",
    ),
    cats: ["education", "abroad"],
    ages: ["a7", "a13"],
    regions: ["ua", "online"],
    services: ["online", "learn"],
    langs: ["uk"],
    check: "ok",
    kind: "government",
  },
  {
    id: "numo",
    name: b("НУМО", "NUMO"),
    url: "https://numo.mon.gov.ua/",
    desc: b(
      "Дошкільне навчання: розвивальні ігри, мова і мислення, заняття разом з батьками.",
      "Preschool learning: educational games, language and thinking, parent-guided activities.",
    ),
    cats: ["early", "education"],
    ages: ["a0", "a4", "parents"],
    regions: ["ua", "online"],
    services: ["online", "learn"],
    langs: ["uk"],
    check: "ok",
    kind: "government",
  },
  {
    id: "passport",
    name: b("Learning Passport", "Learning Passport"),
    url: "https://www.learningpassport.org/",
    desc: b(
      "Цифрова освітня платформа за підтримки ЮНІСЕФ для дітей, зокрема переміщених.",
      "UNICEF-supported digital learning platform, including for displaced children.",
    ),
    cats: ["education", "displaced"],
    ages: ["a7", "a13"],
    regions: ["online"],
    services: ["online", "learn"],
    langs: ["en"],
    check: "ok",
    kind: "info",
  },
  {
    id: "learningua",
    name: b("Learning.ua", "Learning.ua"),
    url: "https://learning.ua/",
    desc: b(
      "Інтерактивні вправи з математики, української, читання, англійської та підготовки до школи.",
      "Interactive exercises in maths, Ukrainian, reading, English and school readiness.",
    ),
    cats: ["education", "early"],
    ages: ["a4", "a7"],
    regions: ["online"],
    services: ["online", "learn"],
    langs: ["uk"],
    check: "ok",
    kind: "info",
  },
  {
    id: "ilearn",
    name: b("iLearn", "iLearn"),
    url: "https://ilearn.org.ua/",
    desc: b(
      "Онлайн-курси й підготовка до НМТ: відеоуроки, тести, вебінари.",
      "Online courses and national exam preparation: video lessons, practice tests, webinars.",
    ),
    cats: ["education", "youth"],
    ages: ["a13", "a18"],
    regions: ["online"],
    services: ["online", "learn"],
    langs: ["uk"],
    check: "ok",
    kind: "info",
  },
  {
    id: "osvitoria",
    name: b("Освіторія", "Osvitoria"),
    url: "https://osvitoria.org/",
    desc: b(
      "Освітні ініціативи, матеріали для вчителів і родин.",
      "Educational initiatives and materials for teachers and families.",
    ),
    cats: ["education"],
    ages: ["parents", "pros"],
    regions: UA,
    services: ["learn"],
    langs: ["uk"],
    check: "ok",
    kind: "info",
  },
  {
    id: "howareu",
    name: b("Ти як?", "How Are You?"),
    url: "https://howareu.com/",
    desc: b(
      "Всеукраїнська програма ментального здоров’я: самодопомога, стійкість, як знайти психологічну допомогу.",
      "National mental health programme: self-help, resilience and how to find psychological support.",
    ),
    cats: ["sel", "parenting", "kids"],
    ages: ["a13", "a18", "parents"],
    regions: ["ua", "online"],
    services: ["learn", "online"],
    langs: ["uk"],
    check: "ok",
    kind: "government",
  },
  {
    id: "unhcr",
    name: b("УВКБ ООН в Україні", "UNHCR Ukraine"),
    url: "https://help.unhcr.org/ukraine/",
    desc: b(
      "Інформація для переміщених осіб і біженців: захист, правова інформація, психологічна підтримка, гуманітарні послуги.",
      "Information for displaced people and refugees: protection, legal information, psychological support, humanitarian services.",
    ),
    cats: ["displaced", "abroad", "legal"],
    ages: ["parents"],
    regions: ["ua", "online"],
    services: ["learn"],
    langs: ["uk", "en"],
    check: "blocked",
    kind: "info",
  },
  {
    id: "unicef",
    name: b("ЮНІСЕФ (міжнародний)", "UNICEF International"),
    url: "https://www.unicef.org/",
    desc: b(
      "Права дітей, здоров’я, освіта, захист і підтримка дітей-біженців у світі.",
      "Children’s rights, health, education, protection and support for refugee children worldwide.",
    ),
    cats: ["protection", "abroad"],
    ages: ["parents"],
    regions: ["online"],
    services: ["learn"],
    langs: ["en"],
    check: "ok",
    kind: "info",
  },
  {
    id: "stc",
    name: b("Save the Children", "Save the Children"),
    url: "https://www.savethechildren.net/",
    desc: b(
      "Захист дітей, освіта, екстрене реагування та психосоціальна підтримка.",
      "Child protection, education, emergency response and psychosocial support.",
    ),
    cats: ["protection", "displaced"],
    ages: ["parents"],
    regions: ["online"],
    services: ["learn"],
    langs: ["en"],
    check: "blocked",
    kind: "info",
  },
  {
    id: "tdh",
    name: b("Terre des hommes", "Terre des hommes"),
    url: "https://www.tdh.org/",
    desc: b(
      "Захист дітей, психосоціальна підтримка і права дітей у вразливих ситуаціях.",
      "Child protection, psychosocial support and children’s rights in vulnerable situations.",
    ),
    cats: ["protection"],
    ages: ["parents"],
    regions: ["online"],
    services: ["learn"],
    langs: ["en"],
    check: "ok",
    kind: "info",
  },
  {
    id: "lumos",
    name: b("Lumos", "Lumos"),
    url: "https://www.wearelumos.org/",
    desc: b(
      "Сімейна опіка замість інтернатів, зміцнення родин і захист вразливих дітей.",
      "Family-based care instead of institutions, family strengthening and protection of vulnerable children.",
    ),
    cats: ["protection", "sen"],
    ages: ["parents", "pros"],
    regions: ["online"],
    services: ["learn"],
    langs: ["en"],
    check: "ok",
    kind: "info",
  },
  {
    id: "coe",
    name: b("Рада Європи: права дітей", "Council of Europe – Children’s Rights"),
    url: "https://www.coe.int/en/web/children/",
    desc: b(
      "Права дітей, дружнє до дитини правосуддя і права переміщених дітей.",
      "Children’s rights, child-friendly justice and the rights of displaced children.",
    ),
    cats: ["legal", "abroad"],
    ages: ["parents", "pros"],
    regions: ["eu", "online"],
    services: ["learn"],
    langs: ["en"],
    check: "blocked",
    kind: "info",
  },
  {
    id: "home",
    name: b("Ukraine is Home", "Ukraine is Home"),
    url: "https://ukraineishome.org/",
    desc: b(
      "Інформація для українців за кордоном: освіта, повернення, громада й інтеграція.",
      "Information for Ukrainians abroad: education, returning home, community and integration.",
    ),
    cats: ["abroad", "culture"],
    ages: ["parents"],
    regions: ["online"],
    services: ["learn"],
    langs: ["uk", "en"],
    check: "ok",
    kind: "info",
  },
  {
    id: "nszu",
    name: b("НСЗУ", "National Health Service of Ukraine"),
    url: "https://nszu.gov.ua/",
    desc: b(
      "Доступ до медичної допомоги, пошук лікарів, зокрема послуги з ментального здоров’я.",
      "Access to healthcare, finding providers, including mental health services.",
    ),
    cats: ["health"],
    ages: ["parents"],
    regions: UA,
    services: ["hotline", "learn"],
    langs: ["uk"],
    check: "blocked",
    kind: "government",
    contacts: [{ label: b("Контакт-центр", "Contact centre"), tel: "1677" }],
  },
  {
    id: "moz",
    name: b("Міністерство охорони здоров’я", "Ministry of Health of Ukraine"),
    url: "https://moz.gov.ua/",
    desc: b(
      "Офіційні рекомендації щодо здоров’я дітей, ментального здоров’я та медичних послуг.",
      "Official guidance on child health, mental health and medical services.",
    ),
    cats: ["health"],
    ages: ["parents"],
    regions: UA,
    services: ["learn"],
    langs: ["uk"],
    check: "ok",
    kind: "government",
  },
  {
    id: "eleos",
    name: b("Елеос-Україна", "Eleos-Ukraine"),
    url: "https://eleos.com.ua/en/resources",
    desc: b(
      "Психосоціальна і гуманітарна допомога, регіональна інформація та довідник гарячих ліній.",
      "Psychosocial and humanitarian help, regional information and a helpline directory.",
    ),
    cats: ["displaced", "kids"],
    ages: ["parents"],
    regions: UA,
    services: ["learn"],
    langs: ["uk", "en"],
    check: "ok",
    kind: "info",
  },
  {
    id: "angels",
    name: b("Янголи поруч", "Angels Care"),
    url: "https://angelscare.org.ua/",
    desc: b(
      "Підтримка батьків після втрати вагітності або дитини. Наявність послуг уточнюйте на сайті.",
      "Support for parents after pregnancy or infant loss. Check current service availability on the site.",
    ),
    cats: ["grief"],
    ages: ["parents"],
    regions: UA,
    services: ["group"],
    langs: ["uk"],
    check: "ok",
    kind: "peer",
  },
];

/** Numbers for "Need help right now?" — all are Ukrainian lines. */
export const CRISIS: Contact[] = [
  {
    label: b(
      "Єдиний номер екстреної допомоги (у країнах ЄС теж)",
      "Single emergency number (also across the EU)",
    ),
    tel: "112",
  },
  { label: b("Пожежна і рятувальна служба", "Fire and rescue"), tel: "101" },
  { label: b("Поліція", "Police"), tel: "102" },
  { label: b("Швидка медична допомога", "Ambulance"), tel: "103" },
  {
    label: b("Лінія для дітей і молоді — Ла Страда", "Children’s & youth hotline — La Strada"),
    tel: "116111",
    note: b("безкоштовно, анонімно", "free, anonymous"),
  },
  {
    label: b(
      "Лінія для дітей і молоді — Ла Страда (інший номер)",
      "Children’s & youth hotline — La Strada (alternative number)",
    ),
    tel: "0800500225",
  },
  {
    label: b("Голоси дітей", "Voices of Children"),
    tel: "0800210106",
    note: b("09:00–20:00 за київським часом", "09:00–20:00 Kyiv time"),
  },
  {
    label: b("UA Mental Help", "UA Mental Help"),
    tel: "0800331200",
    note: b("10:00–21:00 за київським часом", "10:00–21:00 Kyiv time"),
  },
  {
    label: b("Національна психологічна асоціація", "National Psychological Association"),
    tel: "0800100102",
    note: b("години не підтверджено", "hours not confirmed"),
  },
  { label: b("Насильство і торгівля людьми", "Domestic violence & trafficking"), tel: "116123" },
  {
    label: b(
      "Насильство і торгівля людьми (інший номер)",
      "Domestic violence & trafficking (alternative number)",
    ),
    tel: "0800500335",
  },
  {
    label: b("Урядова лінія з питань насильства", "Government support line (violence)"),
    tel: "1547",
    note: b("умови роботи не підтверджено", "current arrangements not confirmed"),
  },
  {
    label: b("Урядова лінія для ВПО", "Government line for displaced people"),
    tel: "1548",
    note: b("доступність не підтверджено", "availability not confirmed"),
  },
];

/** Parent education library: short, original, non-clinical guidance. */
export const LIBRARY: { title: Bi; tips: Bi[] }[] = [
  {
    title: b("Емоційний розвиток", "Emotional development"),
    tips: [
      b(
        "Називайте почуття вголос: «Здається, ти засмутився». Так дитина вчиться розпізнавати емоції.",
        "Name feelings out loud: “It looks like you’re upset.” This helps children recognise emotions.",
      ),
      b(
        "Спершу заспокойтеся самі — дитина «позичає» ваш спокій. Це називають спільною регуляцією.",
        "Calm yourself first — children “borrow” your calm. This is called co-regulation.",
      ),
      b(
        "Усі почуття можна мати; обмежуємо лише дії, які шкодять.",
        "All feelings are allowed; we limit only actions that hurt.",
      ),
    ],
  },
  {
    title: b("Тривога і стрес", "Anxiety and stress"),
    tips: [
      b(
        "Ознаки тривоги: болі в животі, проблеми зі сном, уникання, часті «а що, як…».",
        "Signs of anxiety: tummy aches, sleep trouble, avoidance, frequent “what if…” questions.",
      ),
      b(
        "Передбачуваний розпорядок і попередження про зміни допомагають переносити невизначеність.",
        "Predictable routines and warnings about changes help children tolerate uncertainty.",
      ),
      b(
        "Підтримуйте маленькі сміливі кроки замість повного уникання страшного.",
        "Encourage small brave steps rather than avoiding the feared thing completely.",
      ),
    ],
  },
  {
    title: b("Депресія і настрій", "Depression and mood"),
    tips: [
      b(
        "Зверніть увагу, якщо понад два тижні дитина замкнута, втратила інтерес, погано спить або їсть.",
        "Pay attention if for more than two weeks a child is withdrawn, has lost interest, or sleeps or eats poorly.",
      ),
      b(
        "Слухайте без поспіху з висновками; підліткам важливо відчути, що їх сприймають серйозно.",
        "Listen without rushing to conclusions; teenagers need to feel taken seriously.",
      ),
      b(
        "Будь-які думки про самоушкодження — привід негайно звернутися до фахівця.",
        "Any thoughts of self-harm are a reason to contact a professional right away.",
      ),
    ],
  },
  {
    title: b("Травма і горе", "Trauma and grief"),
    tips: [
      b(
        "Після важких подій діти можуть повертатися до «молодшої» поведінки — це поширена реакція.",
        "After hard events children may return to “younger” behaviour — this is a common reaction.",
      ),
      b(
        "Відповідайте чесно й просто, відповідно до віку; уникайте зайвих подробиць.",
        "Answer honestly and simply for their age; avoid unnecessary details.",
      ),
      b(
        "Безпека, рутина і близькі люди — основа відновлення.",
        "Safety, routine and close people are the foundation of recovery.",
      ),
    ],
  },
  {
    title: b("Батьківство і стосунки", "Parenting and relationships"),
    tips: [
      b(
        "Чіткі, спокійні межі й наслідки, пов’язані з поведінкою, працюють краще за покарання.",
        "Clear, calm boundaries and consequences linked to behaviour work better than punishment.",
      ),
      b(
        "Після сварки поверніться до розмови: «Я накричав, мені шкода». Відновлення зміцнює довіру.",
        "After conflict, come back: “I shouted, I’m sorry.” Repair builds trust.",
      ),
      b(
        "Щодня кілька хвилин уваги без телефона — сильна інвестиція в стосунки.",
        "A few phone-free minutes of attention each day is a powerful investment.",
      ),
    ],
  },
  {
    title: b("Поведінка і розвиток", "Behaviour and development"),
    tips: [
      b(
        "За складною поведінкою часто стоїть невміння, а не небажання: втома, сенсорне перевантаження, труднощі з плануванням.",
        "Challenging behaviour often reflects a skill gap, not unwillingness: tiredness, sensory overload, planning difficulties.",
      ),
      b(
        "Розбивайте завдання на короткі кроки й використовуйте візуальні підказки.",
        "Break tasks into short steps and use visual prompts.",
      ),
      b(
        "Якщо підозрюєте СДУГ, аутизм чи інші особливості — оцінку робить лише фахівець.",
        "If you suspect ADHD, autism or other differences, only a professional can assess.",
      ),
    ],
  },
  {
    title: b("Підлітки", "Adolescents"),
    tips: [
      b(
        "Пошук себе й більша незалежність — нормальна частина дорослішання.",
        "Searching for identity and wanting independence are a normal part of growing up.",
      ),
      b(
        "Говоріть про соцмережі, булінг і стосунки без осуду, щоб підліток прийшов до вас із проблемою.",
        "Talk about social media, bullying and relationships without judgement, so your teen comes to you with problems.",
      ),
      b(
        "Домовляйтеся про правила разом і поступово передавайте відповідальність.",
        "Agree rules together and gradually hand over responsibility.",
      ),
    ],
  },
];

/** Interface copy for the resource page. */
export const UI = {
  title: b("Ресурси для батьків", "Parent Resources"),
  intro: b(
    "Ви не самі. Допомога існує. Емоційне благополуччя вашої дитини важливе — і ви теж заслуговуєте на підтримку.",
    "You are not alone. Help is available. Your child’s emotional well-being matters — and you deserve support too.",
  ),
  helpNow: b("Потрібна допомога зараз?", "Need help right now?"),
  helpNote: b(
    "Усі номери нижче працюють лише в Україні. За кордоном телефонуйте до місцевих екстрених служб і служб захисту дітей. У разі безпосередньої небезпеки — одразу до екстрених служб, а не до довідника.",
    "All numbers below work only within Ukraine. Abroad, call your local emergency and child protection services. In immediate danger, call emergency services right away rather than relying on a directory.",
  ),
  findSupport: b("Знайти підтримку", "Find support"),
  search: b("Пошук: організація, тема, ключове слово", "Search: organisation, topic, keyword"),
  topic: b("Тема", "Topic"),
  age: b("Вік", "Age"),
  place: b("Де", "Location"),
  service: b("Послуга", "Service"),
  any: b("Усі", "All"),
  shown: b("Знайдено: {n}", "Found: {n}"),
  none: b(
    "Нічого не знайдено. Спробуйте змінити фільтри.",
    "Nothing found. Try changing the filters.",
  ),
  reset: b("Скинути фільтри", "Reset filters"),
  visit: b("Відвідати сайт", "Visit website"),
  call: b("Зателефонувати", "Call"),
  services: b("Послуги", "Services"),
  ages: b("Вік", "Ages"),
  where: b("Де", "Location"),
  langs: b("Мови", "Languages"),
  cost: b("Вартість", "Cost"),
  contacts: b("Контакти", "Contacts"),
  notConfirmed: b("Не підтверджено", "Not confirmed"),
  checked: b("Посилання перевірено {d}", "Link checked {d}"),
  blocked: b(
    "Офіційний сайт; автоматична перевірка заблокована {d}",
    "Official site; automated check blocked {d}",
  ),
  library: b("Бібліотека для батьків", "Parent library"),
  libraryNote: b(
    "Це загальна освітня інформація, а не оцінка чи лікування. Якщо вас щось турбує, зверніться до фахівця.",
    "This is general educational information, not assessment or treatment. If you are worried, contact a professional.",
  ),
  disclaimer: b(
    "Номери й години роботи змінюються — перевіряйте їх на офіційних сайтах. Матеріали для самодопомоги не замінюють професійної чи екстреної допомоги. Ця сторінка нічого не збирає і не вимагає особистих даних.",
    "Numbers and hours change — confirm them on official sites. Self-help materials do not replace professional or emergency care. This page collects nothing and needs no personal details.",
  ),
  kind: {
    professional: b("Професійні послуги", "Professional services"),
    peer: b("Підтримка ровесників / групи", "Peer / group support"),
    info: b("Інформація та освіта", "Information & education"),
    government: b("Державна служба", "Government service"),
  },
  langNames: {
    uk: b("українська", "Ukrainian"),
    en: b("англійська", "English"),
    de: b("німецька", "German"),
    ru: b("російська", "Russian"),
  },
};
