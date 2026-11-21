/** Never cache account/session screens or OAuth/API responses, even as navigations. */
export function canCacheNavigation({
  request,
  url,
}: {
  request: { mode: string };
  url: { pathname: string };
}): boolean {
  const pathname = url.pathname;
  return (
    request.mode === "navigate" &&
    ![
      "/api",
      "/~oauth",
      "/.lovable",
      "/auth",
      "/caregiver-login",
      "/reset-password",
      "/parents",
      "/shared-garden",
    ].some((path) => pathname === path || pathname.startsWith(`${path}/`))
  );
}
