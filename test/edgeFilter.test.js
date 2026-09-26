import assert from 'assert';
import { filterStatement, NO_MATCH_TYPE } from '../src/js/edgeFilter';

const included = { MemberOf: true, AdminTo: true, HasSession: false };
const enabled = 'MemberOf|AdminTo';

const cases = [
    [
        'drops a disabled type from a type list',
        'MATCH p=(n)-[r:MemberOf|HasSession*1..]->(m) RETURN p',
        'MATCH p=(n)-[r:MemberOf*1..]->(m) RETURN p',
    ],
    [
        'handles the |: separator',
        'MATCH p=(n)-[:AdminTo|:HasSession]->(m) RETURN p',
        'MATCH p=(n)-[:AdminTo]->(m) RETURN p',
    ],
    [
        'matches nothing when every type is disabled',
        'MATCH p=(n)<-[:HasSession]-(m) RETURN p',
        `MATCH p=(n)<-[:${NO_MATCH_TYPE}]-(m) RETURN p`,
    ],
    [
        'limits untyped patterns to the enabled types',
        'MATCH p=shortestPath((n)-[*1..]->(m)) RETURN p',
        `MATCH p=shortestPath((n)-[:${enabled}*1..]->(m)) RETURN p`,
    ],
    [
        'keeps the variable on untyped patterns',
        'MATCH p=(n)-[r]->(m) RETURN p',
        `MATCH p=(n)-[r:${enabled}]->(m) RETURN p`,
    ],
    [
        'keeps relationship properties',
        "MATCH p=(n)-[r:HasSession|AdminTo {name:'a]b'}]->(m) RETURN p",
        "MATCH p=(n)-[r:AdminTo {name:'a]b'}]->(m) RETURN p",
    ],
    [
        'leaves types that have no filter row alone',
        'MATCH p=(n)-[:GetChanges|HasSession]->(m) RETURN p',
        'MATCH p=(n)-[:GetChanges]->(m) RETURN p',
    ],
    [
        'ignores lists and indexing',
        "MATCH (n) WHERE n.name IN ['-[:HasSession]-'] RETURN labels(n)[0]",
        "MATCH (n) WHERE n.name IN ['-[:HasSession]-'] RETURN labels(n)[0]",
    ],
    [
        'ignores comments',
        'MATCH (n) // -[:HasSession]->\nRETURN n',
        'MATCH (n) // -[:HasSession]->\nRETURN n',
    ],
    [
        'never rewrites write statements',
        'MATCH (n)-[r:HasSession]->(m) DELETE r',
        'MATCH (n)-[r:HasSession]->(m) DELETE r',
    ],
    [
        'does not mistake keywords inside strings for writes',
        "MATCH p=(n {name:'SET'})-[:HasSession]->(m) RETURN p",
        `MATCH p=(n {name:'SET'})-[:${NO_MATCH_TYPE}]->(m) RETURN p`,
    ],
];

for (const [name, input, expected] of cases) {
    assert.strictEqual(filterStatement(input, included), expected, name);
}

assert.strictEqual(
    filterStatement('MATCH p=(n)-[r]->(m) RETURN p', {
        MemberOf: true,
        AdminTo: true,
    }),
    'MATCH p=(n)-[r]->(m) RETURN p',
    'leaves statements alone when nothing is disabled'
);

console.log(`edgeFilter: ${cases.length + 1} cases passed`);
