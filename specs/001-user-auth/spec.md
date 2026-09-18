# Feature Specification: User Authentication & Role-Based Access Control

**Feature Branch**: `001-user-auth`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "fitur auth untuk user. gunakan spatie permission untuk management role dan permission, terdapat 2 role sementara super admin dan user. refer context7."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign In & Session (Priority: P1)

A registered user opens the application, enters their email and password, and is
signed in. Their authenticated session persists across page refreshes so they
stay logged in until they explicitly sign out or the session expires. When they
sign out, the session is destroyed and they can no longer reach protected areas.

**Why this priority**: Authentication is the entry point to every other feature.
Without a working sign-in/sign-out flow and a persistent session, no protected
functionality can be reached, so this is the minimum viable slice.

**Independent Test**: Can be fully tested by signing in with a known account,
refreshing the page to confirm the session survives, then signing out and
confirming protected routes are no longer reachable.

**Acceptance Scenarios**:

1. **Given** a registered user with valid credentials, **When** they submit the
   sign-in form with correct email and password, **Then** they are authenticated
   and redirected to their intended (or default) landing page.
2. **Given** an authenticated user, **When** they reload the page or open a new
   tab, **Then** they remain signed in without re-entering credentials.
3. **Given** an authenticated user, **When** they choose to sign out, **Then**
   their session is terminated and subsequent access to protected areas is
   blocked.
4. **Given** a visitor who enters an incorrect password, **When** they submit
   the sign-in form, **Then** they are not authenticated and see a friendly
   error message without revealing which field (email or password) was wrong.

---

### User Story 2 - Self-Registration (Priority: P2)

A visitor who is not yet an account holder can create their own account from a
public registration page by entering their details (name, email, password,
password confirmation). Newly self-registered accounts receive the regular
**user** role by default, so they can sign in and use self-service features but
cannot reach administrative areas.

**Why this priority**: With open self-registration chosen as the provisioning
model, the register flow is a public entry point to the product alongside
sign-in; it is needed before the system can accumulate real users.

**Independent Test**: Can be tested by registering a brand-new account from the
public page, then signing in with it and confirming it has the **user** role's
access level (no admin areas reachable).

**Acceptance Scenarios**:

1. **Given** a visitor with no account, **When** they submit the registration
   form with valid name, email, and password, **Then** a new account is created
   and they are signed in (or asked to sign in) with the **user** role.
2. **Given** a registration submission with an email that already belongs to an
   account, **When** the form is submitted, **Then** creation is rejected with
   a friendly message indicating the email is already in use.
3. **Given** a newly self-registered account, **When** it signs in, **Then** it
   cannot reach administrative areas (only **user**-level features).

---

### User Story 3 - Role-Based Access Control (Priority: P3)

The system distinguishes two roles for now — **super admin** and **user**. A
super admin can reach administrative areas and perform user/role management; a
regular user cannot. Every protected area declares which role or permission is
required, and the system blocks access for anyone lacking it, showing a
friendly "access denied" message instead.

**Why this priority**: Access control is what makes the two roles meaningful.
Once authentication and registration exist, enforcing role separation is the
next slice that delivers real value (protecting admin capabilities from regular
users).

**Independent Test**: Can be tested by signing in once as a super admin and
once as a regular user, then confirming that the same admin area is reachable
only by the super admin and that the regular user sees an access-denied state.

**Acceptance Scenarios**:

1. **Given** a user assigned the **super admin** role, **When** they navigate
   to an administrative area, **Then** they are granted access.
2. **Given** a user assigned the regular **user** role, **When** they attempt
   to reach an administrative area, **Then** access is blocked and a friendly
   "access denied" message is shown.
3. **Given** a feature protected by a specific permission, **When** a user
   without that permission (via any role) attempts to use it, **Then** the
   feature is hidden or blocked.
4. **Given** the system is initialized, **Then** exactly two roles exist:
   **super admin** and **user**.

---

### User Story 4 - Super Admin Management UI (Priority: P4)

A super admin can manage the authorization model through a dedicated
administrative interface: list/view/create/edit/disable users, assign and
revoke roles on users, and create, edit, and remove roles and permissions and
attach permissions to roles. Changes take effect immediately and are captured
in the activity log with a narrative description. Regular users cannot reach
any of these screens.

**Why this priority**: A full management UI lets a super admin operate the RBAC
model without touching code/seeds, which is the point of choosing
spatie/laravel-permission for management. It depends on auth, RBAC enforcement,
and self-registration being in place, so it sits after them.

**Independent Test**: Can be tested by signing in as super admin, creating a
new role, attaching a permission to it, assigning it to a user, and confirming
that user's access changes accordingly — then signing in as a regular user and
confirming the management screens are unreachable.

