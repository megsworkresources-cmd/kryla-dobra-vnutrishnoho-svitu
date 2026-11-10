# Caregiver authentication audit

Preserve the existing app, artwork, caregiver sign-in, and local-only dashboard. No profiles, tables, child accounts, or cloud syncing.

## Changes
- Keep `/parents` under the existing server-verified caregiver gate; revalidate the current user on the server.
- Use one shared account-event subscriber to update caregiver access after sign-in, sign-out and recovery, without disrupting public child pages.
- Cancel and clear account query caches before logout; preserve all device-local child data and show translated errors.
- Make confirmation return handling reliable and recovery forms require a valid recovery session, including refreshes. Prevent repeat submissions and keep safe local redirects.
- Extend tests for authentication transitions, rejected tokens, recovery, logout and public routes. Verify signed-out and real-session dashboard access in the browser.

## Settings and verification
The existing Lovable Cloud backend has email sign-in and signup enabled, email confirmation required, anonymous accounts disabled, and preview/published return addresses allowed. Leave those settings unchanged.

Run the test suite and lint; inspect the automatically generated production checks rather than running a duplicate build. Report unrelated existing lint failures and any email delivery or password-login checks that cannot be verified without credentials.