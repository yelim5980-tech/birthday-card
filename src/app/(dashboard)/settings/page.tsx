import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <Header title="설정" description="회사 정보 및 기본 설정" />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">회사 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "회사명", value: "핏코 (FitCo)" },
                { label: "사업자번호", value: "-" },
                { label: "대표자명", value: "조예림" },
                { label: "은행", value: "우리은행" },
                { label: "계좌번호", value: "1006001578606" },
                { label: "예금주", value: "조예림" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm">수정</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
