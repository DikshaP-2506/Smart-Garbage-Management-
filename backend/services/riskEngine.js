/**
 * Calculate environmental risk priority.
 *
 * Inputs (all from upstream AI/weather):
 *   drainBlocked    {boolean}  — Vision AI detected drain obstruction
 *   rainProbability {number}   — 0-100, max pop over next 24 h (OpenWeatherMap)
 *   severity        {string}   — 'low' | 'medium' | 'high'  (Vision AI garbage volume)
 *
 * Priority ladder: CRITICAL > HIGH > MEDIUM > LOW > NORMAL
 */
export const calculateRisk = (drainBlocked, rainProbability, severity = 'low') => {

  // ── CRITICAL ─────────────────────────────────────────────────────────
  // Blocked drain + heavy rain → flooding is imminent
  if (drainBlocked && rainProbability >= 60) return 'CRITICAL';

  // Massive pile blocking drain + moderate rain → escalates fast
  if (drainBlocked && severity === 'high' && rainProbability >= 35) return 'CRITICAL';

  // ── HIGH ─────────────────────────────────────────────────────────────
  // Any blocked drain (even dry weather) must be cleared urgently
  if (drainBlocked) return 'HIGH';

  // Extreme rain + large pile → sewage/health emergency even without drain block
  if (rainProbability >= 75 && severity === 'high') return 'HIGH';

  // ── MEDIUM ───────────────────────────────────────────────────────────
  // Heavy rain forecast → unblocked garbage will contaminate water runoff
  if (rainProbability >= 60) return 'MEDIUM';

  // Large pile + moderate rain → significant spread/contamination risk
  if (severity === 'high' && rainProbability >= 35) return 'MEDIUM';

  // Medium pile + heavy rain → notable wash-off risk
  if (severity === 'medium' && rainProbability >= 55) return 'MEDIUM';

  // ── LOW ──────────────────────────────────────────────────────────────
  // Moderate rain + any garbage → some wash risk, needs attention soon
  if (rainProbability >= 35) return 'LOW';

  // Large pile in dry weather → needs faster pickup than average
  if (severity === 'high') return 'LOW';

  // ── NORMAL ───────────────────────────────────────────────────────────
  // Low rain + small/medium pile → standard scheduled pickup
  return 'NORMAL';
};