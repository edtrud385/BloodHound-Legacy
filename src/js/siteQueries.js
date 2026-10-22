import { inboundControlQueries as adInboundControlQueries } from './controlQueries';

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

// Inbound Control Rights queries for a node of `kind` matched by $objectid,
// over the edges CE creates on sites.
export const inboundControlQueries = (kind, edges = SITE_CONTROL_EDGES) =>
    adInboundControlQueries(kind, edges);

export const gpoControllerQuery = (kind) =>
    `MATCH p = (n)-[r:${types(
        GPO_CONTROL_EDGES
    )}]->(g:GPO)-[r1:GPLink]->(t:${kind} {objectid: $objectid})`;
