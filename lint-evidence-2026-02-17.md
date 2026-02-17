# UI Lint/Type Evidence — 2026-02-17

## Scope
Targeted high-impact lint blockers in:
- `src/app/dashboard/layout.tsx`
- `src/components/chat/chat-window.tsx`
- `src/components/layout/intelligence-panel.tsx`
- `src/lib/api.ts`
- directly-related blocker: `src/components/layout/sidebar.tsx`

## Initial blocker snapshot
`npm run lint` initially reported **10 errors / 13 warnings**, including:
- `react-hooks/set-state-in-effect` in `layout.tsx`
- `@typescript-eslint/no-explicit-any` in `chat-window.tsx`, `intelligence-panel.tsx`, `api.ts`
- `react/no-unescaped-entities` in `intelligence-panel.tsx`
- `@typescript-eslint/no-empty-object-type` in `sidebar.tsx`

## Fixes applied
1. **layout.tsx**
   - Removed synchronous `setReady(true)` call inside effect for non-auth path.
   - Kept auth check async branch and redirect behavior.

2. **chat-window.tsx**
   - Replaced `any` in error handling with `unknown` + typed `getErrorMessage` helper.
   - Replaced `as any` cast for reasoning effort with `as ReasoningEffort`.

3. **intelligence-panel.tsx**
   - Replaced `as any` cast with `as ModelTier`.
   - Escaped `"Thinking"` label to `&quot;Thinking&quot;`.

4. **api.ts**
   - Replaced `used?: any[]` with `used?: unknown[]`.
   - Replaced `res.json() as any` with `res.json() as { error?: string }`.

5. **sidebar.tsx** (directly-related active lint blocker)
   - Removed unused imports.
   - Replaced empty interface with type alias:
     - `type SidebarProps = React.HTMLAttributes<HTMLDivElement>`

## Validation
### Lint
Command: `npm run lint`
Result: **0 errors, 9 warnings** (warnings are pre-existing unused vars in `chat-input.tsx` and `chat-message.tsx`; not blockers)

### Type check
- `npm run type-check` is unavailable (missing script in `package.json`).
- Fallback executed: `npx tsc --noEmit`
- Result: **success** (no output, zero exit)

## Notes
- No external/public actions performed.
- No spend incurred.
