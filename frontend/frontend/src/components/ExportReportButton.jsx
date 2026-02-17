import React, { useState } from 'react';
import { exportDashboardToPDF } from '../helpers/exportHelper';
import '../styles/ExportReportButton.css';

/**
 * Export Dashboard to PDF Button Component
 * 
 * @param {Object} props
 * @param {React.RefObject} props.dashboardRef - Reference to dashboard container
 * @param {string} props.reportTitle - Title for the PDF report
 * @param {string} props.fileName - Base filename for download (without .pdf)
 */
const ExportReportButton = ({ 
  dashboardRef, 
  reportTitle = 'Dashboard Report',
  fileName = 'report'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      await exportDashboardToPDF(dashboardRef, reportTitle, fileName);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="export-pdf-btn"
      onClick={handleExport}
      disabled={isLoading}
      title={`Export ${reportTitle} as PDF`}
    >
      {isLoading ? '⏳ Generating PDF...' : '📄 Export PDF'}
    </button>
  );
};

export default ExportReportButton;
