export interface KosmeCategory {
  code: string;
  name: string;
  type: "BIMOK" | "SEMOK";
  parentCode?: string;
  keywords: string[];
  mccCodes: string[];
  requiredDocs: RequiredDoc[];
  canSkipExpenseReport?: boolean;
  needsPurchaseApproval?: boolean;
}

export interface RequiredDoc {
  key: string;
  label: string;
  required: boolean;
  note?: string;
}

export const KOSME_CATEGORIES: KosmeCategory[] = [
  // ── 재료비 ──────────────────────────────────────────────────────────
  {
    code: "MATERIAL",
    name: "재료비",
    type: "BIMOK",
    keywords: ["재료", "부품", "원단", "소재"],
    mccCodes: [],
    requiredDocs: [],
  },
  {
    code: "MATERIAL_PRODUCT",
    name: "제품제작비",
    type: "SEMOK",
    parentCode: "MATERIAL",
    keywords: ["제품제작", "PCB", "외주가공", "설계", "디자인"],
    mccCodes: [],
    requiredDocs: [
      { key: "quote", label: "견적서 (직인 필수)", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
      { key: "expense_report", label: "사업비 사용내역서 (물품사진 첨부)", required: true },
    ],
  },
  {
    code: "MATERIAL_EQUIPMENT",
    name: "기자재구입비",
    type: "SEMOK",
    parentCode: "MATERIAL",
    keywords: ["기자재", "장비", "공구", "소프트웨어", "라이선스"],
    mccCodes: [],
    requiredDocs: [
      { key: "quote", label: "견적서", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
      { key: "expense_report", label: "사업비 사용내역서 (기자재스티커 사진 필수)", required: true },
    ],
    note: "50만원 이상 기자재: 홈페이지 기자재등록 필수",
  } as KosmeCategory & { note: string },

  // ── 기계장치 ─────────────────────────────────────────────────────────
  {
    code: "MACHINE",
    name: "기계장치",
    type: "BIMOK",
    keywords: ["기계", "전산장비", "통신기기"],
    mccCodes: [],
    requiredDocs: [],
  },
  {
    code: "MACHINE_IT",
    name: "전산장비와통신기기구매비",
    type: "SEMOK",
    parentCode: "MACHINE",
    keywords: ["컴퓨터", "노트북", "모니터", "태블릿", "프린터", "스캐너", "스마트폰"],
    mccCodes: ["5045", "5734"],
    requiredDocs: [
      { key: "quote", label: "견적서 (제품사양 포함)", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
      { key: "expense_report", label: "사업비 사용내역서 + 전산장비구매세부내역서", required: true },
    ],
  },

  // ── 인건비 ──────────────────────────────────────────────────────────
  {
    code: "LABOR",
    name: "인건비",
    type: "BIMOK",
    keywords: ["인건비", "급여", "월급"],
    mccCodes: [],
    requiredDocs: [],
  },
  {
    code: "LABOR_TASK",
    name: "과제참여인건비",
    type: "SEMOK",
    parentCode: "LABOR",
    keywords: ["인건비", "급여"],
    mccCodes: [],
    requiredDocs: [
      { key: "insurance", label: "4대사회보험 사업장가입자명부", required: true },
      { key: "payroll", label: "급여대장", required: true },
      { key: "career", label: "경력증명서", required: true },
      { key: "contract", label: "근로계약서", required: true },
    ],
  },

  // ── 지급수수료 ────────────────────────────────────────────────────────
  {
    code: "FEE",
    name: "지급수수료",
    type: "BIMOK",
    keywords: [],
    mccCodes: [],
    requiredDocs: [],
  },
  {
    code: "FEE_EQUIPMENT_RENTAL",
    name: "기자재사용료",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: [
      "figma", "adobe", "notion", "slack", "github", "aws", "gcp", "azure",
      "구독", "사용료", "라이선스", "임차", "렌탈", "월정액",
    ],
    mccCodes: ["7372", "7371"],
    requiredDocs: [
      { key: "quote", label: "견적서(영수증)", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
      { key: "rental_contract", label: "임차계약서", required: false, note: "월정액 라이선스는 생략 가능" },
      { key: "expense_report", label: "사업비 사용내역서", required: false, note: "월정액 라이선스는 생략 가능" },
    ],
    canSkipExpenseReport: true,
  },
  {
    code: "FEE_TEST",
    name: "전문기관시험/인증비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["시험", "인증", "KC", "CE", "시험인증"],
    mccCodes: [],
    requiredDocs: [
      { key: "quote", label: "견적서", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
    ],
  },
  {
    code: "FEE_IP",
    name: "지재권출원비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["특허", "출원", "등록", "지재권", "실용신안", "상표"],
    mccCodes: [],
    requiredDocs: [
      { key: "quote", label: "견적서", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
      { key: "fee_receipt", label: "관납료납부영수증", required: true },
      { key: "application_notice", label: "출원번호통지서 (첫장)", required: true },
    ],
  },
  {
    code: "FEE_CONSULTING",
    name: "기술및경영자문비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["자문", "컨설팅", "법률", "회계", "세무"],
    mccCodes: ["7389"],
    requiredDocs: [
      { key: "quote", label: "견적서", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
      { key: "result_report", label: "자문 결과보고서", required: true },
    ],
    needsPurchaseApproval: true,
  },
  {
    code: "FEE_EDUCATION",
    name: "교육비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["교육", "강의", "세미나", "수강", "훈련"],
    mccCodes: ["8299", "8249"],
    requiredDocs: [
      { key: "approval_screenshot", label: "교육승인 온라인 화면 캡처", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
      { key: "completion_cert", label: "교육 수료증", required: true },
    ],
  },
  {
    code: "FEE_BOOK",
    name: "기술서적구입비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["도서", "책", "서적"],
    mccCodes: ["5942"],
    requiredDocs: [
      { key: "card_receipt", label: "카드영수증", required: true },
    ],
  },
  {
    code: "FEE_SEMINAR",
    name: "세미나및학회참가비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["세미나", "학회", "컨퍼런스", "포럼"],
    mccCodes: ["7941", "7999"],
    requiredDocs: [
      { key: "quote", label: "견적서", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
    ],
  },
  {
    code: "FEE_EXHIBITION",
    name: "개별전시회참가비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["전시회", "박람회", "출품", "참가"],
    mccCodes: [],
    requiredDocs: [
      { key: "quote", label: "견적서", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
      { key: "result_report", label: "전시회 보고서", required: true },
    ],
  },
  {
    code: "FEE_CATALOG",
    name: "카탈로그및포장디자인제작비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["카탈로그", "패키지", "디자인", "리플릿", "명함", "CI", "BI"],
    mccCodes: ["2741", "7389"],
    requiredDocs: [
      { key: "quote", label: "견적서", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
      { key: "expense_report", label: "사업비 사용내역서", required: true },
    ],
  },
  {
    code: "FEE_VIDEO",
    name: "영상제작비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["영상", "동영상", "촬영", "편집", "유튜브"],
    mccCodes: ["7812"],
    requiredDocs: [
      { key: "quote", label: "견적서", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
      { key: "result_file", label: "개발결과물 파일", required: true },
    ],
  },
  {
    code: "FEE_HOMEPAGE",
    name: "홈페이지및온라인쇼핑몰제작비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["홈페이지", "웹사이트", "쇼핑몰", "웹호스팅", "도메인", "서버"],
    mccCodes: ["7372"],
    requiredDocs: [
      { key: "quote", label: "견적서", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
      { key: "expense_report", label: "사업비 사용내역서", required: true },
    ],
  },
  {
    code: "FEE_MALL",
    name: "온라인쇼핑몰입점비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["입점", "네이버쇼핑", "쿠팡", "11번가", "마켓"],
    mccCodes: [],
    requiredDocs: [
      { key: "quote", label: "견적서", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
    ],
  },
  {
    code: "FEE_AD",
    name: "광고비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["광고", "마케팅", "SNS", "인스타", "카카오", "구글", "페이스북", "네이버"],
    mccCodes: ["7311"],
    requiredDocs: [
      { key: "quote", label: "견적서", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
    ],
  },
  {
    code: "FEE_SURVEY",
    name: "소비자반응조사비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["조사", "설문", "리서치", "고객반응"],
    mccCodes: [],
    requiredDocs: [
      { key: "quote", label: "견적서", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
      { key: "result_report", label: "조사 결과보고서", required: true },
    ],
  },
  {
    code: "FEE_ACCOUNTING",
    name: "회계처리비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["세무", "기장", "회계", "세무사", "회계사"],
    mccCodes: ["8931"],
    requiredDocs: [
      { key: "quote", label: "견적서", required: true },
      { key: "card_receipt", label: "카드영수증", required: true },
    ],
  },
  {
    code: "FEE_DOMESTIC_TRAVEL",
    name: "국내출장여비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["출장", "교통", "숙박", "KTX", "항공"],
    mccCodes: ["4111", "4511", "7011"],
    requiredDocs: [
      { key: "card_receipt", label: "카드영수증", required: true },
    ],
  },
  {
    code: "FEE_OVERSEAS_TRAVEL",
    name: "해외출장여비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["해외출장", "해외항공", "해외전시회"],
    mccCodes: ["4511"],
    requiredDocs: [
      { key: "card_receipt", label: "카드영수증", required: true },
    ],
  },
  {
    code: "FEE_MANAGEMENT",
    name: "경영활동비",
    type: "SEMOK",
    parentCode: "FEE",
    keywords: ["경영활동"],
    mccCodes: [],
    requiredDocs: [],
  },
];

export function findCategoryByKeyword(text: string): KosmeCategory | null {
  const lower = text.toLowerCase();
  const semoks = KOSME_CATEGORIES.filter((c) => c.type === "SEMOK");
  for (const cat of semoks) {
    if (cat.keywords.some((k) => lower.includes(k.toLowerCase()))) {
      return cat;
    }
  }
  return null;
}

export function findCategoryByMcc(mcc: string): KosmeCategory | null {
  const semoks = KOSME_CATEGORIES.filter((c) => c.type === "SEMOK");
  for (const cat of semoks) {
    if (cat.mccCodes.includes(mcc)) return cat;
  }
  return null;
}

export function getParentCategory(semok: KosmeCategory): KosmeCategory | null {
  return (
    KOSME_CATEGORIES.find(
      (c) => c.code === semok.parentCode && c.type === "BIMOK"
    ) ?? null
  );
}

export function isMonthlyLicense(merchantName: string): boolean {
  const monthly = [
    "figma", "adobe", "notion", "slack", "github", "claude", "chatgpt",
    "openai", "aws", "google cloud", "microsoft", "zoom", "dropbox",
    "jetbrains", "vercel", "supabase",
  ];
  const lower = merchantName.toLowerCase();
  return monthly.some((m) => lower.includes(m));
}

export function needsPurchaseApproval(amountKrw: number, category?: KosmeCategory): boolean {
  if (amountKrw > 10_000_000) return true;
  if (category?.needsPurchaseApproval) return true;
  return false;
}
