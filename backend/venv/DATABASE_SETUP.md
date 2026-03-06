# SQLite Database Integration - Setup Guide

## What Was Added

✅ **Database Configuration** ([database.py](database.py))
- SQLite engine with SQLAlchemy
- Session management
- Database dependency injection

✅ **Student Model** ([models.py](models.py))
- Table: `students`
- Columns: `id`, `name`, `scores` (JSON), `average`
- Automatically stores dynamic subject scores

✅ **Enhanced CSV Upload** ([main.py](main.py))
- Existing pattern analysis logic **unchanged**
- NEW: Automatically stores student data when CSV has "Name" column
- Dynamically detects subjects (all columns except "Name")
- Calculates and stores average scores

✅ **New API Endpoints**
- `GET /students` - Get all students
- `GET /students/{id}` - Get specific student
- `DELETE /students/{id}` - Delete student

---

## Setup Instructions

### 1. Install SQLAlchemy

```bash
cd backend/venv
pip install sqlalchemy
```

Or install all dependencies:
```bash
pip install -r requirements.txt
```

### 2. Start the Server

```bash
uvicorn main:app --reload
```

The `students.db` database will be created automatically on startup.

---

## How It Works

### CSV Format for Student Data

```csv
Name,Math,Biology,Physics,Chemistry
Alice,78,82,91,85
Bob,65,70,72,68
Charlie,88,76,85,90
```

**Rules:**
- Must have a "Name" column
- All other columns are treated as subjects
- Scores must be numeric
- Dynamic - works with any number of subjects

### What Happens on Upload

1. **Pattern analysis runs** (existing logic - unchanged)
2. **If CSV has "Name" column:**
   - Detects subjects: `["Math", "Biology", "Physics", "Chemistry"]`
   - Extracts scores for each student
   - Calculates average: `sum(scores) / count(subjects)`
   - Stores in SQLite database

### Database Storage

**Example stored record:**
```json
{
  "id": 1,
  "name": "Alice",
  "scores": {
    "Math": 78,
    "Biology": 82,
    "Physics": 91,
    "Chemistry": 85
  },
  "average": 84.0
}
```

---

## Testing

### Option 1: Use Sample Data

```bash
# Upload the sample student data
curl -X POST -F "file=@sample_student_data.csv" http://localhost:8000/upload
```

### Option 2: Check Stored Students

```bash
# Get all students
curl http://localhost:8000/students

# Get specific student (ID 1)
curl http://localhost:8000/students/1

# Delete student (ID 1)
curl -X DELETE http://localhost:8000/students/1
```

### Option 3: Use Swagger UI

```
http://localhost:8000/docs
```

---

## API Responses

### POST /upload

**Response** (unchanged from before + database storage):
```json
{
  "valid": true,
  "message": "Dataset processed successfully",
  "patterns": {
    "comparison": {...},
    "trend": {...},
    ...
  }
}
```

**Side effect:** Data stored in SQLite if CSV has "Name" column.

### GET /students

```json
[
  {
    "id": 1,
    "name": "Alice",
    "scores": {"Math": 78, "Biology": 82, "Physics": 91, "Chemistry": 85},
    "average": 84.0
  },
  {
    "id": 2,
    "name": "Bob",
    "scores": {"Math": 65, "Biology": 70, "Physics": 72, "Chemistry": 68},
    "average": 68.75
  }
]
```

### GET /students/{id}

```json
{
  "id": 1,
  "name": "Alice",
  "scores": {"Math": 78, "Biology": 82, "Physics": 91, "Chemistry": 85},
  "average": 84.0
}
```

### DELETE /students/{id}

```json
{
  "message": "Student Alice deleted successfully"
}
```

---

## Key Features

✅ **Dynamic Subject Detection**
- Works with any subjects: Math, English, Science, History, etc.
- No hardcoding of subject names
- Flexible for different CSV formats

✅ **Automatic Storage**
- No manual database operations needed
- Students are stored/updated automatically on CSV upload

✅ **Non-Breaking Changes**
- Existing pattern analysis unchanged
- All existing API responses preserved
- Database storage is a transparent add-on

✅ **CRUD Operations**
- Query all students
- Get individual records
- Delete students when needed

---

## Database Location

```
backend/venv/students.db
```

The SQLite database file is created automatically when you start the server.

---

## Important Notes

⚠️ **Existing Logic Preserved:**
- Pattern analysis still works exactly the same
- All existing endpoints return the same responses
- Database storage is optional (only happens if "Name" column exists)

✅ **What Changed:**
- Added database configuration files
- Enhanced `/upload` endpoint with storage logic
- Added new `/students` endpoints for querying data
- Updated requirements.txt with SQLAlchemy

✅ **What Didn't Change:**
- Pattern analysis algorithms
- Validator logic
- API response structures
- Frontend compatibility

---

## Troubleshooting

### "Module 'sqlalchemy' not found"
```bash
pip install sqlalchemy
```

### "Database is locked"
- Close all other server instances
- Restart the server

### "Student data not saving"
- Make sure CSV has a "Name" column
- Check that other columns contain numeric values
- Verify the server started successfully

---

## Next Steps

1. ✅ Install SQLAlchemy: `pip install sqlalchemy`
2. ✅ Start server: `uvicorn main:app --reload`
3. ✅ Upload CSV with student data
4. ✅ Query students: `GET /students`
5. ✅ Check `students.db` file created

**Your backend now has persistent SQLite storage! 🎉**
