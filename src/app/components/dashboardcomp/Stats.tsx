interface StatsProps {
  userStats: {
    hoursCoding: number;
    exercises: string;
    notionsMastered: number;
    daysLeft: number;
  };
}

export default function Stats({ userStats }: StatsProps) {
  return (
    <div className="w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[80vw] xl:max-w-[60vw] 2xl:max-w-[50vw] mx-auto border-2 border-[#BF9ACA] rounded-lg p-6 sm:p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 place-items-center text-center">
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl sm:text-4xl font-medium text-white mb-1 sm:mb-2">
            {userStats.hoursCoding}
          </p>
          <p className="text-gray-400 text-sm sm:text-base">Hours Coding</p>
        </div>

        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl sm:text-4xl font-medium text-white mb-1 sm:mb-2">
            {userStats.exercises}
          </p>
          <p className="text-gray-400 text-sm sm:text-base">Exercises</p>
        </div>

        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl sm:text-4xl font-medium text-white mb-1 sm:mb-2">
            {userStats.notionsMastered}
          </p>
          <p className="text-gray-400 text-sm sm:text-base">Notions mastered</p>
        </div>

        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl sm:text-4xl font-medium text-white mb-1 sm:mb-2">
            {userStats.daysLeft}
          </p>
          <p className="text-gray-400 text-sm sm:text-base">Days left</p>
        </div>
      </div>
    </div>
  );
}
