---
name: reference-base-ui-toggle-group
description: base-ui ToggleGroup API — value is always an array even for single-select
metadata:
  type: reference
---

`@base-ui/react` ToggleGroup (used by `src/components/ui/toggle-group.tsx`):

- `value?: readonly Value[]` — always an array, even when `multiple={false}` (default).
- `onValueChange?: (groupValue: Value[], eventDetails) => void` — receives an array.
- For single-select: pass `value={[accent]}`, read `groupValue[0]` in handler.
- `ToggleGroupItem` takes `value: string` and `pressed` is managed by the group.
- `multiple` defaults to `false` (only one item pressed at a time).

RadioGroup is simpler: `value: Value`, `onValueChange: (value: Value) => void`.

Both live under `@base-ui/react/*` (NOT Radix). The shadcn "base-nova" style wraps these via `class-variance-authority`. The `render` prop pattern (e.g. `render={<Link to={x} />}`) is how base-ui swaps the rendered element.