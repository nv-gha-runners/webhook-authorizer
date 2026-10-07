# webhook-authorizer

This repository contains a TypeScript library that exports a single function, `authorizer`.

The `authorizer` function is intended to be used by publicly installable GitHub applications to verify a webhook signature and determine if the webhook originated from a trusted organization.

If the webhook did not originate from a trusted organization, the `authorizer` function logs the installation for alerting and returns an unauthorized result. It does not automatically uninstall the GitHub application.

## Usage

Pass the raw Lambda event, the allowed organization names, and the GitHub App webhook secret to `authorizer`. The signature is checked before the JSON payload is parsed.
