# dd-framework — Tier-1 component contracts (draft)

Draft contracts for the five Tier-1 components the **dd-seo** dashboard needs but
dd-framework does not yet ship: `dd-badge`, `dd-data-table`, `dd-score-ring`,
`dd-bar-chart`, `dd-finding`. Authored in dd-framework spec format so each block
below can be split into the framework's per-component files.

## How to port into dd-framework

For each component `dd-{name}`:
1. Copy the **spec** section into `assets/components/dd-{name}.spec.md` (drop the
   surrounding `### dd-{name}` wrapper heading; start the file at `# dd-{name}`).
2. Copy the **Canonical HTML example** into `assets/components/dd-{name}.html`.
3. Add the **manifest entry** to `assets/components.manifest.json`.
4. Add the component's CSS (BEM classes below) to the framework stylesheet, using
   the design tokens named in each spec. No new token values are required —
   everything reuses the existing `$c_*` palette.

Cross-component dependency: **`dd-data-table`** and **`dd-finding`** both embed
**`dd-badge`** for status/severity cells. Build `dd-badge` first.

Shared conventions (matching existing components): BEM root `div.dd-{name}` /
`span.dd-{name}`, grid helpers `dd-g` / `dd-u-1-1` / `l-box`, screen-reader text
via `.-scrn-reader-only`, scroll-in via `data-sal`. `wraps_in_section: true`
means the consumer wraps the component in a `dd-section`; atoms embedded inside
other components use `false`.

Severity vocabulary is fixed to the dd-seo set: **Critical / Warning / Info /
Pass** (glyphs 🔴 / ⚠️ / ℹ️ / ✅). Variant modifiers are `-critical` `-warning`
`-info` `-pass` (plus neutral default). Palette mapping reused from `dd-alert`:
tertiary → critical, secondary → warning, primary → info, support → pass.

---

## Manifest entries (add to `assets/components.manifest.json`)

```json
{
  "dd-badge": {
    "file": "dd-badge.html",
    "spec": "dd-badge.spec.md",
    "summary": "Compact non-interactive status/severity pill — critical, warning, info, pass, neutral.",
    "root_selector": "span.dd-badge",
    "wraps_in_section": false,
    "required": ["label"],
    "variants": ["-critical", "-warning", "-info", "-pass"]
  },
  "dd-data-table": {
    "file": "dd-data-table.html",
    "spec": "dd-data-table.spec.md",
    "summary": "Accessible data table with caption, column headers, status cells, scroll region, optional sort, and empty state.",
    "root_selector": "div.dd-data-table",
    "wraps_in_section": true,
    "required": ["columns", "rows"],
    "variants": ["-dense"]
  },
  "dd-score-ring": {
    "file": "dd-score-ring.html",
    "spec": "dd-score-ring.spec.md",
    "summary": "Radial SVG gauge showing a score out of a maximum, with visible value and label; optional link.",
    "root_selector": "div.dd-score-ring",
    "wraps_in_section": false,
    "required": ["score", "label"],
    "variants": ["-sm", "-lg"]
  },
  "dd-bar-chart": {
    "file": "dd-bar-chart.html",
    "spec": "dd-bar-chart.spec.md",
    "summary": "Dependency-free horizontal bar chart for comparing labelled values; text values are the accessible truth, bars are decorative.",
    "root_selector": "div.dd-bar-chart",
    "wraps_in_section": true,
    "required": ["items"],
    "variants": []
  },
  "dd-finding": {
    "file": "dd-finding.html",
    "spec": "dd-finding.spec.md",
    "summary": "List of audit findings — each a severity badge + title + evidence + fix. The repeated issue/recommendation atom.",
    "root_selector": "div.dd-finding",
    "wraps_in_section": true,
    "required": ["items"],
    "variants": []
  }
}
```

---

### dd-badge

# dd-badge

## Purpose
Compact, non-interactive status or severity pill. Labels a value with a tone —
Critical / Warning / Info / Pass, or a neutral default. Used inline inside tables,
finding lists, card headers, and summary readouts.

## Context
- Does **not** wrap in `dd-section` — it is an inline atom embedded in other
  components (`dd-data-table` status cells, `dd-finding` items, panel labels).
- Non-interactive. If a badge needs to be clickable, wrap it in a `dd-button` or
  a link — do not add handlers to the badge itself.
- The **text label carries the meaning**, never color alone (1.4.1).

## Required parameters
| name | type | description |
|---|---|---|
| `label` | string | Visible text. For status use the severity word itself (e.g. `Critical`, `Pass`) so meaning is not color-dependent. |

## Optional parameters
| name | type | default | description |
|---|---|---|---|
| `variant` | enum | — | `-critical` `-warning` `-info` `-pass`. Omit for neutral. |
| `icon` | string | — | Optional leading glyph (emoji or inline SVG). Decorative only — rendered `aria-hidden="true"`; never the sole carrier of meaning. |
| `id` | string | — | Optional element id (e.g. to reference from `aria-describedby`). |

## Variants
| modifier | tone | typical use |
|---|---|---|
| (none) | Neutral | counts, categories, non-severity tags |
| `-critical` | 🔴 Critical | blocking issues |
| `-warning` | ⚠️ Warning | should-fix issues |
| `-info` | ℹ️ Info | opportunities / notes |
| `-pass` | ✅ Pass | passing checks |

