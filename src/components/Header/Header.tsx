import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';
import SearchIcon from '../../assets/icons/search-icon.svg?react';

const Header: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Charging Stations');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Add event listener to detect screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 767);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = [
    'Charging Stations',
    'Fleet Sizing',
    'Parking'
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className={styles.header}>
      {/* Desktop Tab Navigation */}
      <nav className={styles.tabNavigation}>
        {tabs.map(tab => (
          <button
            key={tab}
            className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
            onClick={tab === 'Charging Stations' ? () => handleTabChange(tab) : undefined}
            disabled={tab !== 'Charging Stations'}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Mobile Tab Dropdown */}
      <div className={styles.mobileTabsDropdown}>
        <button 
          className={styles.mobileTabsButton}
          onClick={toggleDropdown}
        >
          {activeTab}
          <span>{isDropdownOpen ? '▲' : '▼'}</span>
        </button>
        <div className={`${styles.dropdownContent} ${isDropdownOpen ? styles.open : ''}`}>
          {tabs.map(tab => (
            <div 
              key={tab}
              className={`${styles.dropdownItem} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.searchBar}>
        <SearchIcon />
        <input type="text" placeholder="Search..." className={styles.searchInput} />
      </div>
    </header>
  );
};

export default Header;