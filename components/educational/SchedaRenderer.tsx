'use client';

import { SchedaAsset } from '@/lib/types/educational';

interface SchedaRendererProps {
    asset: SchedaAsset['content'];
}

export function SchedaRenderer({ asset }: SchedaRendererProps) {
    // Handle "sections" legacy structure
    if (asset.sections) {
        return (
            <div className="space-y-8">
                {asset.sections.map((section, idx) => (
                    <div key={idx} className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
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

    // New Structure (pro_tips, objective, technical_data, diagnosis_steps)
    return (
        <div className="space-y-8">
            {/* Objective */}
            {asset.objective && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                    <h3 className="font-bold text-blue-900 mb-2">Obiettivo Diagnosi</h3>
                    <p className="text-blue-800 text-lg">{asset.objective}</p>
                </div>
            )}

            {/* Pro Tips */}
            {asset.pro_tips && asset.pro_tips.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl">
                    <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                        💡 Pro Tips
                    </h3>
                    <ul className="space-y-3">
                        {asset.pro_tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-amber-900/80">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Diagnosis Steps */}
            {asset.diagnosis_steps && asset.diagnosis_steps.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Passaggi Diagnostici</h3>
                    <div className="space-y-4">
                        {asset.diagnosis_steps.map((step, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="bg-slate-100 text-slate-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                                        {step.step}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-1">{step.action}</h4>
                                        {step.question && (
                                            <p className="text-slate-500 text-sm italic">❓ {step.question}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Technical Data */}
            {asset.technical_data && asset.technical_data.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Dati Tecnici</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {asset.technical_data.map((data, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{data.component}</span>
                                <div className="font-mono text-lg text-slate-700 font-semibold mt-1">{data.value}</div>
                                {data.note && <p className="text-sm text-slate-500 mt-2">{data.note}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
