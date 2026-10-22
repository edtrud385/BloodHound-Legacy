import React, { useContext, useEffect, useState } from 'react';
import clsx from 'clsx';
import CollapsibleSection from './Components/CollapsibleSection';
import NodeCypherLink from './Components/NodeCypherLink';
import NodePlayCypherLink from './Components/NodePlayCypherLink';
import MappedNodeProps from './Components/MappedNodeProps';
import ExtraNodeProps from './Components/ExtraNodeProps';
import CEProperties from './Components/CEProperties';
import { Table } from 'react-bootstrap';
import styles from './NodeData.module.css';
import { AppContext } from '../../../AppContext';
import {
    inboundControlQueries,
    gpoControllerQuery,
} from '../../../js/siteQueries';

const inbound = inboundControlQueries('Site');

const SiteNodeData = () => {
    const [visible, setVisible] = useState(false);
    const [objectid, setObjectid] = useState(null);
    const [label, setLabel] = useState(null);
    const [nodeProps, setNodeProps] = useState({});
    const context = useContext(AppContext);

    useEffect(() => {
        emitter.on('nodeClicked', nodeClickEvent);

        return () => {
            emitter.removeListener('nodeClicked', nodeClickEvent);
        };
    }, []);

    const nodeClickEvent = (type, id) => {
        if (type === 'Site') {
            setVisible(true);
            setObjectid(id);
            let session = driver.session();
            session
                .run(`MATCH (n:Site {objectid: $objectid}) RETURN n AS node`, {
                    objectid: id,
                })
                .then((r) => {
                    let props = r.records[0].get('node').properties;
                    setNodeProps(props);
                    setLabel(props.name || id);
                    session.close();
                });
        } else {
            setObjectid(null);
            setVisible(false);
        }
    };

    const displayMap = {
        objectid: 'Object ID',
        description: 'Description',
        distinguishedname: 'Distinguished Name',
    };

    return objectid === null ? (
        <div></div>
    ) : (
        <div
            className={clsx(
                !visible && 'displaynone',
                context.darkMode ? styles.dark : styles.light
            )}
        >
            <div className={clsx(styles.dl)}>
                <h5>{label || objectid}</h5>

                <CollapsibleSection header='OVERVIEW'>
                    <div className={styles.itemlist}>
                        <Table>
                            <thead></thead>
                            <tbody className='searchable'>
                                <NodeCypherLink
                                    property='Site Servers'
                                    target={objectid}
                                    baseQuery={
                                        'MATCH p = (s:Site {objectid: $objectid})-[r:Contains]->(n:SiteServer)'
                                    }
                                    start={label}
                                    distinct
                                />
                                <NodeCypherLink
                                    property='Site Subnets'
                                    target={objectid}
                                    baseQuery={
                                        'MATCH p = (s:Site {objectid: $objectid})-[r:Contains]->(n:SiteSubnet)'
                                    }
                                    start={label}
                                    distinct
                                />
                                <NodeCypherLink
                                    property='Server Computers'
                                    target={objectid}
                                    baseQuery={
                                        'MATCH p = (s:Site {objectid: $objectid})-[r:Contains]->(:SiteServer)-[r1:ServerIs]->(n:Computer)'
                                    }
                                    start={label}
                                    distinct
                                />
                            </tbody>
                        </Table>
                    </div>
                </CollapsibleSection>

                <hr></hr>

                <MappedNodeProps
                    kind='Site'
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

                <hr></hr>

                <CollapsibleSection header='LINKED GPOS'>
                    <div className={styles.itemlist}>
                        <Table>
                            <thead></thead>
                            <tbody className='searchable'>
                                <NodeCypherLink
                                    property='Linked GPOs'
                                    target={objectid}
                                    baseQuery={
                                        'MATCH p = (n:GPO)-[r:GPLink]->(s:Site {objectid: $objectid})'
                                    }
                                    end={label}
                                    distinct
                                />
                                <NodeCypherLink
                                    property='Enforced GPOs'
                                    target={objectid}
                                    baseQuery={
                                        'MATCH p = (n:GPO)-[r:GPLink {enforced: true}]->(s:Site {objectid: $objectid})'
                                    }
                                    end={label}
                                    distinct
                                />
                                <NodeCypherLink
                                    property='Linked GPO Controllers'
                                    target={objectid}
                                    baseQuery={gpoControllerQuery('Site')}
                                    end={label}
                                    distinct
                                />
                            </tbody>
                        </Table>
                    </div>
                </CollapsibleSection>

                <hr></hr>

                <CollapsibleSection header='INBOUND CONTROL RIGHTS'>
                    <div className={styles.itemlist}>
                        <Table>
                            <thead></thead>
                            <tbody className='searchable'>
                                <NodeCypherLink
                                    property='Explicit Object Controllers'
                                    target={objectid}
                                    baseQuery={inbound.explicit}
                                    end={label}
                                    distinct
                                />
                                <NodeCypherLink
                                    property='Unrolled Object Controllers'
                                    target={objectid}
                                    baseQuery={inbound.unrolled}
                                    end={label}
                                    distinct
                                />
                                <NodePlayCypherLink
                                    property='Transitive Object Controllers'
                                    target={objectid}
                                    baseQuery={inbound.transitive}
                                    end={label}
                                    distinct
                                />
                            </tbody>
                        </Table>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
};

SiteNodeData.propTypes = {};
export default SiteNodeData;
