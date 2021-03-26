/**
 * The interface for Russian pluralization rules. 3 forms of the word are required:
 * - 1 of 'word'
 * - 2 of 'word'
 * - 5 of 'word'
 */
interface PluralizationRule {
  one: string;
  two: string;
  five: string;
}

/** Predefined pluralizations. */
export const entityPluralizations: Record<string, PluralizationRule> = {
  votes: {
    one: 'голос',
    two: 'голоса',
    five: 'голосов',
  },
  commits: {
    one: 'коммит',
    two: 'коммита',
    five: 'коммитов',
  }
}

/**
 * Pluralize an amount of a certain object based on its pluralization rule.
 *
 * @param amount The amount to pluralize.
 * @param rule The pluralization rule to use.
 * @param forceSign Whether positive quantities should have a '+' prepended.
 * @return The pluralized amount as a string.
 */
export function pluralize(amount: number, rule: PluralizationRule, forceSign = false) {
  const amountStr = (forceSign && amount > 0) ? `+${amount}` : amount.toString();
  amount = Math.abs(amount);

  if (amount % 10 === 1 && (amount % 100 - 1) != 10) {
    return `${amountStr} ${rule.one}`;
  }

  if (amount % 10 >= 2 && amount % 10 <= 4 && (amount % 100 - amount % 10) != 10) {
    return `${amountStr} ${rule.two}`;
  }

  return `${amountStr} ${rule.five}`;
}
