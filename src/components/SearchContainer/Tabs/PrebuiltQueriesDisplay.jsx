import React, { useContext, useEffect, useState } from 'react';
import { remote } from 'electron';
import path from 'path';
import fs from 'fs';
import PrebuiltQueryNode from './PrebuiltQueryNode';
import styles from './PrebuiltQueries.module.css';
import { AppContext } from '../../../AppContext';
import { Table } from 'react-bootstrap';
import CollapsibleSection from './Components/CollapsibleSection';
import { splitCategory, topLevels } from '../../../js/queryCategories';

const { app } = remote;

const PrebuiltQueriesDisplay = () => {
    const [queries, setQueries] = useState([]);
    const [custom, setCustom] = useState([]);
    const [customCat, setCustomCat] = useState(
        conf.get('customQueryCat') || ''
    );
    const context = useContext(AppContext);

    useEffect(() => {
        readCustom();
        readBase();
        emitter.on('updateCustomQueries', refreshCustom);
    }, []);

    const readCustom = async () => {
        let filePath = path.join(
            app.getPath('userData'),
            '/customqueries.json'
        );
        fs.readFile(filePath, 'utf8', (err, data) => {
            let j = JSON.parse(data);
            let y = [];
            j.queries.forEach((query) => {
                try {
                    if (query.category === undefined || query.category === '') {
                        query.category = 'Uncategorized Query';
                    }
                    if (query.name === '') {
                        query.name = 'Unnamed Query';
                    }
                    if (!(query.category in y)) {
                        y[query.category] = [];
                    }

                    y[query.category].push(query);
                } catch (e) {
                    alert(
                        'Custom Queries Category Array Exception: ' + e.message
                    );
                }
            });

            setCustom(y);
        });
    };

    const readBase = async () => {
        $.ajax({
            url: 'src/components/SearchContainer/Tabs/PrebuiltQueries.json',
            type: 'GET',
            success: function (response) {
                let y = [];

                $.each(response.queries, function (_, el) {
                    try {
                        if (el.category === undefined || el.category === '') {
                            el.category = 'Uncategorized Query';
                        }
                        if (el.name === '') {
                            el.name = 'Unnamed Query';
                        }
                        if (!(el.category in y)) {
                            y[el.category] = [];
                        }
                        y[el.category].push(el);
                    } catch (e) {
                        alert('Queries Category Array Exception: ' + e.message);
                    }
                });

                setQueries(y);
            },
        });
    };

    const refreshCustom = () => {
        readCustom();
    };

    // Registers every category (unfiltered) so the query-create form's category
    // list stays complete regardless of the dropdown selection.
    useEffect(() => {
        emitter.emit('registerQueryCategories', queries);
    }, [queries]);
    useEffect(() => {
        emitter.emit('registerQueryCategories', custom);
    }, [custom]);

    // Builds the collapsible category sections. When selectedTop is set (not
    // the empty "all" value), only categories under that top-level are shown,
    // and grouped sub-sections are relabelled to their sub name.
    const createQuerieSections = (queryArray, selectedTop) => {
        let finalQueryElement = [];

        for (let queryCategory in queryArray) {
            const { top, sub, grouped } = splitCategory(queryCategory);
            if (selectedTop && top !== selectedTop) continue;
            const header = selectedTop && grouped ? sub : queryCategory;
            try {
                finalQueryElement.push(
                    <CollapsibleSection header={header} key={queryCategory}>
                        <div className={styles.itemlist}>
                            <Table>
                                <thead />
                                <tbody className='searchable'>
                                    {queryArray[queryCategory].map(function (
                                        a
                                    ) {
                                        return (
                                            <PrebuiltQueryNode
                                                key={a.name}
                                                info={a}
                                            />
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </CollapsibleSection>
                );
            } catch (e) {
                //alert("Create Query Section Exception: " + e.message + "\nqueryCategory: " + queryCategory);
            }
        }

        return finalQueryElement;
    };

    const settingsClick = () => {
        emitter.emit('openQueryCreate');
    };

    const changeCustomCat = (e) => {
        const value = e.target.value;
        setCustomCat(value);
        try {
            conf.set('customQueryCat', value);
        } catch (err) {}
    };

    const customTops = topLevels(Object.keys(custom));
    const dark = context.darkMode;
    const hasCustom = Object.keys(custom).length > 0;

    // The custom-query category picker, shown at the very top so it can be
    // reached without scrolling past the built-in analytics. It filters only
    // the Custom Queries list below.
    const categoryPicker = hasCustom ? (
        <div style={{ margin: '2px 10px 12px 12px' }}>
            <div
                style={{
                    fontSize: '12px',
                    color: dark ? '#9fb3c2' : '#555',
                    margin: '0 0 4px 1px',
                }}
            >
                Custom Query Category
            </div>
            <select
                className='form-control'
                value={customCat}
                onChange={changeCustomCat}
                style={{
                    width: '100%',
                    cursor: 'pointer',
                    ...(dark
                        ? {
                              background: '#0d1013',
                              color: 'white',
                              border: '1px solid #94989d',
                          }
                        : {}),
                }}
            >
                <option value=''>All categories</option>
                {customTops.map((t) => {
                    let n = 0;
                    Object.keys(custom).forEach((c) => {
                        if (splitCategory(c).top === t) n += custom[c].length;
                    });
                    return (
                        <option key={t} value={t}>
                            {t}
                            {n ? `  (${n})` : ''}
                        </option>
                    );
                })}
            </select>
        </div>
    ) : null;

    return (
        <div className={context.darkMode ? styles.dark : styles.light}>
            <div className={styles.dl}>
                {categoryPicker}

                <h5>Pre-Built Analytics Queries</h5>

                {createQuerieSections(queries, '').map((a) => {
                    return a;
                })}

                <hr />
                <h5>
                    Custom Queries
                    <i
                        className='glyphicon glyphicon-pencil customQueryGlyph'
                        data-toggle='tooltip'
                        title='Edit Queries'
                        onClick={settingsClick}
                    />
                    <i
                        className='glyphicon glyphicon-refresh customQueryGlyph'
                        onClick={refreshCustom}
                        style={{ paddingLeft: '5px' }}
                        data-toggle='tooltip'
                        title='Refresh Queries'
                    />
                </h5>
                {!hasCustom && <div>No user defined queries.</div>}
                {hasCustom &&
                    createQuerieSections(custom, customCat).map((a) => {
                        return a;
                    })}
            </div>
        </div>
    );
};

PrebuiltQueriesDisplay.propTypes = {};
export default PrebuiltQueriesDisplay;
