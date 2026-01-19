'use client';

import { SchedaAsset } from '@/lib/types/educational';

interface SchedaRendererProps {
    asset: SchedaAsset['content'];
}

export function SchedaRenderer({ asset }: SchedaRendererProps) {
    return (
        <div className="space-y-8">
            {asset.sections.map((section, idx) => (
                <div key={idx} className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        {/* Icon handling could be here */}
                        {section.title}
                    </h3>
                    <ul className="space-y-2">
                        {section.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-700">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            {asset.tables?.map((table, idx) => (
                <div key={idx} className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                            <tr>
                                {table.headers.map((h, i) => <th key={i} className="px-4 py-3">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50">
                                    {row.map((cell, cIdx) => <td key={cIdx} className="px-4 py-3 border-b border-slate-100">{cell}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}
