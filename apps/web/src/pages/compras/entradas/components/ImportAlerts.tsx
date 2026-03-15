
type Props = {
  actionError?: string | null;
  allocationError?: string | null;
  installmentError?: string | null;
  economicsError?: string | null;
  successMessage?: string | null;
};

function AlertBox({
  message,
  tone,
}: {
  message: string;
  tone: "error" | "success";
}) {
  const classes =
    tone === "error"
      ? "mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      : "mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700";

  return <div className={classes}>{message}</div>;
}

export function ImportAlerts({
  actionError,
  allocationError,
  installmentError,
  economicsError,
  successMessage,
}: Props) {
  return (
    <>
      {actionError && <AlertBox message={actionError} tone="error" />}
      {allocationError && <AlertBox message={allocationError} tone="error" />}
      {installmentError && <AlertBox message={installmentError} tone="error" />}
      {economicsError && <AlertBox message={economicsError} tone="error" />}
      {successMessage && <AlertBox message={successMessage} tone="success" />}
    </>
  );
}