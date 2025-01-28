"use client"

export default function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className="h-1 w-full bg-white">
            <div 
                className="h-full bg-[#BF9ACA]" 
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}