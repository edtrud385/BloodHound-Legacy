import 'core-js/stable';
import 'regenerator-runtime/runtime'; // generators
import React from 'react';
import ReactDOM from 'react-dom';

import AppContainer from './AppContainer';
import Login from './components/Float/Login';
import { positions, Provider as AlertProvider, transitions } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

import { remote, shell } from 'electron';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

import ConfigStore from 'electron-store';

import 'react-bootstrap-typeahead/css/Typeahead.css';
import { EventEmitter2 as e } from 'eventemitter2';

const { app } = remote;

global.conf = new ConfigStore();
global.imageconf = new ConfigStore({
    name: 'images',
});
global.emitter = new e({});
emitter.setMaxListeners(0);
global.renderEmit = new e({});
global.Mustache = require('mustache');

//open links externally by default
$(document).on('click', 'a[href^="http"]', function (event) {
    event.preventDefault();
    shell.openExternal(this.href);
});

String.prototype.format = function () {
    let i = 0;
    const args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] !== 'undefined' ? args[i++] : '';
    });
};

String.prototype.formatAll = function () {
    return this.replace(/{}/g, arguments[0]);
};

String.prototype.formatn = function () {
    let formatted = this;
    for (let i = 0; i < arguments.length; i++) {
        const regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

Array.prototype.allEdgesSameType = function () {
    for (let i = 1; i < this.length; i++) {
        if (this[i].neo4j_type !== this[0].neo4j_type) return false;
    }

    return true;
};

Array.prototype.chunk = function (chunkSize = 10000) {
    let i;
    let len = this.length;
    let temp = [];

    for (i = 0; i < len; i += chunkSize) {
        temp.push(this.slice(i, i + chunkSize));
    }

    return temp;
};

if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
}

sigma.renderers.def = sigma.renderers.canvas;

sigma.classes.graph.addMethod('outboundNodes', function (id) {
    return this.outNeighborsIndex.get(id).keyList();
});

sigma.classes.graph.addMethod('inboundNodes', function (id) {
    return this.inNeighborsIndex.get(id).keyList();
});

sigma.classes.graph.addMethod('outNeighbors', function (id) {
    return this.outNeighborsIndex.get(id).keyList();
});

global.appStore = {
    dagre: true,
    startNode: null,
    endNode: null,
    prebuiltQuery: [],
    highlightedEdges: [],
    spotlightData: {},
    queryStack: [],
    currentTooltip: null,
    highResPalette: {
        iconScheme: {
            // Active Directory
            User: {
                font: "'Font Awesome 5 Free'",
                content: '\uf007',
                scale: 1.5,
                color: '#17E625',
            },
            Group: {
                font: "'Font Awesome 5 Free'",
                content: '\uf0c0',
                scale: 1.5,
                color: '#DBE617',
            },
            Computer: {
                font: "'Font Awesome 5 Free'",
                content: '\uf390',
                scale: 1.2,
                color: '#E67873',
            },
            Domain: {
                font: "'Font Awesome 5 Free'",
                content: '\uf0ac',
                scale: 1.5,
                color: '#17E6B9',
            },
            GPO: {
                font: "'Font Awesome 5 Free'",
                content: '\uf03a',
                scale: 1.25,
                color: '#998EFD',
            },
            OU: {
                font: "'Font Awesome 5 Free'",
                content: '\uf0e8',
                scale: 1.25,
                color: '#FFAA00',
            },
            Container: {
                font: "'Font Awesome 5 Free'",
                content: '\uf466',
                scale: 1.25,
                color: '#F79A78',
            },
            // Local principals (CE local group collection)
            ADLocalGroup: {
                font: "'Font Awesome 5 Free'",
                content: '\uf0c0',
                scale: 1.4,
                color: '#E8B54B',
            },
            ADLocalUser: {
                font: "'Font Awesome 5 Free'",
                content: '\uf007',
                scale: 1.4,
                color: '#5BC46A',
            },
            // ADCS
            AIACA: {
                font: "'Font Awesome 5 Free'",
                content: '\ue4ba',
                scale: 1.25,
                color: '#9769F0',
            },
            RootCA: {
                font: "'Font Awesome 5 Free'",
                content: '\uf66f',
                scale: 1.25,
                color: '#6968E8',
            },
            EnterpriseCA: {
                font: "'Font Awesome 5 Free'",
                content: '\uf1ad',
                scale: 1.25,
                color: '#4696E9',
            },
            NTAuthStore: {
                font: "'Font Awesome 5 Free'",
                content: '\uf54e',
                scale: 1.25,
                color: '#D575F5',
            },
            CertTemplate: {
                font: "'Font Awesome 5 Free'",
                content: '\uf2c2',
                scale: 1.25,
                color: '#B153F3',
            },
            IssuancePolicy: {
                font: "'Font Awesome 5 Free'",
                content: '\uf46c',
                scale: 1.25,
                color: '#99B2DD',
            },
            // Azure
            AZUser: {
                font: "'Font Awesome 5 Free'",
                content: '\uf007',
                scale: 1.25,
                color: '#34D2EB',
            },
            AZGroup: {
                font: "'Font Awesome 5 Free'",
                content: '\uf0c0',
                scale: 1.25,
                color: '#F57C9B',
            },
            AZTenant: {
                font: "'Font Awesome 5 Free'",
                content: '\uf0c2',
                scale: 1.25,
                color: '#54F2F2',
            },
            AZSubscription: {
                font: "'Font Awesome 5 Free'",
                content: '\uf084',
                scale: 1.25,
                color: '#D2CCA1',
            },
            AZResourceGroup: {
                font: "'Font Awesome 5 Free'",
                content: '\uf1b2',
                scale: 1.25,
                color: '#89BD9E',
            },
            AZVM: {
                font: "'Font Awesome 5 Free'",
                content: '\uf390',
                scale: 1.25,
                color: '#F9ADA0',
            },
            AZWebApp: {
                font: "'Font Awesome 5 Free'",
                content: '\uf247',
                scale: 1.25,
                color: '#4696E9',
            },
            AZLogicApp: {
                font: "'Font Awesome 5 Free'",
                content: '\uf0e8',
                scale: 1.25,
                color: '#9EE047',
            },
            AZAutomationAccount: {
                font: "'Font Awesome 5 Free'",
                content: '\uf013',
                scale: 1.25,
                color: '#F4BA44',
            },
            AZFunctionApp: {
                font: "'Font Awesome 5 Free'",
                content: '\uf0e7',
                scale: 1.25,
                color: '#F4BA44',
            },
            AZContainerRegistry: {
                font: "'Font Awesome 5 Free'",
                content: '\uf49e',
                scale: 1.25,
                color: '#0885D7',
            },
            AZManagedCluster: {
                font: "'Font Awesome 5 Free'",
                content: '\uf1b3',
                scale: 1.25,
                color: '#326CE5',
            },
            AZDevice: {
                font: "'Font Awesome 5 Free'",
                content: '\uf390',
                scale: 1.25,
                color: '#B18FCF',
            },
            AZKeyVault: {
                font: "'Font Awesome 5 Free'",
                content: '\uf023',
                scale: 1.25,
                color: '#ED658C',
            },
            AZApp: {
                font: "'Font Awesome 5 Free'",
                content: '\uf2d2',
                scale: 1.25,
                color: '#03FC84',
            },
            AZVMScaleSet: {
                font: "'Font Awesome 5 Free'",
                content: '\uf233',
                scale: 1.25,
                color: '#007CD0',
            },
            AZServicePrincipal: {
                font: "'Font Awesome 5 Free'",
                content: '\uf544',
                scale: 1.25,
                color: '#C1D6D6',
            },
            AZRole: {
                font: "'Font Awesome 5 Free'",
                content: '\uf46d',
                scale: 1.25,
                color: '#ED8537',
            },
            AZManagementGroup: {
                font: "'Font Awesome 5 Free'",
                content: '\uf0e8',
                scale: 1.25,
                color: '#BD93D8',
            },
            AZFederatedIdentityCredential: {
                font: "'Font Awesome 5 Free'",
                content: '\uf084',
                scale: 1.25,
                color: '#FFEE8C',
            },
            // Base
            Base: {
                font: "'Font Awesome 5 Free'",
                content: '\uF128',
                scale: 1.25,
                color: '#E6E600',
            },
        },
        edgeScheme: {
            AdminTo: 'tapered',
            MemberOf: 'tapered',
            HasSession: 'tapered',
            AllExtendedRights: 'tapered',
            ForceChangePassword: 'tapered',
            GenericAll: 'tapered',
            GenericWrite: 'tapered',
            WriteDacl: 'tapered',
            WriteOwner: 'tapered',
            AddMember: 'tapered',
            TrustedBy: 'curvedArrow',
            DCSync: 'tapered',
            Contains: 'tapered',
            GPLink: 'tapered',
            Owns: 'tapered',
            CanRDP: 'tapered',
            ExecuteDCOM: 'tapered',
            ReadLAPSPassword: 'tapered',
            AllowedToDelegate: 'tapered',
            AddAllowedToAct: 'tapered',
            AllowedToAct: 'tapered',
            GetChanges: 'tapered',
            GetChangesAll: 'tapered',
            SQLAdmin: 'tapered',
            ReadGMSAPassword: 'tapered',
            HasSIDHistory: 'tapered',
            CanPSRemote: 'tapered',
            AddSelf: 'tapered',
            WriteSPN: 'tapered',
            AddKeyCredentialLink: 'tapered',
            SyncLAPSPassword: 'tapered',
            DumpSMSAPassword: 'tapered',
        },
    },
    lowResPalette: {
        colorScheme: {
            User: '#17E625',
            Group: '#DBE617',
            Computer: '#E67873',
            Domain: '#17E6B9',
            GPO: '#998EFD',
            OU: '#FFAA00',
            Container: '#F79A78',
            ADLocalGroup: '#E8B54B',
            ADLocalUser: '#5BC46A',
            AIACA: '#9769F0',
            RootCA: '#6968E8',
            EnterpriseCA: '#4696E9',
            NTAuthStore: '#D575F5',
            CertTemplate: '#B153F3',
            IssuancePolicy: '#99B2DD',
            AZUser: '#34D2EB',
            AZGroup: '#F57C9B',
            AZTenant: '#54F2F2',
            AZSubscription: '#D2CCA1',
            AZResourceGroup: '#89BD9E',
            AZVM: '#F9ADA0',
            AZWebApp: '#4696E9',
            AZLogicApp: '#9EE047',
            AZAutomationAccount: '#F4BA44',
            AZFunctionApp: '#F4BA44',
            AZContainerRegistry: '#0885D7',
            AZManagedCluster: '#326CE5',
            AZDevice: '#B18FCF',
            AZKeyVault: '#ED658C',
            AZApp: '#03FC84',
            AZVMScaleSet: '#007CD0',
            AZServicePrincipal: '#C1D6D6',
            AZRole: '#ED8537',
            AZManagementGroup: '#BD93D8',
            AZFederatedIdentityCredential: '#FFEE8C',
            Base: '#E6E600',
        },
        edgeScheme: {
            AdminTo: 'line',
            MemberOf: 'line',
            HasSession: 'line',
            AllExtendedRights: 'line',
            ForceChangePassword: 'line',
            GenericAll: 'line',
            GenericWrite: 'line',
            WriteDacl: 'line',
            WriteOwner: 'line',
            AddMember: 'line',
            TrustedBy: 'curvedArrow',
            DCSync: 'line',
            Contains: 'line',
            GPLink: 'line',
            Owns: 'line',
            CanRDP: 'line',
            ExecuteDCOM: 'line',
            ReadLAPSPassword: 'line',
            AllowedToDelegate: 'line',
            AddAllowedToAct: 'line',
            AllowedToAct: 'line',
            GetChanges: 'line',
            GetChangeAll: 'line',
            SQLAdmin: 'line',
            ReadGMSAPassword: 'line',
            HasSIDHistory: 'line',
            CanPSRemote: 'line',
            SyncLAPSPassword: 'line',
            DumpSMSAPassword: 'line',
        },
    },
    highResStyle: {
        nodes: {
            label: {
                by: 'label',
            },
            size: {
                by: 'degree',
                bins: 5,
                min: 10,
                max: 20,
            },
            icon: {
                by: 'type',
                scheme: 'iconScheme',
            },
        },
        edges: {
            type: {
                by: 'type',
                scheme: 'edgeScheme',
            },
            size: {
                by: 'degree',
                bins: 1,
                min: 4,
                max: 4,
            },
        },
    },
    lowResStyle: {
        nodes: {
            label: {
                by: 'label',
            },
            size: {
                by: 'degree',
                bins: 10,
                min: 10,
                max: 20,
            },
            color: {
                by: 'type',
                scheme: 'colorScheme',
            },
        },
        edges: {
            type: {
                by: 'type',
                scheme: 'edgeScheme',
            },
            size: {
                by: 'degree',
                bins: 1,
                min: 4,
                max: 4,
            },
        },
    },
};

if (typeof conf.get('performance') === 'undefined') {
    conf.set('performance', {
        edge: 5,
        lowGraphics: false,
        nodeLabels: 0,
        edgeLabels: 0,
        darkMode: false,
    });
}

if (typeof conf.get('edgeincluded') === 'undefined') {
    conf.set('edgeincluded', {
        MemberOf: true,
        HasSession: true,
        AdminTo: true,
        AllExtendedRights: true,
        AddMember: true,
        ForceChangePassword: true,
        GenericAll: true,
        GenericWrite: true,
        Owns: true,
        WriteDacl: true,
        WriteOwner: true,
        CanRDP: true,
        ExecuteDCOM: true,
        AllowedToDelegate: true,
        ReadLAPSPassword: true,
        Contains: true,
        GPLink: true,
        AddAllowedToAct: true,
        AllowedToAct: true,
        WriteAccountRestrictions: true,
        SQLAdmin: true,
        ReadGMSAPassword: true,
        HasSIDHistory: true,
        CanPSRemote: true,
        SyncLAPSPassword: true,
        DumpSMSAPassword: true,
        AZMGGrantRole: true,
        AZMGAddSecret: true,
        AZMGAddOwner: true,
        AZMGAddMember: true,
        AZMGGrantAppRoles: true,
        AZNodeResourceGroup: true,
        AZWebsiteContributor: true,
        AZLogicAppContributo: true,
        AZAutomationContributor: true,
        AZAKSContributor: true,
    });
}

const alertOptions = {
    position: positions.TOP_CENTER,
    timeout: 5000,
    offset: '30px',
    transitions: transitions.FADE,
    containerStyle: {
        zIndex: 100,
        width: '100%',
    },
};

appStore.edgeincluded = conf.get('edgeincluded');
appStore.performance = conf.get('performance');
appStore.filterAllQueries = conf.get('filterAllQueries') !== false;

if (typeof appStore.performance.edgeLabels === 'undefined') {
    appStore.performance.edgeLabels = 0;
    conf.set('performance', appStore.performance);
}

if (typeof appStore.performance.nodeLabelSize === 'undefined') {
    appStore.performance.nodeLabelSize = 22;
    appStore.performance.edgeLabelSize = 16;
    conf.set('performance', appStore.performance);
}

if (typeof appStore.performance.forceLabels === 'undefined') {
    appStore.performance.forceLabels = true;
    appStore.performance.nodeLabels = 1;
    appStore.performance.edgeLabels = 1;
    conf.set('performance', appStore.performance);
}

if (typeof appStore.performance.darkMode === 'undefined') {
    appStore.performance.darkMode = false;
    conf.set('performance', appStore.performance);
}

const custompath = join(app.getPath('userData'), 'customqueries.json');
if (!existsSync(custompath)) {
    writeFileSync(custompath, '{"queries": []}');
}

let imagepath = join(app.getPath('userData'), 'images');
if (!existsSync(imagepath)) {
    mkdirSync(imagepath);
}

global.closeTooltip = function () {
    emitter.emit('closeTooltip');
};

renderEmit.on('login', function () {
    emitter.removeAllListeners();
    ReactDOM.unmountComponentAtNode(document.getElementById('root'));
    let Root = () => (
        <AlertProvider
            id='alertContainer'
            template={AlertTemplate}
            {...alertOptions}
        >
            <AppContainer />
        </AlertProvider>
    );
    ReactDOM.render(<Root />, document.getElementById('root'));
});

renderEmit.on('logout', function () {
    emitter.removeAllListeners();
    ReactDOM.unmountComponentAtNode(document.getElementById('root'));
    ReactDOM.render(<Login />, document.getElementById('root'));
});

ReactDOM.render(<Login />, document.getElementById('root'));
