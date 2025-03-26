import { Link } from "wouter";
import { Github, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary">CodeTrack</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-base">
              Helping students track and showcase their coding journey across
              multiple platforms.
            </p>
            <div className="flex space-x-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="mailto:contact@codetrack.edu"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Email</span>
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-300 tracking-wider uppercase">
                  Navigation
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link
                      href="/"
                      className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/branches"
                      className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Branches
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/developers"
                      className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Developers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-300 tracking-wider uppercase">
                  Platforms
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a
                      href="https://www.hackerrank.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      HackerRank
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://leetcode.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      LeetCode
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.codechef.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      CodeChef
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.geeksforgeeks.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      GeeksforGeeks
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-base text-gray-400 dark:text-gray-500 text-center">
            &copy; {new Date().getFullYear()} CodeProfileTracker. All rights
            reserved by{" "}
            <a className="text-black" href="https://ofzen.in/" target="_blank">
              Ofzen
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
