// Help text for the CE edge types that Legacy has no Help panel for. Legacy
// gives every edge a component built from per-tab files; there are too many
// new CE edges for that, so this one module holds a short definition for each
// and builds the same tabbed panel from it.
//
// Each definition is informational: what the edge means, what having it lets a
// principal do, and links to the official BloodHound documentation for the
// full abuse and detection guidance. The abuse steps themselves live in CE's
// docs (the same "Refs" links), not here.
import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'react-bootstrap';
import { groupSpecialFormat, typeFormat } from './Formatter';

const CE_DOCS = 'https://bloodhound.specterops.io/resources/edges/';

// Definitions keyed by edge type. Each has:
//   summary(sourceName, sourceType, targetName, targetType) -> intro line
//   paras                       -> array of explanatory paragraphs
//   refs                        -> extra reference URLs (the edge's own CE
//                                  docs page is always added)
//   slug                        -> CE docs page name (defaults from the key)
const DEFINITIONS = {
    // --- ADCS attack edges -------------------------------------------------
    ADCSESC1: {
        slug: 'adcs-esc1',
        paras: [
            'ESC1 is an Active Directory Certificate Services domain escalation. The certificate template published to an enterprise CA lets an enrollee supply an arbitrary subject alternative name, allows client authentication, and does not require manager approval or authorized signatures.',
            'A principal that can enroll in such a template can request a certificate for any account in the domain, including a Tier Zero principal, and use it to authenticate as that account.',
        ],
    },
    ADCSESC3: {
        slug: 'adcs-esc3',
        paras: [
            'ESC3 abuses an enrollment agent certificate template. One template grants the Certificate Request Agent application policy; a second, authentication-capable template allows enrollment on behalf of another user.',
            'A principal that controls the agent template can enroll on behalf of an arbitrary account and obtain a certificate that authenticates as that account.',
        ],
    },
    ADCSESC4: {
        slug: 'adcs-esc4',
        paras: [
            'ESC4 is control over a certificate template object itself (for example GenericAll, GenericWrite, WriteOwner or WriteDacl).',
            'A principal with write access can reconfigure the template into a vulnerable state (such as the ESC1 configuration) and then abuse it to escalate.',
        ],
    },
    ADCSESC5: {
        slug: 'adcs-esc5',
        paras: [
            'ESC5 covers control over PKI objects outside the template itself, such as the CA computer object, the CA server, or objects in the Public Key Services container, that can be leveraged to compromise the PKI and escalate.',
        ],
    },
    ADCSESC6a: {
        slug: 'adcs-esc6a',
        paras: [
            'ESC6 exists when an enterprise CA has the EDITF_ATTRIBUTESUBJECTALTNAME2 flag set, so any request can specify an arbitrary subject alternative name regardless of the template.',
            'ESC6a is the variant where the CA does not enforce strong certificate mapping, allowing a requested certificate to be mapped to an arbitrary account for authentication.',
        ],
    },
    ADCSESC6b: {
        slug: 'adcs-esc6b',
        paras: [
            'ESC6 exists when an enterprise CA has the EDITF_ATTRIBUTESUBJECTALTNAME2 flag set, so any request can specify an arbitrary subject alternative name regardless of the template.',
            'ESC6b is the variant abused where strong certificate mapping is enforced, using the CA misconfiguration together with the mapping requirements.',
        ],
    },
    ADCSESC7: {
        slug: 'adcs-esc7',
        paras: [
            'ESC7 is control over an enterprise CA through the ManageCA or ManageCertificates permission.',
            'These rights let a principal change CA settings (for example enabling the ESC6 flag) or approve pending requests, which can be chained into a domain escalation.',
        ],
    },
    ADCSESC9a: {
        slug: 'adcs-esc9a',
        paras: [
            'ESC9 relies on a certificate template that carries the CT_FLAG_NO_SECURITY_EXTENSION flag, so the issued certificate omits the szOID_NTDS_CA_SECURITY_EXT security extension.',
            'ESC9a is the variant abused against accounts mapped weakly by UPN, allowing a principal with control over a victim account to obtain a certificate that authenticates as a more privileged account.',
        ],
    },
    ADCSESC9b: {
        slug: 'adcs-esc9b',
        paras: [
            'ESC9 relies on a certificate template that carries the CT_FLAG_NO_SECURITY_EXTENSION flag, so the issued certificate omits the security extension used for strong mapping.',
            'ESC9b is the variant abused against machine accounts mapped by DNS, allowing escalation through a controlled victim computer account.',
        ],
    },
    ADCSESC10a: {
        slug: 'adcs-esc10a',
        paras: [
            'ESC10 depends on weak certificate mapping registry settings on the domain controllers (the CertificateMappingMethods or StrongCertificateBindingEnforcement values).',
            'ESC10a is the UPN-based variant: a principal with control over a victim account can change its UPN and enroll to authenticate as a targeted account.',
        ],
    },
    ADCSESC10b: {
        slug: 'adcs-esc10b',
        paras: [
            'ESC10 depends on weak certificate mapping registry settings on the domain controllers.',
            'ESC10b is the variant abused through the account’s altSecurityIdentities / DNS mapping to escalate via a controlled victim.',
        ],
    },
    ADCSESC13: {
        slug: 'adcs-esc13',
        target: 'Group',
        paras: [
            'ESC13 abuses a certificate template that is linked to an issuance policy which is in turn mapped to an Active Directory group (an OID group link).',
            'A principal that can enroll in the template receives a certificate that grants the rights of the linked group, effectively adding them to that group when they authenticate.',
        ],
    },
    GoldenCert: {
        slug: 'golden-certificate',
        paras: [
            'A Golden Certificate edge marks that a principal can obtain or use the private key of an enterprise CA (for example by controlling the CA host).',
            'With the CA private key an attacker can forge certificates for any principal in the domain and authenticate as them, similar to a golden ticket.',
        ],
    },

    // --- ADCS control edges ------------------------------------------------
    ManageCA: {
        slug: 'manageca',
        paras: [
            'ManageCA is the CA Administrator role over an enterprise CA. It allows administrative changes to the CA configuration, including toggling flags such as the one behind ESC6.',
        ],
    },
    ManageCertificates: {
        slug: 'managecertificates',
        paras: [
            'ManageCertificates is the Certificate Manager (officer) role over an enterprise CA. It allows approving or denying pending certificate requests, which can release requests that would otherwise need manager approval.',
        ],
    },
    WritePKIEnrollmentFlag: {
        slug: 'writepkienrollmentflag',
        paras: [
            'WritePKIEnrollmentFlag is write access to the msPKI-Enrollment-Flag attribute of a certificate template.',
            'Changing this flag (for example to remove the manager-approval requirement) can move a template into an abusable configuration.',
        ],
    },
    WritePKINameFlag: {
        slug: 'writepkinameflag',
        paras: [
            'WritePKINameFlag is write access to the msPKI-Certificate-Name-Flag attribute of a certificate template.',
            'Changing this flag (for example to allow the enrollee to supply the subject) can move a template into an ESC1-style abusable configuration.',
        ],
    },
    EnrollOnBehalfOf: {
        slug: 'enrollonbehalfof',
        paras: [
            'EnrollOnBehalfOf links an enrollment agent template to a target template it can request on behalf of another principal. It is a component of the ESC3 chain.',
        ],
    },
    DelegatedEnrollmentAgent: {
        slug: 'adcs-esc3',
        paras: [
            'DelegatedEnrollmentAgent indicates a principal is permitted to act as an enrollment agent for a certificate template, i.e. to enroll on behalf of other principals. It is a component of the ESC3 chain.',
        ],
    },

    // --- Local group edges -------------------------------------------------
    MemberOfLocalGroup: {
        slug: 'memberoflocalgroup',
        paras: [
            'MemberOfLocalGroup means the principal is a member of a local group on a computer (for example the local Administrators or Remote Desktop Users group), granting whatever access that local group confers on the host.',
        ],
    },
    LocalToComputer: {
        slug: 'localtocomputer',
        paras: [
            'LocalToComputer ties a local group or local user object to the computer it exists on, expressing that the local principal is defined on that specific host.',
        ],
    },
    RemoteInteractiveLogonRight: {
        slug: 'remoteinteractivelogonright',
        paras: [
            'RemoteInteractiveLogonRight means the principal is granted the "Allow log on through Remote Desktop Services" user right on the computer, i.e. it may sign in over RDP.',
        ],
    },

    // --- CE attack-path edges ----------------------------------------------
    CoerceToTGT: {
        slug: 'coercetotgt',
        paras: [
            'CoerceToTGT indicates a principal can coerce or obtain a Ticket-Granting Ticket for the target, for example through unconstrained delegation or Kerberos abuse, allowing it to act as that principal.',
        ],
    },
    DCFor: {
        slug: 'dcfor',
        paras: [
            'DCFor marks that a computer is a domain controller for the target domain. Domain controllers are Tier Zero and can perform sensitive directory operations such as replication.',
        ],
    },
    HasTrustKeys: {
        slug: 'hastrustkeys',
        paras: [
            'HasTrustKeys represents possession of the trust keys for a domain trust, which can be used to forge inter-realm tickets and traverse the trust.',
        ],
    },
    SpoofSIDHistory: {
        slug: 'spoofsidhistory',
        paras: [
            'SpoofSIDHistory indicates the principal can add SID history entries (for example across a trust) so that authenticating grants the privileges of the spoofed SIDs.',
        ],
    },
    AbuseTGTDelegation: {
        slug: 'abusetgtdelegation',
        paras: [
            'AbuseTGTDelegation indicates a principal can obtain another principal’s TGT through Kerberos delegation across a trust, and reuse it to authenticate as that principal.',
        ],
    },
    WriteGPLink: {
        slug: 'writegplink',
        paras: [
            'WriteGPLink is write access to the gPLink attribute of an OU or site, letting a principal link a Group Policy Object to that container and so apply policy (and any settings it carries) to the objects within it.',
        ],
    },
    GPOAppliesTo: {
        slug: 'gpoappliesto',
        target: 'Base',
        paras: [
            'GPOAppliesTo expresses that a Group Policy Object applies to the target object, i.e. the settings in the GPO reach that principal or computer.',
        ],
    },
    CanApplyGPO: {
        slug: 'canapplygpo',
        paras: [
            'CanApplyGPO expresses that a principal is within the scope of, or can cause the application of, a Group Policy Object, so control over that GPO affects the principal.',
        ],
    },
    SyncedToEntraUser: {
        slug: 'syncedtoentrauser',
        paras: [
            'SyncedToEntraUser links an on-premises Active Directory user to the Entra ID (Azure AD) user it is synchronized to, so compromise of one side can affect the other.',
        ],
    },
    WriteOwnerLimitedRights: {
        slug: 'writeownerlimitedrights',
        paras: [
            'WriteOwnerLimitedRights is a constrained form of WriteOwner: the principal can set the owner of the target object but only within limits enforced by the environment, still potentially enabling further control.',
        ],
    },
    OwnsLimitedRights: {
        slug: 'ownslimitedrights',
        paras: [
            'OwnsLimitedRights is a constrained form of Owns: the principal is the owner of the target but with limited implicit rights, which may still be leveraged toward control of the object.',
        ],
    },
};

