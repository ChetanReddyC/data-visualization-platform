import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
// Svg icons imports
import MenuIcon from '../../assets/icons/menu-icon.svg?react';
import HomeIcon from '../../assets/icons/home-icon.svg?react';
import BellIcon from '../../assets/icons/bell-icon.svg?react';
import ClipboardIcon from '../../assets/icons/clipboard-text-clock.svg?react';
import CloudUploadIcon from '../../assets/icons/cloud-upload.svg?react';
import CogIcon from '../../assets/icons/settings-icon.svg?react';
import AccountCircleIcon from '../../assets/icons/account-circle.svg?react';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const location = useLocation();

  // Add event listener to detect screen resize
  useEffect(() => {
    const handleResize = () => {
      const mobileViewDetected = window.innerWidth <= 991;
      setIsMobileView(mobileViewDetected);
      

      if (mobileViewDetected && !isMobileView) {
        setTimeout(() => {
          setShowMobileNav(true);
        }, 300);
      } else {
        setShowMobileNav(mobileViewDetected);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileView]);

  const toggleSidebar = () => {
    if (!isMobileView) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Navigation menu items - now including settings and profile for bottom nav
  const navItems = [
    { path: "/home", label: "Home", icon: <HomeIcon /> },
    { path: "/notifications", label: "Notifications", icon: <BellIcon /> },
    { path: "/history", label: "History", icon: <ClipboardIcon /> },
    { path: "/upload", label: "Upload", icon: <CloudUploadIcon /> },
    { path: "/settings", label: "Settings", icon: <CogIcon /> },
    { path: "/profile", label: "Profile", icon: <AccountCircleIcon /> }
  ];

  // Sidebar classes
  const sidebarClasses = `
    ${styles.sidebar} 
    ${isCollapsed ? styles.collapsed : ''}
  `;

  // Mobile nav classes with animation
  const mobileNavClasses = `
    ${styles.bottomMobileNav}
    ${showMobileNav ? styles.visible : ''}
  `;

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      {!isMobileView && (
        <nav className={sidebarClasses}>
          <div className={styles.logoSection}>
            <button onClick={toggleSidebar} className={styles.menuButton} aria-label="Toggle sidebar">
              <MenuIcon />
            </button>
          </div>

          <ul className={styles.menuItems}>
            {navItems.slice(0, 5).map(item => (
              <li key={item.path} className={styles.menuItem}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className={styles.profileSection}>
            <Link to="/profile" className={`${styles.navLink} ${styles.profileLink}`}>
              <AccountCircleIcon />
              {!isCollapsed && <span>Profile</span>}
            </Link>
          </div>
        </nav>
      )}
      
      {/* Bottom mobile navigation for all items */}
      {isMobileView && (
        <div className={mobileNavClasses}>
          {/* Show all navigation items in the bottom bar */}
          {navItems.map((item, index) => (
            <NavLink 
              key={`mobile-${item.path}`}
              to={item.path}
              className={({ isActive }) => isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink}
              aria-label={item.label}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {item.icon}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
};

export default Sidebar; 