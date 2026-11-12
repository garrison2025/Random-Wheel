export interface SeoPagePolicy { indexable: boolean; canonical?: string; robots: string; }
/** A canonical is a positive indexing signal. Never emit it for deliberately noindexed pages. */
export function resolveSeoPagePolicy(globalIndexable:boolean, pageNoindex:boolean, domain:string, path:string):SeoPagePolicy {
  if (!globalIndexable) return {indexable:false,robots:'noindex, nofollow'};
  // Keep candidate landing pages out of results, but let crawlers discover valid tools they link to.
  if (pageNoindex) return {indexable:false,robots:'noindex, follow'};
  const indexable=true;
  if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain) || !path.startsWith('/')) {
    throw new Error('A valid official HTTPS domain and absolute page path are required for canonical.');
  }
  return {indexable:true,canonical:domain.replace(/\/+$/,'')+path,robots:'index, follow, max-image-preview:large'};
}
