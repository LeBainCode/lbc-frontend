export default function Contact() {
  const email = "your.email@example.com"; // Replace

  return (
    <div className="max-w-6xl mx-auto text-center px-4 sm:px-6 md:px-8">
      <div className="flex justify-center mb-6">
        <a href={`mailto:${email}`}>
          <div className="w-12 h-12 bg-[#84cc16] rounded-lg flex items-center justify-center cursor-pointer hover:rotate-45 transition-transform duration-300">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </a>
      </div>

      <h2 className="text-white text-xl font-medium mb-3">
        Still have questions?
      </h2>
      <div className="text-gray-400 text-sm leading-relaxed">
        <p className="mb-1">
          For assistance, please visit our{" "}
          <a
            href={`mailto:${email}`}
            className="text-[#84cc16] hover:underline"
          >
            Contact Us
          </a>{" "}
          page.
        </p>
        <p>
          Our dedicated team is ready to help you on your journey to a greener,
          more sustainable future.
        </p>
      </div>
    </div>
  );
}
