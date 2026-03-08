import { Outlet, NavLink } from 'react-router';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <header className="layout-header">
        <NavLink to="/" className="layout-brand">
          FindThem
        </NavLink>
        <nav className="layout-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/register">Register</NavLink>
          <NavLink to="/sighting">Report Sighting</NavLink>
          <NavLink to="/matches">Matches</NavLink>
        </nav>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
