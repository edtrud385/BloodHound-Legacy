import assert from 'assert';
import { nodeKind } from '../src/js/nodeKind';

// Tier Zero / owned tags can come before the real kind in the label list.
assert.strictEqual(nodeKind(['Tag_Tier_Zero', 'AZBase', 'AZUser']), 'AZUser');
assert.strictEqual(nodeKind(['AZBase', 'AZUser', 'Tag_Tier_Zero']), 'AZUser');
assert.strictEqual(nodeKind(['Base', 'Tag_Owned', 'User']), 'User');
assert.strictEqual(nodeKind(['Base', 'Computer']), 'Computer');

// Nothing but Base / tags left: fall back.
assert.strictEqual(nodeKind(['Base', 'Tag_Tier_Zero']), 'Base');
assert.strictEqual(nodeKind([]), 'Base');
assert.strictEqual(nodeKind(undefined), 'Base');
assert.strictEqual(nodeKind(['AZBase'], 'AZBase'), 'AZBase');

console.log('nodeKind: label cases passed');
