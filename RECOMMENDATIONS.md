# Code Review Recommendations

## Security

**`app.config.yaml`** — All four actions have `LOG_LEVEL: debug` hardcoded. That's fine locally but should not deploy to production — debug logs can expose request parameters and tokens.

---

## Hardcoded Values That Should Be Config

These are scattered across the action files and will break silently when the environment changes:

| Location | Value |
|---|---|
| `campaignTimelineWidget` action | Workspace name `"Adobe GenStudio"` |
| `campaignTimelineWidget` action | Status UUID `9a41209d-...` |
| `projectsTableWidget` action | Limit of 10 records |
| `wfPlanningClient.js` | Search limit of 200 |
| `authTokenManager.js` | IMS endpoint URL |

---

## Duplicate Code

`handleStatusChange` and `handlePriorityChange` in `ProjectsTableWidget` are nearly identical — they could be one `handleFieldChange(projectId, field, value)` function.

---

## Incomplete / Stub Widgets

Several widgets render entirely hardcoded mock data with no API connection and no click handlers: `LiveCampaignsWidget`, `MediaInsightsWidget`, `TopAssetsWidget`, `QuickActionsWidget`, `RecentActivityWidget`, `TasksWidget`, `CalendarWidget`, `HeaderWidget`, `AnalyticsWidget`. If these aren't in active development, they're adding noise and bundle weight. Worth either wiring them up or not importing/rendering them until they're ready.
