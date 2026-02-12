import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Link to="/">
            <img src="/tactihub_logo.png" alt="TactiHub" className="h-14" />
          </Link>
        </div>
        <Outlet />
        <div className="flex justify-center">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
