export default function ComingSoon({ title = "Em construção" }: { title?: string }) {
  return (
    <div className="p-6">
      <div className="max-w-3xl space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Esta área já está no mapa do ERP, mas ainda não foi implementada.
          (Sim, é proposital. Estamos construindo por módulos.)
        </p>
      </div>
    </div>
  );
}