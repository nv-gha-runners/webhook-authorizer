# webhook-authorizer

This repository contains a TypeScript library that exports a single function, `authorizer`.

The `authorizer` function is intended to be used by publicly installable GitHub applications to verify a webhook signature and determine if the webhook originated from a trusted organization.

If the webhook did not originate from a trusted organization, the `authorizer` function verifies the signed installation identity and account against GitHub before automatically uninstalling the application.

## Usage

Pass the trusted GitHub App ID, private key, raw Lambda event, allowed organization names, and webhook secret to `authorizer`. The signature is checked before the JSON payload is parsed or any GitHub API request is made.
