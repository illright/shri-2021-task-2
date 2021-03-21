interface PluralizationRule {
  one: string;
  two: string;
  five: string;
}

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

export function pluralize(amount: number, rule: PluralizationRule, forceSign = false) {
  const amountStr = (forceSign && amount > 0) ? `+${amount}` : amount.toString();

  if (amount % 10 === 1 && (amount % 100 - 1) != 10) {
    return `${amountStr} ${rule.one}`;
  }

  if (amount % 10 >= 2 && amount % 10 <= 4 && (amount % 100 - amount % 10) != 10) {
    return `${amountStr} ${rule.two}`;
  }

  return `${amountStr} ${rule.five}`;
}
