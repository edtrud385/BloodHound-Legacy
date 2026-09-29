// Grouping for the query category dropdown. A category named
// "<PREFIX> - <sub>" (e.g. "ADSA - 1. Domain Admins") folds under a single
// "<PREFIX>" dropdown entry; choosing it reveals every "<PREFIX> - *"
// sub-section with its own sub-label. Mirrors the ADSA/ESA query categories
// in the bloodhound-legacy-tweaks setup.
export const GROUP_PREFIXES = ['ADSA', 'ESA'];

// Splits a category into its dropdown top-level and the sub-label shown when
// that group is the selected one.
export function splitCategory(full) {
    const i = String(full).indexOf(' - ');
    if (i > 0) {
        const top = full.slice(0, i);
        if (GROUP_PREFIXES.includes(top)) {
            return { top, sub: full.slice(i + 3), grouped: true };
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
