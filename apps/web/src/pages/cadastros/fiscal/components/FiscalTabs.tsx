import { useState } from "react";
import { CfopTable } from "./CfopTable";
import { NcmTable } from "./NcmTable";
import { CestTable } from "./CestTable";

export function FiscalTabs() {
  const [tab, setTab] = useState<"cfop" | "ncm" | "cest">("cfop");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          className={`px-3 py-2 rounded-md border ${tab === "cfop" ? "bg-white" : "bg-transparent"}`}
          onClick={() => setTab("cfop")}
        >
          CFOP
        </button>
        <button
          className={`px-3 py-2 rounded-md border ${tab === "ncm" ? "bg-white" : "bg-transparent"}`}
          onClick={() => setTab("ncm")}
        >
          NCM
        </button>
        <button
          className={`px-3 py-2 rounded-md border ${tab === "cest" ? "bg-white" : "bg-transparent"}`}
          onClick={() => setTab("cest")}
        >
          CEST
        </button>
      </div>

      {tab === "cfop" ? <CfopTable /> : tab === "ncm" ? <NcmTable /> : <CestTable />}
    </div>
  );
}