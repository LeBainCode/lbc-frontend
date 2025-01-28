interface StatsProps {
    userStats: {
        hoursCoding: number;
        exercises: string;
        notionsMastered: number;
        daysLeft: number;
    }
}

export default function Stats({ userStats }: StatsProps) {
    return (
        <div className="bg-[#1F2937] rounded-lg p-8">
            <div className="grid grid-cols-4 gap-8">
                <div>
                    <p className="text-4xl font-medium text-white mb-2">
                        {userStats.hoursCoding}
                    </p>
                    <p className="text-gray-400 text-sm">Hours Coding</p>
                </div>
                <div>
                    <p className="text-4xl font-medium text-white mb-2">
                        {userStats.exercises}
                    </p>
                    <p className="text-gray-400 text-sm">Exercises</p>
                </div>
                <div>
                    <p className="text-4xl font-medium text-white mb-2">
                        {userStats.notionsMastered}
                    </p>
                    <p className="text-gray-400 text-sm">Notions mastered</p>
                </div>
                <div>
                    <p className="text-4xl font-medium text-white mb-2">
                        {userStats.daysLeft}
                    </p>
                    <p className="text-gray-400 text-sm">Days left</p>
                </div>
            </div>
        </div>
    )
}