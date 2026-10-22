import React from 'react';
import NodePanel from './Components/NodePanel';

const t = '(t:ADLocalUser {objectid: $objectid})';

// A computer's local (SAM) account, from CE's local group collection. It has
// no AD ACL, so there is no control section.
const overview = [
    {
        property: 'Computer',
        query: `MATCH p = ${t}-[r:LocalToComputer]->(n:Computer)`,
        outbound: true,
    },
    {
        property: 'Local Group Membership',
        query: `MATCH p = ${t}-[r:MemberOfLocalGroup]->(n:ADLocalGroup)`,
        outbound: true,
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
    enabled: 'Enabled',
    lastlogon: 'Last Logon',
    pwdlastset: 'Password Last Set',
};

const ADLocalUserNodeData = () => (
    <NodePanel kind='ADLocalUser' displayMap={displayMap} overview={overview} />
);

export default ADLocalUserNodeData;
