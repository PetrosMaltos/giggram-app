import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, User, Settings, HelpCircle, Hand, Users, Briefcase } from 'lucide-react';
import './Navbar.css';

const NAV_ITEMS = [
  { to: '/main', icon: <Home />, text: 'Главная', key: 'home' },
  { to: '/orders', icon: <List />, text: 'Заказы', key: 'orders' },
  { to: '/profile', icon: <User />, text: 'Профиль', key: 'profile' },
  { to: '/favors', icon: <Hand />, text: 'Услуги', key: 'favors' },
  { to: '/specialists', icon: <Users />, text: 'Специалисты', key: 'specialists' },
  { to: '/projects', icon: <Briefcase />, text: 'Проекты', key: 'projects' },
  { to: '/settings', icon: <Settings />, text: 'Настройки', key: 'settings' },
  { to: '/help', icon: <HelpCircle />, text: 'Помощь', key: 'help' },
];

const Navbar = () => {
  const location = useLocation();
  const [active, setActive] = useState('');

  useEffect(() => {
    const activeTab = NAV_ITEMS.find(item => item.to === location.pathname)?.key || 'home';
    setActive(activeTab);
  }, [location.pathname]);

  useEffect(() => {
    const activeElement = document.querySelector('.nav-item.active');
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }, [active]);

  const navItems = useMemo(() => NAV_ITEMS, []);

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="nav-wrapper">
        {navItems.map(({ to, icon, text, key }) => (
          <NavItem
            key={key}
            to={to}
            icon={icon}
            text={text}
            isActive={active === key}
            onClick={() => setActive(key)}
          />
        ))}
      </div>
    </nav>
  );
};

const NavItem = ({ to, icon, text, isActive, onClick }) => (
  <Link
    to={to}
    className={`nav-item ${isActive ? 'active' : ''}`}
    onClick={onClick}
    aria-current={isActive ? 'page' : undefined}
  >
    {icon}
    <span className="nav-text">{text}</span>
  </Link>
);

export default Navbar;