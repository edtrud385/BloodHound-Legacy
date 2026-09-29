// Grouping for the query category dropdown. A category named
// "<PREFIX> - <sub>" (e.g. "Active Directory - Domain Admins") folds under a
// single top-level entry; choosing it reveals every matching "<PREFIX> - *"
// sub-section with its own sub-label.
//
// The two groups are the platforms a BloodHound dataset spans: Active
// Directory and Entra ID. Each recognises a few prefix spellings, so the
// dropdown groups by platform regardless of the exact wording used in
// customqueries.json (including the older ADSA/ESA assessment labels).
export const GROUPS = [
    { label: 'Active Directory', prefixes: ['Active Directory', 'AD', 'ADSA'] },
    {
        label: 'Entra ID',
        prefixes: ['Entra ID', 'Entra', 'Azure AD', 'AAD', 'ESA'],
    },
];

// Returns the group whose prefixes include the given category prefix (matched
// case-insensitively), or null.
function groupForPrefix(prefix) {
    const p = prefix.trim().toLowerCase();
    return (
        GROUPS.find((g) => g.prefixes.some((x) => x.toLowerCase() === p)) || null
    );
}

// Splits a category into its dropdown top-level and the sub-label shown when
// that group is the selected one. "Active Directory - Domain Admins" ->
// { top: 'Active Directory', sub: 'Domain Admins', grouped: true }.
export function splitCategory(full) {
    const i = String(full).indexOf(' - ');
    if (i > 0) {
        const group = groupForPrefix(full.slice(0, i));
        if (group) {
            return { top: group.label, sub: full.slice(i + 3), grouped: true };
        }
    }
    return { top: full, sub: full, grouped: false };
}

// The distinct top-level categories, in first-appearance order.
export function topLevels(categories) {
    const tops = [];
    (categories || []).forEach((c) => {
        const { top } = splitCategory(c);
        if (!tops.includes(top)) tops.push(top);
    });
    return tops;
}
