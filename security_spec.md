# Security Specification & Threat Model

## 1. Data Invariants
1. **User Identity Isolation**: A user can only read, create, update, or delete their own documents located under `/users/{userId}/*`. Cross-user reads or modifications are strictly forbidden.
2. **Owner Id Matching**: The path variable `{userId}` must strictly match `request.auth.uid`.
3. **Data Integrity**: In subcollections `cards` and `dictionaries`, `userId` in the payload must match `request.auth.uid` and path variable `userId`.
4. **Field Boundaries**:
   - `original`, `translation`, `name` cannot be empty or excessively long (prevent Denial of Wallet).
   - Document IDs must conform to `^[a-zA-Z0-9_\\-]+$` and size <= 128 chars.
5. **No Blanket Reads**: All list and get operations are confined to authenticated owners.
6. **Immutable Fields**: `userId` and `createdAt` cannot be modified after creation.

## 2. The Dirty Dozen Payloads (Designed to break laws of Identity and Integrity)
1. **Unauthenticated Write**: Payload sent to `/users/alice/cards/card1` without `request.auth` -> MUST BE DENIED.
2. **Cross-User Write**: User Bob (`auth.uid = "bob"`) attempts to create `/users/alice/cards/card1` -> MUST BE DENIED.
3. **Cross-User Read**: User Bob attempts to read `/users/alice/cards/card1` -> MUST BE DENIED.
4. **Cross-User List**: User Bob attempts to list `/users/alice/cards` -> MUST BE DENIED.
5. **Spoofed User ID in Card Payload**: User Bob (`auth.uid = "bob"`) writes to `/users/bob/cards/card1` with payload `{"userId": "alice", ...}` -> MUST BE DENIED.
6. **Path ID Poisoning**: Attempt to write to `/users/{userId}/cards/malicious%20..%20id` -> MUST BE DENIED by `isValidId`.
7. **Oversized String (Resource Exhaustion)**: Card original string > 500 characters or translation > 1000 characters -> MUST BE DENIED.
8. **Invalid Enum**: Card `ankiStatus` set to `"hacked_status"` instead of `not_added | synced | error` -> MUST BE DENIED.
9. **Tampering Immutable Owner**: Update payload attempting to change `userId` -> MUST BE DENIED.
10. **Tampering Immutable Creation Time**: Update payload attempting to modify `createdAt` -> MUST BE DENIED.
11. **Shadow Key Injection**: Create payload containing unvalidated extra system fields like `{ "isAdmin": true, "superUser": true }` -> MUST BE DENIED.
12. **Unauthenticated User Profile Modification**: Anonymous or unverified intruder trying to overwrite `/users/{userId}` -> MUST BE DENIED.
