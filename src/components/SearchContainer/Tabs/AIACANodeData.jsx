import React from 'react';
import NodePanel from './Components/NodePanel';
import { inboundControlQueries } from '../../../js/controlQueries';

const t = '(t:AIACA {objectid: $objectid})';

// CE's PKI Hierarchy for an intermediate (AIA) CA: what it issued, and the
// chain up to the root CA and the domain.
const hierarchy = [
    {
        property: 'Issued CAs',
        query: `MATCH p = (n)-[r:HostsCAService|IssuedSignedBy|EnterpriseCAFor*1..]->${t}`,
    },
    {
        property: 'Issuing Chain',
        query: `MATCH p = ${t}-[r:EnterpriseCAFor|IssuedSignedBy|RootCAFor*1..]->(n)`,
        outbound: true,
    },
];

const displayMap = {
    objectid: 'Object ID',
    description: 'Description',
    distinguishedname: 'Distinguished Name',
    certthumbprint: 'Certificate Thumbprint',
    crosscertificatepair: 'Cross Certificate Pair',
    hascrosscertificatepair: 'Has Cross Certificate Pair',
};

const AIACANodeData = () => (
    <NodePanel
        kind='AIACA'
        displayMap={displayMap}
        sections={[{ header: 'PKI HIERARCHY', rows: hierarchy }]}
        inbound={inboundControlQueries('AIACA')}
    />
);

export default AIACANodeData;
