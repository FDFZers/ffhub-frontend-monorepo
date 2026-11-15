function makeUrl(subdomain: string) {
  return import.meta.env.DEV
    ? `https://${subdomain}.ffhub.localhost`
    : `https://${subdomain}.fdfz.top/`;
}

export const AUTH_URL = makeUrl("auth");
export const SPACE_URL = makeUrl("space");
export const ADMIN_URL = makeUrl("admin");
