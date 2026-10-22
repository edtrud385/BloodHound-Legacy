import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NODE_ICON_CLASSES, nodeIconClass } from '../../js/nodeIcons';

export default class SpotlightRow extends Component {
    _handleClick() {
        emitter.emit(
            'spotlightClick',
            this.props.nodeId,
            this.props.parentNodeId
        );
    }

    render() {
        const iconFor = (kind) =>
            kind in NODE_ICON_CLASSES ? nodeIconClass(kind) : '';
        const nodeIcon = iconFor(this.props.nodeType);
        const parentIcon = iconFor(this.props.parentNodeType);
        return (
            <tr
                style={{ cursor: 'pointer' }}
                onClick={this._handleClick.bind(this)}
                data-id={this.props.nodeId}
                data-parent-id={this.props.parentNodeId}
            >
                <td>
                    {this.props.nodeLabel} <i className={nodeIcon} />
                </td>
                <td>
                    {this.props.parentNodeLabel} <i className={parentIcon} />
                </td>
            </tr>
        );
    }
}

SpotlightRow.propTypes = {
    nodeId: PropTypes.number.isRequired,
    parentNodeId: PropTypes.number.isRequired,
    nodeLabel: PropTypes.string.isRequired,
    parentNodeLabel: PropTypes.string.isRequired,
    nodeType: PropTypes.string.isRequired,
    parentNodeType: PropTypes.string.isRequired,
};
