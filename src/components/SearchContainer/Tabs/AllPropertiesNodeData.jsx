import React, { useContext, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Table } from 'react-bootstrap';
import styles from './NodeData.module.css';
import CollapsibleSection from './Components/CollapsibleSection';
import { AppContext } from '../../../AppContext';
import { propLabel, propValue } from '../../../js/propLabels';

// Lists every property of the clicked node. For kinds Legacy has its own
// panel for, this is a collapsed section below that panel. For kinds it has
// no panel for (the ADCS kinds and anything else from CE), this is the
// whole Node Info tab.
const AllPropertiesNodeData = ({ standalone }) => {
    const [node, setNode] = useState(null);
    const [open, setOpen] = useState(conf.get('allPropertiesOpen') === true);
    const context = useContext(AppContext);

    useEffect(() => {
        let current = null;

        const nodeClickEvent = async (type, objectid) => {
            current = objectid;
            if (!objectid) {
                setNode(null);
                return;
            }
            setNode({ objectid: objectid, type: type, loading: true });
            let result;
            try {
                result = await fetchNode(type, objectid);
            } catch (e) {
                result = { error: e.message };
            }
            // a later click wins over a slow lookup
            if (current !== objectid) return;
            setNode({ objectid: objectid, type: type, ...result });
        };

        emitter.on('nodeClicked', nodeClickEvent);
        return () => {
            emitter.removeListener('nodeClicked', nodeClickEvent);
        };
    }, []);

    if (node === null) return <div />;

    const toggle = (value) => {
        setOpen(value);
        conf.set('allPropertiesOpen', value);
    };

    const props = node.properties || {};
    const name = props.name || props.azname || props.displayname;
    const kinds = (node.labels || []).filter(
        (l) => l !== 'Base' && l !== 'AZBase' && !l.startsWith('Tag_')
    );

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
        <div
            className={clsx(
                standalone ? null : styles.allProperties,
                context.darkMode ? styles.dark : styles.light
            )}
        >
            {standalone && (
                <div className={styles.dl}>
                    <h5>
                        {name || node.objectid}
                        {(kinds[0] || node.type) && (
                            <span className={styles.kind}>
                                {' '}
                                - {kinds[0] || node.type}
                            </span>
                        )}
                    </h5>
                </div>
            )}
            <CollapsibleSection
                header={'ALL PROPERTIES'}
                open={standalone || open}
                onToggle={standalone ? null : toggle}
            >
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
