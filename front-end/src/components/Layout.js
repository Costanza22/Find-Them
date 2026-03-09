import { Outlet, NavLink } from 'react-router';
import useTheme from '../hooks/useTheme';
import './Layout.css';

export default function Layout() {
  const { theme, toggle } = useTheme();

  return (
    <div className="layout">
      <header className="layout-header">
        <NavLink to="/" className="layout-brand">
          FindThem
        </NavLink>
        <nav className="layout-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/register">Register</NavLink>
          <NavLink to="/registry">Registry</NavLink>
          <NavLink to="/sighting">Report Sighting</NavLink>
          <NavLink to="/matches">Matches</NavLink>
        </nav>
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
          title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
      <footer className="layout-footer">
        <a
          href="https://int-missing.fandom.com/wiki/International_Missing_Persons_Wiki"
          target="_blank"
          rel="noopener noreferrer"
        >
          International Missing Persons Wiki
        </a>
        <span className="layout-footer-sep"> · </span>
        <span>Reference &amp; awareness</span>
      </footer>
    </div>
  );
}
