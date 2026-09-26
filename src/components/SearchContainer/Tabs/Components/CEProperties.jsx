import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import CollapsibleSection from './CollapsibleSection';
import styles from '../NodeData.module.css';
import { propLabel, propValue } from '../../../../js/propLabels';

// Every property of a node, including the ones BloodHound CE collection adds
// (system_tags, isaclprotected, doesanyacegrantownerrights, ...), with
// readable names. In the regular Node Info panels it starts collapsed and
// remembers whether it was last left open.
const CEProperties = ({ properties, extraRows = [], alwaysOpen = false }) => {
    const [open, setOpen] = useState(conf.get('cePropertiesOpen') === true);

    const toggle = (value) => {
        setOpen(value);
        conf.set('cePropertiesOpen', value);
    };

    const rows = Object.keys(properties || {})
        .map((key) => [propLabel(key), propValue(properties[key])])
        .sort((a, b) => a[0].localeCompare(b[0]))
        .concat(extraRows);

    if (rows.length === 0) return null;

    return (
        <CollapsibleSection
            header={'CE PROPERTIES'}
            open={alwaysOpen || open}
            onToggle={alwaysOpen ? undefined : toggle}
        >
            <div className={styles.itemlist}>
                <Table>
                    <tbody>
                        {rows.map(([label, value], i) => (
                            <tr key={`${label}${i}`}>
                                <td align='left' className={'col-md-2'}>
                                    {label}
                                </td>
                                <td align='right' className={styles.propValue}>
                                    {value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </CollapsibleSection>
    );
};

CEProperties.propTypes = {};
export default CEProperties;
