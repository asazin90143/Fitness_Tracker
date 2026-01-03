# LocalFit Tracker (MVP)

![Status](https://img.shields.io/badge/Status-Stable-success)
![Python](https://img.shields.io/badge/Python-3.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-red)

LocalFit is a lightweight, privacy-focused web application to track body measurements and workouts. It runs locally using Flask and SQLite.

## Getting Started

Prerequisites:

- Python 3.8+

Installation:

```bash
git clone <repo-url>
cd localfit
python -m venv venv
# LocalFit Tracker (MVP)

![Status](https://img.shields.io/badge/Status-Stable-success)
![Python](https://img.shields.io/badge/Python-3.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-red)

LocalFit is a lightweight, privacy-focused web application to track body measurements and workouts. It runs locally using Flask and SQLite.

## Getting Started

Prerequisites:

- Python 3.8+

Installation:

```bash
git clone <repo-url>
cd localfit
python -m venv venv
venv\Scripts\activate   # Windows
# or on macOS / Linux: source venv/bin/activate
pip install -r requirements.txt
```

Run the app:

```bash
python app.py
```

Open <http://127.0.0.1:5000> in your browser.

The database file `localfit.db` is created automatically on first run.

## Features

- Log body measurements (weight, waist) with dates.

- Log workouts (exercise, sets, reps, load).

- Dashboard with weight chart (Chart.js).

## Development

- Templates are in `templates/`.

- Add new routes in `app.py`.

## License

MIT
## Development
