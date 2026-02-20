import * as React from "react";
import { Input } from "@/components/ui/input";
import { onlyDigits } from "../digits";
import { maskCPF, maskCNPJ } from "../masks";

export function BrDocumentInput(props: {
  value: string;
  personType: "PF" | "PJ";
  onChange: (rawDigits: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}) {
  const masked =
    props.personType === "PF" ? maskCPF(props.value) : maskCNPJ(props.value);

  return (
    <Input
      value={masked}
      placeholder={props.placeholder ?? (props.personType === "PF" ? "CPF" : "CNPJ")}
      onChange={(e) => props.onChange(onlyDigits(e.target.value))}
      onBlur={props.onBlur}
      inputMode="numeric"
    />
  );
}
