"""
Dataset Generator for Modern College Research:
Simulates student academic performance, attendance behavior, and LMS metrics.
"""

import numpy as np
import pandas as pd
import os

def generate_student_dataset(n_samples: int = 1500, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)
    
    # Generate realistic features
    attendance_rate = np.clip(np.random.normal(loc=82, scale=12, size=n_samples), 45, 100)
    internal_test1 = np.clip(np.random.normal(loc=21, scale=4, size=n_samples), 5, 30)
    internal_test2 = np.clip(np.random.normal(loc=22, scale=4.5, size=n_samples), 6, 30)
    assignment_rate = np.clip(np.random.normal(loc=85, scale=15, size=n_samples), 30, 100)
    lab_marks = np.clip(np.random.normal(loc=24, scale=3.5, size=n_samples), 10, 30)
    prev_gpa = np.clip(np.random.normal(loc=7.6, scale=1.2, size=n_samples), 4.0, 10.0)
    lms_logins_per_week = np.clip(np.random.poisson(lam=6, size=n_samples), 0, 25)
    fee_delayed_days = np.random.exponential(scale=10, size=n_samples)
    
    # Calculate target final semester percentage with realistic correlation and noise
    academic_signal = (
        0.30 * (attendance_rate) +
        0.70 * ((internal_test1 + internal_test2) / 60 * 100) +
        0.15 * assignment_rate +
        0.20 * (lab_marks / 30 * 100) +
        0.35 * (prev_gpa * 10)
    ) / 1.70
    
    noise = np.random.normal(0, 3.5, size=n_samples)
    final_percentage = np.clip(academic_signal + noise, 35.0, 98.0)
    
    # Academic performance category
    def assign_grade(score):
        if score >= 80:
            return 'Distinction'
        elif score >= 65:
            return 'First Class'
        elif score >= 50:
            return 'Second Class'
        else:
            return 'At Risk'

    grades = [assign_grade(s) for s in final_percentage]
    attendance_shortage_risk = (attendance_rate < 75.0).astype(int)

    df = pd.DataFrame({
        'student_id': [f"MCLG-{1000 + i}" for i in range(n_samples)],
        'attendance_percentage': np.round(attendance_rate, 1),
        'internal_test1_30': np.round(internal_test1, 1),
        'internal_test2_30': np.round(internal_test2, 1),
        'assignment_submission_rate': np.round(assignment_rate, 1),
        'lab_marks_30': np.round(lab_marks, 1),
        'previous_semester_cgpa': np.round(prev_gpa, 2),
        'lms_weekly_logins': lms_logins_per_week,
        'fee_delay_days': np.round(fee_delayed_days, 0),
        'final_exam_percentage': np.round(final_percentage, 1),
        'performance_category': grades,
        'attendance_at_risk': attendance_shortage_risk
    })
    
    return df

if __name__ == '__main__':
    output_path = os.path.join(os.path.dirname(__file__), 'students_dataset.csv')
    df = generate_student_dataset()
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} student records saved to {output_path}")
    print(df.head())
