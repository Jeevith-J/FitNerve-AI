# calorie_calculator.py

def calculate_bmr(age, gender, weight, height):
    """
    Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation.
    """
    if gender.lower() == "male":
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:  # Female
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    return bmr

def calculate_tdee(bmr, activity_level):
    """
    Calculate Total Daily Energy Expenditure (TDEE).
    """
    activity_multipliers = {
        "sedentary": 1.2,
        "lightly active": 1.375,
        "moderately active": 1.55,
        "very active": 1.725
    }
    return bmr * activity_multipliers.get(activity_level.lower(), 1.2)

def get_calorie_goal(tdee, goal, weight):
    """
    Adjust calorie intake based on goal.
    """
    if goal.lower() == "weight loss":
        print("Choose your weight loss speed:")
        print("1. Mild (0.25 kg/week) → 250 kcal deficit")
        print("2. Moderate (0.5 kg/week) → 500 kcal deficit")
        print("3. Aggressive (1 kg/week) → 1000 kcal deficit")
        choice = int(input("Enter your choice (1/2/3): "))
        adjustment = [-250, -500, -1000][choice - 1]
    elif goal.lower() == "muscle gain":
        print("Choose your muscle gain speed:")
        print("1. Slow (0.25 kg/week) → 250 kcal surplus")
        print("2. Moderate (0.5 kg/week) → 500 kcal surplus")
        print("3. Fast (0.75 kg/week) → 750 kcal surplus")
        choice = int(input("Enter your choice (1/2/3): "))
        adjustment = [250, 500, 750][choice - 1]
    else:
        adjustment = 0  # Maintenance mode, no change in calories
    return tdee + adjustment

def calculate_macronutrients(calories, weight):
    """
    Calculate macronutrient breakdown based on calorie intake and protein range.
    """
    protein_min = weight * 1.6
    protein_max = weight * 2.2
    fat_cals = calories * 0.20
    carb_cals = calories * 0.45
    fiber = (calories * 0.015) / 2  # Approx. 1.5% of total kcal, converted to grams

    fats = fat_cals / 9  # 1g fat = 9 kcal
    carbs = carb_cals / 4  # 1g carbs = 4 kcal
    
    return protein_min, protein_max, fats, carbs, fiber

# Example usage
if __name__ == "__main__":
    age = int(input("Enter age: "))
    gender = input("Enter gender (male/female): ")
    weight = float(input("Enter weight (kg): "))
    height = float(input("Enter height (cm): "))
    activity_level = input("Enter activity level (sedentary, lightly active, moderately active, very active): ")
    goal = input("Enter goal (weight loss, muscle gain, maintenance): ")

    bmr = calculate_bmr(age, gender, weight, height)
    tdee = calculate_tdee(bmr, activity_level)
    calorie_goal = get_calorie_goal(tdee, goal, weight)
    protein_min, protein_max, fats, carbs, fiber = calculate_macronutrients(calorie_goal, weight)

    print(f"\nYour BMR: {bmr:.2f} kcal/day")
    print(f"Your TDEE: {tdee:.2f} kcal/day")
    print(f"Recommended Calorie Intake: {calorie_goal:.2f} kcal/day")
    print(f"Macronutrient Breakdown:")
    print(f"- Protein: {protein_min:.2f}g - {protein_max:.2f}g/day (1.6-2.2g per kg of body weight)")
    print(f"- Fats: {fats:.2f} g/day (20% of total calories)")
    print(f"- Carbohydrates: {carbs:.2f} g/day (45% of total calories)")
    print(f"- Fiber: {fiber:.2f} g/day (~1.5% of total calories)")
