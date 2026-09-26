// Edge types produced by BloodHound Community Edition collection that
// Legacy's Edge Filtering pane does not list. Grouped the way the pane
// shows them.
export const CE_EDGE_GROUPS = [
    {
        title: 'ADCS',
        sectionName: 'ADCS',
        edges: [
            'ADCSESC1',
            'ADCSESC3',
            'ADCSESC4',
            'ADCSESC5',
            'ADCSESC6a',
            'ADCSESC6b',
            'ADCSESC7',
            'ADCSESC9a',
            'ADCSESC9b',
            'ADCSESC10a',
            'ADCSESC10b',
            'ADCSESC13',
            'GoldenCert',
        ],
    },
    {
        title: 'ADCS Control',
        sectionName: 'ADCS control',
        edges: [
            'ManageCA',
            'ManageCertificates',
            'WritePKIEnrollmentFlag',
            'WritePKINameFlag',
            'EnrollOnBehalfOf',
            'DelegatedEnrollmentAgent',
        ],
    },
    {
        title: 'Local Groups',
        sectionName: 'local group',
        edges: [
            'MemberOfLocalGroup',
            'LocalToComputer',
            'RemoteInteractiveLogonRight',
        ],
    },
    {
        title: 'CE Attack Paths',
        sectionName: 'CE attack path',
        edges: [
            'CoerceToTGT',
            'DCFor',
            'HasTrustKeys',
            'SpoofSIDHistory',
            'AbuseTGTDelegation',
            'WriteGPLink',
            'GPOAppliesTo',
            'CanApplyGPO',
            'SyncedToEntraUser',
            'WriteOwnerLimitedRights',
            'OwnsLimitedRights',
        ],
    },
];

export const CE_EDGES = CE_EDGE_GROUPS.reduce(
    (all, group) => all.concat(group.edges),
    []
);

// Every edge type that has a fixed row in the Edge Filtering pane. Anything
// else that ends up in the edgeincluded config (edge types seen in a drawn
// graph) is listed under "Other".
export const LEGACY_FILTER_EDGES = [
    'MemberOf',
    'HasSession',
    'AdminTo',
    'AllExtendedRights',
    'AddMember',
    'ForceChangePassword',
    'GenericAll',
    'GenericWrite',
    'Owns',
    'WriteDacl',
    'WriteOwner',
    'ReadLAPSPassword',
    'ReadGMSAPassword',
    'AddKeyCredentialLink',
    'WriteSPN',
    'AddSelf',
    'AddAllowedToAct',
    'WriteAccountRestrictions',
    'DCSync',
    'SyncLAPSPassword',
    'Contains',
    'GPLink',
    'CanRDP',
    'CanPSRemote',
    'ExecuteDCOM',
    'AllowedToDelegate',
    'AllowedToAct',
    'SQLAdmin',
    'HasSIDHistory',
    'DumpSMSAPassword',
];

export const isListedEdge = (name) =>
    LEGACY_FILTER_EDGES.includes(name) ||
    CE_EDGES.includes(name) ||
    name.startsWith('AZ');
