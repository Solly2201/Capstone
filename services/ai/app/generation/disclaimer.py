"""Disclaimer text/version for Module 1B responses.

Mirrors packages/contracts/src/index.ts (disclaimerVersion,
disclaimerText). There is no shared package between the TypeScript and
Python services, so these two definitions must be kept in sync by hand
whenever the disclaimer changes. Every /legal/answer response carries
this, per the project's "every legal AI message must carry disclaimer
context" requirement -- not just account-level acceptance at
registration, since the endpoint is intentionally public (no login
required for v1).
"""
DISCLAIMER_VERSION = "2026-08-16"
DISCLAIMER_TEXT = (
    "This module is only for public awareness and information. For any "
    "real-world implication, please contact a legal adviser."
)
