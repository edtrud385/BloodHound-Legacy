// Edges CE creates from a principal onto an AD Site (SharpHound v2.17 Site
// ACLs), for the Inbound Control Rights sections of the Site, SiteServer and
// SiteSubnet panels. WriteGPLink is how a principal links a GPO to the site.
export const SITE_CONTROL_EDGES = [
    'GenericAll',
    'GenericWrite',
    'WriteDacl',
    'WriteOwner',
    'Owns',
    'OwnsLimitedRights',
    'WriteOwnerLimitedRights',
    'WriteGPLink',
    'AllExtendedRights',
];

// Edges that give control of a GPO, for "who can edit a GPO linked here".
export const GPO_CONTROL_EDGES = [
    'GenericAll',
    'GenericWrite',
    'WriteDacl',
    'WriteOwner',
    'Owns',
    'OwnsLimitedRights',
    'WriteOwnerLimitedRights',
    'AllExtendedRights',
];

const types = (edges) => edges.join('|');

// Inbound Control Rights queries for a node of `kind` matched by $objectid.
// Each one binds the controller as n and the path as p, the way
// NodeCypherLink / NodePlayCypherLink expect.
export const inboundControlQueries = (kind, edges = SITE_CONTROL_EDGES) => ({
    explicit: `MATCH p = (n)-[r:${types(edges)}]->(t:${kind} {objectid: $objectid})`,
    unrolled: `MATCH p = (n)-[r:MemberOf*1..]->(g:Group)-[r1:${types(
        edges
    )}]->(t:${kind} {objectid: $objectid}) WITH LENGTH(p) as pathLength, p, n, t WHERE NONE (x in NODES(p)[1..(pathLength-1)] WHERE x.objectid = t.objectid) AND NOT n.objectid = t.objectid`,
    transitive: `MATCH (n) WHERE NOT n.objectid = $objectid WITH n MATCH p = shortestPath((n)-[r:MemberOf|${types(
        edges
    )}*1..]->(t:${kind} {objectid: $objectid}))`,
});

export const gpoControllerQuery = (kind) =>
    `MATCH p = (n)-[r:${types(
        GPO_CONTROL_EDGES
    )}]->(g:GPO)-[r1:GPLink]->(t:${kind} {objectid: $objectid})`;