const General = ({ def, sourceName, sourceType, targetName, targetType }) => (
    <>
        <p>
            {groupSpecialFormat(sourceType, sourceName)} the {def.key} edge to
            the {typeFormat(targetType)} {targetName}.
        </p>
        {def.paras.map((text, i) => (
            <p key={i}>{text}</p>
        ))}
    </>
);

const References = ({ def }) => {
    const links = [`${CE_DOCS}${def.slug}`, ...(def.refs || [])];
    return (
        <>
            {links.map((href) => (
                <React.Fragment key={href}>
                    <a href={href}>{href}</a>
                    <br />
                </React.Fragment>
            ))}
        </>
    );
};

// Builds the tabbed Help component for one definition, matching the shape of
// Legacy's hand-written edge Help panels (an Info tab and a Refs tab).
const makeComponent = (key, def) => {
    const withKey = { ...def, key };
    const Component = ({ sourceName, sourceType, targetName, targetType }) => (
        <Tabs defaultActiveKey={1} id='help-tab-container' justified>
            <Tab eventKey={1} title='Info'>
                <General
                    def={withKey}
                    sourceName={sourceName}
                    sourceType={sourceType}
                    targetName={targetName}
                    targetType={targetType}
                />
            </Tab>
            <Tab eventKey={2} title='Refs'>
                <References def={withKey} />
            </Tab>
        </Tabs>
    );
    Component.propTypes = {
        sourceName: PropTypes.string,
        sourceType: PropTypes.string,
        targetName: PropTypes.string,
        targetType: PropTypes.string,
    };
    Component.displayName = key;
    return Component;
};

// The map HelpModal spreads into its components table: edge type -> component.
const CEEdgeHelp = Object.fromEntries(
    Object.entries(DEFINITIONS).map(([key, def]) => [key, makeComponent(key, def)])
);

export { DEFINITIONS };
export default CEEdgeHelp;
