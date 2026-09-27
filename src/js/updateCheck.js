// A lightweight, cross-platform update check for the fork. It only asks GitHub
// whether a newer version exists and reports back; it never downloads or
// installs anything, so it behaves identically on macOS, Windows and Linux and
// needs no code signing or change to how the app is packaged.
//
// It compares the running fork version (forkVersion in package.json) against
// the newest semver tag on the fork's repository. Tags are the anchor because
// the fork is versioned by hand: cut a build by bumping forkVersion and pushing
// a matching tag (for example v1.1.0). If the repository has no tags yet it
// falls back to reporting the latest commit on the default branch, so the check
// still tells you something useful.

export const FORK_REPO = 'edtrud385/BloodHound-Legacy';
const API = `https://api.github.com/repos/${FORK_REPO}`;

// "v1.2.3" / " 1.2 " -> [1, 2, 3]; anything non-numeric is dropped.
export function parseVersion(v) {
    if (!v) return [];
    return String(v)
        .trim()
        .replace(/^v/i, '')
        .split('.')
        .map((part) => parseInt(part, 10))
        .filter((n) => !Number.isNaN(n));
}

// True when version a is strictly greater than version b, compared part by part.
export function isNewer(a, b) {
    const pa = parseVersion(a);
    const pb = parseVersion(b);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
        const x = pa[i] || 0;
        const y = pb[i] || 0;
        if (x > y) return true;
        if (x < y) return false;
    }
    return false;
}

// Given GitHub's tags payload, return the highest semver-looking tag name, or
// null if there are none.
export function pickLatestTag(tags) {
    if (!Array.isArray(tags)) return null;
    let best = null;
    for (const tag of tags) {
        const name = tag && tag.name;
        if (!name || parseVersion(name).length === 0) continue;
        if (best === null || isNewer(name, best)) best = name;
    }
    return best;
}

// Classifies the running version against the newest tag. Pure, so it is unit
// tested; checkForUpdate wraps it around the network calls.
export function compareToTags(currentForkVersion, tags) {
    const latest = pickLatestTag(tags);
    if (latest === null) return { status: 'untagged' };
    if (isNewer(latest, currentForkVersion)) {
        return {
            status: 'update',
            latest,
            current: currentForkVersion,
            url: `https://github.com/${FORK_REPO}/releases`,
        };
    }
    return { status: 'current', latest, current: currentForkVersion };
}

// Runs the check against GitHub. fetchImpl is injectable for testing; at
// runtime it defaults to the environment's fetch (available in Electron's
// renderer). Never throws: network or API problems come back as
// { status: 'error', message }.
export async function checkForUpdate(currentForkVersion, fetchImpl) {
    const doFetch = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
    if (!doFetch) return { status: 'error', message: 'No fetch available' };

    const headers = { Accept: 'application/vnd.github+json' };
    try {
        const res = await doFetch(`${API}/tags?per_page=100`, { headers });
        if (!res.ok) {
            return { status: 'error', message: `GitHub returned ${res.status}` };
        }
        const tags = await res.json();
        const result = compareToTags(currentForkVersion, tags);
        if (result.status !== 'untagged') return result;

        // No tags to compare against; report the latest commit instead.
        const commitRes = await doFetch(`${API}/commits?per_page=1`, { headers });
        if (!commitRes.ok) return result;
        const commits = await commitRes.json();
        const head = Array.isArray(commits) && commits[0];
        if (!head) return result;
        return {
            status: 'untagged',
            current: currentForkVersion,
            commit: (head.sha || '').substring(0, 7),
            date:
                head.commit &&
                head.commit.author &&
                head.commit.author.date
                    ? head.commit.author.date.substring(0, 10)
                    : '',
            url: `https://github.com/${FORK_REPO}/commits`,
        };
    } catch (e) {
        return { status: 'error', message: e.message };
    }
}
