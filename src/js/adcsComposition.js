// ADCS edge "composition" expansion, modelled on BloodHound Community
// Edition. A precomputed edge such as (principal)-[:ADCSESC1]->(domain) is a
// summary of a longer chain: the principal's enrollment/control rights on a
// certificate template, the template being published to an enterprise CA, the
// CA's certificate chain up to the domain's root CA, and the CA being trusted
// for NT authentication. Expanding the edge draws that underlying subgraph.
//
// Each entry below reproduces the structure and the per-ESC template/CA
// conditions from CE's published composition queries, parameterised so one
// query serves both cases:
//   $s = the source principal's objectid, or null to expand every principal
//        that has this edge into the target (used for domain-wide expansion)
//   $t = the target objectid (a Domain for most types, a Group for ESC13)
//
// These need data collected for CE (the ADCS nodes and edges: CertTemplate,
// EnterpriseCA, NTAuthStore, PublishedTo, TrustedForNTAuth, Enroll, ...). If
// those are absent the queries simply return nothing, exactly as in CE.

// The chain shared by most ESC types: template published to a CA, the CA's
// chain to the domain, the CA trusted for NT auth, and (optionally) direct
// enrollment on the CA.
const caChainToDomain = `
    MATCH p2 = (ca)-[:IssuedSignedBy|EnterpriseCAFor|RootCAFor*1..]->(target:Domain)
    MATCH p3 = (ca)-[:TrustedForNTAuth]->(:NTAuthStore)-[:NTAuthStoreFor]->(target)
    OPTIONAL MATCH p4 = (start)-[:MemberOf*0..]->()-[:Enroll]->(ca)`;

// A principal-controls-a-template composition. controlRels is the set of
// edges that let the principal abuse the template; templateWhere is the extra
// per-ESC condition on the template (ct) or CA (ca).
const templateEsc = (controlRels, templateWhere) => ({
    target: 'Domain',
    paths: ['p1', 'p2', 'p3', 'p4'],
    body: `
    MATCH p1 = (start)-[:MemberOf*0..]->()-[:${controlRels}]->(ct:CertTemplate)-[:PublishedTo]->(ca:EnterpriseCA)${caChainToDomain}
    WITH * WHERE target.objectid = $t AND ($s IS NULL OR start.objectid = $s)${templateWhere}`,
});

// A "victim" composition (ESC9/ESC10): the principal has control over another
// object m, and m can enroll in an abusable template.
const victimEsc = (templateWhere) => ({
    target: 'Domain',
    paths: ['p1', 'p2', 'p3'],
    body: `
    MATCH p1 = (start)-[:GenericAll|GenericWrite|Owns|WriteOwner|WriteDacl]->(m)-[:MemberOf*0..]->()-[:GenericAll|Enroll|AllExtendedRights]->(ct:CertTemplate)-[:PublishedTo]->(ca:EnterpriseCA)
    MATCH p2 = (ca)-[:IssuedSignedBy|EnterpriseCAFor|RootCAFor*1..]->(target:Domain)
    MATCH p3 = (m)-[:MemberOf*0..]->()-[:Enroll]->(ca)-[:TrustedForNTAuth]->(:NTAuthStore)-[:NTAuthStoreFor]->(target)
    WITH * WHERE target.objectid = $t AND ($s IS NULL OR start.objectid = $s)${templateWhere}`,
});

