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
