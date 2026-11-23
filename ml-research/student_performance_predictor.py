"""
Student Performance Prediction Model
Uses Scikit-learn (RandomForest, GradientBoosting, Ridge Regression)
to predict expected exam percentages and risk classification.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.metrics import mean_squared_error, r2_score, classification_report, accuracy_score
from dataset_generator import generate_student_dataset

class StudentPerformancePredictor:
    def __init__(self):
        self.regression_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.classification_model = GradientBoostingClassifier(n_estimators=100, random_state=42)
        self.feature_cols = [
            'attendance_percentage',
            'internal_test1_30',
            'internal_test2_30',
            'assignment_submission_rate',
            'lab_marks_30',
            'previous_semester_cgpa',
            'lms_weekly_logins'
        ]
        self.is_trained = False

    def train(self, df: pd.DataFrame = None):
        if df is None:
            df = generate_student_dataset(n_samples=2000)
            
        X = df[self.feature_cols]
        y_reg = df['final_exam_percentage']
        y_clf = df['performance_category']

        X_train, X_test, y_reg_train, y_reg_test = train_test_split(X, y_reg, test_size=0.2, random_state=42)
        _, _, y_clf_train, y_clf_test = train_test_split(X, y_clf, test_size=0.2, random_state=42)

        # Train regressor
        self.regression_model.fit(X_train, y_reg_train)
        reg_preds = self.regression_model.predict(X_test)
        r2 = r2_score(y_reg_test, reg_preds)
        rmse = np.sqrt(mean_squared_error(y_reg_test, reg_preds))

        # Train classifier
        self.classification_model.fit(X_train, y_clf_train)
        clf_preds = self.classification_model.predict(X_test)
        acc = accuracy_score(y_clf_test, clf_preds)

        self.is_trained = True

        metrics = {
            'r2_score': round(float(r2), 4),
            'rmse': round(float(rmse), 4),
            'classification_accuracy': round(float(acc), 4),
            'feature_importances': dict(zip(self.feature_cols, [round(float(x), 4) for x in self.regression_model.feature_importances_]))
        }
        return metrics

    def predict_student(self, student_features: dict) -> dict:
        if not self.is_trained:
            self.train()

        input_data = pd.DataFrame([{col: student_features.get(col, 0) for col in self.feature_cols}])
        predicted_score = float(self.regression_model.predict(input_data)[0])
        predicted_category = str(self.classification_model.predict(input_data)[0])
        probabilities = self.classification_model.predict_proba(input_data)[0]
        classes = self.classification_model.classes_

        risk_level = 'High' if predicted_score < 55 else ('Medium' if predicted_score < 70 else 'Low')

        return {
            'predicted_percentage': round(predicted_score, 1),
            'predicted_category': predicted_category,
            'risk_level': risk_level,
            'confidence': round(float(np.max(probabilities)), 4),
            'recommendations': self._generate_recommendations(student_features, predicted_score)
        }

    def _generate_recommendations(self, features: dict, score: float) -> list:
        recs = []
        if features.get('attendance_percentage', 100) < 75:
            recs.append("Attendance is below statutory 75% limit. Advise remedial class attendance.")
        if features.get('assignment_submission_rate', 100) < 70:
            recs.append("Assignment completion is low. Faculty mentor intervention advised.")
        if features.get('internal_test1_30', 30) < 15 or features.get('internal_test2_30', 30) < 15:
            recs.append("Mid-term internal exam scores indicate conceptual gaps. Recommend peer tutoring.")
        if not recs:
            recs.append("Student is performing consistently across academic benchmarks.")
        return recs

    def save_model(self, filepath: str):
        joblib.dump({
            'regressor': self.regression_model,
            'classifier': self.classification_model,
            'features': self.feature_cols
        }, filepath)

    def load_model(self, filepath: str):
        data = joblib.load(filepath)
        self.regression_model = data['regressor']
        self.classification_model = data['classifier']
        self.feature_cols = data['features']
        self.is_trained = True

if __name__ == '__main__':
    predictor = StudentPerformancePredictor()
    metrics = predictor.train()
    print("Model Training Complete!")
    print("Metrics:", metrics)

    # Example: Rahul Sharma's current stats
    rahul_stats = {
        'attendance_percentage': 92.0,
        'internal_test1_30': 25.5,
        'internal_test2_30': 24.0,
        'assignment_submission_rate': 95.0,
        'lab_marks_30': 26.0,
        'previous_semester_cgpa': 8.35,
        'lms_weekly_logins': 8
    }
    prediction = predictor.predict_student(rahul_stats)
    print("\nPrediction for Rahul Sharma:")
    print(prediction)
