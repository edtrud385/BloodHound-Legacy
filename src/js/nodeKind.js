// Picks the node kind to draw and open a panel for from a node's labels.
// Base and AZBase are on every node, and CE adds Tag_* labels (Tag_Tier_Zero,
// Tag_Owned) whose position in the label list is not fixed, so all of them
// are skipped. Falls back to `fallback` when nothing else is left.
export const isKindLabel = (label) =>
    label !== 'Base' && label !== 'AZBase' && !label.startsWith('Tag_');

export const nodeKind = (labels, fallback = 'Base') =>
    (labels || []).find(isKindLabel) || fallback;
