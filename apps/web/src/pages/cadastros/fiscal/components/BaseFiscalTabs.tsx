import { useState } from "react";
import * as api from "../fiscal.service";
import { useFiscalFixed } from "../useFiscalFixed";
import { FixedFiscalTable } from "./FixedFiscalTable";

import { CfopTable } from "./CfopTable";
import { NcmTable } from "./NcmTable";
import { CestTable } from "./CestTable";

export function BaseFiscalTabs() {
  const [tab, setTab] = useState<
    "cfop" | "ncm" | "cest" | "uom" | "csosn" | "origem" | "cst-icms" | "pis" | "cofins" | "ipi"
  >("cfop");

  const uom = useFiscalFixed(api.listUom);
  const csosn = useFiscalFixed(api.listCsosn);
  const origem = useFiscalFixed(api.listIcmsOrigem);
  const cstIcms = useFiscalFixed(api.listCstIcms);
  const pis = useFiscalFixed(api.listPisCst);
  const cofins = useFiscalFixed(api.listCofinsCst);
  const ipi = useFiscalFixed(api.listIpiCst);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          ["cfop", "CFOP"],
          ["ncm", "NCM"],
          ["cest", "CEST"],
          ["uom", "UOM"],
          ["csosn", "CSOSN"],
          ["origem", "Origem ICMS"],
          ["cst-icms", "CST ICMS"],
          ["pis", "CST PIS"],
          ["cofins", "CST COFINS"],
          ["ipi", "CST IPI"],
        ].map(([k, label]) => (
          <button
            key={k}
            className={`px-3 py-2 rounded-md border ${tab === (k as any) ? "bg-white" : "bg-transparent"}`}
            onClick={() => setTab(k as any)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "cfop" && <CfopTable />}
      {tab === "ncm" && <NcmTable />}
      {tab === "cest" && <CestTable />}

      {tab === "uom" && <FixedFiscalTable title="Unidades de Medida" hook={uom} />}
      {tab === "csosn" && <FixedFiscalTable title="CSOSN" hook={csosn} />}
      {tab === "origem" && <FixedFiscalTable title="Origem ICMS" hook={origem} />}
      {tab === "cst-icms" && <FixedFiscalTable title="CST ICMS" hook={cstIcms} />}
      {tab === "pis" && <FixedFiscalTable title="CST PIS" hook={pis} />}
      {tab === "cofins" && <FixedFiscalTable title="CST COFINS" hook={cofins} />}
      {tab === "ipi" && <FixedFiscalTable title="CST IPI" hook={ipi} />}
    </div>
  );
}