**Acceptance Scenarios**:

1. **Given** a super admin, **When** they open the user management screen,
   **Then** they can list, view, create, edit, and disable user accounts.
2. **Given** a super admin, **When** they assign or revoke a role on a user,
   **Then** that user's effective access updates immediately.
3. **Given** a super admin, **When** they create, rename, or delete a role or
   permission, **Then** the change is persisted and reflected in the
   authorization model.
4. **Given** a super admin, **When** they attach or detach a permission from a
   role, **Then** every user holding that role gains or loses that permission.
5. **Given** a regular **user**, **When** they attempt to reach any management
   screen, **Then** access is blocked.
6. **Given** any management action is performed, **Then** a narrative activity
   log entry is recorded (who, what, target, before/after where meaningful).

---

### User Story 5 - Password Recovery (Priority: P5)

A user who forgets their password can request a recovery link by entering their
email address. The system sends a time-limited, single-use link to that email.
Opening the link lets them choose a new password, after which they can sign in
with the new password. The link stops working once it has been used or has
expired.

**Why this priority**: Account lockout from forgotten passwords is a common
support burden. Recovery is the standard self-service fix, but it depends on
email transport being configured, so it sits below the core auth, registration,
RBAC, and management slices.

**Independent Test**: Can be tested by requesting a recovery link for a known
account, following it, setting a new password, and confirming the new password
works while the old one no longer does.

**Acceptance Scenarios**:

1. **Given** a registered user who has forgotten their password, **When** they
   submit their email on the recovery page, **Then** a recovery link is sent to
   that email.
2. **Given** a valid, unused, unexpired recovery link, **When** the user opens
   it and submits a new password, **Then** the password is updated and the link
   becomes invalid.
3. **Given** an expired or already-used recovery link, **When** the user opens
   it, **Then** they are told the link is no longer valid and offered a way to
   request a new one.
4. **Given** a recovery request for an email that does not match any account,
   **When** the form is submitted, **Then** the system shows a neutral
   confirmation (without revealing whether the email exists).

---

### User Story 6 - Self-Service Profile & Change Password (Priority: P6)

An authenticated user can view their own profile and update editable profile
fields. They can also change their password by entering their current password
and a new one, without needing an email recovery flow.

**Why this priority**: Lets users keep their account details and credentials
current on their own, reducing admin/support load — but it is not a blocker for
the core auth, registration, RBAC, or management slices.

**Independent Test**: Can be tested by signing in, editing a profile field and
saving, then changing the password and confirming the new password works on the
next sign-in.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they open their profile, **Then**
   they see their own account information.
2. **Given** an authenticated user, **When** they edit an editable profile
   field and save, **Then** the change is persisted and reflected on reload.
3. **Given** an authenticated user, **When** they submit their current password
   plus a new password, **Then** the password is changed only if the current
   password is correct; otherwise a friendly error is shown.

---

### Edge Cases

- What happens when a visitor submits invalid credentials (wrong password, or
  email that does not match an account)?
- What happens when an authenticated user's session expires mid-task and they
  attempt a protected action?
- What happens when a user without the required role/permission tries to access
  a protected route directly via its URL?
- What happens when a recovery link is reused, or opened after it has expired?
- What happens when a user changes their password — are other active sessions
  invalidated?
- What happens when a disabled/deactivated account attempts to sign in?
- What happens when concurrent sign-in attempts occur for the same account?
- What happens when role/permission data is missing or uninitialized at
  startup (e.g., the two seed roles have not been created)?
- What happens when a visitor registers with a weak password, or with
  mismatched password and confirmation?
- What happens when a super admin tries to delete a role or permission still
  in use by users?
- What happens when a super admin attempts to remove their own **super admin**
  role or disable their own account (self-lockout guard)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate a user by verifying their email and
  password.
- **FR-002**: System MUST establish a persistent authenticated session after a
  successful sign-in, surviving page reloads until explicit sign-out or
  expiry.
- **FR-003**: System MUST terminate the session on sign-out and block further
  access to protected areas.
- **FR-004**: System MUST define exactly two roles initially: **super admin**
  and **user**.
- **FR-005**: System MUST assign each user at least one role from the set
  {super admin, user}.
- **FR-006**: System MUST enforce access to protected areas based on the user's
  role(s) and/or permissions.
- **FR-007**: System MUST block unauthorized access to a protected resource and
  show a friendly "access denied" message instead of exposing the resource.
- **FR-008**: The **super admin** role MUST carry every permission, including
  user and role/permission management.
- **FR-009**: The regular **user** role MUST be limited to self-service actions
  (own profile and own password); additional permissions are granted only as
  new features are introduced.
