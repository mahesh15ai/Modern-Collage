# Modern College AI Research Module
**Modern College of Computer Science & Information Technology, Nanded**

## Academic Research Topic
**"Predictive Analytics & Early-Warning AI for Higher Education Using Scikit-Learn"**

### Objectives
1. **Academic Performance Forecasting**: Forecast student final semester marks and letter grades using multi-factor regression and classification ensembles (RandomForestRegressor, GradientBoostingClassifier).
2. **Attendance Shortage Early-Warning**: Identify students at risk of breaching the statutory 75% attendance threshold before mid-term exams so faculty mentors can provide early interventions.
3. **Personalized Academic Recommendations**: Generate rule-informed AI interventions based on internal test scores, lab assessments, and LMS activity metrics.

---

### Machine Learning Stack
- **Language**: Python 3.10+
- **Core Library**: Scikit-learn
- **Data Manipulation**: Pandas, NumPy
- **Serialization**: Joblib
- **Visualization**: Matplotlib, Seaborn

---

### Dataset Features
| Feature Name | Description | Range / Unit |
|---|---|---|
| `attendance_percentage` | Current semester cumulative attendance | 0 - 100% |
| `internal_test1_30` | Mid-term internal assessment 1 | 0 - 30 marks |
| `internal_test2_30` | Mid-term internal assessment 2 | 0 - 30 marks |
| `assignment_submission_rate` | Submitted vs total assigned coursework | 0 - 100% |
| `lab_marks_30` | Practical laboratory continuous evaluation | 0 - 30 marks |
| `previous_semester_cgpa` | Historical cumulative GPA | 0.0 - 10.0 |
| `lms_weekly_logins` | Portal & study material access frequency | Count / week |
| `fee_delay_days` | Days payment was delayed (socio-economic proxy) | Days |

---

### How to Run
```bash
# 1. Navigate to research folder
cd ml-research

# 2. Install dependencies
pip install -r requirements.txt

# 3. Generate synthetic college dataset
python dataset_generator.py

# 4. Train model & run sample prediction
python student_performance_predictor.py

# 5. Run CLI Bridge for any student
python api_bridge.py --attendance 92.0 --cgpa 8.35 --assignment 95.0
```
