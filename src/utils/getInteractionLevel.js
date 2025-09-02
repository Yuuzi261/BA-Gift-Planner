import { getPreferenceValue } from './getPreferenceValue'

export function getInteractionLevel(gift, student) {
  const value = getPreferenceValue(student, gift)
  if (gift.isSsr) {
    if (value > 180) return 'xl'
    if (value > 120) return 'l'
    return 'm'
  } else {
    if (value > 60) return 'xl'
    if (value > 40) return 'l'
    return 'm'
  }
}
