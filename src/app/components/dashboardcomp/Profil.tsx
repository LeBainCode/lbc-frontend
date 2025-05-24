interface ProfilProps {
  username: string;
  role: string;
}

export default function Profile({ username, role }: ProfilProps) {
  return (
    <div className="w-[90vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] 2xl:w-[50vw]  sm:flex sm:flex-col mb-10 pt-32">
      <h1 className="text-5xl sm:text-6xl font-bold text-[#e6e6e6]">
        Hello {username}
        {role === "admin" && (
          <span className="text-[#BF9ACA] ml-2">(Admin)</span>
        )}
      </h1>
    </div>
  );
}