## Canonical structure
```html
<span class="dd-badge {variant}"{id_attr}>
  {icon_span}<span class="dd-badge__label">{label}</span>
</span>
```
Where:
- `{variant}` is one of the modifiers or empty.
- `{id_attr}` is ` id="{id}"` when `id` is set, else empty.
- `{icon_span}` is `<span class="dd-badge__icon" aria-hidden="true">{icon}</span>`
  when `icon` is set, else empty.

## Accessibility
**WCAG criteria touched:** 1.1.1, 1.3.1, 1.4.1 Use of Color, 1.4.3, 1.4.11.

- **Not color alone (1.4.1):** the `__label` text states the status. Do not ship a
  badge whose only differentiator is background color.
- **Icon is decorative:** `aria-hidden="true"` on `__icon`; the label text remains
  the accessible name. Never encode status only in the icon.
- **Contrast (1.4.3):** label text ≥ 4.5:1 against the badge surface in light and
  dark mode. `-warning` (yellow tones) is highest-risk — verify against
  `$c_text_primary`.
- **Non-text contrast (1.4.11):** if the badge has a border/outline that conveys
  boundary, it must meet 3:1 against the page surface.
- Not focusable, no role — it is static text, correctly exposed as such.

## Design tokens
| token | usage |
|---|---|
| `$c_text_primary` / `--dark` | neutral label text |
| `$c_tertiary_subtle` / `--dark` | `-critical` surface |
| `$c_secondary_subtle` / `--dark` | `-warning` surface |
| `$c_primary_subtle` / `--dark` | `-info` surface |
| `$c_support_subtle` / `--dark` | `-pass` surface |
| `$c_support_border` / `--dark` | optional border |

## JS hooks
None. Static markup.

## Example params
```json
{ "variant": "-critical", "label": "Critical", "icon": "🔴" }
```

## Platform translation
**Static HTML:** substitute directly. Emit `__icon` only when `icon` is set.

**Drupal Twig (`dd-badge.html.twig`):**
```twig
<span class="dd-badge{% if variant %} {{ variant }}{% endif %}"{% if id %} id="{{ id }}"{% endif %}>
  {% if icon %}<span class="dd-badge__icon" aria-hidden="true">{{ icon }}</span>{% endif %}<span class="dd-badge__label">{{ label }}</span>
</span>
```

**WordPress (block render.php):**
```php
<?php
$variant = $attributes['variant'] ?? '';
$icon    = $attributes['icon'] ?? '';
$id      = $attributes['id'] ?? '';
?>
<span class="dd-badge<?php echo $variant ? ' ' . esc_attr( $variant ) : ''; ?>"<?php echo $id ? ' id="' . esc_attr( $id ) . '"' : ''; ?>>
  <?php if ( $icon ) : ?><span class="dd-badge__icon" aria-hidden="true"><?php echo esc_html( $icon ); ?></span><?php endif; ?><span class="dd-badge__label"><?php echo esc_html( $attributes['label'] ); ?></span>
</span>
```

### params (dd-badge)
```json
{ "required": ["label"], "variants": ["-critical", "-warning", "-info", "-pass"], "wraps_in_section": false }
```

### Canonical HTML example (dd-badge.html)
```html
<span class="dd-badge -critical"><span class="dd-badge__icon" aria-hidden="true">🔴</span><span class="dd-badge__label">Critical</span></span>
<span class="dd-badge -warning"><span class="dd-badge__icon" aria-hidden="true">⚠️</span><span class="dd-badge__label">Warning</span></span>
<span class="dd-badge -info"><span class="dd-badge__icon" aria-hidden="true">ℹ️</span><span class="dd-badge__label">Info</span></span>
<span class="dd-badge -pass"><span class="dd-badge__icon" aria-hidden="true">✅</span><span class="dd-badge__label">Pass</span></span>
<span class="dd-badge"><span class="dd-badge__label">14 tasks</span></span>
```

---

### dd-data-table

# dd-data-table

## Purpose
Accessible tabular data: a caption, column headers, body rows, optional status
cells (via `dd-badge`), a horizontal scroll region for wide tables, an optional
sortable header row, and a graceful empty state. Backs the dd-seo tasks table,
GSC insight tables, and per-check detail tables.

## Context
- Wraps in `dd-section`.
- The **caption** (or, if omitted, an `aria-label` on the scroll region) names the
  table — always provide one.
- Filtering/search UI is out of scope here — that is a `dd-toolbar` placed above
  this component. This spec covers the table + optional column sorting only.

## Required parameters
| name | type | description |
|---|---|---|
| `columns` | array | Ordered column defs: `{ "label": string, "key": string, "align"?: "start"\|"end"\|"center", "sort"?: boolean }`. |
| `rows` | array | Array of rows; each row is an array of cells matching `columns` order. A cell is either a string (plain text) or an object `{ "badge": { "variant": string, "label": string } }` to render a `dd-badge`. |

