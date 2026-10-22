import React from 'react';
import { Highlighter } from 'react-bootstrap-typeahead';
import styles from './SearchRow.module.css';
import clsx from 'clsx';
import { nodeIconClass } from '../../js/nodeIcons';

const SearchRow = ({ item, search }) => {
    let searched;
    if (search.includes(':')) {
        searched = search.split(':')[1];
    } else {
        searched = search;
    }

    let type = item.type;
    let icon = {};

    const selectName = () => {
        if (item.hasOwnProperty("name")){
            return item["name"];
        }else if (item.hasOwnProperty("azname")){
            return item["azname"];
        }else{
            return item["objectid"]
        }
    }

    if (!(type in appStore.highResPalette.iconScheme)) {
        type = 'Base';
    }
    icon.className = nodeIconClass(type);

    icon.style = { color: appStore.highResPalette.iconScheme[type].color };
    icon.className = clsx(icon.className, styles.spacing);

    let name = item.name || item.objectid;

    return (
        <>
            <span>
                <i {...icon} />
            </span>
            <Highlighter matchElement='strong' search={searched}>
                {selectName()}
            </Highlighter>
        </>
    );
};

SearchRow.propTypes = {};
export default SearchRow;
