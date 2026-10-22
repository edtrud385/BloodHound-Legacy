import React from 'react';
import { Table } from 'react-bootstrap';
import CollapsibleSection from './CollapsibleSection';
import NodeCypherLink from './NodeCypherLink';
import NodePlayCypherLink from './NodePlayCypherLink';
import styles from '../NodeData.module.css';

// Inbound control section over queries from js/controlQueries: who has
// control rights on the node, directly, through group membership, or by any
// path of control edges.
export const InboundControlSection = ({
    queries,
    objectid,
    label,
    header = 'INBOUND CONTROL RIGHTS',
}) => (
    <CollapsibleSection header={header}>
        <div className={styles.itemlist}>
            <Table>
                <thead></thead>
                <tbody className='searchable'>
                    <NodeCypherLink
                        property='Explicit Object Controllers'
                        target={objectid}
                        baseQuery={queries.explicit}
                        end={label}
                        distinct
                    />
                    <NodeCypherLink
                        property='Unrolled Object Controllers'
                        target={objectid}
                        baseQuery={queries.unrolled}
                        end={label}
                        distinct
                    />
                    <NodePlayCypherLink
                        property='Transitive Object Controllers'
                        target={objectid}
                        baseQuery={queries.transitive}
                        end={label}
                        distinct
                    />
                </tbody>
            </Table>
        </div>
    </CollapsibleSection>
);

// Outbound counterpart: what the node has control rights on.
export const OutboundControlSection = ({
    queries,
    objectid,
    label,
    header = 'OUTBOUND OBJECT CONTROL',
}) => (
    <CollapsibleSection header={header}>
        <div className={styles.itemlist}>
            <Table>
                <thead></thead>
                <tbody className='searchable'>
                    <NodeCypherLink
                        property='First Degree Object Control'
                        target={objectid}
                        baseQuery={queries.explicit}
                        start={label}
                        distinct
                    />
                    <NodeCypherLink
                        property='Group Delegated Object Control'
                        target={objectid}
                        baseQuery={queries.unrolled}
                        start={label}
                        distinct
                    />
                    <NodePlayCypherLink
                        property='Transitive Object Control'
                        target={objectid}
                        baseQuery={queries.transitive}
                        start={label}
                        distinct
                    />
                </tbody>
            </Table>
        </div>
    </CollapsibleSection>
);
