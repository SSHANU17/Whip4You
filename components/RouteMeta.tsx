import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE = 'https://www.whip4you.com';
const pageMeta: Record<string, { title: string; description: string }> = {
  '/': { title: 'Whip4You | Used Cars in Surrey, BC', description: 'Shop inspected pre-owned cars, SUVs, trucks and vans at Whip4You in Surrey, British Columbia. Browse inventory and apply for vehicle financing.' },
  '/inventory': { title: 'Used Vehicle Inventory | Surrey, BC | Whip4You', description: 'Browse available used cars, SUVs, trucks and vans for sale in Surrey and across the Lower Mainland, British Columbia.' },
  '/finance': { title: 'Auto Financing in Surrey, BC | Whip4You', description: 'Explore vehicle financing options in Surrey, BC. Apply online for financing on quality pre-owned vehicles at Whip4You.' },
  '/calculator': { title: 'Car Loan Calculator | Whip4You Surrey', description: 'Estimate your car loan payments with the Whip4You vehicle payment calculator in Surrey, British Columbia.' },
  '/about': { title: 'About Whip4You | Surrey Used Car Dealership', description: 'Learn about Whip4You, a pre-owned vehicle dealership serving Surrey, Langley and the Lower Mainland of British Columbia.' },
  '/contact': { title: 'Contact Whip4You | Surrey, BC', description: 'Contact the Whip4You vehicle sales team in Surrey, British Columbia, to ask about inventory, financing or a trade-in.' },
  '/privacy': { title: 'Privacy Policy | Whip4You', description: 'Read the Whip4You privacy policy.' },
  '/admin': { title: 'Admin | Whip4You', description: 'Whip4You administration.' },
};

export default function RouteMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = pathname.startsWith('/vehicle/')
      ? { title: 'Pre-Owned Vehicle for Sale in Surrey, BC | Whip4You', description: 'View vehicle details, photos and financing information for this pre-owned vehicle at Whip4You in Surrey, BC.' }
      : pageMeta[pathname] || pageMeta['/'];
    document.title = meta.title;
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) { description = document.createElement('meta'); description.name = 'description'; document.head.appendChild(description); }
    description.content = meta.description;
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${SITE}${pathname}`;
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = pathname === '/admin' ? 'noindex, nofollow' : 'index, follow';
  }, [pathname]);
  return null;
}
