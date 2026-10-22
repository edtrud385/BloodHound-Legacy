import React, { useContext, useEffect, useState } from 'react';
import clsx from 'clsx';
import CollapsibleSection from './Components/CollapsibleSection';
import CEProperties from './Components/CEProperties';
import NodeCypherLink from './Components/NodeCypherLink';
import MappedNodeProps from './Components/MappedNodeProps';
import { Table } from 'react-bootstrap';
import styles from './NodeData.module.css';
import { AppContext } from '../../../AppContext';

// Node Info for a federated identity credential (FIC) on an app registration.
// Whoever can get a token from the credential's issuer with a matching subject
// can sign in as the app (AZAuthenticatesTo), so the issuer and subject are
// the properties that matter.
const AZFederatedIdentityCredentialNodeData = () => {
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
        if (type === 'AZFederatedIdentityCredential') {
            setVisible(true);
            setObjectid(id);
            let session = driver.session();
            session
                .run(
                    `MATCH (n:AZFederatedIdentityCredential {objectid: $objectid}) RETURN n AS node`,
                    {
                        objectid: id,
                    }
                )
                .then((r) => {
                    let props = r.records[0].get('node').properties;
                    setNodeProps(props);
                    setLabel(props.name || props.displayname || id);
                    session.close();
                });
        } else {
            setObjectid(null);
            setVisible(false);
        }
    };

    const displayMap = {
        objectid: 'Object ID',
        displayname: 'Display Name',
        issuer: 'Issuer',
        subject: 'Subject',
        audiences: 'Audiences',
        description: 'Description',
        appid: 'App ID',
        tenantid: 'Tenant ID',
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
                                    property='Authenticates To App'
                                    target={objectid}
                                    baseQuery={
                                        'MATCH p=(:AZFederatedIdentityCredential {objectid: $objectid})-[:AZAuthenticatesTo]->(n:AZApp)'
                                    }
                                    start={label}
                                />
                                <NodeCypherLink
                                    property='Runs As Service Principal'
                                    target={objectid}
                                    baseQuery={
                                        'MATCH p=(:AZFederatedIdentityCredential {objectid: $objectid})-[:AZAuthenticatesTo]->(:AZApp)-[:AZRunsAs]->(n:AZServicePrincipal)'
                                    }
                                    start={label}
                                />
                                <NodeCypherLink
                                    property='Reachable High Value Targets'
                                    target={objectid}
                                    baseQuery={
                                        'MATCH (m:AZFederatedIdentityCredential {objectid: $objectid}),(n {highvalue:true}),p=shortestPath((m)-[r*1..]->(n)) WHERE NOT m=n'
                                    }
                                    start={label}
                                />
                            </tbody>
                        </Table>
                    </div>
                </CollapsibleSection>

                <MappedNodeProps
                    kind='AZFederatedIdentityCredential'
                    displayMap={displayMap}
                    properties={nodeProps}
                    label={label}
                />

                <CEProperties properties={nodeProps} />

                <hr></hr>

                <CollapsibleSection header='INBOUND CONTROL'>
                    <div className={styles.itemlist}>
                        <Table>
                            <thead></thead>
                            <tbody className='searchable'>
                                <NodeCypherLink
                                    property='Explicit Inbound Edges'
                                    target={objectid}
                                    baseQuery={
                                        'MATCH p = (n)-[r]->(g:AZFederatedIdentityCredential {objectid: $objectid})'
                                    }
                                    end={label}
                                />
                            </tbody>
                        </Table>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
};

AZFederatedIdentityCredentialNodeData.propTypes = {};
export default AZFederatedIdentityCredentialNodeData;
