import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-gray-200/50 bg-white/80 dark:border-gray-800/50 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="mb-4 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              CarHealth
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              AI-powered car health reports for confident buying and selling.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 font-bold text-gray-900 dark:text-white">
              Product
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#how-it-works"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:translate-x-1 inline-block"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:translate-x-1 inline-block"
                >
                  Pricing
                </a>
              </li>
              <li>
                <Link
                  href="/reports"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:translate-x-1 inline-block"
                >
                  Reports
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:translate-x-1 inline-block"
                >
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 font-bold text-gray-900 dark:text-white">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="/about"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:translate-x-1 inline-block"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:translate-x-1 inline-block"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:translate-x-1 inline-block"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 font-bold text-gray-900 dark:text-white">
              Legal
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="/terms"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:translate-x-1 inline-block"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:translate-x-1 inline-block"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200/50 pt-8 dark:border-gray-800/50">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} CarHealth. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
