# Security Specification - Nilesh Store

## Data Invariants
1. Products, Categories, and Banners are managed exclusively by Admins.
2. Users can only read their own profile, except for Admins who can manage all users.
3. Users can only read their own orders.
4. Orders must be created with a valid userId matching the authenticated user.
5. Order status can only be updated by Admins.
6. Admin role cannot be self-assigned.

## The "Dirty Dozen" Payloads (Red Team Test Cases)

1. **Self-Promotion Attack**: A customer attempts to update their own role to 'admin'.
   - `PATCH /users/{uid} { "role": "admin" }` (Auth: {uid}) -> DENIED
2. **Product Price Sabotage**: An unauthenticated user tries to change a product price.
   - `PATCH /products/{id} { "price": 0.01 }` (Auth: Null) -> DENIED
3. **Identity Spoofing**: User A tries to create an order with `userId` of User B.
   - `POST /orders { "userId": "userB", "total": 100 }` (Auth: userA) -> DENIED
4. **Order Hijacking**: User A tries to read User B's order.
   - `GET /orders/orderB` (Auth: userA) -> DENIED
5. **PII Leakage**: Unauthenticated user tries to list all user profiles.
   - `GET /users` (Auth: Null) -> DENIED
6. **Ghost Product Injection**: Signed-in user tries to create a new product unauthorized.
   - `POST /products { "name": "Fake Pen", "price": 10 }` (Auth: customer) -> DENIED
7. **Status Manipulation**: Customer tries to mark their 'pending' order as 'shipped'.
   - `PATCH /orders/{id} { "status": "shipped" }` (Auth: owner) -> DENIED
8. **Banner Vandalism**: User tries to delete the homepage banner.
   - `DELETE /banners/{id}` (Auth: customer) -> DENIED
9. **Shadow Field Injection**: Admin tries to add an undocumented field `isInternalOnly` to a category without validation.
   - `PATCH /categories/{id} { "isInternalOnly": true }` (Auth: admin) -> DENIED (Strict schema)
10. **ID Poisoning**: User tries to create a user profile with a 1.5KB string as the ID.
    - `PUT /users/{long_id} { ... }` -> DENIED
11. **Relational Sync Break**: User tries to create an order referencing a non-existent product ID (if exists() check implemented).
    - `POST /orders { "items": [{ "id": "none" }] }` -> DENIED
12. **Admin Lockdown**: Admin tries to delete their own account (if terminal state/locking applied).
    - `DELETE /users/{admin_uid}` -> DENIED (Protect core identity)

## Test Runner
See `firestore.rules.test.ts` for implementation.
