"""
Attendance Risk Early-Warning Classifier
Specialized Scikit-learn model to identify students likely to miss the 75% attendance threshold.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score
from dataset_generator import generate_student_dataset

class AttendanceRiskClassifier:
    def __init__(self):
        self.model = LogisticRegression(class_weight='balanced', max_iter=1000)
        self.feature_cols = [
            'assignment_submission_rate',
            'lms_weekly_logins',
            'previous_semester_cgpa',
            'fee_delay_days'
        ]

    def train(self, df: pd.DataFrame = None):
        if df is None:
            df = generate_student_dataset(n_samples=2000)

        X = df[self.feature_cols]
        y = df['attendance_at_risk']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
        self.model.fit(X_train, y_train)

        probs = self.model.predict_proba(X_test)[:, 1]
        auc = roc_auc_score(y_test, probs)
        
        return {
            'roc_auc_score': round(float(auc), 4),
            'coefficients': dict(zip(self.feature_cols, [round(float(c), 4) for c in self.model.coef_[0]]))
        }

if __name__ == '__main__':
    clf = AttendanceRiskClassifier()
    res = clf.train()
    print("Attendance Risk Classifier Trained:")
    print(res)
