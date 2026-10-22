import assert from 'assert';
import { propLabel, propValue } from '../src/js/propLabels';

assert.strictEqual(propLabel('administrators'), 'Administrators');
assert.strictEqual(propLabel('hasadministrators'), 'Has Administrators');
assert.strictEqual(propLabel('admincount'), 'Admin Count');
assert.strictEqual(propLabel('enrolleesuppliessubject'), 'Enrollee Supplies Subject');
assert.strictEqual(propLabel('system_tags'), 'System Tags');
// CE's own display names
assert.strictEqual(propLabel('appdisplayname'), 'App Display Name');
assert.strictEqual(propLabel('certthumbprint'), 'Certificate Thumbprint');
// keys that cannot be split into known words are shown whole, not in pieces
assert.strictEqual(propLabel('webclientthing'), 'Webclientthing');
assert.strictEqual(propLabel('hasspn'), 'Has SPN');
assert.strictEqual(propValue(['a', 'b']), 'a\nb');
assert.strictEqual(propValue(true), 'True');

console.log('propLabels: label cases passed');
