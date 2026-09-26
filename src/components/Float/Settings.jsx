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
import {
    chooseImageFolder,
    imageSize,
    screenSize,
    updateImageSettings,
} from '../../js/imageExport';
import {
    protectedGroupsEnabled,
    setProtectedGroupsEnabled,
} from '../../js/ceHighValue';

// Number box that lets the field be cleared while typing and only reports
// whole numbers of at least min. With emptyValue set, an empty box means
// (and shows) that value.
const NumberSetting = ({ value, min, onCommit, placeholder, emptyValue }) => {
    const display = (v) =>
        emptyValue !== undefined && v === emptyValue ? '' : String(v);
    const [text, setText] = useState(display(value));

    useEffect(() => {
        setText(display(value));
    }, [value]);

    const change = (e) => {
        setText(e.target.value);
        let val = parseInt(e.target.value);
        if (e.target.value === '' && emptyValue !== undefined) {
            onCommit(emptyValue);
        } else if (val >= min) {
            onCommit(val);
        }
    };

    return (
        <FormControl
            type='number'
            min={min}
            className={styles.numberInput}
            value={text}
            placeholder={placeholder}
            onChange={change}
            onBlur={() => setText(display(value))}
        />
    );
};

const Settings = () => {
    const [nodeCollapse, setNodeCollapse] = useState(appStore.performance.edge);
    const [open, setOpen] = useState(false);
    const [protectedHighValue, setProtectedHighValue] = useState(
        protectedGroupsEnabled()
    );
    const dragControl = useDragControls();

    const context = useContext(AppContext);
    const image = context.imageExport;
    const { width: imageWidth, height: imageHeight } = imageSize(
        sigma.instances(0),
        image
    );

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

    const protectedHighValueChange = (e) => {
        setProtectedHighValue(e.target.checked);
        setProtectedGroupsEnabled(e.target.checked);
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
                        <FormGroup>
                            <Col sm={5} componentClass={ControlLabel}>
                                Protected Groups Are High Value
                                <i
                                    data-toggle='tooltip'
                                    data-placement='right'
                                    title='Show the high value marker on AD protected groups and their members, ProtectAdminGroups targets, Azure tenants and privileged Entra role holders. Nothing is written to the database.'
                                    className={clsx(
                                        'glyphicon',
                                        'glyphicon-question-sign',
                                        styles.glyphMargin
                                    )}
                                />
                            </Col>
                            <Col sm={2}>
                                <Checkbox
                                    checked={protectedHighValue}
                                    onChange={protectedHighValueChange}
                                />
                            </Col>
                        </FormGroup>
                        <h5 className={styles.sectionHeader}>
                            Graph Images
                        </h5>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={5}>
                                Image Size
                                <i
                                    data-toggle='tooltip'
                                    data-placement='right'
                                    title='Pixel size of saved images. Leave blank to use the size of the graph on screen; with only a width set, the height keeps the screen proportions.'
                                    className={clsx(
                                        'glyphicon',
                                        'glyphicon-question-sign',
                                        styles.glyphMargin
                                    )}
                                />
                            </Col>
                            <Col sm={7}>
                                <div className={styles.inline}>
                                    <NumberSetting
                                        min={256}
                                        emptyValue={0}
                                        placeholder='auto'
                                        value={image.width}
                                        onCommit={(val) =>
                                            updateImageSettings({ width: val })
                                        }
                                    />
                                    x
                                    <NumberSetting
                                        min={256}
                                        emptyValue={0}
                                        placeholder='auto'
                                        value={image.height}
                                        onCommit={(val) =>
                                            updateImageSettings({
                                                height: val,
                                            })
                                        }
                                    />
                                    <Button
                                        bsSize='small'
                                        onClick={() => {
                                            let screen = screenSize(
                                                sigma.instances(0)
                                            );
                                            updateImageSettings(screen);
                                        }}
                                    >
                                        Match screen
                                    </Button>
                                    <Button
                                        bsSize='small'
                                        onClick={() =>
                                            updateImageSettings({
                                                width: 0,
                                                height: 0,
                                            })
                                        }
                                    >
                                        Auto
                                    </Button>
                                </div>
                                <div className={styles.hint}>
                                    {image.width || image.height
                                        ? 'saves at'
                                        : 'auto, currently'}{' '}
                                    {imageWidth} x {imageHeight}
                                </div>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={5}>
                                Image Padding
                                <i
                                    data-toggle='tooltip'
                                    data-placement='right'
                                    title='Zooms out by this percent so labels near the edges are not clipped'
                                    className={clsx(
                                        'glyphicon',
                                        'glyphicon-question-sign',
                                        styles.glyphMargin
                                    )}
                                />
                            </Col>
                            <Col sm={7} className={styles.inline}>
                                <NumberSetting
                                    min={0}
                                    value={image.padding}
                                    onCommit={(val) =>
                                        updateImageSettings({ padding: val })
                                    }
                                />
                                %
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={5}>
                                Image Markers
                                <i
                                    data-toggle='tooltip'
                                    data-placement='right'
                                    title='Which node markers to draw in saved images'
                                    className={clsx(
                                        'glyphicon',
                                        'glyphicon-question-sign',
                                        styles.glyphMargin
                                    )}
                                />
                            </Col>
                            <Col sm={7}>
                                <Checkbox
                                    inline
                                    checked={image.highValue}
                                    onChange={() =>
                                        updateImageSettings({
                                            highValue: !image.highValue,
                                        })
                                    }
                                >
                                    High Value
                                </Checkbox>
                                <Checkbox
                                    inline
                                    checked={image.owned}
                                    onChange={() =>
                                        updateImageSettings({
                                            owned: !image.owned,
                                        })
                                    }
                                >
                                    Owned
                                </Checkbox>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={5}>
                                Numbered Auto-Save
                                <i
                                    data-toggle='tooltip'
                                    data-placement='right'
                                    title='On: images save straight to the folder below as 00001.png, 00002.png and so on. Off: a save dialog asks for the name every time.'
                                    className={clsx(
                                        'glyphicon',
                                        'glyphicon-question-sign',
                                        styles.glyphMargin
                                    )}
                                />
                            </Col>
                            <Col sm={2}>
                                <Checkbox
                                    checked={image.autoNumber}
                                    onChange={() =>
                                        updateImageSettings({
                                            autoNumber: !image.autoNumber,
                                        })
                                    }
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={5}>
                                Image Folder
                                <i
                                    data-toggle='tooltip'
                                    data-placement='right'
                                    title='Where numbered images are saved, and where the save dialog opens. Right-clicking the camera button also changes it.'
                                    className={clsx(
                                        'glyphicon',
                                        'glyphicon-question-sign',
                                        styles.glyphMargin
                                    )}
                                />
                            </Col>
                            <Col sm={7} className={styles.inline}>
                                <FormControl
                                    readOnly
                                    value={image.folder || ''}
                                    placeholder='no folder chosen yet'
                                />
                                <Button
                                    bsSize='small'
                                    onClick={chooseImageFolder}
                                >
                                    Choose
                                </Button>
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
