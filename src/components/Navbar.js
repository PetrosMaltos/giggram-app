import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, Mail, User, Settings, HelpCircle, Hand, Users, Briefcase } from 'lucide-react';
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
    // Scroll to the active tab if it's out of view
    const activeElement = document.querySelector(`.nav-item.active`);
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }, [active]);

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="nav-wrapper">
        {NAV_ITEMS.map(({ to, icon, text, key }) => (
          <Link
            key={key}
            to={to}
            className={`nav-item ${active === key ? 'active' : ''}`}
            onClick={() => setActive(key)}
            aria-current={active === key ? 'page' : undefined}
          >
            {icon}
            <span className="nav-text">{text}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
