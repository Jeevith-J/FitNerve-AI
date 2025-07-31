import json
import os
from exercise_data import EXERCISE_CATEGORIES, CARDIO_EXERCISES

# File to store logs
LOG_FILE = "exercise_logs.json"
USER_WEIGHT_KG = 80  # You can customize this later

def save_log(entry):
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as f:
            data = json.load(f)
    else:
        data = []
    data.append(entry)
    with open(LOG_FILE, "w") as f:
        json.dump(data, f, indent=4)

def load_logs():
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as f:
            return json.load(f)
    return []

def calculate_strength_training_calories(weight_kg, exercise_name, duration_min):
    name = exercise_name.lower()
    if "bench" in name or "press" in name:
        calories_per_min = 7.5
    elif "deadlift" in name or "row" in name or "pull" in name:
        calories_per_min = 8
    elif "shoulder" in name or "raise" in name:
        calories_per_min = 6
    elif "curl" in name or "extension" in name:
        calories_per_min = 5.5
    elif "squat" in name or "leg" in name or "lunge" in name:
        calories_per_min = 7
    elif "crunch" in name or "plank" in name or "twist" in name:
        calories_per_min = 5.5
    else:
        calories_per_min = 4.5
    return round(calories_per_min * duration_min, 2)

def calculate_treadmill_calories(duration_min, speed_kmh, incline_percent, weight_kg):
    speed_mpm = speed_kmh * 1000 / 60
    METs = (0.1 * speed_mpm) + (1.8 * speed_mpm * (incline_percent / 100)) + 3.5
    calories_per_min = (METs * weight_kg) / 200
    return round(calories_per_min * duration_min, 2)

def calculate_cardio_calories(exercise, duration, speed, incline, weight_kg):
    if exercise.lower() == "treadmill":
        return calculate_treadmill_calories(duration, speed, incline, weight_kg)
    else:
        met_values = {
            "cycling": 7.5,
            "elliptical": 5,
            "stairmaster": 8,
            "rowing machine": 7,
            "jump rope": 12,
            "hiit": 9
        }
        met = met_values.get(exercise.lower(), 6)
        return round((met * weight_kg / 200) * duration, 2)

def log_strength_exercise():
    print("\nAvailable Muscle Groups:")
    muscle_groups = list(EXERCISE_CATEGORIES.keys())
    for i, mg in enumerate(muscle_groups, 1):
        print(f"{i}. {mg}")

    group_choice = int(input("Select a muscle group by number: "))
    chosen_group = muscle_groups[group_choice - 1]
    exercises = EXERCISE_CATEGORIES[chosen_group]

    print(f"\nAvailable exercises for {chosen_group}:")
    for i, ex in enumerate(exercises, 1):
        print(f"{i}. {ex}")

    exercise_choice = int(input("Choose an exercise by number: "))
    chosen_exercise = exercises[exercise_choice - 1]

    sets = int(input("Enter number of sets: "))
    set_details = []
    for i in range(1, sets + 1):
        reps = int(input(f"Set {i} - Reps: "))
        weight = float(input(f"Set {i} - Weight used (kg): "))
        set_details.append({"set": i, "reps": reps, "weight": weight})

    duration_min = float(input("Estimated duration for this exercise (in minutes): "))
    total_calories = calculate_strength_training_calories(USER_WEIGHT_KG, chosen_exercise, duration_min)

    print(f"\n✅ {chosen_exercise} logged!\n🔥 Total calories burned: {total_calories} kcal")

    save_log({
        "type": "strength",
        "muscle_group": chosen_group,
        "exercise": chosen_exercise,
        "sets": set_details,
        "duration_min": duration_min,
        "calories": total_calories
    })

def log_cardio_exercise():
    print("\nAvailable Cardio Exercises:")
    for i, cardio in enumerate(CARDIO_EXERCISES, 1):
        print(f"{i}. {cardio}")
    choice = input("Enter the number of the exercise or type the name manually: ")
    chosen_exercise = CARDIO_EXERCISES[int(choice) - 1] if choice.isdigit() else choice.strip()

    duration = int(input("Enter duration (minutes): "))
    speed = float(input("Enter speed (km/h): "))
    incline = float(input("Enter incline (%): "))

    calories = calculate_cardio_calories(chosen_exercise, duration, speed, incline, USER_WEIGHT_KG)

    print(f"\n✅ Cardio logged!\n🔥 Calories burned: {calories} kcal")

    save_log({
        "type": "cardio",
        "exercise": chosen_exercise,
        "duration_min": duration,
        "speed_kmh": speed,
        "incline": incline,
        "calories": calories
    })

def view_progress():
    logs = load_logs()
    if not logs:
        print("\nNo logs found.")
        return
    print("\n===== Exercise Progress Logs =====")
    for entry in logs:
        print(json.dumps(entry, indent=4))

def main():
    while True:
        print("\n===== Exercise Tracker =====")
        print("1. Log Strength Exercise")
        print("2. Log Cardio Exercise")
        print("3. View Progress")
        print("4. Exit")
        choice = input("Enter your choice: ")
        if choice == "1":
            log_strength_exercise()
        elif choice == "2":
            log_cardio_exercise()
        elif choice == "3":
            view_progress()
        elif choice == "4":
            print("Exiting. Stay strong, Jack! 💪")
            break
        else:
            print("Invalid choice. Try again.")

if __name__ == "__main__":
    main()
