# Export Dashboard to PDF - Implementation Guide

## ✅ What's Included

This is a **stable, non-invasive** PDF export feature that adds export functionality without modifying existing components, charts, or layout.

### Files Created:

1. **`src/helpers/exportHelper.js`** - Core export logic
2. **`src/components/ExportReportButton.jsx`** - Button component  
3. **`src/styles/ExportReportButton.css`** - Button styling
4. **`EXPORT_INTEGRATION_GUIDE.js`** - Integration examples

### Dependencies Added:

- `html2canvas@^1.4.1` - Captures DOM to canvas/image
- `jspdf@^2.5.1` - Generates PDF files

---

## 📋 Quick Start (5 Minutes)

### Step 1: Install Dependencies ✓
```bash
npm install html2canvas jspdf
```
*Already done if using current package.json*

### Step 2: Add to AdminAnalysis.jsx

At the top of file, add:
```jsx
import { useRef } from "react";
import ExportReportButton from "./ExportReportButton";
```

Inside component, add ref:
```jsx
function AdminAnalysis({ result, csvData }) {
  const dashboardRef = useRef(null);  // ADD THIS
  // ... rest of component
```

Change the return statement header:
```jsx
return (
  <div className="app-container">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <h2>📊 Admin Analysis Dashboard</h2>
      <ExportReportButton 
        dashboardRef={dashboardRef} 
        reportTitle="Admin Analytics Report"
        fileName="admin-report"
      />
    </div>

    {/* WRAP YOUR DASHBOARD CONTENT WITH REF */}
    <div ref={dashboardRef}>
      <AdminSummaryCard dataset={dataset} />
      <div className="admin-dashboard-wrapper">
        <AnalysisCharts result={result} dataset={dataset} />
        <AdminAttentionPanel dataset={dataset} />
      </div>
    </div>
  </div>
);
```

### Step 3: Add to StudentAnalysis.jsx

Same pattern - add imports, useRef, ExportReportButton, and wrapper div.

See `EXPORT_INTEGRATION_GUIDE.js` for full StudentAnalysis example.

### Step 4: Build & Test
```bash
npm run build
npm run dev
```

---

## 🎯 Features

✅ **Stable Implementation**
- Waits for Chart.js rendering (500ms + requestAnimationFrame)
- Proper error handling with console logs
- No errors on null refs or missing elements

✅ **Quality PDF Output**
- 2x scale for crisp rendering
- Properly sized to A4 page (210mm width)
- Auto-fits content with margins (15mm)
- Multi-page support for long dashboards

✅ **User-Friendly**
- Single "📄 Export PDF" button
- Shows "⏳ Generating PDF..." while processing
- Auto-downloads with timestamp: `admin-report-1708086453000.pdf`

✅ **Complete Capture**
- Summary cards
- All 5 charts (Comparison, Trend, Distribution, Anomaly, Threshold)
- Insights panels
- Attention panels
- Complete dashboard layout as-is

---

## 🔧 Component Props

### ExportReportButton

```jsx
<ExportReportButton 
  dashboardRef={dashboardRef}           // Required: React ref to container
  reportTitle="Custom Report Title"     // Optional: Shown in PDF. Default: "Dashboard Report"
  fileName="my-report"                  // Optional: Download filename. Default: "report"
/>
```

---

## 📊 What Gets Exported

The PDF includes:

**Header Section:**
- Report title (e.g., "Admin Analytics Report")
- Generation date and time

**Content Section:**
- Everything inside the `<div ref={dashboardRef}>` container
- All charts, cards, panels, and insights
- Maintains colors and layout from dashboard

**Format:**
- Single page or multiple pages (auto-detected)
- A4 size (210mm × 297mm)
- 15mm margins
- White background for printing

---

## 🚀 How It Works

1. **Waits for rendering** (500ms timeout + requestAnimationFrame)
   - Ensures Chart.js has time to draw
   - Waits for DOM layout to complete

2. **Captures container** using html2canvas
   - `scale: 2` for high quality
   - `useCORS: true` for external resources
   - `allowTaint: true` for cross-origin images
   - Ignores buttons and inputs

3. **Creates PDF** with jsPDF
   - Converts canvas image to PDF
   - Adds title and metadata
   - Handles multi-page automatically

4. **Downloads** with timestamp
   - Filename: `{fileName}-{timestamp}.pdf`
   - Example: `admin-report-1708086453000.pdf`

---

## ⚠️ Troubleshooting

### "Dashboard reference not found"
- Make sure `ref={dashboardRef}` is on the div wrapping dashboard content
- Check ref is properly initialized: `const dashboardRef = useRef(null);`

### "Failed to load resource: 504 (Outdated Optimize Dep)"
- Clear Vite cache:
  ```bash
  rmdir /s node_modules\.vite
  // or delete node_modules/.vite folder manually
  ```
- Hard refresh browser: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)

### Charts look blank in PDF
- This is normal for Chart.js. Function waits 500ms before capturing.
- To increase wait time, edit `exportHelper.js`:
  ```javascript
  await new Promise(resolve => setTimeout(resolve, 1000)); // Increase to 1000ms
  ```

### Content cut off at edges
- Margins auto-fit content to page width
- If still cutting off, reduce margin in exportHelper.js:
  ```javascript
  const margin = 10; // Reduce from 15
  ```

### PDF looks blurry
- Scale is already set to 2 for quality
- This is the best possible quality with html2canvas

---

## 📁 File Structure

```
src/
├── helpers/
│   └── exportHelper.js              # Core export logic
├── components/
│   ├── AdminAnalysis.jsx            # ← MODIFY: Add ref + button
│   ├── StudentAnalysis.jsx          # ← MODIFY: Add ref + button
│   ├── ExportReportButton.jsx       # NEW: Button component
│   └── ...
├── styles/
│   ├── ExportReportButton.css       # NEW: Button styles
│   └── ...
└── ...
```

---

## 🎨 Button Styling

The button uses the same dark theme as your dashboard:
- Green (#238636) on light backgrounds
- White text
- Hover and active states included
- Responsive on mobile devices

CSS classes available:
- `.export-pdf-btn` - Main button
- Has hover, active, focus, and disabled states

---

## 💾 Package.json Update

`package.json` now includes:
```json
"dependencies": {
  "html2canvas": "^1.4.1",
  "jspdf": "^2.5.1",
  ...
}
```

---

## ✨ Best Practices

1. **Always use `useRef`** for dashboard container
2. **Place button in header** for visibility
3. **Provide meaningful `reportTitle`** for each dashboard
4. **Test exports** with various dashboard sizes
5. **Check multi-page PDFs** by exporting long dashboards

---

## 🔒 No Breaking Changes

- ✅ No existing components modified
- ✅ No chart configuration changed
- ✅ No layout structure altered
- ✅ Purely additive feature
- ✅ Fully compatible with current code

---

## 📞 Support

If issues arise:
1. Check browser console for errors
2. Clear `.vite` cache and hard refresh
3. Verify ref is attached to correct container
4. Check that export button has valid dashboardRef

See `EXPORT_INTEGRATION_GUIDE.js` for full examples and integration patterns.
