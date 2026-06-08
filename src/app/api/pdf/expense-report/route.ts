import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { ExpenseReportPdf, ExpenseReportPdfProps } from "@/lib/pdf/expenseReport";

export async function POST(req: NextRequest) {
  try {
    const body: ExpenseReportPdfProps = await req.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(ExpenseReportPdf, body) as any;
    const buffer = await renderToBuffer(element);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="expense-report-${Date.now()}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "PDF 생성 실패" }, { status: 500 });
  }
}
