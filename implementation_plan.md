# Forum Lobby Redesign Implementation Plan

## Goal
To redesign the Forum Lobby page (`src/pages/Forum/index.tsx`) to match the aesthetic and improved UX of the Archive Lobby pages. The focus is on reducing the "clunky" feel of large buttons, introducing elegance through typography and whitespace, and ensuring a cohesive look across both desktop and mobile.

## Design Philosophy (Inspired by Archive.tsx)
*   **Single Screen Feel:** Use `h-dvh` or calculated heights to make the lobby feel like a contained app screen rather than a long scrolling page.
*   **Ghost Buttons:** Instead of large, heavy cards with borders and shadows, use subtle "ghost" buttons that reveal their interactivity on hover.
*   **Typography First:** Rely on strong serif headings and clean sans-serif body text.
*   **Minimalist Icons:** Use stroke icons in subtle containers.
*   **Centralized Layout:** Center the content vertically and horizontally for a focused entry point.

## Proposed Changes

### 1. Structural Changes to `src/pages/Forum/index.tsx`
*   **Container:** Change the main wrapper to `h-dvh md:h-[calc(100vh-64px)] overflow-hidden flex flex-col justify-center items-center bg-[#f5f5f4]`.
*   **Header:** Add a centralized header section similar to Archive's "KOLEKTİF HAMLİN" block.
    *   Title: "FORUM" or "BOĞAZİÇİ FORUM"
    *   Subtitle: "Kampüsün dijital toplanma alanı."
*   **Grid Layout:**
    *   Switch from large cards to a compact grid (`grid-cols-1 md:grid-cols-2`).
    *   Reduce gap sizes to keep elements tighter (`gap-x-8 gap-y-4`).

### 2. Component Redesign
*   **Navigation Buttons (Formerly Cards):**
    *   **Old:** Large white cards, heavy shadows, big gradients.
    *   **New:**
        *   `group relative flex items-center gap-4 p-4 md:p-6 rounded-xl transition-all duration-300 hover:bg-stone-200/50 text-left`
        *   **Icon:** `p-3 rounded-full bg-stone-200/50 group-hover:bg-white` (retains color themes but more subtle).
        *   **Text:** Title on one line, bold serif. No description text in the button itself (or kept very minimal/hidden until hover if requested, but Archive keeps it clean). *Self-correction: Archive has descriptions. I will keep descriptions but make them smaller and lighter.*
        *   **Arrow:** Reveal on hover behavior.

### 3. Visual Polish
*   Use `framer-motion` for staggered entrance animations.
*   Ensure text colors are `stone-700` to `stone-900` for soft contrast.
*   Remove the "Background Gradient Effect" blobs from the old forum cards.

## Detailed Steps
1.  **Refactor `ForumHub` Component:** Replace the entire return statement.
2.  **Update Data Structure:** Ensure the `categories` array has the necessary icon/color props matching the new style.
3.  **Styling:** Apply Tailwind classes consistent with `Archive.tsx`.

## Verification
*   **Mobile:** Check if it fits on one screen without unnecessary scrolling.
*   **Desktop:** Check hover states and alignment.
*   **Aesthetic:** Confirm it feels like a "sibling" to the Archive page.
