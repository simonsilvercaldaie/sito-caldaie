'use client';

import { useState, useEffect, useCallback } from 'react';
import { EducationalAsset, UserProgress } from '@/lib/types/educational';
import { Loader2, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
// We will implement these specific renderers next
import { SchedaRenderer } from './SchedaRenderer';
import { ChecklistRenderer } from './ChecklistRenderer';
import { QuizPlayer } from './QuizPlayer';
import { CasoStudioRenderer } from './CasoStudioRenderer';

interface EducationalPanelProps {
    videoId: string;
}

export function EducationalPanel({ videoId }: EducationalPanelProps) {
    const [loading, setLoading] = useState(true);
    const [resources, setResources] = useState<any[]>([]);
    const [progress, setProgress] = useState<Record<string, UserProgress>>({});
    const [activeTab, setActiveTab] = useState<string>('scheda');

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`/api/educational/${videoId}`);
            if (!res.ok) throw new Error('Failed to fetch educational data');
            const data = await res.json();
            setResources(data.resources || []);
            // Map progress by resource_id is already done by API but let's ensure type safety
            setProgress(data.progress || {});

            // Select first available tab if activeTab not present
            // (logic omitted for brevity, keeping 'scheda' default)
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleProgressUpdate = async (resourceId: string, status: string, state_data: any, score?: number) => {
        // Optimistic update
        setProgress((prev) => ({
            ...prev,
            [resourceId]: { ...prev[resourceId], status, state_data, score } as UserProgress,
        }));

        try {
            const res = await fetch('/api/educational/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resource_id: resourceId, status, state_data, score }),
            });

            // If server returns data (like unlocked case study), we should re-fetch or merge
            const updatedData = await res.json();

            // If we got a valid response, let's refresh explicitly to catch side-effects (unlocks)
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error('Failed to save progress', err);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    // Group resources by type for tabs
    const getResourceByType = (type: string) => resources.find((r) => r.type === type);

    const tabs = [
        { id: 'scheda', label: 'Scheda Diagnosi', icon: AlertTriangle },
        { id: 'checklist', label: 'Checklist', icon: CheckCircle },
        { id: 'quiz', label: 'Quiz', icon: CheckCircle },
        { id: 'caso_studio', label: 'Caso Reale', icon: Lock },
    ];

    const activeResource = getResourceByType(activeTab);
    const activeProgress = activeResource ? progress[activeResource.id] : undefined;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {resources.length === 0 ? (
                <div className="p-8 text-center bg-slate-50">
                    <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-slate-700">Materiali in preparazione</h3>
                    <p className="text-slate-500 text-sm">Schede, Checklist e Quiz saranno disponibili a breve per questo video.</p>
                    <div className="hidden">{`[LOG] VideoId: ${videoId} - No resources found`}</div>
                </div>
            ) : (
                <>
                    {/* Tabs Header */}
                    <div className="flex border-b border-slate-200 bg-slate-50">
                        {tabs.map((tab) => {
                            const res = getResourceByType(tab.id);
                            if (!res) return null; // Don't show tab if resource doesn't exist

                            const isLocked = tab.id === 'caso_studio' && (!progress[res.id] || progress[res.id].status === 'locked');

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    disabled={isLocked && false} // We allow clicking to show "Locked" state UI
                                    className={cn(
                                        "flex-1 py-4 px-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                                        activeTab === tab.id ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
                                        isLocked && "opacity-75"
                                    )}
                                >
                                    {isLocked ? <Lock className="w-4 h-4" /> : <tab.icon className="w-4 h-4" />}
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="p-6 min-h-[400px]">
                        {activeResource ? (
                            <>
                                {activeTab === 'scheda' && (
                                    <SchedaRenderer
                                        asset={activeResource.content}
                                    />
                                )}
                                {activeTab === 'checklist' && (
                                    <ChecklistRenderer
                                        asset={activeResource.content}
                                        savedProgress={activeProgress}
                                        onSave={(data) => handleProgressUpdate(activeResource.id, 'unlocked', data)}
                                    />
                                )}
                                {activeTab === 'quiz' && (
                                    <QuizPlayer
                                        asset={activeResource.content}
                                        savedProgress={activeProgress}
                                        onComplete={(score, passed) => handleProgressUpdate(activeResource.id, 'completed', { passed }, score)}
                                    />
                                )}
                                {activeTab === 'caso_studio' && (
                                    <CasoStudioRenderer
                                        asset={activeResource.content}
                                        isLocked={!activeProgress || activeProgress.status === 'locked'}
                                        onSolve={() => handleProgressUpdate(activeResource.id, 'completed', { solved: true })}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="text-center text-slate-400 py-10">Seleziona una risorsa</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
