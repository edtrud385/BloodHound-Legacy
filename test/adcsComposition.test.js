import assert from 'assert';
import {
    COMPOSITION_EDGE_TYPES,
    isCompositionEdge,
    compositionQuery,
    domainCompositionQuery,
} from '../src/js/adcsComposition';

// Every ADCS edge type the Edge Filtering pane lists as abusable should have a
// composition, and each should be a read-only, parameterised query.
const expected = [
    'ADCSESC1',
    'ADCSESC3',
    'ADCSESC4',
    'ADCSESC6a',
    'ADCSESC6b',
    'ADCSESC9a',
    'ADCSESC9b',
    'ADCSESC10a',
    'ADCSESC10b',
    'ADCSESC13',
    'GoldenCert',
];

for (const type of expected) {
    assert.ok(isCompositionEdge(type), `${type} is a composition edge`);
    const q = compositionQuery(type);
    assert.ok(q && q.includes('RETURN'), `${type} has a RETURN`);
    assert.ok(q.includes('$t'), `${type} is parameterised by target`);
    assert.ok(q.includes('$s'), `${type} is parameterised by source`);
    assert.ok(!/\b(CREATE|MERGE|DELETE|SET|REMOVE)\b/.test(q), `${type} is read-only`);
}

assert.strictEqual(
    COMPOSITION_EDGE_TYPES.size,
    expected.length,
    'no unexpected composition edges'
);
assert.strictEqual(compositionQuery('MemberOf'), null, 'non-ADCS edge has none');
assert.ok(!isCompositionEdge('AdminTo'));

const domain = domainCompositionQuery();
assert.ok(domain.includes('UNION'), 'domain query unions the compositions');
assert.ok(domain.includes('RETURN path'), 'domain query returns a path column');
// ESC13 targets a group, so it is not part of the domain-wide expansion.
assert.ok(
    (domain.match(/UNION/g) || []).length ===
        expected.filter((t) => t !== 'ADCSESC13').length - 1,
    'domain query unions every domain-targeting composition'
);

console.log(`adcsComposition: ${expected.length} edge types checked`);
