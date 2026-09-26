import React, { useContext, useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import styles from './NodeData.module.css';
import CollapsibleSection from './Components/CollapsibleSection';
import { AppContext } from '../../../AppContext';
import { propLabel, propValue } from '../../../js/propLabels';

// Node Info for kinds Legacy has no panel of its own for (the ADCS kinds
// and anything else from CE): lists every property of the clicked node.
// Kinds with their own panel already list leftover properties under
// EXTRA PROPERTIES.
const AllPropertiesNodeData = ({ visible }) => {
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

    let rows;
    if (node.loading) {
        rows = [['Loading', '...']];
    } else if (node.error) {
        rows = [['Lookup failed', node.error]];
    } else if (!node.properties) {
        rows = [['Node', `not found (${node.objectid})`]];
    } else {
        rows = Object.keys(props)
            .map((key) => [propLabel(key), propValue(props[key])])
            .sort((a, b) => a[0].localeCompare(b[0]));
        if (node.labels && node.labels.length)
            rows.push(['All Kinds', node.labels.join(', ')]);
    }

    return (
        <div className={context.darkMode ? styles.dark : styles.light}>
            <div className={styles.dl}>
                <h5>
                    {name || node.objectid}
                    {kind && <span className={styles.kind}> - {kind}</span>}
                </h5>
            </div>
            <CollapsibleSection header={'NODE PROPERTIES'}>
                <div className={styles.itemlist}>
                    <Table>
                        <tbody>
                            {rows.map(([label, value], i) => (
                                <tr key={`${label}${i}`}>
                                    <td align='left' className={'col-md-2'}>
                                        {label}
                                    </td>
                                    <td
                                        align='right'
                                        className={styles.propValue}
                                    >
                                        {value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </CollapsibleSection>
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

AllPropertiesNodeData.propTypes = {};
export default AllPropertiesNodeData;
