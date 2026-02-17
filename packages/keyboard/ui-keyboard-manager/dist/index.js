"use strict";
/**
 * UI Keyboard Manager
 * Export all keyboard management functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.KeyboardManager = exports.HelpTooltip = exports.Chat = exports.DocumentEditor = exports.ShortcutRegistry = exports.ContextDetector = void 0;
var ContextDetector_1 = require("./ContextDetector");
Object.defineProperty(exports, "ContextDetector", { enumerable: true, get: function () { return ContextDetector_1.ContextDetector; } });
var ShortcutRegistry_1 = require("./ShortcutRegistry");
Object.defineProperty(exports, "ShortcutRegistry", { enumerable: true, get: function () { return ShortcutRegistry_1.ShortcutRegistry; } });
var DocumentEditor_1 = require("./DocumentEditor");
Object.defineProperty(exports, "DocumentEditor", { enumerable: true, get: function () { return DocumentEditor_1.DocumentEditor; } });
var Chat_1 = require("./Chat");
Object.defineProperty(exports, "Chat", { enumerable: true, get: function () { return Chat_1.Chat; } });
var HelpTooltip_1 = require("./HelpTooltip");
Object.defineProperty(exports, "HelpTooltip", { enumerable: true, get: function () { return HelpTooltip_1.HelpTooltip; } });
var KeyboardManager_1 = require("./KeyboardManager");
Object.defineProperty(exports, "KeyboardManager", { enumerable: true, get: function () { return KeyboardManager_1.KeyboardManager; } });
// Export default KeyboardManager for convenience
var KeyboardManager_2 = require("./KeyboardManager");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return KeyboardManager_2.KeyboardManager; } });