## Optional parameters
| name | type | default | description |
|---|---|---|---|
| `caption` | string | — | Visible table caption. If omitted, `aria_label` is **required**. |
| `aria_label` | string | — | Accessible name for the scroll region when there is no visible caption. |
| `id` | string | — | Table id (anchor target / `aria-describedby`). |
| `empty_text` | string | `No data.` | Message shown as a single full-width row when `rows` is empty. |
| `scroll` | boolean | `true` | Wrap in a keyboard-focusable horizontal scroll region (1.4.10 reflow safety). |
| `sortable` | boolean | `false` | Render sortable columns (those with `sort: true`) as header buttons with `aria-sort`. Requires the sort JS hook. |
| `variant` | enum | — | `-dense` for tighter row height. |

## Canonical structure
```html
<div class="dd-data-table {variant}">
  <div class="dd-data-table__scroll"{scroll_a11y_attrs}>
    <table class="dd-data-table__table"{id_attr}>
      <caption class="dd-data-table__caption">{caption}</caption>
      <thead>
        <tr>
          <!-- non-sortable column -->
          <th scope="col" class="dd-data-table__th" data-align="{align}">{label}</th>
          <!-- sortable column (when sortable=true and column.sort) -->
          <th scope="col" class="dd-data-table__th" aria-sort="none" data-align="{align}">
            <button type="button" class="dd-data-table__sort" data-sort-key="{key}">
              {label}<span class="dd-data-table__sort-ind" aria-hidden="true"></span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- data row -->
        <tr class="dd-data-table__row">
          <td class="dd-data-table__td" data-align="{align}">{cell_text_or_badge}</td>
        </tr>
        <!-- empty state (only when rows is empty) -->
        <tr class="dd-data-table__row -empty">
          <td class="dd-data-table__td" colspan="{column_count}">{empty_text}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```
Where:
- `{scroll_a11y_attrs}` (only when `scroll=true`) is
  `tabindex="0" role="region" aria-label="{caption or aria_label}"` so a table
  that overflows is reachable by keyboard (SC 2.1.1 for the scroll container).
- `{id_attr}` is ` id="{id}"` when set.
- A badge cell renders the `dd-badge` markup in place of `{cell_text_or_badge}`.
- Omit `<caption>` if `caption` is unset; then `aria_label` MUST populate the
  region's `aria-label`.

## Accessibility
**WCAG criteria touched:** 1.3.1, 1.4.10 Reflow, 2.1.1, 2.4.6, 2.5.8, 4.1.2, 1.3.5 (aria-sort).

- **Headers (1.3.1):** every column header is `<th scope="col">`. If a first column
  identifies the row, render it `<th scope="row">` in `<tbody>`.
- **Name (4.1.2 / 2.4.6):** a `<caption>` or region `aria-label` names the table.
  Never ship both empty.
- **Scroll region (1.4.10 / 2.1.1):** when the table can scroll horizontally the
  wrapper is `tabindex="0"` + `role="region"` + `aria-label`, so keyboard users can
  scroll it. Without a name, a focusable region is a WCAG failure — the name is
  mandatory when `scroll=true`.
- **Sortable columns (1.3.5, 4.1.2):** the header is a real `<button>` (not a link,
  not a bare `<th>` click target). `aria-sort` on the `<th>` is exactly one of
  `none` / `ascending` / `descending`; only one column is non-`none` at a time.
  Target size ≥ 24×24px (2.5.8).
- **Status cells:** use `dd-badge` so status is text, not color (1.4.1 via badge).
- Do not use layout tables — this component is for genuine tabular data only.

## Design tokens
| token | usage |
|---|---|
| `$c_line` / `--dark` | cell borders, header rule |
| `$c_surface_subtle` / `--dark` | header row / zebra background |
| `$c_text_primary` / `--dark` | cell text |
| `$c_text_secondary` / `--dark` | caption, muted cells |
| `$c_support_focus` / `--dark` | focus outline on sort buttons + scroll region |

## JS hooks
- `data-sort-key` on each `.dd-data-table__sort` button — click handler sorts rows
  by that column, toggling `aria-sort` on the owning `<th>` between
  `ascending`/`descending` and resetting other columns to `none`. Sort must be
  operable by keyboard (button = free). No library required.
- The component ships **no** filtering — pair with `dd-toolbar`.
- Static (non-sortable) tables need no JS.

## Example params
```json
{
  "caption": "Prioritized remediation tasks",
  "sortable": true,
  "columns": [
    { "label": "ID", "key": "id" },
    { "label": "Priority", "key": "priority", "sort": true },
    { "label": "Finding", "key": "finding" },
    { "label": "Effort", "key": "hours", "align": "end", "sort": true }
  ],
  "rows": [
    ["SEO-001", { "badge": { "variant": "-critical", "label": "Critical" } }, "Missing title tag", "2h"],
    ["SEO-002", { "badge": { "variant": "-warning",  "label": "Warning"  } }, "Thin meta description", "1h"]
  ]
}
```

## Platform translation
**Static HTML:** loop `columns`/`rows` in your build pipeline. Compute the scroll
region name from `caption` or `aria_label`. Render badge cells via the `dd-badge`
partial.

