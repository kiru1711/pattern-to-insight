'''Goal: Add SQLite database support and store student data from uploaded CSV files without changing the existing analytics logic.

Requirements:

1. Use SQLite with SQLAlchemy in a FastAPI backend.

2. Create database configuration:

   * File: database.py
   * Configure SQLite engine
   * Create SessionLocal and Base using SQLAlchemy
   * Provide a dependency to access the database session.

3. Create a Student model:

   * File: models.py
   * Table name: students
   * Columns:
     id (primary key, integer, auto increment)
     name (string)
     scores (JSON)
     average (float)

4. When a CSV file is uploaded and processed:

   * Read the CSV file.
   * Treat every column except "Name" as a subject.
   * Store subject scores as a JSON dictionary.
   * Calculate the average using all subject values.
   * Insert each student record into the SQLite database.

5. Ensure database tables are created automatically when the FastAPI server starts.

6. Important constraints:

   * Do not modify existing analytics logic.
   * Do not change existing API responses.
   * Only extend the backend to store processed CSV data in the database.

Expected behavior:
CSV upload → process data → save each student (name, subject scores, average) into the SQLite database.
'''
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from io import BytesIO
import pandas as pd
import re
from services.validator import validate_dataset
from services.patterns import (
    comparison_pattern,
    trend_pattern,
    correlation_pattern,
    distribution_pattern,
    anomaly_pattern,
    threshold_pattern
)

# Import database components
from database import engine, get_db
from models import Base, Student, Admin
from passlib.context import CryptContext
from pydantic import BaseModel

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ============================================================
# Validation Helper Functions
# ============================================================

def validate_email(email: str) -> bool:
    """
    Validate email format using regex.
    
    Args:
        email: Email string to validate
        
    Returns:
        True if valid email format, False otherwise
    """
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None


def validate_password(password: str) -> tuple[bool, str]:
    """
    Validate password meets security requirements:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 digit
    - At least 1 special character
    
    Args:
        password: Password string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least 1 uppercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least 1 digit"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least 1 special character"
    
    return True, ""


# ============================================================
# Pydantic Models for Request/Response Validation
# ============================================================

class StudentValidationRequest(BaseModel):
    name: str


class StudentCreateRequest(BaseModel):
    name: str
    scores: dict  # Dictionary of subject names to scores


class AdminRegisterRequest(BaseModel):
    username: str
    password: str


class AdminLoginRequest(BaseModel):
    username: str
    password: str


app = FastAPI()

# Create database tables on startup
@app.on_event("startup")
def startup_event():
    """Create all database tables when the application starts"""
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://pattern-to-insight.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "backend running"}


@app.post("/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = (file.filename or "").strip()
    if not filename.lower().endswith(".csv"):
        return {"error": "Only CSV files are supported"}

    try:
        file_content = await file.read()
        if not file_content:
            return {"error": "Uploaded file is empty"}

        df = pd.read_csv(BytesIO(file_content))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read CSV file: {str(exc)}") from exc
    finally:
        await file.close()

    is_valid, result = validate_dataset(df)

    if not is_valid:
        return {"valid": False, "message": result}

    numeric_col = result["numeric_columns"][0]
    categorical_col = result["categorical_columns"][0]

    patterns = {
    "comparison": comparison_pattern(df, categorical_col, numeric_col),
    "trend": trend_pattern(df, numeric_col),
    "correlation": correlation_pattern(df, numeric_col),
    "distribution": distribution_pattern(df, numeric_col),
    "anomaly": anomaly_pattern(df, numeric_col),
    "threshold": threshold_pattern(df, numeric_col)
}

    # ============================================================
    # NEW: Store student data in SQLite database
    # ============================================================
    # Check if the CSV contains student data (has "Name" column)
    if "Name" in df.columns:
        # Get all column names except "Name" - these are subjects
        subject_columns = [col for col in df.columns if col != "Name"]
        
        # Process each student record
        for _, row in df.iterrows():
            student_name = str(row["Name"]).strip()
            
            # Extract scores for all subjects
            scores_dict = {}
            for subject in subject_columns:
                try:
                    subject_value = row[subject]
                    if pd.isna(subject_value):
                        scores_dict[subject] = 0.0
                    else:
                        scores_dict[subject] = float(subject_value)
                except (ValueError, TypeError):
                    scores_dict[subject] = 0.0
            
            # Calculate average across all subjects
            if scores_dict:
                average_score = sum(scores_dict.values()) / len(scores_dict)
            else:
                average_score = 0.0
            
            # Check if student already exists
            existing_student = db.query(Student).filter(Student.name == student_name).first()
            
            if existing_student:
                # Update existing student
                existing_student.scores = scores_dict
                existing_student.average = average_score
            else:
                # Create new student record
                new_student = Student(
                    name=student_name,
                    scores=scores_dict,
                    average=average_score
                )
                db.add(new_student)
        
        # Commit all changes to database
        try:
            db.commit()
        except Exception as exc:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to store student data: {str(exc)}") from exc

    return {
    "valid": True,
    "message": "Dataset processed successfully",
    "patterns": patterns
}


@app.get("/test")
def test_route():
    return {"test": "route works"}


# ============================================================
# NEW: Student Data CRUD Endpoints
# ============================================================

@app.get("/students")
def get_all_students(db: Session = Depends(get_db)):
    """
    Get all students from the database.
    Returns: List of all student records with their scores and averages
    """
    students = db.query(Student).all()
    return [
        {
            "id": student.id,
            "name": student.name,
            "scores": student.scores,
            "average": student.average
        }
        for student in students
    ]


@app.get("/students/{student_id}")
def get_student(student_id: int, db: Session = Depends(get_db)):
    """
    Get a specific student by ID.
    Returns: Student record with scores and average
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return {"error": "Student not found"}
    
    return {
        "id": student.id,
        "name": student.name,
        "scores": student.scores,
        "average": student.average
    }


