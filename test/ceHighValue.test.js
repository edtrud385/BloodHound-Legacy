import assert from 'assert';
import {
    PROTECTED_QUERY,
    PROTECTED_PARAMS,
    hasSystemTag,
    isHighValue,
    refreshProtected,
} from '../src/js/ceHighValue';

// The protected set query must never write to the database.
assert.ok(
    !/\b(CREATE|MERGE|DELETE|SET|REMOVE|CALL)\b/.test(PROTECTED_QUERY),
    'protected query is read-only'
);
// ProtectAdminGroups also points at former admins, so it is not used.
assert.ok(!PROTECTED_QUERY.includes('ProtectAdminGroups'));
assert.ok(PROTECTED_QUERY.includes('AZTenant'));
assert.deepStrictEqual(PROTECTED_PARAMS.roles, [
    '62E90394-69F5-4237-9190-012177145E10',
    'E8611AB8-C189-46E8-94E1-60213AB1F814',
]);
assert.ok(PROTECTED_PARAMS.rids.includes('-512'));
assert.ok(PROTECTED_PARAMS.builtins.includes('S-1-5-32-544'));

assert.ok(hasSystemTag('admin_tier_0 owned', 'admin_tier_0'));
assert.ok(hasSystemTag(['owned', 'admin_tier_0'], 'admin_tier_0'));
assert.ok(!hasSystemTag('admin_tier_01', 'admin_tier_0'));
assert.ok(!hasSystemTag(undefined, 'admin_tier_0'));

const cases = [
    ['plain node', { labels: ['Base', 'User'], properties: {} }, false],
    ['highvalue property', { highvalue: true, properties: {} }, true],
    ['highvalue false', { highvalue: false, properties: {} }, false],
    ['Tag_Tier_Zero label', { labels: ['Base', 'Tag_Tier_Zero'] }, true],
    [
        'admin_tier_0 system tag',
        { properties: { system_tags: 'admin_tier_0' } },
        true,
    ],
    ['owned tag only', { properties: { system_tags: 'owned' } }, false],
    // Unmark from the right-click menu hides the diamond whatever marks it.
    [
        'unmarked Tier Zero',
        {
            labels: ['Tag_Tier_Zero'],
            properties: { system_tags: 'admin_tier_0', highvalueoverride: true },
        },
        false,
    ],
    [
        'unmarked highvalue',
        { highvalue: true, properties: { highvalueoverride: true } },
        false,
    ],
    [
        'override false',
        { labels: ['Tag_Tier_Zero'], properties: { highvalueoverride: false } },
        true,
    ],
];
for (const [name, node, expected] of cases) {
    assert.strictEqual(isHighValue(node), expected, name);
}

// The protected set is read from the database, and dropped again when the
// setting is turned off.
const config = {};
const events = [];
global.conf = {
    get: (key) => config[key],
    set: (key, value) => (config[key] = value),
};
global.emitter = { emit: (name) => events.push(name) };
global.driver = {
    session: () => ({
        run: async () => ({
            records: ['S-1-5-21-1-2-3-512', null].map((id) => ({
                get: () => id,
            })),
        }),
        close: () => {},
    }),
};

const da = { objectid: 'S-1-5-21-1-2-3-512', properties: {} };

(async () => {
    assert.strictEqual(isHighValue(da), false, 'not protected before load');
    await refreshProtected();
    assert.strictEqual(isHighValue(da), true, 'protected by default');
    assert.strictEqual(
        isHighValue({ ...da, properties: { highvalueoverride: true } }),
        false,
        'unmarked protected node'
    );
    config.protectedGroupsHighValue = false;
    await refreshProtected();
    assert.strictEqual(isHighValue(da), false, 'setting off');
    assert.deepStrictEqual(events, ['highValueUpdated', 'highValueUpdated']);
    console.log(`ceHighValue: ${cases.length + 4} cases passed`);
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