**Drupal Twig (`dd-data-table.html.twig`):**
```twig
{% set region_name = caption ?? aria_label %}
<div class="dd-data-table{% if variant %} {{ variant }}{% endif %}">
  <div class="dd-data-table__scroll"{% if scroll %} tabindex="0" role="region" aria-label="{{ region_name }}"{% endif %}>
    <table class="dd-data-table__table"{% if id %} id="{{ id }}"{% endif %}>
      {% if caption %}<caption class="dd-data-table__caption">{{ caption }}</caption>{% endif %}
      <thead>
        <tr>
          {% for col in columns %}
            <th scope="col" class="dd-data-table__th" data-align="{{ col.align|default('start') }}"{% if sortable and col.sort %} aria-sort="none"{% endif %}>
              {% if sortable and col.sort %}
                <button type="button" class="dd-data-table__sort" data-sort-key="{{ col.key }}">{{ col.label }}<span class="dd-data-table__sort-ind" aria-hidden="true"></span></button>
              {% else %}{{ col.label }}{% endif %}
            </th>
          {% endfor %}
        </tr>
      </thead>
      <tbody>
        {% if rows is empty %}
          <tr class="dd-data-table__row -empty"><td class="dd-data-table__td" colspan="{{ columns|length }}">{{ empty_text|default('No data.') }}</td></tr>
        {% else %}
          {% for row in rows %}
            <tr class="dd-data-table__row">
              {% for cell in row %}
                <td class="dd-data-table__td" data-align="{{ columns[loop.index0].align|default('start') }}">
                  {% if cell.badge %}{{ include('dd-badge.html.twig', cell.badge) }}{% else %}{{ cell }}{% endif %}
                </td>
              {% endfor %}
            </tr>
          {% endfor %}
        {% endif %}
      </tbody>
    </table>
  </div>
</div>
```

**WordPress (block render.php):** mirror the Twig — `esc_html` cell text,
`esc_attr` on `data-align`/`data-sort-key`, render badge cells through the
`dd-badge` render callback, and emit the region attrs only when `scroll` is true
with a non-empty name.

### params (dd-data-table)
```json
{ "required": ["columns", "rows"], "variants": ["-dense"], "wraps_in_section": true }
```

### Canonical HTML example (dd-data-table.html)
```html
<div class="dd-data-table">
  <div class="dd-data-table__scroll" tabindex="0" role="region" aria-label="Prioritized remediation tasks">
    <table class="dd-data-table__table" id="task-table">
      <caption class="dd-data-table__caption">Prioritized remediation tasks</caption>
      <thead>
        <tr>
          <th scope="col" class="dd-data-table__th" data-align="start">ID</th>
          <th scope="col" class="dd-data-table__th" data-align="start" aria-sort="none">
            <button type="button" class="dd-data-table__sort" data-sort-key="priority">Priority<span class="dd-data-table__sort-ind" aria-hidden="true"></span></button>
          </th>
          <th scope="col" class="dd-data-table__th" data-align="start">Finding</th>
        </tr>
      </thead>
      <tbody>
        <tr class="dd-data-table__row">
          <th scope="row" class="dd-data-table__td" data-align="start">SEO-001</th>
          <td class="dd-data-table__td"><span class="dd-badge -critical"><span class="dd-badge__label">Critical</span></span></td>
          <td class="dd-data-table__td">Missing &lt;title&gt; tag</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

### dd-score-ring

# dd-score-ring

## Purpose
Radial SVG gauge showing a `score` out of a maximum as a donut, with the numeric
value and a text label. Colors by threshold. Optionally a link (jump to the
matching detail section). Backs the dd-seo per-category score rings and the
overall score.

## Context
- Does **not** wrap in `dd-section` — it is an atom, typically placed inside a
  `dd-card` grid, a `dd-panel`, or a summary readout.
- Color is a secondary cue only; the visible **number** and **label** carry the
  value (1.4.1).

## Required parameters
| name | type | description |
|---|---|---|
| `score` | number | The value to display (e.g. `82`). |
| `label` | string | What the score measures (e.g. `Performance`, `Overall`). |

## Optional parameters
| name | type | default | description |
|---|---|---|---|
| `max` | number | `100` | Denominator; the ring fills `score / max`. |
| `href` | string | — | If set, the whole ring becomes a link to this target (e.g. `#section-performance`). |
| `sublabel` | string | — | Small text under the label (e.g. `13 checks`). |
| `variant` | enum | — | `-sm` `-lg` size modifiers. |
| `tone` | enum | auto | Force `-good` / `-warn` / `-bad`; default derives from `score/max` thresholds (≥0.8 good, ≥0.5 warn, else bad). |
| `id` | string | — | Element id. |

## Canonical structure
```html
<!-- as a static figure -->
<div class="dd-score-ring {variant} {tone}"{id_attr}>
  <svg class="dd-score-ring__svg" viewBox="0 0 100 100" role="img"
       aria-label="{label}: {score} out of {max}">
    <circle class="dd-score-ring__track" cx="50" cy="50" r="42" fill="none" />
    <circle class="dd-score-ring__value" cx="50" cy="50" r="42" fill="none"
            stroke-dasharray="{circumference}" stroke-dashoffset="{offset}"
            transform="rotate(-90 50 50)" />
    <text class="dd-score-ring__num" x="50" y="54" text-anchor="middle" aria-hidden="true">{score}</text>
  </svg>
  <div class="dd-score-ring__label">{label}</div>
  {sublabel_div}
</div>
```
Where:
- `{circumference}` = `2 * π * 42 ≈ 263.9`; `{offset}` = `circumference * (1 - score/max)`.
- The `<svg>` carries the full accessible name via `aria-label`; the `<text>`
  numeral is `aria-hidden="true"` to avoid double announcement.
