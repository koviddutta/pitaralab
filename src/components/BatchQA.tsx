export default function BatchQA({onPrint}:{onPrint?:()=>void}) {
  return (
    <div className="rounded-xl border p-3 space-y-2">
      <div className="font-semibold">Batch & QA</div>
      <div className="grid gap-2 md:grid-cols-3">
        <Field label="Batch Size (kg)" />
        <Field label="Operator" />
        <Field label="Overrun Target %" />
        <Field label="Measured °Bx" />
        <Field label="Draw Temp (°C)" />
        <Field label="Notes" />
      </div>
      <div className="text-xs opacity-70">Tip: Draw −7 to −5 °C; serve ≈ −12 °C; store ≤ −18 °C.</div>
      <button onClick={onPrint} className="rounded bg-slate-800 text-white px-3 py-2 text-sm">Print Production Sheet</button>
    </div>
  );
}
function Field({label}:{label:string}) {
  return <div><div className="text-sm">{label}</div><input className="w-full rounded border px-2 py-1" /></div>;
}