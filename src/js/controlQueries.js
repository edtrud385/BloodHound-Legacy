// Edges CE counts as control of an AD object (ad.ACLRelationships() in CE's
// graph schema), for the Inbound Control Rights / Outbound Object Control
// sections of the AD and ADCS panels.
export const AD_CONTROL_EDGES = [
    'AllExtendedRights',
    'ForceChangePassword',
    'AddMember',
    'AddAllowedToAct',
    'GenericAll',
    'WriteDacl',
    'WriteOwner',
    'GenericWrite',
    'ReadLAPSPassword',
    'ReadGMSAPassword',
    'Owns',
    'AddSelf',
    'WriteSPN',
    'AddKeyCredentialLink',
    'GetChanges',
    'GetChangesAll',
    'GetChangesInFilteredSet',
    'WriteAccountRestrictions',
    'WriteGPLink',
    'SyncLAPSPassword',
    'DCSync',
    'ManageCertificates',
    'ManageCA',
    'Enroll',
    'WritePKIEnrollmentFlag',
    'WritePKINameFlag',
    'WriteOwnerLimitedRights',
    'OwnsLimitedRights',
    'WriteAltSecurityIdentities',
    'WritePublicInformation',
];

// Edges CE counts as control of an Azure / Entra object
// (azure.ControlRelationships()).
export const AZ_CONTROL_EDGES = [
    'AZAvereContributor',
    'AZContributor',
    'AZOwner',
    'AZVMContributor',
    'AZAutomationContributor',
    'AZKeyVaultContributor',
    'AZAddMembers',
    'AZAddSecret',
    'AZExecuteCommand',
    'AZGlobalAdmin',
    'AZGrant',
    'AZGrantSelf',
    'AZPrivilegedRoleAdmin',
    'AZResetPassword',
    'AZUserAccessAdministrator',
    'AZOwns',
    'AZCloudAppAdmin',
    'AZAppAdmin',
    'AZAddOwner',
    'AZManagedIdentity',
    'AZAKSContributor',
    'AZWebsiteContributor',
    'AZLogicAppContributor',
    'AZMGAddMember',
    'AZMGAddOwner',
    'AZMGAddSecret',
    'AZMGGrantAppRoles',
    'AZMGGrantRole',
    'AZAuthenticatesTo',
];

const AD = { memberOf: 'MemberOf', group: 'Group' };
const AZ = { memberOf: 'AZMemberOf', group: 'AZGroup' };

const types = (edges) => edges.join('|');

// Inbound control queries for a node of `kind` matched by $objectid. Each
// one binds the controller as n and the path as p, the way NodeCypherLink /
// NodePlayCypherLink expect.
const inbound = (kind, edges, { memberOf, group }) => ({
    explicit: `MATCH p = (n)-[r:${types(edges)}]->(t:${kind} {objectid: $objectid})`,
    unrolled: `MATCH p = (n)-[r:${memberOf}*1..]->(g:${group})-[r1:${types(
        edges
    )}]->(t:${kind} {objectid: $objectid}) WITH LENGTH(p) as pathLength, p, n, t WHERE NONE (x in NODES(p)[1..(pathLength-1)] WHERE x.objectid = t.objectid) AND NOT n.objectid = t.objectid`,
    transitive: `MATCH (n) WHERE NOT n.objectid = $objectid WITH n MATCH p = shortestPath((n)-[r:${memberOf}|${types(
        edges
    )}*1..]->(t:${kind} {objectid: $objectid}))`,
});

// Outbound control queries: what a node of `kind` controls, bound as n.
const outbound = (kind, edges, { memberOf, group }) => ({
    explicit: `MATCH p = (s:${kind} {objectid: $objectid})-[r:${types(
        edges
    )}]->(n)`,
    unrolled: `MATCH p = (s:${kind} {objectid: $objectid})-[r:${memberOf}*1..]->(g:${group})-[r1:${types(
        edges
    )}]->(n)`,
    transitive: `MATCH (n) WHERE NOT n.objectid = $objectid WITH n MATCH p = shortestPath((s:${kind} {objectid: $objectid})-[r:${memberOf}|${types(
        edges
    )}*1..]->(n))`,
});

export const inboundControlQueries = (kind, edges = AD_CONTROL_EDGES) =>
    inbound(kind, edges, AD);

export const outboundControlQueries = (kind, edges = AD_CONTROL_EDGES) =>
    outbound(kind, edges, AD);

export const azInboundControlQueries = (kind, edges = AZ_CONTROL_EDGES) =>
    inbound(kind, edges, AZ);

export const azOutboundControlQueries = (kind, edges = AZ_CONTROL_EDGES) =>
    outbound(kind, edges, AZ);
