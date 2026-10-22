import React from 'react';
import NodePanel from './Components/NodePanel';
import { inboundControlQueries } from '../../../js/controlQueries';

const t = '(t:CertTemplate {objectid: $objectid})';

const overview = [
    {
        property: 'Published To CAs',
        query: `MATCH p = ${t}-[r:PublishedTo]->(n:EnterpriseCA)`,
        outbound: true,
    },
    {
        property: 'Issuance Policies',
        query: `MATCH p = ${t}-[r:ExtendedByPolicy]->(n:IssuancePolicy)`,
        outbound: true,
    },
    {
        property: 'Enrollment Rights',
        query: `MATCH p = (n)-[r:Enroll|GenericAll|AllExtendedRights]->${t}`,
    },
    {
        property: 'Unrolled Enrollment Rights',
        query: `MATCH p = (n)-[r:MemberOf*1..]->(g:Group)-[r1:Enroll|GenericAll|AllExtendedRights]->${t}`,
    },
];

const displayMap = {
    objectid: 'Object ID',
    description: 'Description',
    distinguishedname: 'Distinguished Name',
    displayname: 'Display Name',
    schemaversion: 'Schema Version',
    enrolleesuppliessubject: 'Enrollee Supplies Subject',
    subjectaltrequireupn: 'Subject Alt Requires UPN',
    requiresmanagerapproval: 'Requires Manager Approval',
    authenticationenabled: 'Authentication Enabled',
    nosecurityextension: 'No Security Extension',
    authorizedsignatures: 'Authorized Signatures',
    effectiveekus: 'Effective EKUs',
    validityperiod: 'Validity Period',
    renewalperiod: 'Renewal Period',
};

const CertTemplateNodeData = () => (
    <NodePanel
        kind='CertTemplate'
        displayMap={displayMap}
        overview={overview}
        inbound={inboundControlQueries('CertTemplate')}
    />
);

export default CertTemplateNodeData;
