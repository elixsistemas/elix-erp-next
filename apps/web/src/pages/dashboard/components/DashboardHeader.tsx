// components/DashboardHeader.tsx
export function DashboardHeader(props: { firstName: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
        Olá, {props.firstName}
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mt-1">{props.subtitle}</p>
    </div>
  );
}
