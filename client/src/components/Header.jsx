import { useAuth } from "../hooks/useAuth.jsx";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header__brand">
        <svg className="header__logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.5 C12 2.5 5.5 9.5 5.5 14.5 a6.5 6.5 0 0 0 13 0 C18.5 9.5 12 2.5 12 2.5 Z" />
        </svg>
        <span>Sweety</span>
      </div>
      {user && (
        <div className="header__actions">
          <span className="header__user">Hi, {user.name}</span>
          <button className="btn btn--ghost" onClick={logout}>Logout</button>
        </div>
      )}
    </header>
  );
}