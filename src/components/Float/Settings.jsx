import React, { useEffect, useState, useContext } from 'react';
import {
    Panel,
    Button,
    FormControl,
    ControlLabel,
    FormGroup,
    Form,
    Col,
    Checkbox,
} from 'react-bootstrap';
import styles from './Settings.module.css';
import clsx from 'clsx';
import { AppContext } from '../../AppContext';
import PoseContainer from '../PoseContainer';
import { useDragControls } from 'framer-motion';

// Number box that lets the field be cleared while typing and only reports
// whole numbers of at least min.
const NumberSetting = ({ value, min, onCommit, placeholder }) => {
    const [text, setText] = useState(value ? String(value) : '');

    useEffect(() => {
        setText(value ? String(value) : '');
    }, [value]);

    const change = (e) => {
        setText(e.target.value);
        let val = parseInt(e.target.value);
        if (val >= min) onCommit(val);
    };

    return (
        <FormControl
            type='number'
            min={min}
            className={styles.numberInput}
            value={text}
            placeholder={placeholder}
            onChange={change}
            onBlur={() => setText(value ? String(value) : '')}
        />
    );
};

const Settings = () => {
    const [nodeCollapse, setNodeCollapse] = useState(appStore.performance.edge);
    const [open, setOpen] = useState(false);
    const dragControl = useDragControls();

    const context = useContext(AppContext);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const changeNodeCollapse = (e) => {
        let val = parseInt(e.target.value);
        setNodeCollapse(val);
        appStore.performance.edge = val;
        conf.set('performance', appStore.performance);
    };

    const edgeLabelChange = (e) => {
        let val = parseInt(e.target.value);
        context.setEdgeLabels(val);
    };

    const nodeLabelChange = (e) => {
        let val = parseInt(e.target.value);
        context.setNodeLabels(val);
    };


    useEffect(() => {
        emitter.on('openSettings', handleOpen);
        return () => {
            emitter.removeListener('openSettings', handleOpen);
        };
    }, []);

    return (
        <PoseContainer
            visible={open}
            className={clsx(
                styles.container,
                context.darkMode ? styles.dark : null
            )}
            dragHandle={dragControl}
        >
            <Panel>
                <Panel.Heading
                    onMouseDown={(e) => {
                        dragControl.start(e);
                    }}
                >
                    Settings
                    <Button
                        onClick={handleClose}
                        className='close'
                        aria-label='close'
                    >
                        <span aria-hidden='true'>&times;</span>
                    </Button>
                </Panel.Heading>

                <Panel.Body>
                    <Form
                        noValidate
                        horizontal
                        onSubmit={() => {
                            return false;
                        }}
                    >
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={5}>
                                Node Collapse Threshold
                                <i
                                    data-toggle='tooltip'
                                    data-placement='right'
                                    title='Collapse nodes at the end of paths that only have one relationship. 0 to Disable, Default 5'
                                    className={clsx(
                                        'glyphicon',
                                        'glyphicon-question-sign',
                                        styles.glyphMargin
                                    )}
                                />
                            </Col>
                            <Col sm={2}>
                                <FormControl
                                    value={nodeCollapse}
                                    onChange={changeNodeCollapse}
                                />
                            </Col>
                            <Col sm={5} className={styles.slider}>
                                <FormControl
                                    type='range'
                                    componentClass='input'
                                    value={nodeCollapse}
                                    min={0}
                                    max={20}
                                    onChange={changeNodeCollapse}
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={5}>
                                Edge Label Display
                                <i
                                    data-toggle='tooltip'
                                    data-placement='right'
                                    title='When to display edge labels'
                                    className={clsx(
                                        'glyphicon',
                                        'glyphicon-question-sign',
                                        styles.glyphMargin
                                    )}
                                />
                            </Col>
                            <Col sm={7}>
                                <FormControl
                                    componentClass='select'
                                    value={context.edgeLabels}
                                    onChange={edgeLabelChange}
                                    disabled={context.forceLabels}
                                >
                                    <option value='0'>Threshold Display</option>
                                    <option value='1'>Always Display</option>
                                    <option value='2'>Never Display</option>
                                </FormControl>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={5}>
                                Node Label Display
                                <i
                                    data-toggle='tooltip'
                                    data-placement='right'
                                    title='When to display node labels'
                                    className={clsx(
                                        'glyphicon',
                                        'glyphicon-question-sign',
                                        styles.glyphMargin
                                    )}
                                />
                            </Col>
                            <Col sm={7}>
                                <FormControl
                                    componentClass='select'
                                    value={context.nodeLabels}
                                    onChange={nodeLabelChange}
                                    disabled={context.forceLabels}
                                >
                                    <option value='0'>Threshold Display</option>
                                    <option value='1'>Always Display</option>
                                    <option value='2'>Never Display</option>
                                </FormControl>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col sm={5} componentClass={ControlLabel}>
                                Force Labels On
                                <i
                                    data-toggle='tooltip'
                                    data-placement='right'
                                    title='Always show node and edge labels, and stop the Ctrl/Cmd key from toggling node labels'
                                    className={clsx(
                                        'glyphicon',
                                        'glyphicon-question-sign',
                                        styles.glyphMargin
                                    )}
                                />
                            </Col>
                            <Col sm={2}>
                                <Checkbox
                                    checked={context.forceLabels}
                                    onChange={context.toggleForceLabels}
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={5}>
                                Label Size
                                <i
                                    data-toggle='tooltip'
                                    data-placement='right'
                                    title='Font size of node and edge labels in pixels'
                                    className={clsx(
                                        'glyphicon',
                                        'glyphicon-question-sign',
                                        styles.glyphMargin
                                    )}
                                />
                            </Col>
                            <Col sm={7} className={styles.inline}>
                                Node
                                <NumberSetting
                                    min={1}
                                    value={context.nodeLabelSize}
                                    onCommit={(val) =>
                                        context.setLabelSize(
                                            'nodeLabelSize',
                                            val
                                        )
                                    }
                                />
                                Edge
                                <NumberSetting
                                    min={1}
                                    value={context.edgeLabelSize}
                                    onCommit={(val) =>
                                        context.setLabelSize(
                                            'edgeLabelSize',
                                            val
                                        )
                                    }
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col sm={5} componentClass={ControlLabel}>
                                Query Debug Mode
                                <i
                                    data-toggle='tooltip'
                                    data-placement='right'
                                    title='Dump queries run into the Raw Query Box'
                                    className={clsx(
                                        'glyphicon',
                                        'glyphicon-question-sign',
                                        styles.glyphMargin
                                    )}
                                />
                            </Col>
                            <Col sm={2}>
                                <Checkbox
                                    checked={context.debugMode}
                                    onChange={context.toggleDebugMode}
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col sm={5} componentClass={ControlLabel}>
                                Low Detail Mode
                                <i
                                    data-toggle='tooltip'
                                    data-placement='right'
                                    title='Lower detail of graph to improve performance'
                                    className={clsx(
                                        'glyphicon',
                                        'glyphicon-question-sign',
                                        styles.glyphMargin
                                    )}
                                />
                            </Col>
                            <Col sm={2}>
                                <Checkbox
                                    checked={context.lowDetailMode}
                                    onChange={context.toggleLowDetailMode}
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col sm={5} componentClass={ControlLabel}>
                                Dark Mode
                                <i
                                    data-toggle='tooltip'
                                    data-placement='right'
                                    title='Toggle Dark Mode for the Interface'
                                    className={clsx(
                                        'glyphicon',
                                        'glyphicon-question-sign',
                                        styles.glyphMargin
                                    )}
                                />
                            </Col>
                            <Col sm={2}>
                                <Checkbox
                                    checked={context.darkMode}
                                    onChange={context.toggleDarkMode}
                                />
                            </Col>
                        </FormGroup>
                    </Form>
                </Panel.Body>
            </Panel>
        </PoseContainer>
    );
};

Settings.propTypes = {};
export default Settings;
