export const calculateRisk = (drainBlocked, rainProbability) => {

  if (drainBlocked && rainProbability > 60) {
    return "CRITICAL"
  }

  if (drainBlocked) {
    return "HIGH"
  }

  return "NORMAL"
}