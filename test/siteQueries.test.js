import assert from 'assert';
import {
    SITE_CONTROL_EDGES,
    inboundControlQueries,
    gpoControllerQuery,
} from '../src/js/siteQueries';

// The edges CE documents onto a Site are all in the list.
for (const edge of [
    'GenericAll',
    'GenericWrite',
    'WriteDacl',
    'WriteOwner',
    'Owns',
    'OwnsLimitedRights',
    'WriteOwnerLimitedRights',
    'WriteGPLink',
])
    assert.ok(SITE_CONTROL_EDGES.includes(edge), edge);

const q = inboundControlQueries('Site');
assert.ok(q.explicit.includes('|WriteGPLink|'));
assert.ok(q.explicit.endsWith('->(t:Site {objectid: $objectid})'));
assert.ok(q.unrolled.startsWith('MATCH p = (n)-[r:MemberOf*1..]->(g:Group)'));
assert.ok(q.transitive.includes('shortestPath((n)-[r:MemberOf|GenericAll|'));
assert.ok(inboundControlQueries('SiteSubnet').explicit.includes('(t:SiteSubnet '));
assert.ok(gpoControllerQuery('Site').includes('(g:GPO)-[r1:GPLink]->(t:Site '));

console.log('siteQueries: query cases passed');
