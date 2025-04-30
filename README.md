# IPL Team Performance Predictor

A web application that predicts IPL team performance using machine learning algorithms. The application consists of a Django backend API and a React frontend interface.

## Features

- Team performance prediction based on historical data
- Interactive UI for data visualization
- RESTful API endpoints for predictions
- Machine learning model integration

## Tech Stack

- Backend: Django with Django REST Framework
- Frontend: React.js
- Database: SQLite
- Machine Learning: Python (scikit-learn)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ipl-team-predictor
```

2. Set up the backend:
```bash
cd ipl_predictor_backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

3. Set up the frontend:
```bash
cd ../frontend
npm install
npm start
```

## Project Structure

- `ipl_predictor_backend/`: Django backend application
- `src/`: React frontend application
- `ml_api/`: Machine learning model and API endpoints
- `data/`: Dataset files for training and testing

## Contributing

Feel free to open issues and pull requests for any improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 