import pandas as pd

def validate_dataset(df: pd.DataFrame):
    # Rule 1: Minimum rows
    if len(df) <= 10:
        return False, "Dataset must contain more than 10 rows"

    # Identify column types
    numeric_cols = df.select_dtypes(include=["number"]).columns
    categorical_cols = df.select_dtypes(exclude=["number"]).columns

    # Rule 2: At least one numerical column
    if len(numeric_cols) < 1:
        return False, "Dataset must contain at least one numerical column"

    # Rule 3: At least one categorical column
    if len(categorical_cols) < 1:
        return False, "Dataset must contain at least one categorical column"

    return True, {
        "rows": len(df),
        "numeric_columns": list(numeric_cols),
        "categorical_columns": list(categorical_cols)
    }
