# NexoChess analytics setup

NexoChess uses Google Analytics 4 (GA4) for optional, consent-gated usage analytics.

## Privacy model

- Analytics is enabled only on the production environment.
- Staging intentionally has no GA4 measurement ID.
- The Google tag is not loaded until the visitor grants the Analytics consent category.
- Advertising storage, advertising user data and advertising personalisation remain denied in Step 32.
- Google Signals and ad-personalisation signals are disabled in the client integration.
- Product-specific events are intentionally not configured until Step 33.

## GA4 property and web stream

The NexoChess GA4 Web stream is configured for `https://www.nexochess.com`.

Production Measurement ID:

```text
G-V4227TJCDB
```

Use these privacy-first settings for Step 32:

- Keep Enhanced Measurement disabled for now. Step 33 will decide intentionally which NexoChess interactions become events.
- Set user and event data retention to 2 months.
- Do not link Google Ads or enable advertising features during Step 32.
- Keep Google Signals disabled.
- In the Google tag data-transmission controls, prevent advertising data transmission and prevent behavioral analytics data transmission when consent is denied.

## Production configuration

The production Cloudflare configuration generator uses `G-V4227TJCDB` as the tracked default Measurement ID. This identifier is public and is intentionally not included in staging.

For recovery or controlled testing, the default can still be overridden with either:

```powershell
$env:NEXOCHESS_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

or:

```text
--analytics-measurement-id G-XXXXXXXXXX
```

The production configuration generator rejects malformed Measurement IDs. Staging receives no production Analytics identifier, so staging traffic cannot contaminate the production property.

## Google Analytics privacy settings

The NexoChess client uses basic consent behavior: the Google tag is not loaded before Analytics consent. The runtime configuration additionally keeps `ad_storage`, `ad_user_data` and `ad_personalization` denied, and disables Google Signals and ad-personalisation signals. Advertising integration belongs to the later advertising/CMP roadmap steps.

GA4 may set first-party `_ga` and `_ga_<container-id>` cookies only after the Analytics category is granted. Google documents a default cookie lifetime of up to two years, subject to browser limits. The NexoChess Privacy Policy discloses this behavior in all eleven supported languages.

## Validation

Staging must continue to work normally whether Analytics consent is accepted or rejected, but it must not load `googletagmanager.com` because no production Measurement ID is exposed there.

Production activation is validated only after the controlled `develop -> master` release. Step 33 adds NexoChess-specific events on top of the same consent-aware analytics layer.
