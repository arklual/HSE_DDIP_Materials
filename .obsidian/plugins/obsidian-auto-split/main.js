/*
THIS IS A GENERATED/BUNDLED FILE BY ROLLUP
if you want to view the source visit the plugins github repository
*/

'use strict';

var obsidian = require('obsidian');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const DEFAULT_SETTINGS = {
    autoSplit: true,
    minSize: 1000,
    direction: 'auto',
    editorFirst: true,
    paneToFocus: 'source',
    linkPanes: true,
};
class AutoSplitPlugin extends obsidian.Plugin {
    constructor() {
        super(...arguments);
        this.hasOpenFiles = false;
    }
    updateHasOpenFiles() {
        try {
            this.hasOpenFiles =
                this.app.workspace.getLeavesOfType('markdown').length > 0;
        }
        catch (e) {
            // it's okay to fail sometimes
        }
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            this.addSettingTab(new AutoSplitSettingTab(this.app, this));
            this.addCommand({
                id: 'split-current-pane',
                name: 'Split and link current pane',
                checkCallback: (checking) => {
                    var _a;
                    if (obsidian.Platform.isPhone)
                        return false;
                    const file = (_a = this.app.workspace.activeEditor) === null || _a === void 0 ? void 0 : _a.file;
                    if (!file)
                        return false;
                    if (!checking)
                        this.splitActiveFile(file);
                    return true;
                },
            });
            this.app.workspace.onLayoutReady(() => {
                this.updateHasOpenFiles();
                this.registerEvent(this.app.workspace.on('file-open', (file) => __awaiter(this, void 0, void 0, function* () {
                    if (this.settings.autoSplit &&
                        !obsidian.Platform.isPhone &&
                        this.app.workspace.getLeavesOfType('markdown').length === 1 &&
                        !this.hasOpenFiles &&
                        file) {
                        yield this.splitActiveFile(file, true);
                    }
                    this.updateHasOpenFiles();
                })));
            });
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
    splitActiveFile(file_1) {
        return __awaiter(this, arguments, void 0, function* (file, autoSplit = false) {
            var _a;
            const activeLeaf = (_a = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView)) === null || _a === void 0 ? void 0 : _a.leaf;
            if (!activeLeaf)
                return;
            const rootSize = getRootContainerSize(this.app);
            let direction = this.settings.direction;
            if (direction === 'auto') {
                direction = rootSize.width >= rootSize.height ? 'vertical' : 'horizontal';
            }
            if ((direction === 'vertical' ? rootSize.width : rootSize.height) >
                this.settings.minSize) {
                const viewState = activeLeaf.getViewState();
                if (viewState.type !== 'markdown')
                    return;
                viewState.active = false;
                viewState.state.mode =
                    viewState.state.mode === 'preview' ? 'source' : 'preview';
                const firstPane = this.settings.editorFirst ? 'source' : 'preview';
                const newLeaf = this.app.workspace.createLeafBySplit(activeLeaf, direction, autoSplit && viewState.state.mode === firstPane);
                yield newLeaf.openFile(file, viewState);
                if (!autoSplit || this.settings.linkPanes) {
                    activeLeaf.setGroupMember(newLeaf);
                }
                if (autoSplit && viewState.state.mode === this.settings.paneToFocus) {
                    this.app.workspace.setActiveLeaf(newLeaf, { focus: true });
                }
            }
        });
    }
}
class AutoSplitSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        if (obsidian.Platform.isPhone) {
            const infoText = containerEl.createEl('div', {
                cls: 'auto-split-settings-info-text',
            });
            obsidian.setIcon(infoText, 'info');
            infoText.createEl('p', {
                text: 'Split panes are not supported on phones.',
            });
            return;
        }
        containerEl.createEl('h2', { text: 'Auto Split Settings' });
        new obsidian.Setting(containerEl)
            .setName('Split Automatically')
            .setDesc('Turn off to only split when the command "Split and link current pane" is used.')
            .addToggle((toggle) => {
            toggle
                .setValue(this.plugin.settings.autoSplit)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.autoSplit = value;
                yield this.plugin.saveSettings();
            }));
        });
        const { width: rootWidth, height: rootHeight } = getRootContainerSize(this.app);
        new obsidian.Setting(containerEl)
            .setName('Minimum Size')
            .setDesc(`Only split if the main area is at least this wide or tall, depending on split direction. The main area was ${rootWidth}x${rootHeight} when you opened this screen. (default: 1000)`)
            .addText((text) => {
            text.inputEl.type = 'number';
            text
                .setValue(String(this.plugin.settings.minSize))
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                const valueAsNumber = Number.parseInt(value);
                this.plugin.settings.minSize = Number.isInteger(valueAsNumber)
                    ? valueAsNumber
                    : this.plugin.settings.minSize;
                yield this.plugin.saveSettings();
            }));
        });
        new obsidian.Setting(containerEl)
            .setName('Split Direction')
            .setDesc('Vertical = left/right, Horizontal = up/down. Auto splits vertically if the main area is wider than it is tall, and horizontally otherwise.')
            .addDropdown((dropdown) => {
            dropdown
                .addOptions({
                auto: 'Auto',
                vertical: 'Vertical',
                horizontal: 'Horizontal',
            })
                .setValue(this.plugin.settings.direction)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.direction = value;
                yield this.plugin.saveSettings();
            }));
        });
        const infoText = containerEl.createEl('div', {
            cls: 'auto-split-settings-info-text',
        });
        obsidian.setIcon(infoText, 'info');
        infoText.createEl('p', {
            text: 'Settings below do not apply to the "Split and link current pane" command.',
        });
        new obsidian.Setting(containerEl)
            .setName('Editor First')
            .setDesc('Place the pane with the editor on the left/top.')
            .addToggle((toggle) => {
            toggle
                .setValue(this.plugin.settings.editorFirst)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.editorFirst = value;
                yield this.plugin.saveSettings();
            }));
        });
        new obsidian.Setting(containerEl)
            .setName('Focus On')
            .setDesc('Select which pane should be focused.')
            .addDropdown((dropdown) => {
            dropdown
                .addOptions({
                source: 'Editor',
                preview: 'Preview',
            })
                .setValue(this.plugin.settings.paneToFocus)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.paneToFocus = value;
                yield this.plugin.saveSettings();
            }));
        });
        new obsidian.Setting(containerEl)
            .setName('Link Panes')
            .setDesc('Link the panes so their scroll position and open file stay the same.')
            .addToggle((toggle) => {
            toggle
                .setValue(this.plugin.settings.linkPanes)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.linkPanes = value;
                yield this.plugin.saveSettings();
            }));
        });
    }
}
function getRootContainerSize(app) {
    const rootContainer = app.workspace.rootSplit.doc.documentElement;
    if (rootContainer) {
        return {
            width: rootContainer.clientWidth,
            height: rootContainer.clientHeight,
        };
    }
    else {
        console.warn(`[Auto Split] couldn't get root container, using window size`);
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }
}

module.exports = AutoSplitPlugin;


/* nosourcemap */