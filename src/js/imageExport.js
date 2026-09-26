import { remote } from 'electron';
import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const { dialog } = remote;

// Graph image settings, saved under "imageExport" in the app config.
//   width, height  pixel size of the image; 0 uses the graph's on-screen size
//   padding        percent to zoom out so nothing sits on the image edge
//   highValue      draw the high value marker on nodes
//   owned          draw the owned marker on nodes
//   autoNumber     save straight to folder as 00001.png, 00002.png, ...
//                  instead of asking for a file name
//   folder         where numbered images go; also where the save dialog opens
export const IMAGE_DEFAULTS = {
    width: 0,
    height: 0,
    padding: 8,
    highValue: true,
    owned: true,
    autoNumber: true,
    folder: null,
};

export function loadImageSettings() {
    return { ...IMAGE_DEFAULTS, ...(conf.get('imageExport') || {}) };
}

export function updateImageSettings(changes) {
    appStore.imageExport = { ...appStore.imageExport, ...changes };
    conf.set('imageExport', appStore.imageExport);
    emitter.emit('imageSettingsChanged', appStore.imageExport);
}

export function chooseImageFolder() {
    const result = dialog.showOpenDialogSync({
        title: 'Choose a folder for graph images',
        properties: ['openDirectory', 'createDirectory'],
    });
    if (!result || result.length === 0) return null;
    updateImageSettings({ folder: result[0] });
    return result[0];
}

function nextNumberedPath(folder) {
    let highest = 0;
    for (const file of readdirSync(folder)) {
        const match = /^(\d+)\.png$/i.exec(file);
        if (match) highest = Math.max(highest, parseInt(match[1], 10));
    }
    return join(folder, `${String(highest + 1).padStart(5, '0')}.png`);
}

function chooseTarget(settings) {
    if (settings.autoNumber) {
        const folder = settings.folder || chooseImageFolder();
        return folder ? nextNumberedPath(folder) : null;
    }
    return (
        dialog.showSaveDialogSync({
            title: 'Save graph image',
            defaultPath: settings.folder
                ? join(settings.folder, 'bloodhound.png')
                : 'bloodhound.png',
            filters: [{ name: 'PNG Image', extensions: ['png'] }],
        }) || null
    );
}

// The graph's size on screen, used when no fixed size is set.
export function screenSize(sigmaInstance) {
    const live = sigmaInstance && sigmaInstance.renderers[0];
    if (live && live.width && live.height) {
        return { width: Math.round(live.width), height: Math.round(live.height) };
    }
    return { width: window.innerWidth, height: window.innerHeight };
}

export function imageSize(sigmaInstance, settings) {
    const screen = screenSize(sigmaInstance);
    const width = settings.width || screen.width;
    const height =
        settings.height ||
        Math.round((width * screen.height) / screen.width);
    return { width, height };
}

// Glyph positions Graph.jsx uses for the owned and high value markers.
const OWNED_GLYPH = 'top-left';
const HIGH_VALUE_GLYPH = 'top-right';

// Renders the graph exactly as framed on screen into an image of the
// configured size and writes it to disk. Returns the saved path, or null
// if the user cancelled.
export function exportGraphImage(sigmaInstance, darkMode) {
    const settings = appStore.imageExport;
    const target = chooseTarget(settings);
    if (!target) return null;

    const { width, height } = imageSize(sigmaInstance, settings);
    const screen = screenSize(sigmaInstance);
    const liveCamera = sigmaInstance.renderers[0].camera;

    // Render into an offscreen container the size of the live view with
    // the live camera, then scale that to the requested size, so a size
    // that differs from the screen does not crop or re-zoom the graph.
    const container = document.createElement('div');
    container.style.cssText = `position:fixed;left:-100000px;top:0;width:${screen.width}px;height:${screen.height}px;`;
    document.body.appendChild(container);

    const hidden = [];
    let renderer = null;
    try {
        for (const node of sigmaInstance.graph.nodes()) {
            if (!node.glyphs || node.glyphs.length === 0) continue;
            const keep = node.glyphs.filter(
                (glyph) =>
                    (settings.highValue ||
                        glyph.position !== HIGH_VALUE_GLYPH) &&
                    (settings.owned || glyph.position !== OWNED_GLYPH)
            );
            if (keep.length !== node.glyphs.length) {
                hidden.push({ node: node, glyphs: node.glyphs });
                node.glyphs = keep;
            }
        }

        renderer = sigmaInstance.addRenderer({
            container: container,
            type: 'canvas',
        });
        sigmaInstance.refresh();
        renderer.camera.goTo({
            x: liveCamera.x,
            y: liveCamera.y,
            angle: liveCamera.angle,
            ratio: liveCamera.ratio * (1 + settings.padding / 100),
        });
        renderer.glyphs();

        const out = document.createElement('canvas');
        out.width = width;
        out.height = height;
        const context = out.getContext('2d');
        context.fillStyle = darkMode ? '#383332' : '#f2f5f9';
        context.fillRect(0, 0, width, height);
        container.querySelectorAll('canvas').forEach((canvas) => {
            if (canvas.width && canvas.height)
                context.drawImage(canvas, 0, 0, width, height);
        });

        const data = out.toDataURL('image/png').split(',')[1];
        writeFileSync(target, Buffer.from(data, 'base64'));
        return target;
    } finally {
        for (const { node, glyphs } of hidden) node.glyphs = glyphs;
        if (renderer) sigmaInstance.killRenderer(renderer);
        container.remove();
        sigmaInstance.renderers[0].glyphs();
        sigmaInstance.refresh();
    }
}
