import { Link, Outlet } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import { useSocket } from "../context/useSocket";
import { NotificationBell } from "./NotificationBell";

export function Layout() {
  const { user, logout } = useAuth();
  const { unreadMessages } = useSocket();

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">Matcha</Link>

        <nav className="nav">
          {user ? (
            <>
              <Link to="/browse">Browse</Link>
              <Link to="/search">Search</Link>
              <Link to="/map">Map</Link>
              <Link to="/visitors">Visitors</Link>
              <Link to="/meetups">Meetups</Link>
              <Link to="/chat" className="notification-bell">
                Chat
                {unreadMessages > 0 && <span className="notification-badge">{unreadMessages}</span>}
              </Link>
              <NotificationBell />
              <Link to="/"><span className="username">{user.username}</span></Link>
              <button type="button" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Sign up</Link>
            </>
          )}
        </nav>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <p>2026 Matcha</p>
      </footer>
    </div>
  );
}
