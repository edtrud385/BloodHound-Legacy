import assert from 'assert';
import { propLabel, propValue } from '../src/js/propLabels';

assert.strictEqual(propLabel('administrators'), 'Administrators');
assert.strictEqual(propLabel('hasadministrators'), 'Has Administrators');
assert.strictEqual(propLabel('admincount'), 'Admin Count');
assert.strictEqual(propLabel('enrolleesuppliessubject'), 'Enrollee Supplies Subject');
assert.strictEqual(propLabel('system_tags'), 'System Tags');
assert.strictEqual(propValue(['a', 'b']), 'a\nb');
assert.strictEqual(propValue(true), 'True');

console.log('propLabels: label cases passed');
