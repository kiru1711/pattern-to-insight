# Role-Based CSV Analysis System - Quick Reference Guide

## User Flow

### 1. Landing Page
- User sees the "Pattern to Insight" dashboard
- Uploads a CSV file containing student data with a name column

### 2. Role Selection (New!)
- **Automatically shown** after successful CSV upload
- Two options appear:
  - **👨‍💼 Admin / Faculty** - For instructors/administrators
  - **👤 Student / User** - For individual students

### 3. Admin Mode (`/analysis/admin`)
- Displays all 5 analysis charts:
  1. **Comparison Chart** - Shows category performance (bar chart)
  2. **Trend Chart** - Displays trends over time (line chart)
  3. **Distribution Chart** - Shows frequency distribution (histogram)
  4. **Anomaly Chart** - Highlights outliers (scatter plot)
  5. **Threshold Chart** - Shows values above/below threshold
- **No filtering** - Shows complete dataset

### 4. Student Mode (`/analysis/student`)
- **Step 1**: Enter your name
  - Student validates their identity by entering their name
  - System checks against the CSV dataset
  - **Case-insensitive** matching (e.g., "john DOE" = "John Doe")
  - Error message shown if name not found: "Student name not found in dataset"
  
- **Step 2**: View personalized analysis (after validation)
  - Same 5 analysis charts displayed
  - Contains data relevant to individual student
  - "Change Student" button to switch users

## CSV File Requirements

### Expected Format
```csv
Name,Score,Performance,Category
John Doe,85,Good,A
Jane Smith,92,Excellent,A
Bob Johnson,78,Fair,B
...
```

### Key Requirements
- ✅ **First row must be headers** (Name, Student, etc.)
- ✅ **Name column** should be labeled "name", "student", or be the first column
- ✅ **Values should be numeric** where applicable
- ✅ **No special characters** in CSV that break parsing

## File Structure

```
frontend/
└── frontend/
    └── src/
        ├── components/
        │   ├── RoleSelection.jsx         # Role selection screen
        │   ├── AdminAnalysis.jsx         # Admin dashboard
        │   ├── StudentAnalysis.jsx       # Student analysis + validation
        │   └── AnalysisCharts.jsx        # Chart component
        ├── styles/
        │   ├── RoleSelection.css         # Role page styling
        │   └── StudentAnalysis.css       # Student page styling
        ├── App.jsx                        # Main app with routing
        ├── App.css                        # App styling
        ├── index.css                      # Global styling
        └── main.jsx                       # Entry point
```

## How Validation Works

### Name Matching Algorithm
1. **Extracts names** from CSV's first column (or "name" column)
2. **Converts to lowercase** for comparison
3. **Trims whitespace** from user input
4. **Finds exact match** in dataset
5. **Displays error** if no match found

### Example Validations
| User Input | Dataset | Status |
|----------|---------|--------|
| john doe | John Doe | ✅ Valid (case-insensitive) |
| JANE SMITH | Jane Smith | ✅ Valid |
| bob j. | Bob Johnson | ❌ Invalid (partial match) |
| Unknown | - | ❌ Invalid (not in dataset) |

## Backend Integration

### API Endpoint (No Changes Required)
```javascript
POST http://127.0.0.1:8000/upload
```
- Accepts: CSV file via FormData
- Returns: Analysis result with patterns
- **Not modified** - works as before

## Technical Architecture

### State Management
```javascript
// App Level (persists across navigation)
const [result, setResult] = useState(null);      // Analysis data from backend
const [csvData, setCsvData] = useState(null);    // Raw CSV for validation
const [selectedRole, setSelectedRole] = useState(null); // User's role

// Component Level
// RoleSelection: no internal state
// AdminAnalysis: no internal state
// StudentAnalysis: manages input and validation
// AnalysisCharts: reusable chart rendering
```

### Routing
```javascript
BrowserRouter
├── / (Upload Page)
├── /role-selection (Role Selection)
├── /analysis/admin (Admin Dashboard)
└── /analysis/student (Student Dashboard)
```

## Styling

All styling uses the existing dark theme:
- Background: `#0f1117` (GitHub dark)
- Primary text: `#c9d1d9`
- Secondary text: `#8b949e`
- Success/Admin: `#238636` (green)
- Student: `#0969da` (blue)
- Accent: `#58a6ff` (light blue)
- Error: `#f85149` (red)

## Testing Checklist

- [ ] Upload CSV file successfully
- [ ] See role selection screen
- [ ] Click Admin → See all charts
- [ ] Click Student → See validation form
- [ ] Enter valid student name → See analysis
- [ ] Enter invalid name → See error message "Student name not found in dataset"
- [ ] Test case-insensitive: "JOHN DOE" should match "John Doe"
- [ ] Click "Change Student" → Back to validation
- [ ] Mobile responsive on different screen sizes

## Common Issues & Solutions

### Issue: Name validation not working
**Solution**: Ensure CSV has proper headers and names in first/name column

### Issue: Charts not rendering
**Solution**: Verify backend is running on `http://127.0.0.1:8000`

### Issue: Error message not showing
**Solution**: Check browser console for any JavaScript errors

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Browser Support
- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (responsive design)
