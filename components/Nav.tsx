import { BookOpen, Eye } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label="Matheye home">
          <span className="brand-mark">
            <Eye size={20} />
          </span>
          Matheye
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/courses">Courses</Link>
          <Link href="/courses/algebra-1">Algebra 1</Link>
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="badge">{user.name.split(" ")[0]}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/auth" className="btn btn-ghost">
                Log in
              </Link>
              <Link href="/auth?mode=signup" className="btn btn-primary">
                <BookOpen size={16} />
                Start
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
