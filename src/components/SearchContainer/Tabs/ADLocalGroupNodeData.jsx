import React from 'react';
import NodePanel from './Components/NodePanel';

const t = '(t:ADLocalGroup {objectid: $objectid})';

// A computer's local (SAM) group, from CE's local group collection. It has
// no AD ACL, so there is no control section.
const overview = [
    {
        property: 'Computer',
        query: `MATCH p = ${t}-[r:LocalToComputer]->(n:Computer)`,
        outbound: true,
    },
    {
        property: 'Members',
        query: `MATCH p = (n)-[r:MemberOfLocalGroup]->${t}`,
    },
    {
        property: 'Unrolled Members',
        query: `MATCH p = (n)-[r:MemberOf*0..]->(g)-[r1:MemberOfLocalGroup]->${t} WHERE NOT n:Group AND NOT n:ADLocalGroup`,
    },
    {
        property: 'Logon Rights',
        query: `MATCH p = ${t}-[r:RemoteInteractiveLogonRight]->(n:Computer)`,
        outbound: true,
    },
];

const displayMap = {
    objectid: 'Object ID',
    description: 'Description',
};

const ADLocalGroupNodeData = () => (
    <NodePanel
        kind='ADLocalGroup'
        displayMap={displayMap}
        overview={overview}
    />
);

export default ADLocalGroupNodeData;
