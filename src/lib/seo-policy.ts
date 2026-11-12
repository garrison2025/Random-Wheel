export interface SeoPagePolicy { indexable: boolean; canonical?: string; robots: string; }

/**
 * Published/approved URLs always have a canonical URL, even when an
 * environment deliberately applies noindex (for example, a preview build).
 * Editorially held pages and the 404 page never receive a canonical.
 */
export function resolveSeoPagePolicy(globalIndexable:boolean, pageNoindex:boolean, domain:string, path:string):SeoPagePolicy {
  if (pageNoindex) return {indexable:false,robots:globalIndexable?'noindex, follow':'noindex, nofollow'};
  if (domain !== 'https://numberspinner.com' || !(path === '/' || /^\/(?:[a-z0-9-]+\/)+$/.test(path))) {
    throw new Error('A canonical must use the official Number Spinner HTTPS domain and an absolute slash-terminated path.');
  }
  const canonical=domain+path;
  if (!globalIndexable) return {indexable:false,canonical,robots:'noindex, nofollow'};
  return {indexable:true,canonical,robots:'index, follow, max-image-preview:large'};
}
