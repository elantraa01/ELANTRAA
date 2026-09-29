"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

export default function Analytics() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  const gaId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-PZWHKPYS60";
  const clarityId =
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() || "ydeyxjad5n";
  const pixelId =
    process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "1088936753845197";

  // Track page transitions on route changes for SPA navigation
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (typeof window !== "undefined") {
      if (typeof window.fbq === "function") {
        window.fbq("track", "PageView");
      }
      if (typeof window.gtag === "function" && gaId) {
        window.gtag("config", gaId, {
          page_path: pathname,
        });
      }
    }
  }, [pathname, gaId]);

  if (!gaId && !clarityId && !pixelId) {
    return null;
  }

  return (
    <>
      {/* Google Analytics 4 (GA4) */}
      {gaId && (
        <>
          <Script
            id="ga4-script"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              `,
            }}
          />
        </>
      )}

      {/* Microsoft Clarity */}
      {clarityId && (
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `,
          }}
        />
      )}

      {/* Meta Pixel (Facebook Pixel) */}
      {pixelId && (
        <>
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </>
  );
}
