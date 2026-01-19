'use client';

import { CasoStudioAsset } from '@/lib/types/educational';
import { Lock } from 'lucide-react';

interface CasoStudioRendererProps {
    asset: CasoStudioAsset['content'];
    isLocked: boolean;
    onSolve: () => void;
}

export function CasoStudioRenderer({ asset, isLocked, onSolve }: CasoStudioRendererProps) {
    if (isLocked) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <div className="bg-slate-200 p-4 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Contenuto Bloccato</h3>
                <p className="text-slate-500 max-w-md text-center">
                    Per accedere al Caso Reale e metterti alla prova, devi prima superare il Quiz di questo modulo.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Scenario</h3>
                <p className="text-blue-800">{asset.scenario.description}</p>

                {asset.scenario.initial_data && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        {Object.entries(asset.scenario.initial_data).map(([key, val]) => (
                            <div key={key} className="bg-white/60 p-2 rounded text-sm">
                                <span className="font-semibold">{key}:</span> {val as string}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <h3 className="font-bold text-lg mt-8 mb-4">Analisi Guidata</h3>
            <div className="space-y-8 relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200">
                {asset.steps.map((step, idx) => (
                    <div key={idx} className="relative">
                        <div className="absolute -left-[2.85rem] bg-white border-2 border-slate-200 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-slate-500">
                            {step.step}
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-1">{step.action}</h4>
                            <p className="text-slate-600">{step.reaction}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-800 mb-2">Soluzione Finale</h3>
                <p className="text-green-700">{asset.solution}</p>
            </div>

            <div className="flex justify-center mt-8">
                <button
                    onClick={onSolve}
                    className="px-6 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition shadow-lg shadow-green-200"
                >
                    Ho capito e risolto il caso
                </button>
            </div>
        </div>
    );
}
