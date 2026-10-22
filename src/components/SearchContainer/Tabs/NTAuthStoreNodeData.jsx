import React from 'react';
import NodePanel from './Components/NodePanel';
import { inboundControlQueries } from '../../../js/controlQueries';

const t = '(t:NTAuthStore {objectid: $objectid})';

const overview = [
    {
        property: 'Trusted CAs',
        query: `MATCH p = (n)-[r:TrustedForNTAuth]->${t}`,
    },
    {
        property: 'Domains',
        query: `MATCH p = ${t}-[r:NTAuthStoreFor]->(n:Domain)`,
        outbound: true,
    },
];

const displayMap = {
    objectid: 'Object ID',
    description: 'Description',
    distinguishedname: 'Distinguished Name',
    certthumbprints: 'Certificate Thumbprints',
};

const NTAuthStoreNodeData = () => (
    <NodePanel
        kind='NTAuthStore'
        displayMap={displayMap}
        overview={overview}
        inbound={inboundControlQueries('NTAuthStore')}
    />
);

export default NTAuthStoreNodeData;
