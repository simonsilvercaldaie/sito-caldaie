// Loading Skeleton Components for better UX during page loads

export function CardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
            <div className="aspect-video bg-gray-200" />
            <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
        </div>
    )
}

export function CourseCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
            <div className="aspect-video bg-gray-200" />
            <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-4/5" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                </div>
            </div>
        </div>
    )
}

export function VideoPlayerSkeleton() {
    return (
        <div className="aspect-video bg-gray-900 rounded-2xl animate-pulse flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-700" />
        </div>
    )
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2 animate-pulse">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={`h-4 bg-gray-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
                />
            ))}
        </div>
    )
}

export function ProfileSkeleton() {
    return (
        <div className="flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
        </div>
    )
}

export function CatalogSkeleton() {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
            ))}
        </div>
    )
}
