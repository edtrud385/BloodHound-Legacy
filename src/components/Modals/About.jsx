import React, { useEffect, useState, useContext } from 'react';
const { app, shell } = require('electron').remote;
import { join } from 'path';
import { promises } from 'fs';
import { Modal, Button } from 'react-bootstrap';
import styles from './About.module.css';
import { AppContext } from '../../AppContext';
import BaseModal from './BaseModal';
import { checkForUpdate } from '../../js/updateCheck';

const About = () => {
    const [data, setData] = useState('');
    const [version, setVersion] = useState('');
    const [forkVersion, setForkVersion] = useState('');
    const [update, setUpdate] = useState(null);
    const [checking, setChecking] = useState(false);
    const [open, setOpen] = useState(false);
    const context = useContext(AppContext);

    const getVersion = async () => {
        let data = await promises.readFile(
            join(app.getAppPath(), 'package.json')
        );
        let parsed = JSON.parse(data);

        setVersion(parsed.version);
        setForkVersion(parsed.forkVersion);
        return parsed.forkVersion;
    };

    const runUpdateCheck = async (fork) => {
        setChecking(true);
        const result = await checkForUpdate(fork);
        setUpdate(result);
        setChecking(false);
    };

    // Renders the result of the update check as a short status line.
    const updateStatus = () => {
        if (checking) return 'Checking for updates…';
        if (!update) return null;
        switch (update.status) {
            case 'update':
                return (
                    <span>
                        Update available: v{update.latest} (you have v
                        {update.current}).{' '}
                        <a href='#' onClick={() => openLink(update.url)}>
                            View releases
                        </a>
                    </span>
                );
            case 'current':
                return `Up to date (v${update.current}).`;
            case 'untagged':
                return update.commit
                    ? `No tagged releases; latest commit ${update.commit}${
                          update.date ? ` (${update.date})` : ''
                      }.`
                    : 'No tagged releases found.';
            default:
                return `Update check failed: ${update.message}.`;
        }
    };

    const getLicense = async () => {
        let data = await promises.readFile(
            join(app.getAppPath(), 'LICENSE.md'),
            'utf-8'
        );
        setData(data);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const openLink = (link) => {
        shell.openExternal(link);
    };

    useEffect(() => {
        getVersion().then((fork) => runUpdateCheck(fork));
        getLicense();

        emitter.on('showAbout', handleOpen);
        return () => {
            emitter.removeListener('showAbout', handleOpen);
        };
    }, []);

    return (
        <BaseModal
            show={open}
            onHide={handleClose}
            label='AboutHeader'
            className={context.darkMode ? styles.dark : styles.light}
        >
            <Modal.Header closeButton className={styles.about}>
                <Modal.Title id='AboutHeader'>About BloodHound</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <h5>
                    Version: {version}
                    {forkVersion ? ` (CE fork v${forkVersion})` : ''}
                </h5>
                <h5>
                    Updates:{' '}
                    <small>{updateStatus() || '—'}</small>{' '}
                    <Button
                        bsSize='xsmall'
                        disabled={checking}
                        onClick={() => runUpdateCheck(forkVersion)}
                    >
                        Check for Updates
                    </Button>
                </h5>
                <h5>
                    Fork GitHub:{' '}
                    <a
                        href='#'
                        onClick={() => {
                            openLink(
                                'https://github.com/edtrud385/BloodHound-Legacy'
                            );
                        }}
                    >
                        https://github.com/edtrud385/BloodHound-Legacy
                    </a>
                </h5>
                <h5>
                    Upstream:{' '}
                    <a
                        href='#'
                        onClick={() => {
                            openLink(
                                'https://github.com/SpecterOps/BloodHound-Legacy'
                            );
                        }}
                    >
                        https://github.com/SpecterOps/BloodHound-Legacy
                    </a>
                </h5>
                <h5>
                    BloodHound Slack:{' '}
                    <a
                        href='#'
                        onClick={() => {
                            openLink('http://slack.specterops.io/');
                        }}
                    >
                        http://slack.specterops.io/
                    </a>
                </h5>
                <h5>
                    Authors:{' '}
                    <a
                        href='#'
                        onClick={() => {
                            openLink('https://www.twitter.com/_wald0');
                        }}
                    >
                        The BloodHound Enterprise Team
                    </a>
                </h5>
                <h5>
                    Created by:{' '}
                    <a
                        href='#'
                        onClick={() => {
                            openLink('https://www.twitter.com/_wald0');
                        }}
                    >
                        @_wald0
                    </a>
                    ,{' '}
                    <a
                        href='#'
                        onClick={() => {
                            openLink('https://www.twitter.com/cptjesus');
                        }}
                    >
                        @CptJesus
                    </a>
                    ,{' '}
                    <a
                        href='#'
                        onClick={() => {
                            openLink('https://www.twitter.com/harmj0y');
                        }}
                    >
                        @harmj0y
                    </a>
                </h5>
                <br />
                <h5>LICENSE</h5>
                <div className={styles.scroll}>{data}</div>
            </Modal.Body>

            <Modal.Footer className={styles.footer}>
                <Button
                    variant='primary'
                    onClick={handleClose}
                    className={styles.btndone}
                >
                    Done
                </Button>
            </Modal.Footer>
        </BaseModal>
    );
};

About.propTypes = {};
export default About;
