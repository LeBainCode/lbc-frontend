export default function Footer() {
  return (
    <>
      {/* Newsletter Section - Outside Footer */}
      <div className="bg-[#0D1117] pt-16 pb-16">
        <div className="container sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] 2xl:w-[50vw] mx-auto px-6">
          <h3 className="text-white text-sm font-medium mb-1">
            Subscribe to our newsletter
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Get product updates, company news, and more.
          </p>
          <button className="w-full sm:w-auto border-2 border-[#252525] text-sm text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors">
            Subscribe
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#161B22] py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span>© 2025 Le Bain Code, Inc.</span>
              <a href="#" className="hover:text-gray-400">
                Terms
              </a>
              <a href="#" className="hover:text-gray-400">
                Privacy
              </a>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/company/le-bain-code/about/?viewAsMember=true"
                className="text-gray-500 hover:text-gray-400"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://discord.gg/zYJpXBNVhk"
                className="text-gray-500 hover:text-gray-400"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