@app.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    """
    Delete a student by ID.
    Returns: Success message
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return {"error": "Student not found"}
    
    student_name = student.name
    db.delete(student)
    db.commit()
    
    return {"message": f"Student {student_name} deleted successfully"}


# ============================================================
# NEW: Student Validation Endpoint
# ============================================================

@app.post("/student/validate")
def validate_student(request: StudentValidationRequest, db: Session = Depends(get_db)):
    """
    Validate if a student exists in the database by name.
    
    Args:
        request: StudentValidationRequest containing the student name
        
    Returns:
        Student record with scores and analytics if found,
        or error message if not found
    """
    student_name = request.name.strip()
    
    # Query database for student by name
    student = db.query(Student).filter(Student.name == student_name).first()
    
    if not student:
        return {
            "valid": False,
            "error": "Student not found in database",
            "message": f"No student record found for '{student_name}'"
        }
    
    # Return student data and analytics
    return {
        "valid": True,
        "student": {
            "id": student.id,
            "name": student.name,
            "scores": student.scores,
            "average": student.average
        },
        "message": "Student validated successfully"
    }


# ============================================================
# NEW: Admin Authentication Endpoints
# ============================================================

@app.post("/admin/register")
def register_admin(request: AdminRegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new admin user with email and password validation.
    
    Requirements:
    - Username must be a valid email format
    - Password must have min 8 chars, 1 uppercase, 1 digit, 1 special char
    
    Args:
        request: AdminRegisterRequest containing username and password
        
    Returns:
        Success message or error if validation fails or username already exists
    """
    username = request.username.strip()
    password = request.password
    
    # Validate email format
    if not validate_email(username):
        return {
            "success": False,
            "error": "Invalid email format",
            "message": "Username must be a valid email address (e.g., user@gmail.com)"
        }
    
    # Validate password requirements
    password_valid, password_error = validate_password(password)
    if not password_valid:
        return {
            "success": False,
            "error": "Invalid password",
            "message": password_error
        }
    
    # Check if username already exists
    existing_admin = db.query(Admin).filter(Admin.username == username).first()
    
    if existing_admin:
        return {
            "success": False,
            "error": "Admin already exists",
            "message": "Admin already registered. Please login."
        }
    
    # Hash the password
    password = password[:72]
    hashed_password = pwd_context.hash(password)
    
    # Create new admin
    new_admin = Admin(
        username=username,
        password=hashed_password
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    return {
        "success": True,
        "message": "Account successfully created. Please login.",
        "admin_id": new_admin.id
    }


@app.post("/admin/login")
def login_admin(request: AdminLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate admin user.
    
    Args:
        request: AdminLoginRequest containing username and password
        
    Returns:
        Success message with admin info if credentials are valid,
        specific error messages for different failure cases
    """
    username = request.username.strip()
    password = request.password
    
    # Query admin by username
    admin = db.query(Admin).filter(Admin.username == username).first()
    
    if not admin:
        return {
            "authenticated": False,
            "error": "Admin not found",
            "message": "Admin not found. Please register."
        }
    
    # Verify password
    if not pwd_context.verify(password, admin.password):
        return {
            "authenticated": False,
            "error": "Invalid credentials",
            "message": "Invalid credentials."
        }
    
    # Authentication successful
    return {
        "authenticated": True,
        "message": "Login successful",
        "admin": {
            "id": admin.id,
            "username": admin.username
        }
    }


# ============================================================
# NEW: Student Management Endpoints
# ============================================================

@app.post("/students")
def create_student(request: StudentCreateRequest, db: Session = Depends(get_db)):
    """
    Create a new student with name and subject scores.
    
    Args:
        request: StudentCreateRequest containing name and scores dictionary
        db: Database session
        
    Returns:
        Created student information with calculated average
    """
    name = request.name.strip()
    scores = request.scores
    
    # Validate scores is a non-empty dictionary
    if not scores or not isinstance(scores, dict):
        return {
            "success": False,
            "error": "Invalid scores",
            "message": "Scores must be a non-empty dictionary"
        }
    
    # Calculate average from all subject scores
    try:
        score_values = [float(score) for score in scores.values()]
        average = sum(score_values) / len(score_values)
    except (ValueError, TypeError) as e:
        return {
            "success": False,
            "error": "Invalid score values",
            "message": "All scores must be numeric values"
        }
    
    # Check if student already exists
    existing_student = db.query(Student).filter(Student.name == name).first()
    if existing_student:
        return {
            "success": False,
            "error": "Student already exists",
            "message": f"A student with name '{name}' already exists"
        }
    
    # Create new student
    new_student = Student(
        name=name,
        scores=scores,
        average=average
    )
    
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    return {
        "success": True,
        "message": "Student created successfully",
        "student": {
            "id": new_student.id,
            "name": new_student.name,
            "scores": new_student.scores,
            "average": new_student.average
        }
    }
