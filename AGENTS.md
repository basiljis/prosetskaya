<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the artist portfolio as a single editorial gallery experience; language and theme preferences remain browser-persisted because no backend is required.
- Store sourced artwork metadata separately from gallery presentation, with local asset pointers and source links, so artist materials remain traceable and replaceable.
- Use a shared artwork caption in the grid and fullscreen viewer to keep typography consistent; fullscreen focus and dismissal use Radix Dialog primitives.
- CV content lives in src/data/cv.json and drives both the /cv page and the prebuilt PDF asset; regenerate and re-upload the PDF whenever cv.json changes so they stay identical.
- Shop state (prices, price visibility, online-payment toggle, YooKassa credentials, orders) lives in Lovable Cloud and is managed from /admin; the first registered account becomes admin. YooKassa webhooks are verified by re-reading the payment from YooKassa, never trusting the body.
- Keep login, signup, and recovery-request presentation in the existing public auth route with shared Button/Input components; this preserves the account flow while matching the gallery's visual system.
- Keep admin queries and writes in src/lib/admin.ts using the authenticated browser client and existing role/RLS checks; cache only a saved-key indicator, not payment secrets, and surface failed saves instead of false success.
- Persist collection filter placement in site_settings and share it through useShop; render the left sidebar only on wide screens so phone layouts retain usable full-width artwork.
- Keep the complete source catalogue in a separate data module with stable artwork IDs, all collection memberships, provenance and local CDN asset pointers; deduplicate repeated images without removing their category memberships.
- The live catalogue is the Cloud `artworks` table (public reads visible rows, admin edits); the bundled catalogue module is only the seed and loading fallback.
- Use section-scoped sticky markers below the fixed header and offset sticky collection filters beneath them so section titles and controls never overlap.
- Collection direction names/order/visibility live in site_settings.collection_directions, resolved by src/lib/directions.ts; project works are excluded from the collection and shown only in the Projects block.
- Store named special projects in Cloud `projects` and assign artworks through `project_id`; public detail pages load through a publishable server function and admin edits stay in `src/lib/admin.ts`, so names, descriptions and membership have one live source.
- Resolve interior preview from an artwork's nullable override, then its project's setting; never infer the setting from photograph labels, so administrator choices apply consistently in every viewer.
- Collection filters are genre pills plus a style dropdown driven by admin-editable dictionaries in site_settings.genres/styles (resolveTerms merges saved entries with built-ins), so the admin controls labels/order without code changes.
- Visits are logged anonymously to page_views from the root tracker and aggregated client-side in the admin Statistics tab; admin uploads go to the private `artworks` bucket with long-lived signed links because public buckets are blocked in this workspace.
- News, CV text and favourites live in Cloud (news table, site_settings.cv, favorites table); the bundled cv.json is only the fallback and the PDF is regenerated separately.
- Admin image uploads are resized (longest side MAX_SIDE) and re-encoded to WebP in the browser by src/lib/image-optimize.ts before storage, so page weight stays low without server-side image tooling.
- The virtual exhibition (/exhibition, ssr:false) is a lazy-loaded React Three Fiber closed room (max EXHIBITION_LIMIT works, launch only after a genre/style filter); hanging rules live in pure src/lib/exhibition-layout.ts and the selection is passed via sessionStorage to avoid huge URLs.
- Project pages can split works into sub-sections by medium via MURAL_SECTIONS in the project route (e.g. murals: walls/ceilings).
- Newsletter subscribers live in Cloud `subscribers` keyed by email; anonymous signup and self-unsubscribe go through security-definer RPCs (subscribe, set_my_subscription), letter HTML is built by src/lib/newsletter.ts.
- Icon-button hints come from one global HintLayer in __root that styles title/aria-label, so new buttons get tooltips by setting title.
