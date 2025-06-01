import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from './yolohome.png';
import { FaHome, FaMicrochip, FaChartLine, FaUsers, FaMicrophone, FaCog, FaUser, FaSignOutAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import './sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save to localStorage whenever isExpanded changes
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  const pathToLabel = {
    '/dashboard': 'DASHBOARD',
    '/devices': 'DEVICES',
    '/statistics': 'STATISTICS',
    '/family_members': 'FAMILY MEMBERS',
    '/voice_control': 'VOICE CONTROL',
    '/setting': 'SETTING',
  };

  const activePage = pathToLabel[location.pathname] || 'DASHBOARD';

  const navItems = [
    { to: '/dashboard', label: 'DASHBOARD', icon: <FaHome /> },
    { to: '/devices', label: 'DEVICES', icon: <FaMicrochip /> },
    { to: '/statistics', label: 'STATISTICS', icon: <FaChartLine /> },
    { to: '/family_members', label: 'FAMILY MEMBERS', icon: <FaUsers /> },
    { to: '/voice_control', label: 'VOICE CONTROL', icon: <FaMicrophone /> },
    { to: '/setting', label: 'SETTING', icon: <FaCog /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-top">
        <div className="sidebar-header">
          <Link to="/" className="logo-link">
            <div className="logo-container">
              <img src={logoImg} alt="Smart Home Logo" className="logo" />
              {isExpanded && <span className="logo-title">SMART HOME</span>}
            </div>
          </Link>
          <button className="toggle-button" onClick={toggleSidebar}>
            {isExpanded ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>

        <nav className="nav-container">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.to} className="nav-item">
                <Link
                  to={item.to}
                  className={`nav-link ${item.label === activePage ? 'active' : ''}`}
                  title={!isExpanded ? item.label : ''}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {isExpanded && item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="user-profile">
        <div className="user-info">
          <FaUser className="user-icon" />
          {isExpanded && <span>{user?.username || 'User'}</span>}
        </div>
        <button onClick={handleLogout} className="logout-button" title={!isExpanded ? "Logout" : ""}>
          <FaSignOutAlt className="logout-icon" />
          {isExpanded && "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;