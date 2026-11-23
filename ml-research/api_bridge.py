"""
AI Bridge Script
Can be executed via CLI or invoked as a JSON microservice to predict student success.
Usage:
  python api_bridge.py --student-id "STU-2023-089" --attendance 92 --cgpa 8.35
"""

import sys
import json
import argparse
from student_performance_predictor import StudentPerformancePredictor

def main():
    parser = argparse.ArgumentParser(description="Modern College Student AI Analysis")
    parser.add_argument("--attendance", type=float, default=92.0, help="Attendance %")
    parser.add_argument("--test1", type=float, default=25.0, help="Internal Test 1 Marks (out of 30)")
    parser.add_argument("--test2", type=float, default=24.0, help="Internal Test 2 Marks (out of 30)")
    parser.add_argument("--assignment", type=float, default=95.0, help="Assignment Submission Rate %")
    parser.add_argument("--lab", type=float, default=26.0, help="Lab Marks (out of 30)")
    parser.add_argument("--cgpa", type=float, default=8.35, help="Previous CGPA")
    parser.add_argument("--lms-logins", type=int, default=8, help="Weekly LMS logins")
    parser.add_argument("--json", action="store_true", help="Output pure JSON")

    args = parser.parse_args()

    input_data = {
        'attendance_percentage': args.attendance,
        'internal_test1_30': args.test1,
        'internal_test2_30': args.test2,
        'assignment_submission_rate': args.assignment,
        'lab_marks_30': args.lab,
        'previous_semester_cgpa': args.cgpa,
        'lms_weekly_logins': args.lms_logins
    }

    predictor = StudentPerformancePredictor()
    predictor.train()
    result = predictor.predict_student(input_data)

    output = {
        "college": "Modern College of Computer Science & Information Technology, Nanded",
        "input_features": input_data,
        "prediction": result
    }

    if args.json:
        print(json.dumps(output, indent=2))
    else:
        print("\n" + "="*60)
        print(" MODERN COLLEGE AI PERFORMANCE PREDICTION")
        print("="*60)
        print(f"Predicted Final Percentage: {result['predicted_percentage']}%")
        print(f"Predicted Category:         {result['predicted_category']}")
        print(f"Academic Risk Level:        {result['risk_level']}")
        print(f"Confidence:                 {result['confidence'] * 100:.1f}%")
        print("\nRecommendations:")
        for r in result['recommendations']:
            print(f"  • {r}")
        print("="*60 + "\n")

if __name__ == '__main__':
    main()
