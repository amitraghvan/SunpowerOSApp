import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#F8F9FA]">
      <h2 className="text-2xl font-bold text-[#212529] mb-2">404 — Page Not Found</h2>
      <p className="text-sm text-[#6C757D] mb-6">
        The requested resource or ERP document could not be located.
      </p>
      <Link
        href="/dashboard"
        className="px-4 py-2 bg-[#714B67] hover:bg-[#58394F] text-white text-xs font-semibold rounded shadow-sm transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
