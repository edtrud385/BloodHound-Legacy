import assert from 'assert';
import {
    parseVersion,
    isNewer,
    pickLatestTag,
    compareToTags,
    checkForUpdate,
} from '../src/js/updateCheck';

assert.deepStrictEqual(parseVersion('v1.2.3'), [1, 2, 3]);
assert.deepStrictEqual(parseVersion(' 1.0 '), [1, 0]);
assert.deepStrictEqual(parseVersion(''), []);

assert.ok(isNewer('1.1.0', '1.0.0'));
assert.ok(isNewer('v1.0.1', '1.0.0'));
assert.ok(isNewer('1.2', '1.1.9'));
assert.ok(!isNewer('1.0.0', '1.0.0'));
assert.ok(!isNewer('1.0.0', '1.1.0'));

assert.strictEqual(
    pickLatestTag([{ name: 'v1.0.0' }, { name: 'v1.3.0' }, { name: 'v1.2.0' }]),
    'v1.3.0'
);
assert.strictEqual(pickLatestTag([{ name: 'nightly' }]), null);
assert.strictEqual(pickLatestTag([]), null);

assert.strictEqual(
    compareToTags('1.0.0', [{ name: 'v1.1.0' }]).status,
    'update'
);
assert.strictEqual(
    compareToTags('1.1.0', [{ name: 'v1.1.0' }]).status,
    'current'
);
assert.strictEqual(compareToTags('1.0.0', []).status, 'untagged');

// checkForUpdate with an injected fetch: update available.
(async () => {
    const fakeFetch = async (url) => ({
        ok: true,
        json: async () =>
            url.includes('/tags')
                ? [{ name: 'v2.0.0' }, { name: 'v1.0.0' }]
                : [],
    });
    const r = await checkForUpdate('1.0.0', fakeFetch);
    assert.strictEqual(r.status, 'update');
    assert.strictEqual(r.latest, 'v2.0.0');

    // No tags -> falls back to latest commit.
    const noTags = async (url) => ({
        ok: true,
        json: async () =>
            url.includes('/tags')
                ? []
                : [{ sha: 'abcdef1234567', commit: { author: { date: '2026-09-27T00:00:00Z' } } }],
    });
    const c = await checkForUpdate('1.0.0', noTags);
    assert.strictEqual(c.status, 'untagged');
    assert.strictEqual(c.commit, 'abcdef1');
    assert.strictEqual(c.date, '2026-09-27');

    // Network failure is swallowed into an error status.
    const boom = async () => {
        throw new Error('offline');
    };
    const e = await checkForUpdate('1.0.0', boom);
    assert.strictEqual(e.status, 'error');
    assert.strictEqual(e.message, 'offline');

    console.log('updateCheck: version and check logic passed');
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
