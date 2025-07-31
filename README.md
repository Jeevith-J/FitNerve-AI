# FitNerve-AI: AI-Powered Fitness Tracking Platform

FitNerve-AI is a comprehensive fitness tracking platform that combines exercise tracking, AI-powered form detection, and personalized workout planning.

## Project Structure

```
├── diet_recommendation/    # Calorie and diet calculation
├── exercise_library/      # Exercise tracking backend
├── frontend/             # Next.js web application
├── ml/                   # Machine learning models and processing
├── processed/           # Processed data
├── squats/             # Squat detection data
└── uploads/            # User uploaded content
```

## Features

- 🏋️ Exercise tracking for strength and cardio workouts
- 🤖 AI-powered form detection for exercises
- 📊 Calorie tracking and calculations
- 💪 Personalized workout planning
- 📈 Progress tracking and visualization
- 👤 User authentication and profiles

## Prerequisites

- Python 3.8+
- Node.js 16+
- pnpm (for frontend package management)

## Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Jeevith-J/FitNerve-AI.git
cd FitNerve-AI
```

2. **Set up the frontend:**
```bash
cd frontend
pnpm install
```

3. **Set up the Python environment:**
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install ML requirements
cd ml
pip install -r requirements.txt

# Install exercise library requirements
cd ../exercise_library
pip install -r requirements.txt
```

## Running the Application

1. **Start the frontend development server:**
```bash
cd frontend
pnpm dev
```
The frontend will be available at `http://localhost:3000`

2. **Start the ML service:**
```bash
cd ml
python main.py
```

3. **Run the exercise tracker:**
```bash
cd exercise_library
python exercise_tracker.py
```

## Environment Variables

Create a `.env.local` file in the frontend directory:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Usage

1. Create an account or sign in
2. Set up your profile with fitness goals and preferences
3. Track workouts using the exercise tracker
4. Use the AI form detection for real-time feedback
5. Monitor progress through the dashboard

## Development

- Frontend: Built with Next.js, React, and Tailwind CSS
- Backend: Python-based services for ML and exercise tracking
- ML: Real-time form detection and analysis

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request