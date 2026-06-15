// clamp() keeps a number inside a safe range so one bad sensor value does not dominate the score.
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// numberOrZero() converts database values into numbers and falls back to 0 when a value is missing.
const numberOrZero = value => (Number.isFinite(Number(value)) ? Number(value) : 0);

// getPriorityLevel() turns the numeric score into a plain-language label for the dashboard.
const getPriorityLevel = score => {
  // Scores at 70 or above mean the bin should be treated as a critical pickup.
  if (score >= 70) return 'Critical';
  // Scores from 45 to 69 are still urgent, but not the highest possible level.
  if (score >= 45) return 'High';
  // Scores from 25 to 44 mean the bin should be watched, but may not need immediate action.
  if (score >= 25) return 'Medium';
  // Anything below 25 is considered normal or low priority.
  return 'Low';
};

// scoreWasteEntry() calculates one pickup priority score for a single waste entry.
const scoreWasteEntry = entry => {
  // Date.now() gives the current time in milliseconds so we can compare it to the reading date.
  const now = Date.now();
  // Use the manual entry date first, then updatedAt/createdAt, and finally the current time as a fallback.
  const readingDate = new Date(entry.date || entry.updatedAt || entry.createdAt || now);
  // Convert the time difference from milliseconds into hours and prevent negative values.
  const ageHours = Math.max(0, (now - readingDate.getTime()) / (1000 * 60 * 60));
  // Bin fullness is stored as a percent, so it is clamped between 0 and 100.
  const fullness = clamp(numberOrZero(entry.binFullness), 0, 100);
  // Gas, pH, weight, and compost weight are converted to numbers for scoring.
  const gas = numberOrZero(entry.gas);
  const ph = numberOrZero(entry.pH);
  const weight = numberOrZero(entry.weight);
  const compostWeight = numberOrZero(entry.compostWeight);

  // Fullness receives the highest weight because a full bin is the clearest pickup signal.
  const fullnessScore = fullness * 0.45;
  // Gas is capped at 10 before scoring so extreme sensor values do not create unrealistic scores.
  const gasScore = clamp(gas, 0, 10) * 2;
  // pH risk increases as the pH moves away from neutral 7, which may indicate compost imbalance.
  const phRiskScore = ph ? clamp(Math.abs(ph - 7) / 7, 0, 1) * 15 : 0;
  // Age score increases over 72 hours so old readings become more urgent over time.
  const ageScore = clamp(ageHours / 72, 0, 1) * 10;
  // Weight score gives extra priority to heavy waste entries.
  const weightScore = clamp(weight / 100, 0, 1) * 7;
  // Compost score gives a small boost when compostable material is present.
  const compostScore = clamp(compostWeight / 100, 0, 1) * 3;
  // The final priority score is rounded so it is easy to display and explain.
  const priorityScore = Math.round(
    fullnessScore + gasScore + phRiskScore + ageScore + weightScore + compostScore
  );

  // reasons stores human-readable explanations for why a bin received its score.
  const reasons = [];
  // These conditions match the scoring categories and help staff understand the recommendation.
  if (fullness >= 80) reasons.push('bin fullness is above 80%');
  if (gas >= 5) reasons.push('gas reading is elevated');
  if (ph && (ph < 5.5 || ph > 8.5)) reasons.push('pH is outside the preferred range');
  if (ageHours >= 24) reasons.push('reading is more than 24 hours old');
  if (weight >= 50) reasons.push('waste weight is high');
  // If nothing risky is found, still return one clear reason for the frontend.
  if (reasons.length === 0) reasons.push('readings are within normal operating ranges');

  // Return the score, the label, and the explanation together for the API response.
  return {
    priorityScore,
    priorityLevel: getPriorityLevel(priorityScore),
    reasons
  };
};

// rankWasteEntries() scores every entry and sorts the highest priority entries first.
const rankWasteEntries = entries => entries
  // Convert Mongoose documents to plain objects before adding calculated fields.
  .map(entry => {
    const source = typeof entry.toObject === 'function' ? entry.toObject() : entry;

    // Copy the original entry fields and merge in the calculated priority data.
    return {
      ...source,
      ...scoreWasteEntry(source)
    };
  })
  // Sort descending so the most urgent pickup appears at the top of the dashboard.
  .sort((a, b) => b.priorityScore - a.priorityScore);

// Export both functions so routes and tests can use the same scoring logic.
module.exports = {
  scoreWasteEntry,
  rankWasteEntries
};
