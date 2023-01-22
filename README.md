# webhook-authorizer

This repository contains a TypeScript library that exports a single function, `authorizer`.

The `authorizer` function is intended to be used by publicly installable GitHub applications to determine if the provided webhook originated from a trusted organization.

If the webhook did not originate from a trusted organization, the `authorizer` function will uninstall the GitHub application from the organization and return a falsey value.

## Usage

The `authorizer` function expects that a `base64` encoded `PRIVATE_KEY` value exists in the environment for the respective GitHub application.
