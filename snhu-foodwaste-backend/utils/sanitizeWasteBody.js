// Converts request body values into numbers Mongoose can validate.
function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

// Builds a clean waste entry object from an HTTP request body.
function sanitizeWasteBody(body = {}) {
  const weight = toNumber(body.weight);
  if (weight === undefined) {
    const error = new Error('Weight is required and must be a valid number');
    error.statusCode = 400;
    throw error;
  }

  const pH = toNumber(body.pH);
  if (pH !== undefined && (pH < 0 || pH > 14)) {
    const error = new Error('pH must be between 0 and 14');
    error.statusCode = 400;
    throw error;
  }

  const fields = {
    foodType: typeof body.foodType === 'string' ? body.foodType.trim() : body.foodType,
    weight,
    date: body.date,
    location: typeof body.location === 'string' ? body.location.trim() : body.location,
    notes: typeof body.notes === 'string' ? body.notes.trim() : body.notes,
    temperature: toNumber(body.temperature),
    humidity: toNumber(body.humidity),
    pH,
    gas: toNumber(body.gas),
    binFullness: toNumber(body.binFullness),
    compostWeight: toNumber(body.compostWeight)
  };

  Object.keys(fields).forEach(key => {
    if (fields[key] === undefined) {
      delete fields[key];
    }
  });

  return fields;
}

// Turns Mongoose validation errors into one readable message.
function formatMongooseError(err) {
  if (err.name === 'ValidationError' && err.errors) {
    return Object.values(err.errors).map(item => item.message).join(' ');
  }

  return err.message;
}

module.exports = {
  sanitizeWasteBody,
  formatMongooseError
};
