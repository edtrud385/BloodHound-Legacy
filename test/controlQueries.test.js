import assert from 'assert';
import {
    AD_CONTROL_EDGES,
    AZ_CONTROL_EDGES,
    inboundControlQueries,
    outboundControlQueries,
    azInboundControlQueries,
    azOutboundControlQueries,
} from '../src/js/controlQueries';

// The ADCS rights CE counts as control are in the AD list.
for (const edge of [
    'ManageCA',
    'ManageCertificates',
    'Enroll',
    'WritePKIEnrollmentFlag',
    'WritePKINameFlag',
    'GenericAll',
    'WriteOwnerLimitedRights',
])
    assert.ok(AD_CONTROL_EDGES.includes(edge), edge);
assert.ok(AZ_CONTROL_EDGES.includes('AZOwns'));
assert.ok(AZ_CONTROL_EDGES.every((edge) => edge.startsWith('AZ')));

const ca = inboundControlQueries('EnterpriseCA');
assert.ok(ca.explicit.startsWith('MATCH p = (n)-[r:AllExtendedRights|'));
assert.ok(ca.explicit.endsWith('->(t:EnterpriseCA {objectid: $objectid})'));
assert.ok(ca.unrolled.startsWith('MATCH p = (n)-[r:MemberOf*1..]->(g:Group)'));
assert.ok(ca.transitive.includes('shortestPath((n)-[r:MemberOf|AllExtendedRights|'));

const base = outboundControlQueries('Base');
assert.ok(base.explicit.startsWith('MATCH p = (s:Base {objectid: $objectid})-[r:'));
assert.ok(base.explicit.endsWith(']->(n)'));
assert.ok(base.unrolled.includes('-[r:MemberOf*1..]->(g:Group)-[r1:'));

const device = azInboundControlQueries('AZDevice');
assert.ok(device.explicit.includes('-[r:AZAvereContributor|'));
assert.ok(device.unrolled.includes('-[r:AZMemberOf*1..]->(g:AZGroup)'));
assert.ok(device.transitive.includes('shortestPath((n)-[r:AZMemberOf|AZAvereContributor|'));
assert.ok(azOutboundControlQueries('AZUser').explicit.startsWith('MATCH p = (s:AZUser '));

console.log('controlQueries: query cases passed');