const COMPOSITIONS = {
    ADCSESC1: templateEsc(
        'GenericAll|Enroll|AllExtendedRights',
        `
      AND ct.requiresmanagerapproval = false
      AND ct.authenticationenabled = true
      AND ct.enrolleesuppliessubject = true
      AND (ct.schemaversion = 1 OR ct.authorizedsignatures = 0)`
    ),

    // Enrollment agent: control an agent template that can enroll on behalf of
    // a second, authentication-capable template.
    ADCSESC3: {
        target: 'Domain',
        paths: ['p1', 'p2', 'p3', 'p4', 'p5'],
        body: `
    MATCH p1 = (start)-[:MemberOf*0..]->()-[:GenericAll|Enroll|AllExtendedRights]->(ct1:CertTemplate)-[:PublishedTo]->(ca:EnterpriseCA)
    MATCH p2 = (ct1)-[:EnrollOnBehalfOf]->(ct2:CertTemplate)-[:PublishedTo]->(ca)
    MATCH p3 = (ca)-[:IssuedSignedBy|EnterpriseCAFor|RootCAFor*1..]->(target:Domain)
    MATCH p4 = (ca)-[:TrustedForNTAuth]->(:NTAuthStore)-[:NTAuthStoreFor]->(target)
    OPTIONAL MATCH p5 = (start)-[:MemberOf*0..]->()-[:Enroll]->(ca)
    WITH * WHERE target.objectid = $t AND ($s IS NULL OR start.objectid = $s)
      AND ct1.requiresmanagerapproval = false
      AND (ct1.schemaversion = 1 OR ct1.authorizedsignatures = 0)
      AND ct2.authenticationenabled = true
      AND ct2.requiresmanagerapproval = false`,
    },

    // Write access to a template's configuration; no template precondition,
    // since the point is that the attacker can rewrite it.
    ADCSESC4: templateEsc(
        'GenericAll|Owns|WriteOwner|WriteDacl|GenericWrite|WritePKINameFlag|WritePKIEnrollmentFlag',
        ''
    ),

    // Misconfigured CA (EDITF_ATTRIBUTESUBJECTALTNAME2).
    ADCSESC6a: templateEsc(
        'GenericAll|Enroll|AllExtendedRights',
        `
      AND ca.isuserspecifiessanenabled = true
      AND ct.authenticationenabled = true
      AND ct.requiresmanagerapproval = false
      AND (ct.schemaversion = 1 OR ct.authorizedsignatures = 0)`
    ),
    ADCSESC6b: templateEsc(
        'GenericAll|Enroll|AllExtendedRights',
        `
      AND ca.isuserspecifiessanenabled = true
      AND ct.schannelauthenticationenabled = true
      AND ct.requiresmanagerapproval = false
      AND (ct.schemaversion = 1 OR ct.authorizedsignatures = 0)`
    ),

    ADCSESC9a: victimEsc(`
      AND ct.requiresmanagerapproval = false
      AND ct.authenticationenabled = true
      AND ct.nosecurityextension = true
      AND ct.enrolleesuppliessubject = false
      AND (ct.subjectaltrequireupn = true OR ct.subjectaltrequirespn = true)
      AND ((ct.schemaversion > 1 AND ct.authorizedsignatures = 0) OR ct.schemaversion = 1)`),
    ADCSESC9b: victimEsc(`
      AND ct.requiresmanagerapproval = false
      AND ct.authenticationenabled = true
      AND ct.nosecurityextension = true
      AND ct.enrolleesuppliessubject = false
      AND ct.subjectaltrequiredns = true
      AND ((ct.schemaversion > 1 AND ct.authorizedsignatures = 0) OR ct.schemaversion = 1)`),
    ADCSESC10a: victimEsc(`
      AND ct.requiresmanagerapproval = false
      AND ct.authenticationenabled = true
      AND ct.enrolleesuppliessubject = false
      AND (ct.subjectaltrequireupn = true OR ct.subjectaltrequirespn = true)
      AND ((ct.schemaversion > 1 AND ct.authorizedsignatures = 0) OR ct.schemaversion = 1)`),
    ADCSESC10b: victimEsc(`
      AND ct.requiresmanagerapproval = false
      AND ct.schannelauthenticationenabled = true
      AND ct.enrolleesuppliessubject = false
      AND ct.subjectaltrequiredns = true
      AND ((ct.schemaversion > 1 AND ct.authorizedsignatures = 0) OR ct.schemaversion = 1)`),

    // ESC13 targets a Group (via an issuance policy linked to that group),
    // not a domain.
    ADCSESC13: {
        target: 'Group',
        paths: ['p1', 'p2', 'p3', 'p4'],
        body: `
    MATCH p1 = (start)-[:MemberOf*0..]->()-[:Enroll|GenericAll|AllExtendedRights]->(ct:CertTemplate)-[:PublishedTo]->(ca:EnterpriseCA)-[:IssuedSignedBy|EnterpriseCAFor|RootCAFor*1..]->(d:Domain)
    MATCH p2 = (ca)-[:TrustedForNTAuth]->(:NTAuthStore)-[:NTAuthStoreFor]->(d)
    MATCH p3 = (ct)-[:ExtendedByPolicy]->(:IssuancePolicy)-[:OIDGroupLink]->(target:Group)
    MATCH p4 = (d)-[:Contains|SameForestTrust*..]->(target)
    WITH * WHERE target.objectid = $t AND ($s IS NULL OR start.objectid = $s)
      AND ct.authenticationenabled = true
      AND ct.requiresmanagerapproval = false
      AND (ct.schemaversion = 1 OR ct.authorizedsignatures = 0)`,
    },

    // A stolen CA private key (forged "golden" certificates).
    GoldenCert: {
        target: 'Domain',
        paths: ['p1', 'p2', 'p3'],
        body: `
    MATCH p1 = (start)-[:HostsCAService]->(ca:EnterpriseCA)
    MATCH p2 = (ca)-[:IssuedSignedBy|EnterpriseCAFor|RootCAFor*1..]->(target:Domain)
    MATCH p3 = (ca)-[:TrustedForNTAuth]->(:NTAuthStore)-[:NTAuthStoreFor]->(target)
    WITH * WHERE target.objectid = $t AND ($s IS NULL OR start.objectid = $s)`,
    },
};

export const COMPOSITION_EDGE_TYPES = new Set(Object.keys(COMPOSITIONS));

export const isCompositionEdge = (type) => COMPOSITION_EDGE_TYPES.has(type);

// The statement for one edge, returning its component paths.
export function compositionQuery(type) {
    const entry = COMPOSITIONS[type];
    if (!entry) return null;
    return `${entry.body}\n    RETURN ${entry.paths.join(', ')}`;
}

// A single statement expanding every Domain-targeting ADCS attack into the
// domain $t (with $s null). Each composition is reduced to a stream of
// `path` rows and unioned together. ESC13 is excluded because it targets a
// group rather than the domain.
export function domainCompositionQuery() {
    const parts = Object.values(COMPOSITIONS)
        .filter((entry) => entry.target === 'Domain')
        .map(
            (entry) =>
                `${entry.body}\n    WITH [${entry.paths.join(
                    ', '
                )}] AS ps UNWIND ps AS path\n    WITH path WHERE path IS NOT NULL\n    RETURN path`
        );
    return parts.join('\n    UNION\n');
}
