# Student POV Comparison Chart - Testing Guide

## Build Status
✅ **Build Successful** - No compilation errors
✅ **All 52 modules transformed**
✅ **Ready to test**

---

## Testing Instructions

### Setup
1. Ensure the dev server is running: `npm run dev`
2. Backend should be running on `http://127.0.0.1:8000`
3. Have a test CSV file with student names ready

### Test CSV Format
```csv
Name,Score,Category
Alice Johnson,95,A
Bob Smith,88,A
Charlie Brown,72,B
Diana Prince,81,A
Eve Wilson,78,B
```

---

## Test Case 1: Admin Mode (Baseline)

**Steps**:
1. Upload CSV file
2. Click "Admin / Faculty"
3. Navigate to Analysis

**Expected Result**:
- Comparison Chart displays with COLORED bars:
  - Highest value: GREEN (#4CAF50)
  - Lowest value: RED (#F44336)
  - Others: BLUE (#2196F3)
- Chart shows: "📊 From the comparison chart, [name] shows the highest performance, while [name] shows the lowest performance."
- Chart is **NOT clickable** (cursor remains default)

**Pass/Fail**: ________

---

## Test Case 2: Student Mode - Highest Performer

**Setup**:
1. Upload the test CSV
2. Click "Student / User"
3. Enter: `Alice Johnson`
4. Click "Verify Name"

**Expected Result - Chart Appearance**:
- Alice's bar: BRIGHT BLUE (#1F6FEB) - **HIGHLIGHTED**
- All other bars: NEUTRAL GRAY (#8B949E)
- Cursor shows **pointer** when hovering chart

**Pass/Fail**: ________

**Expected Result - Initial State**:
- Shows: "💡 Click to know about your analysis"
- Text has light blue background
- Text is NOT clickable yet

**Pass/Fail**: ________

**Expected Result - After First Click**:
- Text changes to: **"You top the dataset."**
- Insight text is larger/different from prompt
- Chart remains highlighted

**Pass/Fail**: ________

**Expected Result - After Second Click**:
- Text changes back to: "💡 Click to know about your analysis"
- Toggle works correctly

**Pass/Fail**: ________

---

## Test Case 3: Student Mode - Lowest Performer

**Setup**:
1. Upload the test CSV
2. Click "Student / User"
3. Enter: `Charlie Brown`
4. Click "Verify Name"

**Expected Result - Chart Appearance**:
- Charlie's bar: BRIGHT BLUE (#1F6FEB) - **HIGHLIGHTED**
- All other bars: NEUTRAL GRAY (#8B949E)

**Pass/Fail**: ________

**Expected Result - After Click**:
- Shows: **"You are currently at the bottom of the dataset and need improvement."**
- Specific to lowest performer insight

**Pass/Fail**: ________

---

## Test Case 4: Student Mode - Middle Performer

**Setup**:
1. Upload the test CSV
2. Click "Student / User"
3. Enter: `Diana Prince` (value: 81)
4. Click "Verify Name"

**Expected Result - Chart Appearance**:
- Diana's bar: BRIGHT BLUE (#1F6FEB) - **HIGHLIGHTED**
- Others: GRAY (#8B949E)

**Pass/Fail**: ________

**Expected Result - Initial Prompt**:
- Shows: "💡 Click to know about your analysis"

**Pass/Fail**: ________

**Expected Result - After Click**:
Should show:
```
"You are X% away from the next higher performer and Y% away from topping the dataset."
```

**Calculation Verification**:
- Student value: 81
- Next higher: 88 (Bob)
- Top value: 95 (Alice)

Expected percentages:
- To next: ((88 - 81) / 81 * 100) = 8.6%
- To top: ((95 - 81) / 81 * 100) = 17.3%

Actual text: ________________________________

**Pass/Fail**: ________

---

## Test Case 5: Case-Insensitive Matching

**Setup**:
1. Upload CSV
2. Click "Student / User"
3. Try different name variations:
   - `ALICE JOHNSON`
   - `alice johnson`
   - `Alice`
   - `Alice Johnson` (exact)

**Expected Result**:
All variations should match Alice successfully

**Pass/Fail**: ________

---

## Test Case 6: Invalid Name Handling

**Setup**:
1. Upload CSV
2. Click "Student / User"
3. Enter: `Unknown Student`
4. Click "Verify Name"

**Expected Result**:
- Error message: "Student name not found in dataset"
- Chart insight shows fallback: "Your data could not be found in the dataset."
- Still shows prompt (not shown as error in comparison)

**Pass/Fail**: ________

---

## Test Case 7: "Change Student" Button

**Setup**:
1. Complete validation as Diana Prince
2. View her analysis
3. Click "Change Student" button

**Expected Result**:
- Returns to name input form
- Previous student name cleared
- Insight state reset
- Can enter new student name

**Pass/Fail**: ________

---

## Test Case 8: Responsive Design

**Test on different screen sizes**:

### Desktop (1200px+)
- Chart displays properly in grid
- Bars are readable
- Prompt text is visible
- Click functionality works

**Pass/Fail**: ________

### Tablet (768px)
- Chart resizes appropriately
- Bars still distinguishable
- Text remains readable
- Layout responsive

**Pass/Fail**: ________

### Mobile (480px)
- Chart fits on screen
- No horizontal scroll needed
- Touch-friendly clicking
- Text wraps properly

**Pass/Fail**: ________

---

## Test Case 9: Browser Compatibility

Test in different browsers:

| Browser | Version | Tested | Result |
|---------|---------|--------|--------|
| Chrome | Latest | ☐ | Pass/Fail |
| Firefox | Latest | ☐ | Pass/Fail |
| Safari | Latest | ☐ | Pass/Fail |
| Edge | Latest | ☐ | Pass/Fail |

---

## Test Case 10: Other Charts Unaffected

**Setup**:
1. Upload CSV as student
2. Validate name
3. Scroll through all charts

**Expected Result**:
- Trend Chart: Works normally (no changes)
- Distribution Chart: Works normally (no changes)
- Anomaly Chart: Works normally (no changes)
- Threshold Chart: Works normally (no changes)
- **ONLY** Comparison Chart has student POV

**Pass/Fail**: ________

---

## Test Case 11: Color Contrast

**Visual Check**:
- Bar highlighting is clearly visible
- Blue (#1F6FEB) stands out from gray (#8B949E)
- Text is readable against background
- No accessibility issues

**Pass/Fail**: ________

---

## Test Case 12: Insight Accuracy

**Setup**:
Create a test CSV with known values:
```csv
Name,Value
A,100
B,80
C,60
D,90
```

Test each:
1. **A (100)** → "You top the dataset." ✓
2. **B (80)** → Should show: "You are X% away from... and Y% away..."
3. **C (60)** → "You are currently at the bottom..." ✓
4. **D (90)** → Should show: "You are X% away from... and Y% away..."

**Excel check for B (80)**:
- Next higher: 90 → ((90-80)/80*100) = 12.5%
- To top: 100 → ((100-80)/80*100) = 25.0%
- Expected: "You are 12.5% away from the next higher performer and 25.0% away from topping the dataset."

**Recorded Results**:
- A: __________ ✓/✗
- B: __________ ✓/✗
- C: __________ ✓/✗
- D: __________ ✓/✗

---

## Performance Testing

### Admin Mode
- Load time: __________ ms
- Chart render time: __________ ms

### Student Mode
- Load time: __________ ms
- Chart render time: __________ ms
- Chart interaction (click): __________ ms

**Expected**: < 500ms for all

**Pass/Fail**: ________

---

## Edge Cases

### Edge Case 1: Single Value
**CSV**: 
```csv
Name,Value
Alice,50
```

**Expected**: "You top the dataset?" (or similar)

**Result**: __________

**Pass/Fail**: ________

### Edge Case 2: All Same Values
**CSV**:
```csv
Name,Value
A,50
B,50
C,50
```

**Expected**: "You top the dataset." (tied for top)

**Result**: __________

**Pass/Fail**: ________

### Edge Case 3: Decimal Values
**CSV**:
```csv
Name,Value
A,99.5
B,88.3
C,72.1
```

**Expected**: Calculations work correctly with decimals

**Result**: __________

**Pass/Fail**: ________

---

## Console Errors

**No errors expected**

Check browser DevTools Console:
- ☐ No JavaScript errors
- ☐ No console warnings
- ☐ No 404 errors
- ☐ No CORS issues

**Result**: __________

---

## Summary Checklist

- [ ] Comparison Chart shows student POV in student mode
- [ ] Student bar highlighted correctly
- [ ] Prompt shows by default
- [ ] Insight calculates correctly for all positions
- [ ] Click toggle works
- [ ] Case-insensitive matching works
- [ ] Other charts unaffected
- [ ] Admin mode still works
- [ ] No console errors
- [ ] Build successful
- [ ] Responsive on all screen sizes
- [ ] All browsers compatible

**Overall Result**: ✅ PASS / ❌ FAIL

---

## Notes & Issues Found

```
Issue #1: ________________________________________________________________
Resolution: ____________________________________________________________

Issue #2: ________________________________________________________________
Resolution: ____________________________________________________________

Issue #3: ________________________________________________________________
Resolution: ____________________________________________________________
```

---

## Screenshots to Document

- [ ] Admin mode comparison chart
- [ ] Student mode with highlighted bar
- [ ] Prompt before clicking
- [ ] Insight after clicking (top performer)
- [ ] Insight after clicking (bottom performer)
- [ ] Insight after clicking (middle performer)
- [ ] Mobile view
- [ ] Tablet view

---

## Sign-off

**Tested By**: ________________________
**Date**: ________________________
**Result**: ✅ APPROVED / ❌ NEEDS FIXES
**Comments**: ________________________________________________________________

---

## Known Limitations

1. Chart does not show interactive tooltips for bars (Chart.js limitation)
2. Name matching is case-insensitive but requires substring match
3. Percentage calculations assume different students (not ties)

## Future Enhancements

1. Animated highlight when first rendered
2. Tooltip showing exact percentages
3. Ranking position indicator (e.g., "3rd out of 5")
4. Visual indicator for students in same performance tier
