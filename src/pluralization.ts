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
  }
}

export function pluralize(amount: number, rule: PluralizationRule) {
  if (amount % 10 === 1 && (amount % 100 - 1) != 10) {
    return `${amount} ${rule.one}`;
  }

  if (amount % 10 >= 2 && amount % 10 <= 4 && (amount % 100 - amount % 10) != 10) {
    return `${amount} ${rule.two}`;
  }

  return `${amount} ${rule.five}`;
}
