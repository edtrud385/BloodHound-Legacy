import React from 'react';
import NodePanel from './Components/NodePanel';
import { inboundControlQueries } from '../../../js/controlQueries';

const t = '(t:IssuancePolicy {objectid: $objectid})';

const overview = [
    {
        property: 'Linked Certificate Templates',
        query: `MATCH p = (n:CertTemplate)-[r:ExtendedByPolicy]->${t}`,
    },
    {
        property: 'Linked Group',
        query: `MATCH p = ${t}-[r:OIDGroupLink]->(n:Group)`,
        outbound: true,
    },
];

const displayMap = {
    objectid: 'Object ID',
    description: 'Description',
    distinguishedname: 'Distinguished Name',
    displayname: 'Display Name',
    certtemplateoid: 'Certificate Template OID',
    grouplinkid: 'Group Link ID',
};

const IssuancePolicyNodeData = () => (
    <NodePanel
        kind='IssuancePolicy'
        displayMap={displayMap}
        overview={overview}
        inbound={inboundControlQueries('IssuancePolicy')}
    />
);

export default IssuancePolicyNodeData;
