/**
 * Baked configuration hook.
 *
 * Empty by default (the popup asks for Gateway URL + Admin Key). The MDP brain
 * proxy rewrites this file when it serves a pre-configured zip
 * (`/admin/extension.zip?baked=1&gateway=…`), so a downloaded copy already
 * points at the right gateway and carries the admin key — no typing needed.
 */
window.MUSE2API_DEFAULTS = { base: "", key: "", label: "" };
