import React, { useContext, useEffect, useState } from 'react';
import styles from './NodeData.module.css';
import CEProperties from './Components/CEProperties';
import { AppContext } from '../../../AppContext';

// Node Info for kinds Legacy has no panel of its own for (the ADCS kinds
// and anything else from CE): the node's name and its CE Properties. Kinds
// with their own panel show the same CE Properties section inside it.
const CENodeData = ({ visible }) => {
    const [target, setTarget] = useState(null);
    const [node, setNode] = useState(null);
    const context = useContext(AppContext);

    useEffect(() => {
        const nodeClickEvent = (type, objectid) => {
            setTarget(objectid ? { type: type, objectid: objectid } : null);
        };
        emitter.on('nodeClicked', nodeClickEvent);
        return () => {
            emitter.removeListener('nodeClicked', nodeClickEvent);
        };
    }, []);

    useEffect(() => {
        if (!visible || target === null) return;
        let current = true;
        setNode({ ...target, loading: true });
        fetchNode(target.type, target.objectid)
            .then((result) => ({ ...target, ...result }))
            .catch((e) => ({ ...target, error: e.message }))
            .then((result) => {
                // a later click wins over a slow lookup
                if (current) setNode(result);
            });
        return () => {
            current = false;
        };
    }, [target, visible]);

    if (!visible || node === null) return <div />;

    const props = node.properties || {};
    const name = props.name || props.azname || props.displayname;
    const kind =
        (node.labels || []).find(
            (l) => l !== 'Base' && l !== 'AZBase' && !l.startsWith('Tag_')
        ) || node.type;

    let properties = props;
    let extraRows = [];
    if (node.loading) {
        properties = {};
        extraRows = [['Loading', '...']];
    } else if (node.error) {
        extraRows = [['Lookup failed', node.error]];
    } else if (!node.properties) {
        extraRows = [['Node', `not found (${node.objectid})`]];
    } else if (node.labels && node.labels.length) {
        extraRows = [['All Kinds', node.labels.join(', ')]];
    }

    return (
        <div className={context.darkMode ? styles.dark : styles.light}>
            <div className={styles.dl}>
                <h5>
                    {name || node.objectid}
                    {kind && <span className={styles.kind}> - {kind}</span>}
                </h5>
            </div>
            <CEProperties
                properties={properties}
                extraRows={extraRows}
                alwaysOpen
            />
        </div>
    );
};

// Looks the node up by its kind first, then falls back to the base labels
// and finally to any node with that objectid.
async function fetchNode(type, objectid) {
    const statements = [];
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(type || ''))
        statements.push(`MATCH (n:${type} {objectid: $objectid})`);
    statements.push('MATCH (n:Base {objectid: $objectid})');
    statements.push('MATCH (n:AZBase {objectid: $objectid})');
    statements.push('MATCH (n {objectid: $objectid})');

    let error = null;
    for (const statement of statements) {
        const session = driver.session();
        try {
            const result = await session.run(
                `${statement} RETURN n, labels(n) AS labels LIMIT 1`,
                { objectid: objectid }
            );
            if (result.records.length > 0) {
                return {
                    properties: result.records[0].get('n').properties,
                    labels: result.records[0].get('labels'),
                };
            }
        } catch (e) {
            error = e;
        } finally {
            session.close();
        }
    }
    if (error) throw error;
    return {};
}

CENodeData.propTypes = {};
export default CENodeData;
