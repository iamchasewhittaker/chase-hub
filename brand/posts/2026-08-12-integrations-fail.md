---
title: 200+ merchant go-lives taught me integrations rarely fail for the reason in the ticket.
date: 2026-08-12
source: operator lesson (Authorize.Net / CyberSource, 200+ merchant go-lives)
status:
  drafted: true
  linkedin: false
  threads: false
  chase_hub_feed: false
---

Getting merchants live on Authorize.Net and CyberSource, the ticket almost never named the real problem. Three patterns showed up over and over.

First: the webhook URL was right in staging and wrong in production, and nobody checked because "it worked before." Environment drift is the single most common cause of a go-live breaking, and it's rarely mentioned in the docs because the docs assume you're testing in the environment you'll ship to.

Second: the merchant's team read the API docs once, built to that version, and never checked back. Six months later the field they depend on got deprecated and nobody on their side knew. Docs are a snapshot. Integrations are not.

Third: the failure showed up three steps downstream from the actual cause. A declined charge that traces back to a currency mismatch set weeks earlier, in a config screen nobody remembers touching. The error message tells you where it broke, not why.

None of these are edge cases. They're the majority of what I saw. The fix isn't smarter error messages, it's checking the boring stuff first: which environment, which docs version, what changed upstream.

What's the "it's never actually the thing in the ticket" pattern you've seen?

#payments #integrations #fintech
