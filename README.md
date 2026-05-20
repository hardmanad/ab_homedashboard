# Home Dashboard

A Workfront Main Menu Extension built on Adobe App Builder that provides a custom dashboard with interactive widgets for projects, campaigns, and approvals.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Adobe I/O CLI](https://developer.adobe.com/runtime/docs/guides/tools/cli_install/): `npm install -g @adobe/aio-cli`
- Access to an [Adobe Developer Console](https://developer.adobe.com/console/) organization
- An Adobe Workfront instance with Admin access (for extension registration)
- Workfront Planning (Maestro) enabled on your Workfront instance (for the Campaign Timeline widget)

---

## First-Time Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd ab_homedashboard
npm install
```

### 2. Create an Adobe Developer Console project

1. Go to [Adobe Developer Console](https://developer.adobe.com/console/)
2. Create a new project (or use an existing App Builder project)
3. Add an **App Builder** workspace (e.g. `Stage`, `Production`)
4. Add the following APIs/services to the workspace:
   - **Adobe Workfront** — required for all backend actions
   - **I/O Management API** — required for App Builder runtime
5. Add an **OAuth Server-to-Server** credential with the following scopes:
   - `openid`, `AdobeID`, `read_organizations`, `profile`, `session`
   - `additional_info.projectedProductContext`, `additional_info.roles`
6. Note your **Client ID** — you will need it for `SERVICE_API_KEY` below

### 3. Link the CLI to your Developer Console project

```bash
aio app use
```

Follow the prompts to select your organization, project, and workspace. This generates the `.env` file with your runtime credentials.

### 4. Configure the `.env` file

After running `aio app use`, open the generated `.env` file and add the following variables. The `AIO_*` variables are populated automatically; everything else must be added manually.

```bash
# Auto-populated by `aio app use` — do not edit
AIO_runtime_auth=
AIO_runtime_namespace=
AIO_runtime_apihost=https://adobeioruntime.net

# Your static hosting hostname — format: {namespace}.adobeio-static.net
# Find your namespace in the AIO_runtime_namespace value above
AIO_STATIC_HOST=your-namespace.adobeio-static.net

# The Client ID from your OAuth Server-to-Server credential in Developer Console
# Used by the submitApprovalDecision and pendingApprovalsWidget actions to call
# the Workfront Unified Approval Service (UAS) API
SERVICE_API_KEY=your-oauth-client-id

# Workfront Planning IDs — see "Finding Planning IDs" section below
WF_PLANNING_WORKSPACE_ID=
WF_PLANNING_CAMPAIGN_RECORD_TYPE_ID=
WF_PLANNING_ON_HOLD_STATUS_ID=
```

### 5. Find your Workfront Planning IDs

The Campaign Timeline widget skips dynamic workspace/record-type lookups for performance and reads these IDs directly from env vars instead. You need to find them once for your org.

**Step 1 — Find your workspace ID and campaign record type ID**

Make the following API calls using your Workfront hostname and a valid Bearer token (copy one from your browser's devtools while logged into Workfront):

```bash
# Get all workspaces
curl -H "Authorization: Bearer <token>" \
  https://<your-hostname>/maestro/api/workspaces

# Find your workspace in the response and note its "id"
# Then get record types for that workspace:
curl -H "Authorization: Bearer <token>" \
  "https://<your-hostname>/maestro/api/record-types?workspaceId=<workspace-id>"

# Find the "campaigns" record type in the response and note its "id"
```

Set `WF_PLANNING_WORKSPACE_ID` and `WF_PLANNING_CAMPAIGN_RECORD_TYPE_ID` in `.env`.

**Step 2 — Find the on-hold status ID**

The "on-hold" status in the campaigns record type is stored as a UUID (not a human-readable string) in the Planning API. To find it:

```bash
# Search for a campaign record you know is in "on-hold" status
curl -H "Authorization: Bearer <token>" \
  "https://<your-hostname>/maestro/api/v1/records/search?recordTypeId=<record-type-id>&limit=10&aliased=true"

# In the response, find a campaign with status "on-hold" and copy the UUID
# value from its "data.status" field
```

Set `WF_PLANNING_ON_HOLD_STATUS_ID` in `.env`.

> **Note:** If your Planning workspace does not have an "on-hold" status, set this to any non-matching value (e.g. `none`) and the widget will return the raw status string from the API.

### 6. Set up the Category field in Workfront Planning

The Campaign Timeline widget shows a colored category badge on each campaign. It reads from a **single-select field named "Category"** on the campaigns record type.

If that field does not already exist, create it:

1. In your Workfront instance, open the Planning workspace containing your campaigns
2. Open the Campaigns record type table view
3. Add a new **Single-select** field, name it exactly `Category`
4. Add one option per campaign category your org uses (e.g. Digital, Brand, Social, Events)
5. Pick a color for each option using the Planning color picker

Assign a category value to each campaign record so the badge renders correctly. Any campaign with no category set will show the default "Digital" badge in blue.

---

### 7. Update org-specific frontend constants

The following values are hardcoded in the frontend and must be updated for your organization:

**`src/workfront-ui-1/web-src/src/components/widgets/AIPoweredActionsWidget/index.js`**

Replace the GenStudio intake request URL with your organization's URL:
```javascript
// Find this line and replace with your org's intake URL
const INTAKE_URL = 'https://experience.adobe.com/#/@<your-org>/...';
```

You can find your intake URL by navigating to the request queue in your Workfront instance and copying the URL from the browser.

### 8. Deploy

```bash
aio app deploy
```

### 9. Register the extension in Workfront

1. Go to your Workfront instance
2. Navigate to **Setup → Extensibility → UI Extensions**
3. Find the deployed extension and enable it
4. Add it as a **Main Menu item** in Workfront's layout templates

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `AIO_runtime_auth` | Yes | App Builder runtime auth token (set by `aio app use`) |
| `AIO_runtime_namespace` | Yes | App Builder runtime namespace (set by `aio app use`) |
| `AIO_runtime_apihost` | Yes | Always `https://adobeioruntime.net` |
| `AIO_STATIC_HOST` | Yes | Static hosting hostname: `{namespace}.adobeio-static.net` |
| `SERVICE_API_KEY` | Yes | OAuth Client ID — used as `x-api-key` header for UAS API calls |
| `WF_PLANNING_WORKSPACE_ID` | Yes | ID of the Workfront Planning workspace containing campaigns |
| `WF_PLANNING_CAMPAIGN_RECORD_TYPE_ID` | Yes | ID of the "campaigns" record type in your Planning workspace |
| `WF_PLANNING_ON_HOLD_STATUS_ID` | Yes | The `name` value of the "On Hold" option in the campaigns status field (often a UUID — find it via `GET /maestro/api/record-types/{id}`) |

---

## Local Development

```bash
aio app run
```

The UI is served locally at `localhost:9080`, but actions are deployed and run on Adobe I/O Runtime. You can run actions locally with `aio app run --local`, but note that local actions may behave differently from deployed ones.

> **Important:** This extension requires the Workfront UIX host for authentication and context. It cannot be tested via direct localhost access or the Adobe Experience Cloud shell. It must be deployed and accessed through your actual Workfront instance.

---

## Actions Overview

| Action | Description |
|---|---|
| `projectsTableWidget` | Fetches current/requested/on-hold projects for the authenticated user |
| `campaignTimelineWidget` | Fetches active campaigns from Workfront Planning |
| `pendingApprovalsWidget` | Fetches pending object and document approvals for the authenticated user |
| `updateProject` | Updates status or priority on a single project |
| `submitApprovalDecision` | Submits approve/reject decisions for object or UAS document approvals |

---

## Other Commands

```bash
aio app test          # Run unit tests
aio app test --e2e    # Run end-to-end tests
aio app undeploy      # Remove deployed actions and static files
```
