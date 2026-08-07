# NexoChess analytics setup

NexoChess uses Google Analytics 4 (GA4) for optional, consent-gated usage analytics.

## Privacy model

- Analytics is enabled only on the production environment.
- Staging intentionally has no GA4 measurement ID.
- The Google tag is not loaded until the visitor grants the Analytics consent category.
- Advertising storage, advertising user data and advertising personalisation remain denied in Step 32.
- Google Signals and ad-personalisation signals are disabled in the client integration.
- Product-specific events are intentionally not configured until Step 33.

## Production configuration

Create a GA4 web data stream for `https://www.nexochess.com` and obtain its Measurement ID (`G-...`).

Before preparing or deploying the production Worker, expose that public identifier to the production configuration process:

```powershell
$env:NEXOCHESS_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

The production configuration generator rejects a missing or malformed Measurement ID. The identifier is not a secret, but NexoChess keeps it out of staging so test traffic cannot contaminate production analytics.

## Google Analytics privacy settings

For the NexoChess GA4 property, keep advertising features disabled for Step 32 and configure the Google tag data-transmission controls so behavioral analytics is not transmitted when `analytics_storage` is denied. Advertising integration belongs to the later advertising/CMP roadmap steps.

## Validation

Staging must continue to work normally whether Analytics consent is accepted or rejected, but it must not load `googletagmanager.com` because no production Measurement ID is exposed there.

Production activation is validated only after the controlled `develop -> master` release. Step 33 adds NexoChess-specific events on top of the same consent-aware analytics layer.
