import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icons";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: "barChart" },
    { to: "/interview/start", label: "New Interview", icon: "mic" },
    { to: "/resumes", label: "Resume Analysis", icon: "fileText" },
    { to: "/history", label: "History", icon: "clipboardList" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/dashboard" className="navbar-brand">
            <span className="brand-icon"><Icon name="target" size={22} /></span>
            <span className="brand-text">IntervueX</span>
          </Link>
        </div>

        <div className="navbar-right">
          <div className="navbar-user">
            <div className="avatar">{user?.name?.[0] || "U"}</div>
            <span className="user-name">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            Logout
          </button>
        </div>
      </nav>

      <div className="app-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-nav">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-link ${
                  location.pathname === item.to ? "active" : ""
                }`}
              >
                <span className="sidebar-icon"><Icon name={item.icon} size={18} /></span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-card">
              <p className="sidebar-card-title">Target Role</p>
              <p className="sidebar-card-value">
                {user?.targetRole || "Not set"}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
