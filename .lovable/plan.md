# Finding (read-only, nothing changed)

- This app's backend is ref ftqdpebplmucvnzyltry and Lovable's records mark it **Managed by Lovable: true** (Lovable Cloud). It is healthy and reachable.
- It is NOT an external project with missing membership. Lovable-managed backends live in Lovable's own organization, so no personal account dashboard can open it. "You do not have access" is expected.
- pahlmmtskmlrhcuevdyc is a separate, unrelated project. Changing its Site URL has no effect on this app, which explains why the fallback still points to the .lovable.app address.

# Safe next step for the user

1. In Lovable, open this project, then **More -> Users -> Auth settings -> Advanced**.
2. Set **Site URL** to `https://kryla-dobra-vnutrishnoho-svitu.vercel.app` and save.
3. Make sure **Redirect URLs** includes `https://kryla-dobra-vnutrishnoho-svitu.vercel.app/**`.
4. Optionally undo the change made on pahlmmtskmlrhcuevdyc if that project is used elsewhere.
5. Rerun the production fallback test. No migration, database replacement or reconnection is needed.

Note: Lovable may reset the Site URL to a Lovable/custom domain if the OAuth server (MCP sign-in) is reconfigured. Adding the Vercel domain as a custom domain is the most durable option.

# If approved

I will only recheck the saved Site URL and redirect list after the user saves; no changes.