- `{sublabel_div}` is `<div class="dd-score-ring__sub">{sublabel}</div>` when set.
- **Link form:** wrap the whole thing in
  `<a class="dd-score-ring -link" href="{href}" aria-label="{label}: {score} out of {max}. View details">…</a>`
  and drop `role="img"`/`aria-label` from the inner `<svg>` (the link owns the name;
  keep the `<svg>` decorative with `aria-hidden="true"`).

## Accessibility
**WCAG criteria touched:** 1.1.1, 1.4.1 Use of Color, 1.4.11 Non-text Contrast, 2.4.4, 2.5.8, 2.3.3 / 2.2.2 (motion).

- **Text alternative (1.1.1):** the SVG has `role="img"` + `aria-label` stating
  "{label}: {score} out of {max}". In link form the `<a>` carries the name and the
  SVG is `aria-hidden`.
- **Not color alone (1.4.1):** the numeral and label are always visible; `tone`
  color is redundant reinforcement, never the only signal.
- **Non-text contrast (1.4.11):** the value arc must be ≥ 3:1 against the track
  ring so the fill level is perceivable.
- **Link (2.4.4 / 2.5.8):** if `href` is set, the accessible name states the
  destination purpose and the hit area is ≥ 24×24px.
- **Motion (2.3.3 / 2.2.2):** if the arc animates from 0 to its value, gate the
  animation behind `@media (prefers-reduced-motion: reduce)` (render at final value,
  no transition).
- Contrast of numeral/label text ≥ 4.5:1 (≥ 3:1 if large) against the surface.

## Design tokens
| token | usage |
|---|---|
| `$c_line` / `--dark` | track ring |
| `$c_support_default` / `--dark` | `-good` value arc |
| `$c_secondary_default` / `--dark` | `-warn` value arc |
| `$c_tertiary_default` / `--dark` | `-bad` value arc |
| `$c_text_primary` / `--dark` | numeral + label |
| `$c_text_secondary` / `--dark` | sublabel |
| `$c_support_focus` / `--dark` | focus outline (link form) |

## JS hooks
- None required for a static ring — `stroke-dashoffset` is computed at render time.
- Optional grow-in: set `--dd-ring-target` and transition `stroke-dashoffset`;
  MUST be disabled under `prefers-reduced-motion: reduce`.

## Example params
```json
{ "score": 82, "max": 100, "label": "Performance", "sublabel": "13 checks", "href": "#section-performance" }
```

## Platform translation
**Static HTML:** compute `circumference` and `offset` in the build step; pick
`tone` from thresholds unless forced. Emit link form when `href` is set.

**Drupal Twig (`dd-score-ring.html.twig`):**
```twig
{% set max = max|default(100) %}
{% set circ = 263.9 %}
{% set offset = circ * (1 - (score / max)) %}
{% set tone = tone ?? (score / max >= 0.8 ? '-good' : (score / max >= 0.5 ? '-warn' : '-bad')) %}
{% set name = label ~ ': ' ~ score ~ ' out of ' ~ max %}
{% set tag = href ? 'a' : 'div' %}
<{{ tag }} class="dd-score-ring{% if variant %} {{ variant }}{% endif %} {{ tone }}{% if href %} -link{% endif %}"{% if href %} href="{{ href }}" aria-label="{{ name }}. View details"{% endif %}{% if id %} id="{{ id }}"{% endif %}>
  <svg class="dd-score-ring__svg" viewBox="0 0 100 100"{% if href %} aria-hidden="true"{% else %} role="img" aria-label="{{ name }}"{% endif %}>
    <circle class="dd-score-ring__track" cx="50" cy="50" r="42" fill="none" />
    <circle class="dd-score-ring__value" cx="50" cy="50" r="42" fill="none" stroke-dasharray="{{ circ }}" stroke-dashoffset="{{ offset }}" transform="rotate(-90 50 50)" />
    <text class="dd-score-ring__num" x="50" y="54" text-anchor="middle" aria-hidden="true">{{ score }}</text>
  </svg>
  <div class="dd-score-ring__label">{{ label }}</div>
  {% if sublabel %}<div class="dd-score-ring__sub">{{ sublabel }}</div>{% endif %}
</{{ tag }}>
```

**WordPress (block render.php):** same computation; `esc_url($href)`,
`esc_attr` on the aria-label, `esc_html` on score/label/sublabel; emit `<a>` vs
`<div>` and swap the SVG name/`aria-hidden` accordingly.

### params (dd-score-ring)
```json
{ "required": ["score", "label"], "variants": ["-sm", "-lg"], "wraps_in_section": false }
```

### Canonical HTML example (dd-score-ring.html)
```html
<a class="dd-score-ring -good -link" href="#section-performance" aria-label="Performance: 82 out of 100. View details">
  <svg class="dd-score-ring__svg" viewBox="0 0 100 100" aria-hidden="true">
    <circle class="dd-score-ring__track" cx="50" cy="50" r="42" fill="none" />
    <circle class="dd-score-ring__value" cx="50" cy="50" r="42" fill="none" stroke-dasharray="263.9" stroke-dashoffset="47.5" transform="rotate(-90 50 50)" />
    <text class="dd-score-ring__num" x="50" y="54" text-anchor="middle" aria-hidden="true">82</text>
  </svg>
  <div class="dd-score-ring__label">Performance</div>
  <div class="dd-score-ring__sub">13 checks</div>
</a>
```

