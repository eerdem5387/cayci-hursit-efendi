const STEPS = ["Sepet", "Teslimat Bilgileri", "Güvenli Ödeme", "Onay"];

/** Sepet → teslimat → ödeme → onay ilerleme göstergesi */
export default function CheckoutSteps({ current, failed = false }: { current: 0 | 1 | 2 | 3 | 4; failed?: boolean }) {
  return (
    <ol className="mb-6 flex items-center gap-2 text-xs sm:mb-8 sm:text-sm" aria-label="Sipariş adımları">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const isFailed = failed && active;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none" aria-current={active ? "step" : undefined}>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                isFailed
                  ? "bg-red-600 text-white"
                  : done
                    ? "bg-emerald-600 text-white"
                    : active
                      ? "bg-emerald-700 text-white ring-4 ring-emerald-100"
                      : "bg-gray-200 text-gray-500"
              }`}
            >
              {isFailed ? "!" : done ? "✓" : i + 1}
            </span>
            <span className={`hidden whitespace-nowrap sm:inline ${active ? "font-semibold text-gray-900" : "text-gray-500"}`}>{label}</span>
            {i < STEPS.length - 1 && <span className={`h-0.5 flex-1 rounded ${done ? "bg-emerald-500" : "bg-gray-200"}`} />}
          </li>
        );
      })}
    </ol>
  );
}
