import pandas as pd

def comparison_pattern(df: pd.DataFrame, category_col: str, value_col: str):
    grouped = df.groupby(category_col)[value_col].mean()

    best_category = grouped.idxmax()
    worst_category = grouped.idxmin()

    insight = (
        f"From the comparison chart, {best_category} shows higher performance "
        f"compared to {worst_category}."
    )

    return {
        "type": "comparison",
        "categories": list(grouped.index),
        "values": [round(v, 2) for v in grouped.values],
        "best_category": best_category,
        "worst_category": worst_category,
        "insight": insight
    }



def trend_pattern(df: pd.DataFrame, value_col: str):
    values = df[value_col].tolist()

    if values[-1] > values[0]:
        trend = "upward"
    elif values[-1] < values[0]:
        trend = "downward"
    else:
        trend = "stable"

    article = "an" if trend[0] in ["a", "e", "i", "o", "u"] else "a"
    insight = f"The trend analysis indicates {article} {trend} trend over the dataset."

    return {
        "type": "trend",
        "values": values,
        "trend": trend,
        "insight": insight
    }

def correlation_pattern(df: pd.DataFrame, value_col: str):
    corr_value = df[value_col].corr(df.index.to_series())

    insight = (
        "A positive correlation is observed between the values and their sequence."
        if corr_value > 0
        else "A negative correlation is observed between the values and their sequence."
    )

    return {
        "type": "correlation",
        "correlation_value": round(corr_value, 2),
        "insight": insight
    }
def distribution_pattern(df: pd.DataFrame, value_col: str):
    mean_val = df[value_col].mean()

    insight = (
        "Most values are concentrated around the average range."
    )

    return {
        "type": "distribution",
        "mean": round(mean_val, 2),
        "insight": insight
    }
def anomaly_pattern(df: pd.DataFrame, value_col: str):
    mean_val = df[value_col].mean()
    std_val = df[value_col].std()

    anomalies = df[df[value_col] > mean_val + 2 * std_val]

    insight = (
        "An unusual spike is detected, indicating a potential anomaly."
        if not anomalies.empty
        else "No significant anomalies detected in the dataset."
    )

    return {
        "type": "anomaly",
        "anomaly_count": len(anomalies),
        "insight": insight
    }
def threshold_pattern(df: pd.DataFrame, value_col: str, threshold=None):
    if threshold is None:
        threshold = df[value_col].mean()

    below_threshold = df[df[value_col] < threshold]

    insight = (
        "Several values fall below the defined threshold, indicating underperformance."
        if not below_threshold.empty
        else "All values are above the defined threshold."
    )

    return {
        "type": "threshold",
        "threshold": round(threshold, 2),
        "below_threshold_count": len(below_threshold),
        "insight": insight
    }
