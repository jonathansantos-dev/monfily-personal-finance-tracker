import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Monfily
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Personal Finance Tracker
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
