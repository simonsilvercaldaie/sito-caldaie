'use client';

import { useState } from 'react';
import { QuizAsset } from '@/lib/types/educational';
import { Button } from '@/components/ui/button'; // Verify this exists or likely needs creation/shadcn
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Temporary fallback for Button if not exists
const Btn = ({ children, onClick, disabled, className, variant }: any) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={cn("px-4 py-2 rounded-md font-medium transition-colors",
            disabled && "opacity-50 cursor-not-allowed",
            variant === "outline" ? "border border-slate-300 hover:bg-slate-50" : "bg-blue-600 text-white hover:bg-blue-700",
            className
        )}
    >
        {children}
    </button>
);

interface QuizPlayerProps {
    asset: QuizAsset['content'];
    savedProgress: any;
    onComplete: (score: number, passed: boolean) => void;
}

export function QuizPlayer({ asset, savedProgress, onComplete }: QuizPlayerProps) {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
    const [showResults, setShowResults] = useState(false);

    const questions = asset.questions || [];
    const currentQ = questions[currentQIndex];

    const handleSelectOption = (optionId: string) => {
        if (showResults) return;
        setAnswers(prev => ({ ...prev, [currentQ.id]: optionId }));
    };

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        let score = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correct) score++;
        });

        // Normalize to 100? Or just raw count. Let's use raw count matching passing_score
        setShowResults(true);
        const passed = score >= (asset.passing_score || Math.ceil(questions.length * 0.8));
        onComplete(score, passed);
    };

    if (showResults) {
        const passed = (savedProgress?.score ?? 0) >= (asset.passing_score || 0);
        return (
            <div className="text-center py-10">
                <h3 className="text-2xl font-bold mb-4">{passed ? "Quiz Superato! 🎉" : "Non Superato"}</h3>
                <p className="text-lg text-slate-600 mb-6">
                    Hai risposto correttamente a {savedProgress?.score ?? 0} domande su {questions.length}.
                </p>
                <Btn onClick={() => { setShowResults(false); setCurrentQIndex(0); setAnswers({}); }}>Riprova</Btn>
            </div>
        );
    }

    // Pre-completed state check
    if (savedProgress?.status === 'completed' && !showResults) {
        // Show summary but user can retry if they want? 
        // For MVP, just show "Completed" state or allow retry.
        // Let's default to allowing them to play again, but showing a banner at top.
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex justify-between items-center text-sm text-slate-500">
                <span>Domanda {currentQIndex + 1} di {questions.length}</span>
                <span>Minimo richiesto: {asset.passing_score}</span>
            </div>

            <h3 className="text-xl font-semibold mb-6">{currentQ.text}</h3>

            <div className="space-y-3 mb-8">
                {currentQ.options.map(opt => (
                    <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={cn(
                            "p-4 border rounded-lg cursor-pointer transition-all hover:bg-slate-50",
                            answers[currentQ.id] === opt.id ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-slate-200"
                        )}
                    >
                        <span className="font-semibold mr-2">{opt.id}.</span> {opt.text}
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <Btn
                    onClick={handleNext}
                    disabled={!answers[currentQ.id]}
                >
                    {currentQIndex === questions.length - 1 ? "Concludi" : "Avanti"}
                </Btn>
            </div>
        </div>
    );
}
