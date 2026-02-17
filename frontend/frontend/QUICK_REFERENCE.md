# PDF Export Feature - Quick Reference Card

## 🚀 30-Second Integration

**AdminAnalysis.jsx:**

```jsx
import { useRef } from "react";
import ExportReportButton from "./ExportReportButton";

function AdminAnalysis({ result, csvData }) {
  const dashboardRef = useRef(null);
  // ... existing code ...
  
  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>📊 Admin Analysis Dashboard</h2>
        <ExportReportButton dashboardRef={dashboardRef} reportTitle="Admin Analytics Report" />
      </div>
      
      <div ref={dashboardRef}>
        <AdminSummaryCard dataset={dataset} />
        <div className="admin-dashboard-wrapper">
          <AnalysisCharts result={result} dataset={dataset} />
          <AdminAttentionPanel dataset={dataset} />
        </div>
      </div>
    </div>
  );
}
```

**StudentAnalysis.jsx:**

```jsx
import { useRef } from "react";
import ExportReportButton from "./ExportReportButton";

function StudentAnalysis({ result, csvData, studentName, studentIndex }) {
  const dashboardRef = useRef(null);
  // ... existing code ...
  
  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>📊 Student Analysis Dashboard</h2>
        <ExportReportButton 
          dashboardRef={dashboardRef} 
          reportTitle={`Student Performance Report - ${validatedName}`}
          fileName={`student-report-${validatedName}`}
        />
      </div>
      
      <div ref={dashboardRef}>
        <StudentDashboard csvData={csvData} studentIndex={studentIndex} />
      </div>
    </div>
  );
}
```

---

## 📦 What You Get

| Item | Location | Purpose |
|------|----------|---------|
| `exportHelper.js` | `src/helpers/` | Core PDF export function |
| `ExportReportButton.jsx` | `src/components/` | Button component |
| `ExportReportButton.css` | `src/styles/` | Button styling |
| Dependencies | `package.json` | html2canvas, jspdf |

---

## ✅ Checklist

- [ ] `npm install` complete (html2canvas + jsPDF should be in node_modules)
- [ ] Added `import useRef` to AdminAnalysis.jsx
- [ ] Added `import ExportReportButton` to AdminAnalysis.jsx
- [ ] Added `const dashboardRef = useRef(null);` to AdminAnalysis
- [ ] Wrapped dashboard content with `<div ref={dashboardRef}>`
- [ ] Added `<ExportReportButton>` component to header
- [ ] Repeated steps for StudentAnalysis.jsx
- [ ] Ran `npm run build` (should show 61 modules, 0 errors)
- [ ] Ran `npm run dev`
- [ ] Tested export button in browser

---

## 🎯 Button Behavior

**Before Click:**
```
📄 Export PDF
```

**While Generating:**
```
⏳ Generating PDF...
```

**After Download:**
```
📄 Export PDF  (ready to click again)
```

---

## 📥 What Gets Downloaded

File: `admin-report-1708086453000.pdf`
- Timestamp auto-added to filename
- Contains: title + all dashboard content
- A4 size, white background, 15mm margins

---

## 🔥 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Reference not found" error | Check `ref={dashboardRef}` is on wrapper div |
| 504 Outdated Optimize Dep | Clear `node_modules/.vite`, hard refresh (Ctrl+Shift+R) |
| Charts missing in PDF | Already handled - function waits for rendering |
| Button doesn't work | Check both imports are present |
| Build fails | Run `npm install` again, clear node_modules/.vite |

---

## 📝 Props Reference

```jsx
<ExportReportButton 
  dashboardRef={dashboardRef}           // ✓ REQUIRED
  reportTitle="Admin Analytics"         // Optional (default: "Dashboard Report")
  fileName="admin-report"               // Optional (default: "report")
/>
```

---

## 🎨 Styling

Button colors:
- **Default**: #238636 (green)
- **Hover**: Darker green
- **Active**: Even darker with inset shadow
- **Disabled**: Gray (#6e7681)

---

## 📞 Need Help?

1. See `EXPORT_INTEGRATION_GUIDE.js` for full examples
2. See `PDF_EXPORT_README.md` for detailed troubleshooting
3. Check browser console F12 for error messages

---

**Status**: ✅ Production-ready | Build: 61 modules, 0 errors
