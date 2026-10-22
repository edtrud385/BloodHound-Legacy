import React from 'react';
import NodePanel from './Components/NodePanel';
import { inboundControlQueries } from '../../../js/controlQueries';

const t = '(t:RootCA {objectid: $objectid})';

const overview = [
    {
        property: 'Domains',
        query: `MATCH p = ${t}-[r:RootCAFor]->(n:Domain)`,
        outbound: true,
    },
];

// CE's PKI Hierarchy for a root CA: everything it issued, down to the
// enterprise CAs and the computers hosting them.
const hierarchy = [
    {
        property: 'Issued CAs',
        query: `MATCH p = (n)-[r:IssuedSignedBy|EnterpriseCAFor*1..]->${t} WHERE n:EnterpriseCA OR n:AIACA OR n:RootCA`,
    },
    {
        property: 'Enterprise CAs',
        query: `MATCH p = (n:EnterpriseCA)-[r:IssuedSignedBy|EnterpriseCAFor*1..]->${t}`,
    },
    {
        property: 'Full PKI Hierarchy',
        query: `MATCH p = (n)-[r:HostsCAService|IssuedSignedBy|EnterpriseCAFor*1..]->${t}`,
    },
];

const displayMap = {
    objectid: 'Object ID',
    description: 'Description',
    distinguishedname: 'Distinguished Name',
    certthumbprint: 'Certificate Thumbprint',
    hasbasicconstraints: 'Has Basic Constraints',
    basicconstraintpathlength: 'Basic Constraint Path Length',
};

const RootCANodeData = () => (
    <NodePanel
        kind='RootCA'
        displayMap={displayMap}
        overview={overview}
        sections={[{ header: 'PKI HIERARCHY', rows: hierarchy, top: true }]}
        inbound={inboundControlQueries('RootCA')}
    />
);

export default RootCANodeData;