---

### dd-bar-chart

# dd-bar-chart

## Purpose
Dependency-free horizontal bar chart for comparing labelled values (e.g. category
scores). Each row shows a text label and a text value; the colored bar is
**decorative reinforcement only**. No canvas, no chart library.

## Context
- Wraps in `dd-section`.
- The accessible truth is the label + value **text**. The bar is `aria-hidden` so
  screen-reader users get the numbers without decorative noise.
- For a single value against a target, prefer `dd-score-ring`. Use this for
  comparing several values.

## Required parameters
| name | type | description |
|---|---|---|
| `items` | array | Rows: `{ "label": string, "value": number, "max"?: number, "tone"?: "-good"\|"-warn"\|"-bad" }`. |

## Optional parameters
| name | type | default | description |
|---|---|---|---|
| `caption` | string | — | Names the chart. Rendered as a `<figcaption>`; strongly recommended (else set `aria_label`). |
| `aria_label` | string | — | Accessible name when no visible `caption`. |
| `max` | number | `100` | Global denominator when a row omits its own `max`. |
| `value_suffix` | string | — | Appended to each value in the visible text (e.g. `%`, `/100`). |
| `id` | string | — | Element id. |

## Canonical structure
```html
<figure class="dd-bar-chart"{id_attr} role="group" aria-label="{caption or aria_label}">
  {figcaption}
  <ul class="dd-bar-chart__list">
    <li class="dd-bar-chart__row {tone}">
      <span class="dd-bar-chart__label">{label}</span>
      <span class="dd-bar-chart__track" aria-hidden="true">
        <span class="dd-bar-chart__fill" style="inline-size: {pct}%"></span>
      </span>
      <span class="dd-bar-chart__value">{value}{value_suffix}</span>
    </li>
  </ul>
</figure>
```
Where:
- `{figcaption}` is `<figcaption class="dd-bar-chart__caption">{caption}</figcaption>`
  when `caption` is set (omit when using `aria_label` only).
- `{pct}` = `round(100 * value / (row.max or max))`, clamped 0–100.
- `{tone}` derives from thresholds like `dd-score-ring` unless the row forces it.
- The `__track`/`__fill` are decorative (`aria-hidden` on the track); label and
  value are real text.

## Accessibility
**WCAG criteria touched:** 1.1.1, 1.3.1, 1.4.1 Use of Color, 1.4.10 Reflow, 1.4.11 Non-text Contrast, 2.2.2 / 2.3.3 (motion).

- **Text is the truth (1.1.1 / 1.4.1):** each row exposes `label` + `value` as text;
  the bar is `aria-hidden`, so nothing depends on seeing or measuring the bar.
- **Structure (1.3.1):** rows are a real `<ul>`/`<li>` list inside a
  `<figure role="group">` named by caption/`aria_label`.
- **Non-text contrast (1.4.11):** the `__fill` must be ≥ 3:1 against the `__track`
  so sighted users can gauge proportion.
- **Reflow (1.4.10):** the value text must remain visible when the bar area
  shrinks at 320px / 400% zoom — never truncate the value behind the bar.
- **Motion (2.2.2 / 2.3.3):** any fill grow-in animation is gated behind
  `prefers-reduced-motion: reduce`.

## Design tokens
| token | usage |
|---|---|
| `$c_line` / `--dark` | track background |
| `$c_support_default` / `--dark` | `-good` fill |
| `$c_secondary_default` / `--dark` | `-warn` fill |
| `$c_tertiary_default` / `--dark` | `-bad` fill |
| `$c_text_primary` / `--dark` | label + value |
| `$c_text_secondary` / `--dark` | caption |

## JS hooks
- None required — widths are inline `style="inline-size:{pct}%"` at render time.
- Optional animate-on-view: read `data-pct` and transition `inline-size`; disable
  under `prefers-reduced-motion: reduce`.

## Example params
```json
{
  "caption": "Category scores",
  "value_suffix": "/100",
  "items": [
    { "label": "Performance", "value": 82 },
    { "label": "On-Page",    "value": 64 },
    { "label": "Security",   "value": 40, "tone": "-bad" }
  ]
}
```

## Platform translation
**Static HTML:** compute `pct` and `tone` per row in the build; emit `<figcaption>`
or set `aria-label`.

**Drupal Twig (`dd-bar-chart.html.twig`):**
```twig
{% set gmax = max|default(100) %}
{% set name = caption ?? aria_label %}
<figure class="dd-bar-chart"{% if id %} id="{{ id }}"{% endif %} role="group" aria-label="{{ name }}">
  {% if caption %}<figcaption class="dd-bar-chart__caption">{{ caption }}</figcaption>{% endif %}
  <ul class="dd-bar-chart__list">
    {% for row in items %}
      {% set rmax = row.max|default(gmax) %}
      {% set pct = (100 * row.value / rmax)|round %}
      {% set tone = row.tone ?? (row.value / rmax >= 0.8 ? '-good' : (row.value / rmax >= 0.5 ? '-warn' : '-bad')) %}
      <li class="dd-bar-chart__row {{ tone }}">
        <span class="dd-bar-chart__label">{{ row.label }}</span>
        <span class="dd-bar-chart__track" aria-hidden="true"><span class="dd-bar-chart__fill" style="inline-size: {{ pct < 0 ? 0 : (pct > 100 ? 100 : pct) }}%"></span></span>
        <span class="dd-bar-chart__value">{{ row.value }}{{ value_suffix }}</span>
      </li>
    {% endfor %}
  </ul>
</figure>
```

