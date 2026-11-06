/**
 * Runtime configuration checks.
 *
 * getConfigProblems() returns a list of human-readable problems with the
 * environment (names only; never values) so the serverless entry point can
 * fail fast with a clear message instead of crashing.
 */
const crypto = require('crypto');

// SHA-256 fingerprints of secrets that were exposed publicly and must never be
// used again. Comparing hashes means the secret itself is not stored here.
const REVOKED_JWT_SECRET_SHA256 = new Set([
  '3e714523b96d3a5495a092c9fffdd530a7d7c59226e8ee2d038628dc97ace2f3'
]);

const PLACEHOLDER_SECRETS = new Set([
  'change-me-to-a-long-random-secret',
  'your-jwt-secret',
  'secret'
]);

const MIN_PRODUCTION_SECRET_LENGTH = 32;

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function isProduction(env) {
  return env.NODE_ENV === 'production' || Boolean(env.VERCEL);
}

function getConfigProblems(env = process.env) {
  const problems = [];

  if (!env.MONGODB_URI && !env.MONGO_URI) {
    problems.push('MONGODB_URI is not set');
  }

  const secret = env.JWT_SECRET;
  if (!secret) {
    problems.push('JWT_SECRET is not set');
  } else if (REVOKED_JWT_SECRET_SHA256.has(sha256(secret))) {
    problems.push('JWT_SECRET is a revoked (publicly exposed) value and must be replaced');
  } else if (isProduction(env)) {
    if (PLACEHOLDER_SECRETS.has(secret)) {
      problems.push('JWT_SECRET is a placeholder value');
    } else if (secret.length < MIN_PRODUCTION_SECRET_LENGTH) {
      problems.push(`JWT_SECRET must be at least ${MIN_PRODUCTION_SECRET_LENGTH} characters in production`);
    }
  }

  return problems;
}

module.exports = { getConfigProblems, sha256, MIN_PRODUCTION_SECRET_LENGTH };
