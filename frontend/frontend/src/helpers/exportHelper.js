import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Stable export function for dashboard PDF
 * Captures dashboard container, waits for rendering, converts to PDF
 * 
 * @param {React.RefObject} dashboardRef - Reference to dashboard container div
 * @param {string} reportTitle - Report title (e.g., "Admin Analytics Report")
 * @param {string} fileName - Output filename without .pdf extension
 * @returns {Promise<void>}
 */
export const exportDashboardToPDF = async (dashboardRef, reportTitle = 'Dashboard Report', fileName = 'report') => {
  if (!dashboardRef?.current) {
    console.error('Dashboard reference not found');
    return;
  }

  try {
    // Wait for Chart.js and all DOM elements to fully render
    await new Promise(resolve => setTimeout(resolve, 500));
    await new Promise(resolve => requestAnimationFrame(resolve));

    const dashboardElement = dashboardRef.current;

    // Configure html2canvas for stability
    const canvas = await html2canvas(dashboardElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowHeight: dashboardElement.scrollHeight,
      windowWidth: dashboardElement.scrollWidth,
      ignoreElements: (element) => {
        // Ignore buttons, inputs, and other UI elements
        const tagName = element.tagName.toLowerCase();
        return tagName === 'button' || tagName === 'input' || tagName === 'select';
      },
    });

    // Get canvas dimensions
    const imgWidth = 210; // A4 page width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const _pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;

    // Add report title
    pdf.setFontSize(16);
    pdf.setTextColor(40, 40, 40);
    pdf.text(reportTitle, margin, margin + 5);

    // Add metadata
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleString();
    pdf.text(`Generated: ${dateStr}`, margin, margin + 15);

    // Calculate available space for content
    const contentStartY = margin + 25;
    const contentHeight = pageHeight - contentStartY - margin;

    // Convert canvas to image and handle single/multi-page
    if (imgHeight <= contentHeight) {
      // Fits on single page
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        contentStartY,
        imgWidth - (margin * 2),
        imgHeight
      );
    } else {
      // Multi-page: split canvas into sections, one per page
      const pxPerMm = canvas.height / imgHeight;
      const contentHeightPx = contentHeight * pxPerMm;
      const pageCount = Math.ceil(imgHeight / contentHeight);

      for (let pageNum = 0; pageNum < pageCount; pageNum++) {
        // Add new page (except for first page)
        if (pageNum > 0) {
          pdf.addPage();
        }

        // Calculate crop area in pixels
        const startPx = pageNum * contentHeightPx;
        const endPx = Math.min(startPx + contentHeightPx, canvas.height);
        const cropHeight = endPx - startPx;

        // Create temporary canvas for this page section
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = cropHeight;

        const ctx = pageCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, startPx, canvas.width, cropHeight, 0, 0, canvas.width, cropHeight);

        // Convert cropped section to image
        const pageImgData = pageCanvas.toDataURL('image/png');
        const pageImgHeight = (cropHeight * imgWidth) / canvas.width;

        // Add image to PDF
        pdf.addImage(
          pageImgData,
          'PNG',
          margin,
          pageNum === 0 ? contentStartY : margin,
          imgWidth - (margin * 2),
          pageImgHeight
        );
      }
    }

    // Download PDF
    pdf.save(`${fileName}-${currentDate.getTime()}.pdf`);

  } catch (error) {
    console.error('Error exporting PDF:', error);
    alert('Failed to export PDF. Check console for details.');
  }
};
