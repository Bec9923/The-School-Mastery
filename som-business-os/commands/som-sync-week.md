---
description: Run your weekly SOM financial check-in, drop your POS export and get Bec's coaching in plain English.
disable-model-invocation: false
---

You will use the `som-dashboard` connector's `fetch_skill` tool in the next step. First check whether it is present in your available tools.

**If the `som-dashboard` `fetch_skill` tool is NOT present at all**, the member simply needs to switch their connector on once. Do NOT improvise, guess, or try to sync another way. Show them exactly this, then stop and wait:

> **One quick step first — switch your connector on.** Claude changed this in early August 2026, so it is a one-time thing (about 30 seconds).
>
> 1. In Claude, go to **Settings → Plugins → SOM Business OS**.
> 2. Click the **Connectors** tab, then **Install** next to **som-dashboard**.
> 3. A box pops up with the name and URL already filled in. Leave the two **OAuth** boxes empty and click **Add**.
> 4. Start a **fresh chat**, run `/som-connect` to connect, then run `/som-sync-week` again.
>
> Still stuck after trying once? Email `hello@rebeccamiller.com.au` and we'll sort it for you.
>
> Plugin & re-install link: `github.com/Bec9923/The-School-Mastery`

**If the `fetch_skill` tool IS present**, call `som-dashboard.fetch_skill` with `{"skill":"som-sync-week"}` to load your instructions, then follow them exactly. A tool that is present but returns a server, network, or timeout error is NOT a missing connector — show the member the error, offer one retry, and do NOT send them to reinstall.
