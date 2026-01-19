'use client';

import { useState, useEffect } from 'react';
import { ChecklistAsset } from '@/lib/types/educational';

interface ChecklistRendererProps {
    asset: ChecklistAsset['content'];
    savedProgress: any;
    onSave: (data: any) => void;
}

export function ChecklistRenderer({ asset, savedProgress, onSave }: ChecklistRendererProps) {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
        savedProgress?.state_data?.checked || {}
    );

    const toggleItem = (id: string) => {
        const newState = { ...checkedItems, [id]: !checkedItems[id] };
        setCheckedItems(newState);
        onSave({ checked: newState });
    };

    return (
        <div className="space-y-8">
            {asset.phases.map((phase, idx) => (
                <div key={idx}>
                    <h3 className="font-bold text-slate-900 border-b pb-2 mb-4">{phase.title}</h3>
                    <div className="space-y-3">
                        {phase.steps.map((step) => (
                            <label key={step.id} className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    checked={!!checkedItems[step.id]}
                                    onChange={() => toggleItem(step.id)}
                                />
                                <span className={checkedItems[step.id] ? "text-slate-400 line-through" : "text-slate-700"}>
                                    {step.label}
                                </span>
                                {step.required && <span className="text-xs text-red-500 font-medium ml-auto">Richiesto</span>}
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
