import { PrismaClient } from "@prisma/client";
import { KOSME_CATEGORIES } from "../src/lib/kosme/categories";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding KOSME budget categories...");

  // 비목(BIMOK) 먼저 삽입
  const bimoks = KOSME_CATEGORIES.filter((c) => c.type === "BIMOK");
  const bimokMap: Record<string, string> = {};

  for (const cat of bimoks) {
    const record = await prisma.budgetCategory.upsert({
      where: { id: `kosme_${cat.code}` },
      update: {},
      create: {
        id: `kosme_${cat.code}`,
        name: cat.name,
        code: cat.code,
        categoryType: "KOSME_BIMOK",
        keywords: cat.keywords,
        mccCodes: cat.mccCodes,
        requiredDocs: cat.requiredDocs as object[],
        isActive: true,
        sortOrder: bimoks.indexOf(cat),
      },
    });
    bimokMap[cat.code] = record.id;
  }

  // 세목(SEMOK) 삽입
  const semoks = KOSME_CATEGORIES.filter((c) => c.type === "SEMOK");
  for (const cat of semoks) {
    const parentId = cat.parentCode ? bimokMap[cat.parentCode] : undefined;
    await prisma.budgetCategory.upsert({
      where: { id: `kosme_${cat.code}` },
      update: {},
      create: {
        id: `kosme_${cat.code}`,
        name: cat.name,
        code: cat.code,
        parentId: parentId ?? null,
        categoryType: "KOSME_SEMOK",
        keywords: cat.keywords,
        mccCodes: cat.mccCodes,
        requiredDocs: cat.requiredDocs as object[],
        isActive: true,
        sortOrder: semoks.indexOf(cat),
      },
    });
  }

  console.log(`Seeded ${bimoks.length} 비목 and ${semoks.length} 세목.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
