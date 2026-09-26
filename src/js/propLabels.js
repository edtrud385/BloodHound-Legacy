// Readable labels for the lowercase, run-together property keys that
// BloodHound stores (e.g. "enrolleesuppliessubject").

const LABELS = {
    objectid: 'Object ID',
    distinguishedname: 'Distinguished Name',
    samaccountname: 'SAM Account Name',
    displayname: 'Display Name',
    admincount: 'Admin Count',
    pwdlastset: 'Password Last Set',
    lastlogon: 'Last Logon',
    lastlogontimestamp: 'Last Logon Timestamp',
    whencreated: 'When Created',
    unconstraineddelegation: 'Unconstrained Delegation',
    trustedtoauth: 'Trusted To Auth For Delegation',
    serviceprincipalnames: 'Service Principal Names',
    hasspn: 'Has SPN',
    passwordnotreqd: 'Password Not Required',
    dontreqpreauth: 'Does Not Require Pre-Auth',
    sensitive: 'Sensitive (Not Delegated)',
    enabled: 'Enabled',
    highvalue: 'High Value',
    system_tags: 'System Tags',
    operatingsystem: 'Operating System',
    enrolleesuppliessubject: 'Enrollee Supplies Subject',
    requiresmanagerapproval: 'Requires Manager Approval',
    authenticationenabled: 'Authentication Enabled',
    authorizedsignatures: 'Authorized Signatures',
    effectiveekus: 'Effective EKUs',
    ekus: 'EKUs',
    certificatenameflag: 'Certificate Name Flag',
    enrollmentflag: 'Enrollment Flag',
    nosecurityextension: 'No Security Extension',
    schemaversion: 'Schema Version',
    renewalperiod: 'Renewal Period',
    validityperiod: 'Validity Period',
    isuserspecifiessanenabled: 'User Specifies SAN Enabled',
    hasvulnerableendpoint: 'Has Vulnerable Endpoint',
    hasenrollmentagentrestrictions: 'Has Enrollment Agent Restrictions',
    strongcertificatebindingenforcementraw:
        'Strong Certificate Binding Enforcement',
    certificatemappingmethodsraw: 'Certificate Mapping Methods',
    caname: 'CA Name',
    dnshostname: 'DNS Host Name',
    casecuritycollected: 'CA Security Collected',
    istierzero: 'Is Tier Zero',
    isowned: 'Is Owned',
    doesanyacegrantownerrights: 'Does Any ACE Grant Owner Rights',
    doesanyinheritedacegrantownerrights:
        'Does Any Inherited ACE Grant Owner Rights',
    owner: 'Owner',
    ownersid: 'Owner SID',
    functionallevel: 'Functional Level',
    domainsid: 'Domain SID',
    domain: 'Domain',
    name: 'Name',
    description: 'Description',
    title: 'Title',
    email: 'Email',
    homedirectory: 'Home Directory',
    userpassword: 'User Password',
    unixpassword: 'Unix Password',
    sfupassword: 'SFU Password',
    logonscript: 'Logon Script',
    gpcpath: 'GPC Path',
    blocksinheritance: 'Blocks Inheritance',
    isaclprotected: 'ACL Protected',
    sidhistory: 'SID History',
    allowedtodelegate: 'Allowed To Delegate',
    lastcollected: 'Last Collected',
    azname: 'Name',
    azsize: 'Size',
};

// Words used to split keys that have no entry above.
const WORDS = [
    'certificate', 'enrollment', 'distinguished', 'operating', 'delegation',
    'principal', 'inherited', 'security', 'extension', 'management',
    'account', 'password', 'mapping', 'methods', 'binding', 'enforcement',
    'restrictions', 'authentication', 'authorized', 'signatures',
    'effective', 'functional', 'timestamp', 'directory', 'protected',
    'collected', 'vulnerable', 'endpoint', 'supplies', 'requires', 'manager',
    'approval', 'schema', 'version', 'renewal', 'validity', 'period',
    'object', 'domain', 'owner', 'rights', 'grant', 'service', 'names',
    'value', 'system', 'tags', 'history', 'logon', 'last', 'when', 'created',
    'name', 'flag', 'does', 'any', 'ace', 'has', 'spn', 'sid', 'ekus', 'eku',
    'user', 'specifies', 'san', 'enabled', 'not', 'required', 'sensitive',
    'high', 'is', 'admin', 'count', 'tier', 'zero', 'owned', 'trusted',
    'auth', 'for', 'host', 'dns',
];

// Greedily splits a run-together key into known words.
function splitWords(key) {
    const out = [];
    let rest = key;
    while (rest.length) {
        let hit = null;
        for (const word of WORDS) {
            if (rest.startsWith(word) && (!hit || word.length > hit.length))
                hit = word;
        }
        if (!hit) {
            // take characters up to where the next known word starts
            let cut = 1;
            while (
                cut < rest.length &&
                !WORDS.some((word) => rest.startsWith(word, cut))
            )
                cut++;
            hit = rest.slice(0, cut);
        }
        out.push(hit);
        rest = rest.slice(hit.length);
    }
    return out.join(' ');
}

export function propLabel(key) {
    if (LABELS[key]) return LABELS[key];
    const text = key.includes('_') ? key.replace(/_/g, ' ') : splitWords(key);
    return text.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Formats a property value the same way MappedNodeProps does, and joins
// lists one item per line.
export function propValue(value) {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value))
        return value.length ? value.map(propValue).join('\n') : '(empty)';
    if (typeof value === 'boolean') return value ? 'True' : 'False';
    if (typeof value === 'number') {
        if (value === -1) return 'Never';
        const now = Math.round(new Date().getTime() / 1000);
        //315536400 = January 1st, 1980
        if (value > 315536400 && value < now)
            return new Date(value * 1000).toUTCString();
        return value.toLocaleString();
    }
    return String(value);
}
