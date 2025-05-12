import React from 'react';
import type { ReactElement } from 'react';
import styles from './KpiCard.module.css';

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactElement;
  isLoading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, description, icon, isLoading = false }) => {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.icon}>{icon}</div>
      </div>
      <p className={styles.description}>{description}</p>
      {isLoading ? (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <p className={styles.value}>{value}</p>
      )}
    </div>
  );
};

export default KpiCard; 