**WordPress (block render.php):** same math; `esc_html` labels/values,
`esc_attr` the inline width, name the figure from caption/`aria_label`.

### params (dd-bar-chart)
```json
{ "required": ["items"], "variants": [], "wraps_in_section": true }
```

### Canonical HTML example (dd-bar-chart.html)
```html
<figure class="dd-bar-chart" role="group" aria-label="Category scores">
  <figcaption class="dd-bar-chart__caption">Category scores</figcaption>
  <ul class="dd-bar-chart__list">
    <li class="dd-bar-chart__row -good">
      <span class="dd-bar-chart__label">Performance</span>
      <span class="dd-bar-chart__track" aria-hidden="true"><span class="dd-bar-chart__fill" style="inline-size: 82%"></span></span>
      <span class="dd-bar-chart__value">82/100</span>
    </li>
    <li class="dd-bar-chart__row -bad">
      <span class="dd-bar-chart__label">Security</span>
      <span class="dd-bar-chart__track" aria-hidden="true"><span class="dd-bar-chart__fill" style="inline-size: 40%"></span></span>
      <span class="dd-bar-chart__value">40/100</span>
    </li>
  </ul>
</figure>
```

---

### dd-finding

# dd-finding

## Purpose
A list of audit findings. Each item pairs a severity **badge** with a title, and
optional evidence and fix text. This is the repeated issue/recommendation atom
across the dd-seo report (replaces the ad-hoc `.issue-item` pattern). Use it
anywhere a set of prioritized findings is shown.

## Context
- Wraps in `dd-section`.
- Embeds **`dd-badge`** for the severity chip — build `dd-badge` first.
- For a single standalone status message (not a list), use `dd-alert` instead;
  `dd-finding` is for enumerated, severity-tagged findings.

## Required parameters
| name | type | description |
|---|---|---|
| `items` | array | Findings: `{ "severity": "-critical"\|"-warning"\|"-info"\|"-pass", "title": string, "evidence"?: string (HTML), "fix"?: string (HTML) }`. |

## Optional parameters
| name | type | default | description |
|---|---|---|---|
| `heading` | string | — | Optional list heading. |
| `heading_level` | enum | `h3` | `h3` `h4` — pick to fit the surrounding outline (1.3.1 / 2.4.10). |
| `ordered` | boolean | `false` | Render `<ol>` (priority order matters) vs `<ul>`. |
| `id` | string | — | Element id / anchor. |
| `empty_text` | string | — | If set and `items` is empty, render this as a single passing/neutral line instead of nothing. |

## Severity → badge mapping
| item.severity | badge variant | badge label | accent |
|---|---|---|---|
| `-critical` | `-critical` | `Critical` | tertiary |
| `-warning` | `-warning` | `Warning` | secondary |
| `-info` | `-info` | `Info` | primary |
| `-pass` | `-pass` | `Pass` | support |

## Canonical structure
```html
<div class="dd-finding"{id_attr}>
  {heading}
  <ul class="dd-finding__list">           <!-- or <ol> when ordered -->
    <li class="dd-finding__item {severity}">
      <span class="dd-finding__badge">
        <span class="dd-badge {severity}"><span class="dd-badge__label">{severity_label}</span></span>
      </span>
      <div class="dd-finding__body">
        <p class="dd-finding__title">{title}</p>
        {evidence_p}
        {fix_p}
      </div>
    </li>
  </ul>
</div>
```
Where:
- `{heading}` is `<{heading_level} class="dd-finding__heading">{heading}</{heading_level}>`
  when set.
- `{severity_label}` is `Critical` / `Warning` / `Info` / `Pass` per the mapping.
- `{evidence_p}` is `<p class="dd-finding__evidence">{evidence}</p>` when set.
- `{fix_p}` is
  `<p class="dd-finding__fix"><span class="dd-finding__fix-label">Fix:</span> {fix}</p>`
  when set.
- Use `<ol>` when `ordered=true`.

## Accessibility
**WCAG criteria touched:** 1.3.1, 1.4.1 Use of Color, 1.4.3, 2.4.6 / 2.4.10 (headings), 2.4.4 (links in fix/evidence).

- **List semantics (1.3.1):** items are `<li>` in a real `<ul>`/`<ol>`; use `<ol>`
  when the order communicates priority.
- **Severity not color alone (1.4.1):** the `dd-badge` states the severity word;
  the `{severity}` accent stripe is redundant. Never rely on the stripe color only.
- **Heading level (1.3.1 / 2.4.10):** `heading_level` must continue the page
  outline — do not skip levels. When embedded under a `dd-accordion`/`dd-panel`
  title, `h4` is typically correct.
- **Contrast (1.4.3):** title/evidence/fix text ≥ 4.5:1; the `Fix:` label must not
  rely on color to be understood — the literal word carries it.
