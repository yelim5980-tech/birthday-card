export const VAT_RATE = 0.1;

export function calcAmountExclVat(amountKrw: number): number {
  return Math.round(amountKrw / (1 + VAT_RATE));
}

export function calcVatAmount(amountKrw: number): number {
  return amountKrw - calcAmountExclVat(amountKrw);
}

export function calcSubsidySplit(amountKrw: number): {
  amountExclVat: number;
  vatAmount: number;
} {
  const amountExclVat = calcAmountExclVat(amountKrw);
  return {
    amountExclVat,
    vatAmount: amountKrw - amountExclVat,
  };
}

export function formatKrw(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function krwToWords(amount: number): string {
  const units = ["", "만", "억", "조"];
  let result = "";
  let n = Math.round(amount);

  const eokeok = Math.floor(n / 100000000);
  if (eokeok > 0) {
    result += eokeok + "억";
    n = n % 100000000;
  }

  const man = Math.floor(n / 10000);
  if (man > 0) {
    result += man + "만";
    n = n % 10000;
  }

  if (n > 0) result += n;

  return `금 ${result}원정 (${formatKrw(amount)})`;
}
