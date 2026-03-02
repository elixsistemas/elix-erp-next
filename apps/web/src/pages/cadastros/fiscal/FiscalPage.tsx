import { FiscalTabs } from "./components/FiscalTabs";

export default function FiscalPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Cadastros Fiscais</h1>
        <p className="text-sm text-gray-600">Gerencie CFOP e NCM (globais do sistema).</p>
      </div>

      <div className="bg-gray-50 border rounded-lg p-4">
        <FiscalTabs />
      </div>
    </div>
  );
}