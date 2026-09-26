// High value marking modelled on BloodHound Community Edition. CE does not
// use Legacy's highvalue property; it marks Tier Zero with the Tag_Tier_Zero
// label and the admin_tier_0 entry in system_tags. A node gets the high value
// diamond when any of these is true:
//   - highvalue: true (Legacy's own marking, set from the right-click menu)
//   - the Tag_Tier_Zero label
//   - admin_tier_0 in system_tags
//   - it is in the protected set below, while the "Protected Groups Are High
//     Value" setting is on
//
// The protected set is what Legacy's post-processing and CE treat as high
// value by default: the AD protected/privileged groups and their nested
// members, the objects CE's ProtectAdminGroups edges point to, Azure tenants,
// and the privileged Entra roles' holders. It is read with one query and
// cached; nothing is written to the database.

export const TIER_ZERO_LABEL = 'Tag_Tier_Zero';
export const TIER_ZERO_TAG = 'admin_tier_0';

// Domain-relative RIDs of the protected AD groups: Domain Admins, Domain
// Controllers, Schema Admins, Enterprise Admins, Read-only Domain
// Controllers, Key Admins and Enterprise Key Admins.
export const AD_PROTECTED_RIDS = [
    '-512',
    '-516',
    '-518',
    '-519',
    '-521',
    '-526',
    '-527',
];

// Well-known SIDs of the protected builtin groups: Administrators, Account,
// Server, Print and Backup Operators, Replicator and Enterprise Domain
// Controllers. Collectors prefix these with the domain name.
export const AD_PROTECTED_BUILTINS = [
    'S-1-5-32-544',
    'S-1-5-32-548',
    'S-1-5-32-549',
    'S-1-5-32-550',
    'S-1-5-32-551',
    'S-1-5-32-552',
    'S-1-5-9',
];

// Global Administrator and Privileged Role Administrator, as in the
// setGlobalAdminHighValue and setPrivRoleAdminHighValue post-processing steps.
export const AZ_PRIVILEGED_ROLES = [
    '62E90394-69F5-4237-9190-012177145E10',
    'E8611AB8-C189-46E8-94E1-60213AB1F814',
];

const protectedGroup = (g) => `(
    (${g}.objectid STARTS WITH 'S-1-5-21-' AND any(rid IN $rids WHERE ${g}.objectid ENDS WITH rid))
    OR any(sid IN $builtins WHERE ${g}.objectid = sid OR ${g}.objectid ENDS WITH '-' + sid))`;

const azPrincipal = (n) =>
    `(${n}:AZUser OR ${n}:AZServicePrincipal OR ${n}:AZDevice)`;

const privilegedRole = 'toUpper(r.templateid) IN $roles';

export const PROTECTED_QUERY = [
    `MATCH (g:Group) WHERE ${protectedGroup('g')}
    RETURN g.objectid AS id`,
    `MATCH (m)-[:MemberOf*1..]->(g:Group) WHERE ${protectedGroup('g')}
    RETURN m.objectid AS id`,
    `MATCH ()-[:ProtectAdminGroups]->(n)
    RETURN n.objectid AS id`,
    `MATCH (n:AZTenant)
    RETURN n.objectid AS id`,
    `MATCH (g:AZGroup)-[:AZHasRole]->(r:AZRole) WHERE ${privilegedRole}
    RETURN g.objectid AS id`,
    `MATCH (i)-[:AZMemberOf]->(:AZGroup)-[:AZHasRole]->(r:AZRole)
    WHERE ${privilegedRole} AND ${azPrincipal('i')}
    RETURN i.objectid AS id`,
    `MATCH (p)-[:AZHasRole]->(r:AZRole) WHERE ${privilegedRole} AND ${azPrincipal('p')}
    RETURN p.objectid AS id`,
].join('\n    UNION\n    ');

export const PROTECTED_PARAMS = {
    rids: AD_PROTECTED_RIDS,
    builtins: AD_PROTECTED_BUILTINS,
    roles: AZ_PRIVILEGED_ROLES,
};

// system_tags is a space-separated string in CE; accept a list as well.
export function hasSystemTag(tags, tag) {
    if (!tags) return false;
    const list = Array.isArray(tags) ? tags : String(tags).split(/\s+/);
    return list.includes(tag);
}

// The setting, saved as "protectedGroupsHighValue" in the app config.
export function protectedGroupsEnabled() {
    return conf.get('protectedGroupsHighValue') !== false;
}

export function setProtectedGroupsEnabled(value) {
    conf.set('protectedGroupsHighValue', value);
    return refreshProtected();
}

let protectedIds = new Set();
let generation = 0;

export const isProtected = (objectid) => protectedIds.has(objectid);

// Reloads the protected set (or clears it when the setting is off) and emits
// highValueUpdated once it has changed. Overlapping refreshes are fine: only
// the most recent one is kept.
export async function refreshProtected() {
    const mine = ++generation;
    let ids = new Set();
    if (protectedGroupsEnabled() && global.driver) {
        const session = driver.session({ defaultAccessMode: 'READ' });
        try {
            const result = await session.run(PROTECTED_QUERY, PROTECTED_PARAMS);
            for (const record of result.records) {
                const id = record.get('id');
                if (id !== null) ids.add(id);
            }
        } catch (e) {
            console.error(e);
            return;
        } finally {
            session.close();
        }
    }
    if (mine !== generation) return;
    protectedIds = ids;
    emitter.emit('highValueUpdated');
}

// Whether a node gets the diamond. highvalue is Legacy's property, which the
// right-click menu keeps current on drawn nodes.
export function isHighValue({ objectid, labels, properties, highvalue }) {
    const props = properties || {};
    return (
        highvalue === true ||
        (labels || []).includes(TIER_ZERO_LABEL) ||
        hasSystemTag(props.system_tags, TIER_ZERO_TAG) ||
        (objectid !== undefined && isProtected(objectid))
    );
}
