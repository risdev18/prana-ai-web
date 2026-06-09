import { GENDERS, ACTIVITY_LEVELS, GOALS } from './constants';

export const calculateBMI = (weightKg, heightCm) => {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi <= 24.9) return 'Normal';
  if (bmi <= 29.9) return 'Overweight';
  return 'Obese';
};

export const calculateBMR = (weightKg, heightCm, age, gender) => {
  if (gender === GENDERS.MALE) {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }
};

export const getActivityFactor = (activityLevel) => {
  switch (activityLevel) {
    case ACTIVITY_LEVELS.LIGHTLY_ACTIVE: return 1.375;
    case ACTIVITY_LEVELS.MODERATELY_ACTIVE: return 1.55;
    case ACTIVITY_LEVELS.VERY_ACTIVE: return 1.725;
    case ACTIVITY_LEVELS.SEDENTARY:
    default: return 1.20;
  }
};

export const calculateTDEE = (bmr, activityLevel) => {
  return bmr * getActivityFactor(activityLevel);
};

export const calculateCutCalories = (tdee) => tdee - 500;
export const calculateBulkCalories = (tdee) => tdee + 300;

export const getHealthyWeightRange = (heightCm) => {
  const heightM = heightCm / 100;
  return {
    min: 18.5 * (heightM * heightM),
    max: 24.9 * (heightM * heightM),
  };
};

export const getWeightToLose = (currentWeight, heightCm) => {
  const { max } = getHealthyWeightRange(heightCm);
  return Math.max(0, currentWeight - max);
};

export const getWeightToGain = (currentWeight, heightCm) => {
  const { min } = getHealthyWeightRange(heightCm);
  return Math.max(0, min - currentWeight);
};

export const calculateProtein = (weightKg, heightCm, bmi, goal) => {
  let referenceWeight = weightKg;
  if (bmi >= 30) {
    referenceWeight = getHealthyWeightRange(heightCm).max;
  }

  switch (goal) {
    case GOALS.CUT: return referenceWeight * 2.2;
    case GOALS.BULK: return referenceWeight * 2.0;
    case GOALS.MAINTAIN:
    default: return referenceWeight * 1.8;
  }
};

export const calculateWaterIntake = (weightKg) => {
  return (weightKg * 35) / 1000;
};

export const calculateProgress = (startingWeight, currentWeight, goalWeight) => {
  if (startingWeight === goalWeight) return 100.0;

  const isCutting = startingWeight > goalWeight;
  
  if (isCutting) {
    if (currentWeight > startingWeight) return 0.0; 
  } else {
    if (currentWeight < startingWeight) return 0.0; 
  }

  const totalJourney = Math.abs(startingWeight - goalWeight);
  const progressMade = Math.abs(startingWeight - currentWeight);
  
  let progress = (progressMade / totalJourney) * 100;
  return Math.min(Math.max(progress, 0.0), 100.0);
};

export const generateRecommendations = (bmi, goal) => {
  const recommendations = [];
  
  if (bmi < 18.5) {
    recommendations.push("You are currently underweight. A caloric surplus is recommended to reach a healthy weight.");
  } else if (bmi >= 25) {
    recommendations.push("You are currently above the normal weight range. A calorie deficit is recommended to reduce body fat safely.");
  } else {
    recommendations.push("Your weight is within the normal range. Focus on maintaining a healthy lifestyle.");
  }

  if (goal === GOALS.CUT) {
    recommendations.push("Keep protein high to preserve muscle mass during your cut.");
  } else if (goal === GOALS.BULK) {
    recommendations.push("Ensure progressive overload in your workouts to maximize muscle gain during your bulk.");
  }

  return recommendations;
};

export const generateAssessment = (memberData) => {
  const { weight, height, age, gender, activityLevel, goal, startingWeight } = memberData;
  const bmi = calculateBMI(weight, height);
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const cutCalories = calculateCutCalories(tdee);
  const bulkCalories = calculateBulkCalories(tdee);
  const protein = calculateProtein(weight, height, bmi, goal);
  const water = calculateWaterIntake(weight);
  const weightToLose = getWeightToLose(weight, height);
  const weightToGain = getWeightToGain(weight, height);
  // Default goal weight to min or max range depending on goal
  let goalWeight = startingWeight || weight;
  if (goal === GOALS.CUT) goalWeight = getHealthyWeightRange(height).max;
  if (goal === GOALS.BULK) goalWeight = getHealthyWeightRange(height).max + 5; // simplified
  
  const progressPercentage = calculateProgress(startingWeight || weight, weight, goalWeight);

  return {
    ...memberData,
    bmi,
    bmr,
    tdee,
    cutCalories,
    bulkCalories,
    protein,
    water,
    weightToLose,
    weightToGain,
    progressPercentage,
    assessmentDate: new Date().toISOString()
  };
};
