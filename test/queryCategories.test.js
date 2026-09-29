import assert from 'assert';
import {
    GROUP_PREFIXES,
    splitCategory,
    topLevels,
} from '../src/js/queryCategories';

// A prefixed category folds under its group with the remainder as the sub-label.
assert.deepStrictEqual(splitCategory('ADSA - 1. Domain Admins'), {
    top: 'ADSA',
    sub: '1. Domain Admins',
    grouped: true,
});
assert.deepStrictEqual(splitCategory('ESA - Tier Zero'), {
    top: 'ESA',
    sub: 'Tier Zero',
    grouped: true,
});

// A non-prefixed category, or one whose prefix is not a group, stands alone.
assert.deepStrictEqual(splitCategory('Kerberos Attacks'), {
    top: 'Kerberos Attacks',
    sub: 'Kerberos Attacks',
    grouped: false,
});
assert.deepStrictEqual(splitCategory('Other - Misc'), {
    top: 'Other - Misc',
    sub: 'Other - Misc',
    grouped: false,
});

// Top levels are distinct and keep first-appearance order; grouped categories
// collapse to their prefix.
assert.deepStrictEqual(
    topLevels([
        'ADSA - 1. Domain Admins',
        'ADSA - 2. Enterprise Admins',
        'ESA - Tier Zero',
        'Kerberos Attacks',
    ]),
    ['ADSA', 'ESA', 'Kerberos Attacks']
);
assert.deepStrictEqual(topLevels([]), []);
assert.ok(GROUP_PREFIXES.includes('ADSA') && GROUP_PREFIXES.includes('ESA'));

console.log('queryCategories: grouping logic passed');
