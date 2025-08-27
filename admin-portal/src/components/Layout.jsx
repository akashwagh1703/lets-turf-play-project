import { useState } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext.jsx";
import {
  LayoutDashboard,
  Users,
  Shield,
  Ticket,
  Map,
  Calendar,
  BarChart,
  DollarSign,
  Settings,
  LogOut,
  UserCircle,
  Menu,
  X
} from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", roles: ["admin", "manager", "staff"], icon: <LayoutDashboard size={20} /> },
    { label: "Roles & Permissions", path: "/roles", roles: ["admin"], icon: <Shield size={20} /> },
    { label: "Turfs", path: "/turfs", roles: ["admin", "manager"], icon: <Map size={20} /> },
    { label: "Bookings", path: "/bookings", roles: ["admin", "manager", "staff"], icon: <Ticket size={20} /> },
    { label: "Availability", path: "/availability", roles: ["manager"], icon: <Calendar size={20} /> },
    { label: "Users", path: "/users", roles: ["admin"], icon: <Users size={20} /> },
    { label: "Reports", path: "/reports", roles: ["admin", "manager", "staff"], icon: <BarChart size={20} /> },
    { label: "Revenue & Plans", path: "/revenue-plans", roles: ["admin", "manager"], icon: <DollarSign size={20} /> },
    { label: "Content & Settings", path: "/settings", roles: ["admin"], icon: <Settings size={20} /> },
  ];

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role.toLowerCase())
  );

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          Turf.
        </div>
        <nav className="nav nav-pills flex-column">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => "nav-link " + (isActive ? "active" : "")}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="content">
        <Navbar as="header" className="top-navbar">
            <button className="icon-button mobile-menu-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Navbar.Brand className="ms-0">
              Welcome{user ? `, ${user.name}` : ""}
            </Navbar.Brand>
            <Nav>
              <NavDropdown 
                title={
                  <div className="d-flex align-items-center gap-2">
                    <UserCircle size={28} />
                    <span className="d-none d-md-block">{user?.name || "Account"}</span>
                  </div>
                } 
                align="end">
                <NavDropdown.Item onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard size={16} className="me-2" /> Dashboard
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  <LogOut size={16} className="me-2" /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
        </Navbar>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
