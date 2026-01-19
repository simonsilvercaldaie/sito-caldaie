export type AssetType = 'scheda' | 'checklist' | 'quiz' | 'caso_studio';
export type CourseLevel = 'base' | 'intermedio' | 'avanzato';

// === DATABASE TYPES ===
export interface EducationalResource {
    id: string;
    video_id: string;
    type: AssetType;
    level: CourseLevel;
    title: string;
    content: EducationalAsset; // JSONB
    version: number;
    is_active: boolean;
}

export interface UserProgress {
    id: string;
    user_id: string;
    resource_id: string;
    status: 'locked' | 'unlocked' | 'completed';
    state_data: Record<string, any>;
    score?: number;
    completed_at?: string;
}

export interface EducationalProfile {
    user_id: string;
    unlocked_levels: CourseLevel[];
    total_score: number;
}

// === JSON ASSET STRUCTURE (CONTENT) ===

export interface BaseAsset {
    meta: {
        video_id: string;
        type: AssetType;
        title: string;
        last_updated: string;
        ukts?: string[]; // Optional: Linked concepts
    };
}

// 1. Scheda Diagnosi
export interface SchedaAsset extends BaseAsset {
    content: {
        // New structure matching DB
        pro_tips?: string[];
        objective?: string;
        technical_data?: Array<{
            component: string;
            value: string;
            note?: string;
        }>;
        diagnosis_steps?: Array<{
            step: number;
            action: string;
            question?: string;
        }>;
        // Keep old structure for backward compatibility if needed, or remove
        sections?: Array<{
            title: string;
            icon?: string;
            items: string[];
        }>;
        tables?: Array<{
            headers: string[];
            rows: string[][];
        }>;
    };
}

// 2. Checklist
export interface ChecklistAsset extends BaseAsset {
    content: {
        phases: Array<{
            title: string;
            steps: Array<{
                id: string;
                label: string;
                required: boolean;
            }>;
        }>;
    };
}

// 3. Quiz
export interface QuizOption {
    id: string;
    text: string;
}

export interface QuizQuestion {
    id: string;
    type: string;
    text: string;
    options: QuizOption[];
    correct: string;
    explanation: string;
}

export interface QuizAsset extends BaseAsset {
    content: {
        passing_score: number;
        questions: QuizQuestion[];
    };
}

// 4. Caso Studio
export interface CasoStudioStep {
    step: number;
    action: string;
    reaction?: string;
    result?: string; // DB uses 'result' in investigation
    clue?: string;
}

export interface CasoStudioAsset extends BaseAsset {
    content: {
        scenario: {
            context?: string; // DB uses 'context'
            initial_obs?: string[]; // DB uses 'initial_obs'
            description?: string;
            initial_data?: Record<string, string>;
        };
        challenge?: string;
        resolution?: string;
        // DB uses 'investigation' instead of 'steps'
        investigation?: CasoStudioStep[];
        steps?: CasoStudioStep[];
        solution?: string;
    };
}

// Union Type
export type EducationalAsset = SchedaAsset | ChecklistAsset | QuizAsset | CasoStudioAsset;
