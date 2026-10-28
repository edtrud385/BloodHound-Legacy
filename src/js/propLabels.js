// Readable labels for the lowercase, run-together property keys that
// BloodHound stores (e.g. "enrolleesuppliessubject").

import { CE_LABELS } from './ceLabels';

const LABELS = {
    objectid: 'Object ID',
    distinguishedname: 'Distinguished Name',
    samaccountname: 'SAM Account Name',
    displayname: 'Display Name',
    admincount: 'Admin Count',
    administrators: 'Administrators',
    adminsdholderprotected: 'AdminSDHolder Protected',
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
    highvalueoverride: 'High Value Unmarked',
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
    'administrators', 'administrator', 'principal', 'inherited', 'security', 'extension', 'management',
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

// Splits a run-together key into known words, preferring the fewest words.
// Returns null when some part of the key is not a known word, so a key is
// never cut into fragments like "Admin Is Trators".
function splitWords(key) {
    // best[i] holds the shortest split of key.slice(0, i)
    const best = [[]];
    for (let i = 1; i <= key.length; i++) {
        for (const word of WORDS) {
            const start = i - word.length;
            if (start < 0 || !best[start] || !key.startsWith(word, start))
                continue;
            if (!best[i] || best[start].length + 1 < best[i].length)
                best[i] = best[start].concat(word);
        }
    }
    return best[key.length] ? best[key.length].join(' ') : null;
}

export function propLabel(key) {
    if (LABELS[key]) return LABELS[key];
    if (CE_LABELS[key]) return CE_LABELS[key];
    const text = key.includes('_')
        ? key.replace(/_/g, ' ')
        : splitWords(key) || key;
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
