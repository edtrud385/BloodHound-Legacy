import React, { useContext } from 'react';
import clsx from 'clsx';
import { Table } from 'react-bootstrap';
import CollapsibleSection from './CollapsibleSection';
import NodeCypherLink from './NodeCypherLink';
import NodePlayCypherLink from './NodePlayCypherLink';
import MappedNodeProps from './MappedNodeProps';
import ExtraNodeProps from './ExtraNodeProps';
import CEProperties from './CEProperties';
import {
    InboundControlSection,
    OutboundControlSection,
} from './ControlSections';
import useNodePanel from './useNodePanel';
import styles from '../NodeData.module.css';
import { AppContext } from '../../../../AppContext';

// One section of query rows. Each row is { property, query } where query
// binds the counted node as n and the path as p; `outbound: true` draws the
// clicked node as the start of the path instead of the end, and `play: true`
// makes the row run on click (for slow shortestPath queries).
const QuerySection = ({ header, rows, objectid, label }) => (
    <CollapsibleSection header={header}>
        <div className={styles.itemlist}>
            <Table>
                <thead></thead>
                <tbody className='searchable'>
                    {rows.map((row) => {
                        const Link = row.play
                            ? NodePlayCypherLink
                            : NodeCypherLink;
                        const ends = row.outbound
                            ? { start: label }
                            : { end: label };
                        return (
                            <Link
                                key={row.property}
                                property={row.property}
                                target={objectid}
                                baseQuery={row.query}
                                distinct
                                {...ends}
                            />
                        );
                    })}
                </tbody>
            </Table>
        </div>
    </CollapsibleSection>
);

// Node Info panel for one kind, laid out like the Site panels: overview
// rows, node properties, CE properties, then the kind's own sections and its
// inbound / outbound control. A section with `top: true` goes above the
// overview instead. Used by the panels for the kinds CE added
// (ADCS, local groups and users).
const NodePanel = ({
    kind,
    displayMap = {},
    overview = [],
    sections = [],
    inbound,
    outbound,
}) => {
    const { visible, objectid, label, nodeProps } = useNodePanel(kind);
    const context = useContext(AppContext);

    if (objectid === null) return <div></div>;

    const linkProps = { objectid, label };

    return (
        <div
            className={clsx(
                !visible && 'displaynone',
                context.darkMode ? styles.dark : styles.light
            )}
        >
            <div className={clsx(styles.dl)}>
                <h5>{label || objectid}</h5>

                {sections
                    .filter((section) => section.top)
                    .map((section) => (
                        <React.Fragment key={section.header}>
                            <QuerySection
                                header={section.header}
                                rows={section.rows}
                                {...linkProps}
                            />
                            <hr></hr>
                        </React.Fragment>
                    ))}

                {overview.length > 0 && (
                    <>
                        <QuerySection
                            header='OVERVIEW'
                            rows={overview}
                            {...linkProps}
                        />
                        <hr></hr>
                    </>
                )}

                <MappedNodeProps
                    kind={kind}
                    displayMap={displayMap}
                    properties={nodeProps}
                    label={label}
                />

                <hr></hr>

                <ExtraNodeProps
                    displayMap={displayMap}
                    properties={nodeProps}
                    label={label}
                />

                <CEProperties properties={nodeProps} />

                {sections
                    .filter((section) => !section.top)
                    .map((section) => (
                        <React.Fragment key={section.header}>
                            <hr></hr>
                            <QuerySection
                                header={section.header}
                                rows={section.rows}
                                {...linkProps}
                            />
                        </React.Fragment>
                    ))}

                {inbound && (
                    <>
                        <hr></hr>
                        <InboundControlSection
                            queries={inbound}
                            {...linkProps}
                        />
                    </>
                )}

                {outbound && (
                    <>
                        <hr></hr>
                        <OutboundControlSection
                            queries={outbound}
                            {...linkProps}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default NodePanel;
