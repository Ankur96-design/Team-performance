# IPL Team Performance Predictor

A modern web interface for predicting IPL team performance using machine learning.

## Features

- Select teams and venues to predict the best 11 players
- Beautiful UI using shadcn/ui components
- Real-time predictions using Flask backend
- Responsive design for all screen sizes

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Start the Flask backend:
```bash
python app.py
```

## Dependencies

### Frontend
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Vite

### Backend
- Flask
- pandas
- scikit-learn
- numpy

## Project Structure

```
ipl-team-predictor/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── label.tsx
│   │       └── select.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx
│   └── index.css
├── public/
├── app.py
└── package.json
```

## Usage

1. Select Team 1 from the dropdown
2. Select Team 2 from the dropdown
3. Select the Venue
4. Click "Predict Best 11" to get predictions
5. View the predicted best 11 players with their roles and fantasy points 