# Verification

The corrected geometry is defined by the current browser viewport rather than a cover-scaled 3840 × 2560 artboard.

Pure geometry checks passed at 320×568, 390×844, 430×932, 768×1024, 1024×768, 1470×660, 1470×800, 1920×1080, 2560×1080 and 1280×400. These independently verify:

- All five lunar centers are collinear, using each source image's actual disc center.
- All five lunar discs fit the viewport, with unstretched photographic proportions.
- The crosshair retains only the original three corner-to-center rays; no center-to-bottom-right segment is drawn.
- The spectrum's original outer ray ends at the bottom-right corner.
- The last moon clears the entry link on portrait screens.

Connected Chrome visual checks include narrow phone, portrait phone, landscape phone, tablet, wide desktop and short non-fullscreen windows. The footer no longer changes between solid white and speckled ink when crossing a circle. Typography is composited on a uniform isolated backdrop. Exact area sampling reduces coarse grain without a global blur; local short-window background grain deviation measured about 6/255.

The entry and return links, source asset/font loading, JavaScript syntax and Git whitespace checks passed. Zotero extension connection messages are unrelated to the application. Noise samples and font antialiasing can differ from Figma.

## Targeted Safari and text corrections

Local macOS Safari reproduced the reported oversaturated spectrum. A translucent violet sample over RGB(32,32,32) produced blue=255 in Safari versus blue=99 in Chrome. A capability probe now selects explicit alpha-aware Color Dodge for the spectrum on affected backends. Its SVG colors, opacity, blur and geometry are retained. Saturated-channel, partial/zero alpha and black-backdrop checks pass against the actual workaround function.

Safari visual checks cover the full desktop page and a 402×684 embedded phone viewport. Corrected spectrum blending is active and the footer's first character is complete. Chrome comparisons at 1470×660 and 402×684 found zero changed pixels outside the footer and removed line region. The existing ten-size geometry checks also pass with the three-ray correction. Physical iOS 27 Safari and Firefox are not claimed as tested.

Deployment and live verification are reported in the accompanying pull request and task result.
