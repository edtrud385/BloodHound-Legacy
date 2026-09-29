import assert from 'assert';
import {
    GROUPS,
    splitCategory,
    topLevels,
} from '../src/js/queryCategories';

// The platform prefixes fold under their group with the remainder as the
// sub-label, whichever spelling is used.
assert.deepStrictEqual(splitCategory('Active Directory - Domain Admins'), {
    top: 'Active Directory',
    sub: 'Domain Admins',
    grouped: true,
});
assert.deepStrictEqual(splitCategory('Entra ID - Global Admins'), {
    top: 'Entra ID',
    sub: 'Global Admins',
    grouped: true,
});

// The older ADSA/ESA assessment labels alias onto the two platforms.
assert.deepStrictEqual(splitCategory('ADSA - 1. Domain Admins'), {
    top: 'Active Directory',
    sub: '1. Domain Admins',
    grouped: true,
});
assert.deepStrictEqual(splitCategory('ESA - Tier Zero'), {
    top: 'Entra ID',
    sub: 'Tier Zero',
    grouped: true,
});

// Matching is case-insensitive on the prefix.
assert.strictEqual(splitCategory('ad - Kerberoastable').top, 'Active Directory');
assert.strictEqual(splitCategory('azure ad - Apps').top, 'Entra ID');

// A non-platform category stands alone.
assert.deepStrictEqual(splitCategory('Kerberos Attacks'), {
    top: 'Kerberos Attacks',
    sub: 'Kerberos Attacks',
    grouped: false,
});

// Top levels are distinct and keep first-appearance order; grouped categories
// collapse to their platform label.
assert.deepStrictEqual(
    topLevels([
        'ADSA - 1. Domain Admins',
        'Active Directory - Kerberoasting',
        'ESA - Tier Zero',
        'Kerberos Attacks',
    ]),
    ['Active Directory', 'Entra ID', 'Kerberos Attacks']
);
assert.deepStrictEqual(topLevels([]), []);
assert.strictEqual(GROUPS.length, 2);

console.log('queryCategories: grouping logic passed');