- **FR-010**: System MUST allow a user to request a password recovery link by
  entering their email.
- **FR-011**: System MUST issue a time-limited, single-use recovery link and
  invalidate it after use or upon expiry.
- **FR-012**: System MUST allow a user to set a new password via a valid
  recovery link.
- **FR-013**: System MUST allow an authenticated user to view and update their
  own editable profile fields.
- **FR-014**: System MUST allow an authenticated user to change their password
  only after confirming their current password.
- **FR-015**: System MUST record a narrative activity log entry for every
  security-relevant event (sign-in, sign-out, failed sign-in, password change,
  password reset, role/permission change), capturing who, what, target, and
  when.
- **FR-016**: System MUST present a neutral confirmation for password recovery
  requests that does not reveal whether the submitted email corresponds to an
  existing account.
- **FR-017**: System MUST allow a visitor to self-register an account from a
  public registration page by providing name, email, and password (with
  confirmation).
- **FR-018**: System MUST assign the regular **user** role by default to every
  newly self-registered account, so it cannot reach administrative areas.
- **FR-019**: System MUST reject registration with an email that already
  belongs to an existing account, with a friendly message.
- **FR-020**: System MUST provide a super-admin management interface where a
  super admin can list, view, create, edit, and disable user accounts.
- **FR-021**: System MUST allow a super admin to assign and revoke roles on a
  user, with the change taking effect immediately.
- **FR-022**: System MUST allow a super admin to create, rename, and delete
  roles and permissions, and to attach permissions to roles (and detach them),
  with changes reflected across every affected user immediately.
- **FR-023**: System MUST block regular users from reaching any management
  screen.
- **FR-024**: System MUST prevent a super admin from removing their own
  **super admin** role or disabling their own account, to avoid self-lockout.

### Key Entities *(include if feature involves data)*

- **User**: A person who can sign in. Has credentials (email + password),
  profile fields, and one or more roles.
- **Role**: A named grouping of permissions. Initially two instances: **super
  admin** and **user**.
- **Permission**: A granular capability that can be granted to a role (and
  optionally directly to a user). Protected areas require a specific role or
  permission.
- **Session**: The authenticated state of a user between sign-in and sign-out.
- **Activity Log Entry**: An audit record of a security-relevant event
  (causer, action, subject, timestamp, narrative description).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A registered user can complete sign-in within 10 seconds on a
  stable connection.
- **SC-002**: 99% of sign-in attempts with valid credentials succeed on the
  first attempt.
- **SC-003**: Unauthorized attempts to reach a protected resource are blocked
  100% of the time, with a friendly "access denied" outcome.
- **SC-004**: A user who has forgotten their password can regain access within
  5 minutes via the recovery flow.
- **SC-005**: Role assignment determines the features a user can reach, with
  zero privilege leakage between the **super admin** and **user** roles.
- **SC-006**: 100% of security-relevant events (sign-in, sign-out, failed
  sign-in, password change, password reset, role/permission changes) are
  captured in the activity log with a narrative description.

## Assumptions

- Authentication is email + password, session-based, with the session
  persisting across SPA reloads. (Implementation guidance for the plan phase:
  Sanctum SPA cookie sessions for the React + Laravel split — the spec itself
  stays technology-agnostic.)
- Role-based access control is implemented via `spatie/laravel-permission`, as
  explicitly chosen by the user. This is a locked technology constraint; the
  spec describes the RBAC behavior, the plan maps it to spatie constructs
  (roles, permissions, guards, middleware).
- Two roles for now — **super admin** and **user** — as stated by the user
  ("sementara" / temporary). The permission set starts minimal and expands as
  new features are added.
- A single web guard is sufficient for v1 (no multi-guard / API-token guard
  split yet).
- Password recovery delivers a link via email, so outbound mail transport must
  be configured in the deployment environment.
- Email verification is out of scope for v1.
- OAuth / SSO and social login are out of scope for v1.
- The frontend (`apps/web`, React SPA) and backend (`apps/api`, Laravel) are
  separate apps with no shared runtime contract; auth crosses that boundary.
- All user-facing text is in semi-formal, friendly Indonesian; identifiers and
  i18n keys stay English, per the project constitution.
- The two seed roles (**super admin**, **user**) and an initial super-admin
  account are created at initialization (via a seeder/Setup step) so the system
  never starts in a role-less or admin-less state; all further roles,
  permissions, and accounts are managed through the super-admin UI or
  self-registration.
- Account provisioning is open self-registration (user decision): visitors
  create their own accounts; new accounts default to the **user** role.
- The super-admin management UI is in scope for v1 (user decision): a super
  admin can fully manage users, roles, and permissions through the UI.