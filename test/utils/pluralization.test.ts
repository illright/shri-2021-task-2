import { pluralize, entityPluralizations } from '../../src/utils/pluralization';

test('Non-negative quantities are pluralized correctly', () => {
  expect(pluralize(0, entityPluralizations.commits)).toEqual('0 коммитов');
  expect(pluralize(1, entityPluralizations.commits)).toEqual('1 коммит');
  expect(pluralize(2, entityPluralizations.commits)).toEqual('2 коммита');
  expect(pluralize(4, entityPluralizations.commits)).toEqual('4 коммита');
  expect(pluralize(5, entityPluralizations.commits)).toEqual('5 коммитов');
  expect(pluralize(10, entityPluralizations.commits)).toEqual('10 коммитов');
  expect(pluralize(11, entityPluralizations.commits)).toEqual('11 коммитов');
  expect(pluralize(21, entityPluralizations.commits)).toEqual('21 коммит');
  expect(pluralize(23, entityPluralizations.commits)).toEqual('23 коммита');
  expect(pluralize(25, entityPluralizations.commits)).toEqual('25 коммитов');
});

test('Negative quantities are pluralized correctly', () => {
  expect(pluralize(-1, entityPluralizations.commits)).toEqual('-1 коммит');
  expect(pluralize(-2, entityPluralizations.commits)).toEqual('-2 коммита');
  expect(pluralize(-5, entityPluralizations.commits)).toEqual('-5 коммитов');
})

test('The sign is enforced correctly', () => {
  const forceSign = true;
  expect(pluralize(-1, entityPluralizations.commits, forceSign)).toEqual('-1 коммит');
  expect(pluralize(0, entityPluralizations.commits, forceSign)).toEqual('0 коммитов');
  expect(pluralize(1, entityPluralizations.commits, forceSign)).toEqual('+1 коммит');
})
