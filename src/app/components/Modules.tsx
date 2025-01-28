"use client"

import ModuleCard from './modules/ModuleCard'
import NotificationCard from './modules/NotificationCard'

export default function Modules() {
    return (
        <div className="mt-12">
            <h2 className="text-white text-4xl font-bold mb-6">
                Modules
            </h2>
            <div className="grid grid-cols-3 gap-6">
                <ModuleCard 
                    type="C" 
                    progress={30} 
                    href="/c-module" 
                />
                <ModuleCard 
                    type="Exam" 
                    progress={0} 
                    isLocked={true}
                    href="/exam-module" 
                />
                <NotificationCard 
                    title="Discord Community"
                    description="This is a sentence about something important."
                    actionLabel="Join now"
                    onAction={() => {
                        // TODO: Add Discord join logic
                    }}
                />
            </div>
        </div>
    )
}