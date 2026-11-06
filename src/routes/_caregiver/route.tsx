import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { checkCaregiver } from "@/lib/caregiver-guard";
import { currentAccessToken } from "@/lib/caregiver-auth";
import { verifyCaregiver } from "@/lib/caregiver.functions";

/** Adult-only area. The session lives on the device, so the gate runs in the browser
 *  but every pass is confirmed by the server validating the token. */
export const Route = createFileRoute("/_caregiver")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const res = await checkCaregiver({
      href: location.href,
      getToken: currentAccessToken,
      verify: () => verifyCaregiver(),
    });
    if (!res.ok) throw redirect({ to: "/caregiver-login", search: { redirect: res.returnTo } });
    return { caregiver: res.caregiver };
  },
  component: () => <Outlet />,
});
