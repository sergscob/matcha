import { Link } from "react-router-dom";

import { useSocket } from "../context/useSocket";

export function NotificationBell() {
  const { unreadNotifications } = useSocket();

  return (
    <Link to="/notifications" className="notification-bell">
      Notifications
      {unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications}</span>}
    </Link>
  );
}
