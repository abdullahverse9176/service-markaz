import Link from "next/link";

export const metadata = {
  title: "404 - Page Not Found | Service Markaz",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[120px] sm:text-[180px] md:text-[220px] font-black text-transparent bg-clip-text service-markaz-gradient leading-none animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-white/80 backdrop-blur-sm shadow-xl flex items-center justify-center">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-[#00a676]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Oops! Page Not Found
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto px-4">
            The page you're looking for seems to have wandered off. Let's get
            you back on track!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go to Homepage
          </Link>

          <Link href="/"
            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-[#00a676] hover:text-[#00a676] shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="/categories"
              className="text-sm sm:text-base text-[#00a676] hover:text-[#008f65] font-medium hover:underline transition-colors"
            >
              Categories
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/cities"
              className="text-sm sm:text-base text-[#00a676] hover:text-[#008f65] font-medium hover:underline transition-colors"
            >
              Cities
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/blog"
              className="text-sm sm:text-base text-[#00a676] hover:text-[#008f65] font-medium hover:underline transition-colors"
            >
              Blog
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/contact-us"
              className="text-sm sm:text-base text-[#00a676] hover:text-[#008f65] font-medium hover:underline transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#00a676]/10 rounded-full blur-2xl animate-pulse hidden sm:block" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#018094]/10 rounded-full blur-3xl animate-pulse hidden sm:block" />
      </div>
    </div>
  );
}
