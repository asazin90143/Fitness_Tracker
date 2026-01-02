from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

app = Flask(__name__)
# Config: Local SQLite DB
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///localfit.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Database Models (Schema) ---
class BodyMeasurement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    weight = db.Column(db.Float, nullable=False)
    waist = db.Column(db.Float, nullable=False)

class Workout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    exercise_name = db.Column(db.String(100), nullable=False)
    sets = db.Column(db.Integer, nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    weight_load = db.Column(db.Float, nullable=False)

# --- Routes ---

@app.route('/')
def index():
    # Fetch Data for Tables
    recent_body = BodyMeasurement.query.order_by(BodyMeasurement.date.desc()).limit(5).all()
    recent_workouts = Workout.query.order_by(Workout.date.desc()).limit(5).all()

    # Prepare Data for Charts (Query all, sort by date)
    measurements = BodyMeasurement.query.order_by(BodyMeasurement.date.asc()).all()
    
    # Format data for Chart.js
    dates = [m.date.strftime('%Y-%m-%d') for m in measurements]
    weights = [m.weight for m in measurements]
    
    return render_template('index.html', 
                           recent_body=recent_body, 
                           recent_workouts=recent_workouts,
                           chart_dates=json.dumps(dates),
                           chart_weights=json.dumps(weights))

@app.route('/add/body', methods=['GET', 'POST'])
def add_body():
    if request.method == 'POST':
        new_entry = BodyMeasurement(
            date=datetime.strptime(request.form['date'], '%Y-%m-%d').date(),
            weight=float(request.form['weight']),
            waist=float(request.form['waist'])
        )
        db.session.add(new_entry)
        db.session.commit()
        return redirect(url_for('index'))
    return render_template('add_measurement.html', today=datetime.now().date())

@app.route('/add/workout', methods=['GET', 'POST'])
def add_workout():
    if request.method == 'POST':
        new_workout = Workout(
            date=datetime.strptime(request.form['date'], '%Y-%m-%d').date(),
            exercise_name=request.form['exercise'],
            sets=int(request.form['sets']),
            reps=int(request.form['reps']),
            weight_load=float(request.form['load'])
        )
        db.session.add(new_workout)
        db.session.commit()
        return redirect(url_for('index'))
    return render_template('add_workout.html', today=datetime.now().date())

# --- Initialization ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Creates localfit.db on first run
    app.run(debug=True)