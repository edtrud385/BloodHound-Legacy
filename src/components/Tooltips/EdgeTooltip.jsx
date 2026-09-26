import React, {useContext, useEffect, useRef, useState} from 'react';
import styles from './Tooltips.module.css';
import clsx from 'clsx';
import {AppContext} from '../../AppContext';
import {isCompositionEdge} from '../../js/adcsComposition';

const EdgeTooltip = ({ edge, x, y }) => {
    let label = edge.label;
    let id = edge.id;
    let type = edge.etype || edge.label;

    const tooltipDiv = useRef(null);

    const [realX, setRealX] = useState(0);
    const [realY, setRealY] = useState(0);
    const context = useContext(AppContext);

    useEffect(() => {
        let rect = tooltipDiv.current.getBoundingClientRect();
        if (x + rect.width > window.innerWidth) {
            x = window.innerWidth - rect.width - 10;
        }

        if (y + rect.height > window.innerHeight) {
            y = window.innerHeight - rect.height - 10;
        }

        setRealX(x);
        setRealY(y);
    }, [x, y]);

    return (
        <div
            ref={tooltipDiv}
            className={clsx(
                styles.tooltip,
                context.darkMode ? styles.dark : null
            )}
            style={{
                left: realX === 0 ? x : realX,
                top: realY === 0 ? y : realY,
            }}
        >
            <div>{label}</div>
            <ul>
                {isCompositionEdge(type) && (
                    <li
                        onClick={() => {
                            emitter.emit('expandComposition', id);
                        }}
                    >
                        <i className='fa fa-project-diagram' /> Expand ADCS
                        Composition
                    </li>
                )}
                <li
                    onClick={() => {
                        emitter.emit('getHelp', id);
                    }}
                >
                    <i className='fa fa-question' /> Help
                </li>
                <li
                    onClick={() => {
                        emitter.emit('deleteEdge', id);
                    }}
                >
                    <i className='fa fa-trash' /> Delete Edge
                </li>
            </ul>
        </div>
    );
};

EdgeTooltip.propTypes = {};
export default EdgeTooltip;
