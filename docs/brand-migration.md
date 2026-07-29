# NexoChess identity and persistence migration plan

## Purpose

NexoChess is replacing the public WintrChess identity while preserving working installations, local settings, Archives and authentication data. Public branding and internal persistence identifiers must not be renamed in one uncontrolled search-and-replace operation.

## Canonical public identity

- Product name: `NexoChess`
- Canonical production origin: `https://www.nexochess.com`
- Canonical apex domain: `https://nexochess.com`
- Local development origin: `http://localhost:8080`

The final deployment should choose either the apex or `www` hostname as canonical and redirect the other permanently. Authentication configuration must use the same canonical origin consistently.

## Public identifiers to migrate

These may be changed during the identity sprint once their locations are reviewed:

- visible product name;
- page titles and metadata;
- favicon and approved logo assets;
- public URLs and email addresses;
- help, privacy and legal copy;
- public repository links;
- promotional and social links;
- user-facing error and loading messages.

## Internal identifiers intentionally retained for now

The following legacy strings are not necessarily visible to users and may contain persisted data:

- `wintrchess_*` local-storage keys;
- `wintrchess_*` cookies;
- Better Auth cookie prefix `wintrchess`;
- MongoDB database name `wintrchess`;
- Docker project and volume names containing `wintrchess`.

Leaving an internal identifier unchanged is not a branding failure. Renaming it without a migration can log users out, reset settings, hide local games or create a fresh empty database.

## Safe browser-storage migration

When migrating a local-storage or IndexedDB key:

1. Read the new NexoChess key first.
2. When absent, read the corresponding legacy WintrChess key.
3. Validate and copy the legacy value to the new key.
4. Continue writing only the new key.
5. Keep legacy reads for at least one stable release.
6. Remove the old key only after confirming the migration is reliable.

The migration must be idempotent: running it more than once must not duplicate or corrupt data.

## Cookie and authentication migration

Authentication-cookie prefixes require a dedicated release plan. A direct prefix rename invalidates existing sessions and may leave stale cookies behind.

Possible controlled approach:

1. Announce a one-time sign-in renewal.
2. Deploy the new prefix with an explicit logout/cleanup path for legacy cookies.
3. Confirm OAuth callback URLs and cookie-domain settings on the canonical hostname.
4. Test sign-up, sign-in, sign-out, password reset and account deletion.

Do not attempt a silent authentication migration until Better Auth behaviour has been tested against the exact deployed version.

## Database migration

The MongoDB database name may remain `wintrchess` indefinitely because it is an internal implementation detail. Rename it only when there is an operational reason.

A future rename requires:

1. a complete backup;
2. a tested copy or rename procedure;
3. verification of indexes and collection counts;
4. updated `DATABASE_URI` values;
5. rollback instructions;
6. post-migration authentication and Archive tests.

## Docker project and volume migration

Changing the Compose project or volume name creates a different volume unless the old volume is explicitly mapped or copied. This can make the database appear empty.

For now, retain the existing volume name. A later infrastructure migration should copy the data and verify it before deleting the legacy volume.

## Release gates

The public launch must not proceed until all of the following are true:

- the domain is registered and controlled by the project owner;
- the product name has been checked for obvious trademark conflicts;
- the public GPL source repository is available;
- upstream and third-party attribution is published;
- engine corresponding source/build information is available;
- privacy and cookie behaviour matches the actual implementation;
- every user-data flow has deletion and retention rules;
- production OAuth credentials and callbacks are configured;
- browser and mobile testing has passed.
