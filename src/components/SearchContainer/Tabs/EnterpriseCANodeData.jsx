import React from 'react';
import NodePanel from './Components/NodePanel';
import { inboundControlQueries } from '../../../js/controlQueries';

const t = '(t:EnterpriseCA {objectid: $objectid})';

const overview = [
    {
        property: 'Hosting Computers',
        query: `MATCH p = (n:Computer)-[r:HostsCAService]->${t}`,
    },
    {
        property: 'Published Templates',
        query: `MATCH p = (n:CertTemplate)-[r:PublishedTo]->${t}`,
    },
    {
        property: 'Enrollment Rights',
        query: `MATCH p = (n)-[r:Enroll]->${t}`,
    },
    {
        property: 'Unrolled Enrollment Rights',
        query: `MATCH p = (n)-[r:MemberOf*1..]->(g:Group)-[r1:Enroll]->${t}`,
    },
];

// CE's PKI Hierarchy: the computers hosting the CA and the CAs it issued,
// and up the chain to the root CA, the NTAuth store and the domain.
const hierarchy = [
    {
        property: 'Issued CAs',
        query: `MATCH p = (n)-[r:HostsCAService|IssuedSignedBy|EnterpriseCAFor*1..]->${t}`,
    },
    {
        property: 'Issuing Chain',
        query: `MATCH p = ${t}-[r:EnterpriseCAFor|TrustedForNTAuth|IssuedSignedBy|RootCAFor|NTAuthStoreFor*1..]->(n)`,
        outbound: true,
    },
    {
        property: 'Trusted For NTAuth',
        query: `MATCH p = ${t}-[r:TrustedForNTAuth]->(n:NTAuthStore)`,
        outbound: true,
    },
    {
        property: 'Domains',
        query: `MATCH p = ${t}-[r:EnterpriseCAFor|IssuedSignedBy|RootCAFor|TrustedForNTAuth|NTAuthStoreFor*1..]->(n:Domain)`,
        outbound: true,
    },
];

const displayMap = {
    objectid: 'Object ID',
    description: 'Description',
    distinguishedname: 'Distinguished Name',
    caname: 'CA Name',
    dnshostname: 'DNS Host Name',
    isuserspecifiessanenabled: 'User Specifies SAN Enabled',
    hasenrollmentagentrestrictions: 'Has Enrollment Agent Restrictions',
    casecuritycollected: 'CA Security Collected',
};

const EnterpriseCANodeData = () => (
    <NodePanel
        kind='EnterpriseCA'
        displayMap={displayMap}
        overview={overview}
        sections={[{ header: 'PKI HIERARCHY', rows: hierarchy, top: true }]}
        inbound={inboundControlQueries('EnterpriseCA')}
    />
);

export default EnterpriseCANodeData;
