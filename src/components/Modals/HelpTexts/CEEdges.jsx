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
        slug: 'golden-cert',
        paras: [
            'A Golden Certificate edge marks that a principal can obtain or use the private key of an enterprise CA (for example by controlling the CA host).',
            'With the CA private key an attacker can forge certificates for any principal in the domain and authenticate as them, similar to a golden ticket.',
        ],
    },

    // --- ADCS control edges ------------------------------------------------
    ManageCA: {
        slug: 'manage-ca',
        paras: [
            'ManageCA is the CA Administrator role over an enterprise CA. It allows administrative changes to the CA configuration, including toggling flags such as the one behind ESC6.',
        ],
    },
    ManageCertificates: {
        slug: 'manage-certificates',
        paras: [
            'ManageCertificates is the Certificate Manager (officer) role over an enterprise CA. It allows approving or denying pending certificate requests, which can release requests that would otherwise need manager approval.',
        ],
    },
    WritePKIEnrollmentFlag: {
        slug: 'write-pki-enrollment-flag',
        paras: [
            'WritePKIEnrollmentFlag is write access to the msPKI-Enrollment-Flag attribute of a certificate template.',
            'Changing this flag (for example to remove the manager-approval requirement) can move a template into an abusable configuration.',
        ],
    },
    WritePKINameFlag: {
        slug: 'write-pki-name-flag',
        paras: [
            'WritePKINameFlag is write access to the msPKI-Certificate-Name-Flag attribute of a certificate template.',
            'Changing this flag (for example to allow the enrollee to supply the subject) can move a template into an ESC1-style abusable configuration.',
        ],
    },
    EnrollOnBehalfOf: {
        slug: 'enroll-on-behalf-of',
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
        slug: 'member-of-local-group',
        paras: [
            'MemberOfLocalGroup means the principal is a member of a local group on a computer (for example the local Administrators or Remote Desktop Users group), granting whatever access that local group confers on the host.',
        ],
    },
    LocalToComputer: {
        slug: 'local-to-computer',
        paras: [
            'LocalToComputer ties a local group or local user object to the computer it exists on, expressing that the local principal is defined on that specific host.',
        ],
    },
    RemoteInteractiveLogonRight: {
        slug: 'remote-interactive-logon-right',
        paras: [
            'RemoteInteractiveLogonRight means the principal is granted the "Allow log on through Remote Desktop Services" user right on the computer, i.e. it may sign in over RDP.',
        ],
    },

    // --- CE attack-path edges ----------------------------------------------
    CoerceToTGT: {
        slug: 'coerce-to-tgt',
        paras: [
            'CoerceToTGT indicates a principal can coerce or obtain a Ticket-Granting Ticket for the target, for example through unconstrained delegation or Kerberos abuse, allowing it to act as that principal.',
        ],
    },
    DCFor: {
        slug: 'dc-for',
        paras: [
            'DCFor marks that a computer is a domain controller for the target domain. Domain controllers are Tier Zero and can perform sensitive directory operations such as replication.',
        ],
    },
    HasTrustKeys: {
        slug: 'has-trust-keys',
        paras: [
            'HasTrustKeys represents possession of the trust keys for a domain trust, which can be used to forge inter-realm tickets and traverse the trust.',
        ],
    },
    SpoofSIDHistory: {
        slug: 'spoof-sid-history',
        paras: [
            'SpoofSIDHistory indicates the principal can add SID history entries (for example across a trust) so that authenticating grants the privileges of the spoofed SIDs.',
        ],
    },
    AbuseTGTDelegation: {
        slug: 'abuse-tgt-delegation',
        paras: [
            'AbuseTGTDelegation indicates a principal can obtain another principal’s TGT through Kerberos delegation across a trust, and reuse it to authenticate as that principal.',
        ],
    },
    WriteGPLink: {
        slug: 'write-gp-link',
        paras: [
            'WriteGPLink is write access to the gPLink attribute of an OU or site, letting a principal link a Group Policy Object to that container and so apply policy (and any settings it carries) to the objects within it.',
        ],
    },
    GPOAppliesTo: {
        slug: 'gpo-applies-to',
        target: 'Base',
        paras: [
            'GPOAppliesTo expresses that a Group Policy Object applies to the target object, i.e. the settings in the GPO reach that principal or computer.',
        ],
    },
    CanApplyGPO: {
        slug: 'can-apply-gpo',
        paras: [
            'CanApplyGPO expresses that a principal is within the scope of, or can cause the application of, a Group Policy Object, so control over that GPO affects the principal.',
        ],
    },
    SyncedToEntraUser: {
        slug: 'synced-to-entra-user',
        paras: [
            'SyncedToEntraUser links an on-premises Active Directory user to the Entra ID (Azure AD) user it is synchronized to, so compromise of one side can affect the other.',
        ],
    },
    SyncedToADUser: {
        slug: 'synced-to-ad-user',
        paras: [
            'SyncedToADUser is the reverse direction of SyncedToEntraUser: it links an Entra ID (Azure AD) user back to the on-premises Active Directory user it is synchronized to, so compromise of the cloud identity can reach the on-premises one.',
        ],
    },
    WriteOwnerLimitedRights: {
        slug: 'write-owner-limited-rights',
        paras: [
            'WriteOwnerLimitedRights is a constrained form of WriteOwner: the principal can set the owner of the target object but only within limits enforced by the environment, still potentially enabling further control.',
        ],
    },
    OwnsLimitedRights: {
        slug: 'owns-limited-rights',
        paras: [
            'OwnsLimitedRights is a constrained form of Owns: the principal is the owner of the target but with limited implicit rights, which may still be leveraged toward control of the object.',
        ],
    },
    WriteOwnerRaw: {
        slug: 'write-owner-raw',
        paras: [
            'WriteOwnerRaw is the raw form of the WriteOwner right, as collected before CE post-processing decides how much control it actually confers.',
            'CE keeps this raw edge and, during analysis, resolves it into either WriteOwner (full control) or WriteOwnerLimitedRights depending on whether the target grants owner rights. It is normally hidden in CE and mainly of interest when reviewing the underlying ACLs.',
        ],
    },
    OwnsRaw: {
        slug: 'owns-raw',
        paras: [
            'OwnsRaw is the raw form of the Owns relationship, as collected before CE post-processing decides how much control ownership actually confers.',
            'CE keeps this raw edge and, during analysis, resolves it into either Owns (full control) or OwnsLimitedRights depending on whether the target grants owner rights. It is normally hidden in CE and mainly of interest when reviewing the underlying ACLs.',
        ],
    },
    WriteAltSecurityIdentities: {
        slug: 'write-alt-security-identities',
        refs: [
            'https://posts.specterops.io/adcs-esc14-abuse-technique-333a004dc2b9',
        ],
        paras: [
            'The principal can write the altSecurityIdentities attribute of the target. That attribute holds explicit certificate mappings: a certificate listed there can be used to authenticate as the target.',
            'This can enable ADCS ESC14 scenario A. The attacker adds a mapping to a certificate they hold and authenticates as the target with it. The certificate must chain to a root CA the domain controller trusts, be issued by a CA in the NTAuth store, carry an EKU that allows domain authentication (Client Authentication, PKINIT Client Authentication or Smart Card Logon), and must not carry a UPN in its subject alternative name.',
        ],
    },
    WritePublicInformation: {
        slug: 'write-public-information',
        refs: [
            'https://posts.specterops.io/adcs-esc14-abuse-technique-333a004dc2b9',
        ],
        paras: [
            'The principal can write the Public-Information property set of the target. The set includes the altSecurityIdentities and servicePrincipalName attributes.',
            'Write access to altSecurityIdentities can enable ADCS ESC14 scenario A (see WriteAltSecurityIdentities). Write access to servicePrincipalName allows targeted Kerberoasting of a user account (see WriteSPN).',
        ],
    },
    ServerIs: {
        slug: 'server-is',
        paras: [
            'ServerIs links an Active Directory site server object to the computer named by its serverReference attribute, normally the domain controller the site server represents.',
            'It grants no control on its own. It makes control of a site traversable: a GPO linked to the site applies to the domain controllers whose site servers are in it, so check the inbound control and GPLink edges of the site.',
        ],
    },

    // --- NTLM relay edges --------------------------------------------------
    CoerceAndRelayNTLMToSMB: {
        slug: 'coerce-and-relay-ntlm-to-smb',
        paras: [
            'Any authenticated user can compromise the target computer by coercing SMB authentication from another computer that has administrative rights on the target and relaying it to the target, which does not require SMB signing.',
            'The source of this edge is the Authenticated Users group (or a group containing the coerced computers), so it applies to every domain account.',
        ],
    },
    CoerceAndRelayNTLMToLDAP: {
        slug: 'coerce-and-relay-ntlm-to-ldap',
        paras: [
            'The target computer runs the WebClient service. Any authenticated user can coerce WebClient (HTTP) NTLM authentication from it and relay that to LDAP on a domain controller that does not require LDAP signing.',
            'The relayed session can be used to configure Resource-Based Constrained Delegation or Shadow Credentials on the target computer and so take it over, or to abuse other Active Directory permissions the computer account holds.',
        ],
    },
    CoerceAndRelayNTLMToLDAPS: {
        slug: 'coerce-and-relay-ntlm-to-ldaps',
        paras: [
            'The target computer runs the WebClient service. Any authenticated user can coerce WebClient (HTTP) NTLM authentication from it and relay that to LDAPS on a domain controller that does not require LDAPS channel binding.',
            'The relayed session can be used to configure Resource-Based Constrained Delegation or Shadow Credentials on the target computer and so take it over, or to abuse other Active Directory permissions the computer account holds.',
        ],
    },
    CoerceAndRelayNTLMToADCS: {
        slug: 'coerce-and-relay-ntlm-to-adcs',
        paras: [
            'Any authenticated user can coerce SMB NTLM authentication from the target computer and relay it to an ESC8-vulnerable web enrollment endpoint of an enterprise CA.',
            'The attacker receives a certificate for the target computer account and can use it to authenticate to the domain as that computer.',
        ],
    },

    // --- Entra ID edges ----------------------------------------------------
    AZAuthenticatesTo: {
        slug: 'az-authenticates-to',
        paras: [
            'The federated identity credential (FIC) is configured on the target app registration. Anyone who can obtain a token from the credential\'s trusted issuer with a matching subject claim can exchange it at the Microsoft identity platform for an access token as the app.',
            'The app runs as its service principal (AZRunsAs), so follow that edge to see what the attacker gains. Control of the external issuer, for example a CI pipeline or workload identity named in the credential, is what the edge leading to the credential represents.',
        ],
    },
    AZRoleEligible: {
        slug: 'az-role-eligible',
        paras: [
            'The user or group is eligible for the Entra ID role through Privileged Identity Management (PIM). It does not hold the role until it is activated; while it is active the principal also has an AZHasRole edge to the role.',
            'If the principal is compromised, an attacker can activate the role, subject to the role\'s PIM settings (MFA, justification, ticket number or approval), or use an activation that is already in place. Activations are recorded in the tenant audit logs and can be set to notify administrators.',
        ],
    },
    AZRoleApprover: {
        slug: 'az-role-approver',
        paras: [
            'The principal is an approver in the PIM policy for the Entra ID role. When the policy requires approval, principals that are eligible for the role (AZRoleEligible) need an approver to accept the activation.',
            'If an approver is compromised, an attacker can approve activations or assignments of the role, for example an activation requested by another account the attacker controls.',
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

// Fallback for any edge type with no definition of its own. Rather than the
// stock "report this to the dev team" error, it names the edge and links to
// the BloodHound edge documentation index. Newer CE edges land here until a
// specific definition is added above.
const GenericEdge = ({ edge, sourceName, sourceType, targetName, targetType }) => (
    <Tabs defaultActiveKey={1} id='help-tab-container' justified>
        <Tab eventKey={1} title='Info'>
            <p>
                {groupSpecialFormat(sourceType, sourceName)} the {edge} edge to
                the {typeFormat(targetType)} {targetName}.
            </p>
            <p>
                No detailed description for the {edge} edge is bundled with this
                build. See the BloodHound documentation for what this edge means
                and how it is abused.
            </p>
        </Tab>
        <Tab eventKey={2} title='Refs'>
            <a href='https://bloodhound.specterops.io/resources/edges/overview'>
                https://bloodhound.specterops.io/resources/edges/overview
            </a>
            <br />
        </Tab>
    </Tabs>
);

GenericEdge.propTypes = {
    edge: PropTypes.string,
    sourceName: PropTypes.string,
    sourceType: PropTypes.string,
    targetName: PropTypes.string,
    targetType: PropTypes.string,
};

export { DEFINITIONS, GenericEdge };
export default CEEdgeHelp;
