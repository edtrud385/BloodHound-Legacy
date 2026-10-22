// Font Awesome icon classes for each node kind, matching the icons CE draws
// on its graph. The graph itself uses the matching glyphs in iconScheme
// (src/index.js); these are for the places that show a kind's icon in HTML,
// like search results and the spotlight.
export const NODE_ICON_CLASSES = {
    // Active Directory
    User: 'fa-user',
    Group: 'fa-users',
    Computer: 'fa-desktop',
    Domain: 'fa-globe',
    GPO: 'fa-list',
    OU: 'fa-sitemap',
    Container: 'fa-box',
    ADLocalGroup: 'fa-users',
    ADLocalUser: 'fa-user',
    // ADCS
    AIACA: 'fa-arrows-left-right-to-line',
    RootCA: 'fa-landmark',
    EnterpriseCA: 'fa-building',
    NTAuthStore: 'fa-store',
    CertTemplate: 'fa-id-card',
    IssuancePolicy: 'fa-clipboard-check',
    // AD Sites
    Site: 'fa-signs-post',
    SiteServer: 'fa-location-pin',
    SiteSubnet: 'fa-map',
    // Azure
    AZUser: 'fa-user',
    AZGroup: 'fa-users',
    AZTenant: 'fa-cloud',
    AZSubscription: 'fa-key',
    AZResourceGroup: 'fa-cube',
    AZVM: 'fa-desktop',
    AZWebApp: 'fa-object-group',
    AZLogicApp: 'fa-sitemap',
    AZAutomationAccount: 'fa-gear',
    AZFunctionApp: 'fa-bolt',
    AZContainerRegistry: 'fa-box-open',
    AZManagedCluster: 'fa-cubes',
    AZDevice: 'fa-desktop',
    AZKeyVault: 'fa-lock',
    AZApp: 'fa-window-restore',
    AZVMScaleSet: 'fa-server',
    AZServicePrincipal: 'fa-robot',
    AZRole: 'fa-clipboard-list',
    AZManagementGroup: 'fa-sitemap',
    AZFederatedIdentityCredential: 'fa-key',
    // Base
    Base: 'fa-question',
};

export const nodeIconClass = (kind) =>
    'fa ' + (NODE_ICON_CLASSES[kind] || NODE_ICON_CLASSES.Base);
