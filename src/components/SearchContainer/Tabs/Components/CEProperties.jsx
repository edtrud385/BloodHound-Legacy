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
    // Default to open so the section is not missed while scrolling; only stay
    // closed if the user has deliberately collapsed it before.
    const [open, setOpen] = useState(conf.get('cePropertiesOpen') !== false);

    const toggle = (value) => {
        setOpen(value);
        conf.set('cePropertiesOpen', value);
    };

    const rows = Object.keys(properties || {})
        .map((key) => [propLabel(key), propValue(properties[key])])
        .sort((a, b) => a[0].localeCompare(b[0]))
        .concat(extraRows);

    if (rows.length === 0) return null;

    // A labelled header with an icon and a count badge, so it is obvious the
    // node has CE properties even when the section is collapsed.
    const header = (
        <span>
            <i className='fa fa-tags' style={{ marginRight: '6px' }} />
            CE PROPERTIES
            <span
                style={{
                    marginLeft: '8px',
                    padding: '0 8px',
                    border: '1px solid currentColor',
                    borderRadius: '10px',
                    fontSize: '12px',
                    verticalAlign: 'middle',
                }}
            >
                {rows.length}
            </span>
        </span>
    );

    return (
        <CollapsibleSection
            header={header}
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
