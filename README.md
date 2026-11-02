# Better Comments by NostraDavid

Highlight tags in code comments so alerts, questions, TODOs, and other notes are easy to scan. The extension keeps the existing `better-comments.*` settings and includes string-aware comment detection for Python and JavaScript/TypeScript, including JSX and TSX.

This is a maintained fork of [Better Comments by Aaron Bond](https://github.com/aaron-bond/better-comments). It preserves the original MIT license and copyright notice; see [LICENSE.md](LICENSE.md). The fork uses its own release sequence, starting at 1.0.0.

## Install

Download the VSIX for the release you want from [GitHub Releases](https://github.com/NostraDavid/vscode-better-comments/releases). In VS Code, open **Extensions**, select the **More Actions** menu, choose **Install from VSIX...**, and select the downloaded file.

If the original Better Comments extension is also installed, disable it to avoid duplicate decorations. Existing `better-comments.*` settings keep their names.

## Configure

The extension reads settings from VS Code user or workspace settings. Its settings include:

- `better-comments.tags` — the tags and styles to apply. Each entry has a `tag` and can set `color`, `backgroundColor`, `strikethrough`, `underline`, `bold`, or `italic`.
- `better-comments.multilineComments` — whether tags are highlighted in multiline comments (default: `true`).
- `better-comments.highlightPlainText` — whether tags at the start of plaintext lines are highlighted (default: `false`).
- `better-comments.enabled` — enables or disables highlighting, including per-language overrides.

For example, add or edit tag entries in `settings.json`:

```json
{
  "better-comments.tags": [
    { "tag": "!", "color": "#FF2D00", "bold": true },
    { "tag": "todo", "color": "#FF8C00" },
    { "tag": "?", "color": "#3498DB" }
  ]
}
```

To disable highlighting for Python only, use VS Code's language-specific settings:

```json
"[python]": {
  "better-comments.enabled": false
}
```

Tag and style changes apply immediately. When tags overlap, the first longest matching tag selects the style.

## Development

See [Getting started](docs/getting-started.md) and [Contributing](CONTRIBUTING.md). The project uses a locked Node.js 24 development environment; run `nix develop`, `just setup`, and `just check`. Use `just package` to build a local VSIX.

See the [changelog](CHANGELOG.md) for fork releases and the [upstream changelog archive](docs/upstream-CHANGELOG.md) for historical upstream notes.

## Attribution and license

This fork is based on Aaron Bond's [Better Comments](https://github.com/aaron-bond/better-comments). The original copyright and MIT permission notice are retained in [LICENSE.md](LICENSE.md).
