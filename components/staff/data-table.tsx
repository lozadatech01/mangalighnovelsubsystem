// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  emptyMessage?: string;
}

export function DataTable<T extends AnyRecord>({
  rows,
  columns,
  emptyMessage = "No data.",
}: Props<T>) {
  if (!rows.length) {
    return (
      <p className="text-sm text-foreground/60 py-4">{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-x-auto border border-foreground/10 rounded">
      <table className="w-full text-sm">
        <thead className="bg-foreground/5">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-2 text-left font-medium text-foreground/70"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-foreground/10">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-foreground/5 transition-colors">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-2">
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