- **Links (2.4.4):** any links inside `evidence`/`fix` keep the default visible
  focus outline and descriptive text.
- Non-interactive container — no role needed beyond native list semantics.

## Design tokens
| token | usage |
|---|---|
| `$c_tertiary_default` / `--dark` | `-critical` accent stripe |
| `$c_secondary_default` / `--dark` | `-warning` accent stripe |
| `$c_primary_default` / `--dark` | `-info` accent stripe |
| `$c_support_default` / `--dark` | `-pass` accent stripe |
| `$c_text_primary` / `--dark` | title |
| `$c_text_secondary` / `--dark` | evidence, fix, `Fix:` label |

## JS hooks
None. Static markup. (Filtering a finding list, if needed, is a `dd-toolbar`
concern, not this component's.)

## Example params
```json
{
  "heading": "Priority findings",
  "heading_level": "h4",
  "ordered": true,
  "items": [
    { "severity": "-critical", "title": "Missing <title> tag", "evidence": "No &lt;title&gt; in &lt;head&gt;.", "fix": "Add a unique 50–60 char title." },
    { "severity": "-info", "title": "Striking-distance query 'web design' at position 12", "evidence": "4,200 impressions, 0.8% CTR.", "fix": "Strengthen on-page relevance and internal links." }
  ]
}
```

## Platform translation
**Static HTML:** loop `items`; map `severity` → badge label; emit optional
heading/evidence/fix. Render the badge via the `dd-badge` partial.

**Drupal Twig (`dd-finding.html.twig`):**
```twig
{% set labels = {'-critical':'Critical','-warning':'Warning','-info':'Info','-pass':'Pass'} %}
{% set list_tag = ordered ? 'ol' : 'ul' %}
<div class="dd-finding"{% if id %} id="{{ id }}"{% endif %}>
  {% if heading %}<{{ heading_level|default('h3') }} class="dd-finding__heading">{{ heading }}</{{ heading_level|default('h3') }}>{% endif %}
  {% if items is empty and empty_text %}
    <p class="dd-finding__empty">{{ empty_text }}</p>
  {% else %}
    <{{ list_tag }} class="dd-finding__list">
      {% for item in items %}
        <li class="dd-finding__item {{ item.severity }}">
          <span class="dd-finding__badge">{{ include('dd-badge.html.twig', { variant: item.severity, label: labels[item.severity] }) }}</span>
          <div class="dd-finding__body">
            <p class="dd-finding__title">{{ item.title }}</p>
            {% if item.evidence %}<p class="dd-finding__evidence">{{ item.evidence|raw }}</p>{% endif %}
            {% if item.fix %}<p class="dd-finding__fix"><span class="dd-finding__fix-label">Fix:</span> {{ item.fix|raw }}</p>{% endif %}
          </div>
        </li>
      {% endfor %}
    </{{ list_tag }}>
  {% endif %}
</div>
```

**WordPress (block render.php):** mirror — `esc_html` title, `wp_kses_post`
evidence/fix (they may hold links), render badge via the `dd-badge` callback, and
choose `<ol>`/`<ul>` from `ordered`.

### params (dd-finding)
```json
{ "required": ["items"], "variants": [], "wraps_in_section": true }
```

### Canonical HTML example (dd-finding.html)
```html
<div class="dd-finding">
  <h4 class="dd-finding__heading">Priority findings</h4>
  <ol class="dd-finding__list">
    <li class="dd-finding__item -critical">
      <span class="dd-finding__badge"><span class="dd-badge -critical"><span class="dd-badge__label">Critical</span></span></span>
      <div class="dd-finding__body">
        <p class="dd-finding__title">Missing &lt;title&gt; tag</p>
        <p class="dd-finding__evidence">No &lt;title&gt; in &lt;head&gt;.</p>
        <p class="dd-finding__fix"><span class="dd-finding__fix-label">Fix:</span> Add a unique 50–60 char title.</p>
      </div>
    </li>
    <li class="dd-finding__item -info">
      <span class="dd-finding__badge"><span class="dd-badge -info"><span class="dd-badge__label">Info</span></span></span>
      <div class="dd-finding__body">
        <p class="dd-finding__title">Striking-distance query ‘web design’ at position 12</p>
        <p class="dd-finding__evidence">4,200 impressions, 0.8% CTR.</p>
        <p class="dd-finding__fix"><span class="dd-finding__fix-label">Fix:</span> Strengthen on-page relevance and internal links.</p>
      </div>
    </li>
  </ol>
</div>
```

---

## Build order & notes

1. **dd-badge** first — embedded by `dd-data-table` and `dd-finding`.
2. **dd-score-ring**, **dd-bar-chart** — independent; pure markup + CSS, optional
   reduced-motion-gated animation.
3. **dd-data-table** — depends on `dd-badge`; the only component with required
   interactive JS (column sort). Filtering stays in a future `dd-toolbar`.
4. **dd-finding** — depends on `dd-badge`.

All five reuse existing `$c_*` palette tokens (tertiary=critical, secondary=warning,
primary=info, support=pass) — no new token values, so they inherit light/dark mode
for free. Run `dd_framework_helper.py validate` after adding each `dd-{name}.html`
to confirm the manifest/markup agree; note the validator currently knows the 17
existing components, so it will flag these as unknown until the manifest entries
above are merged.
