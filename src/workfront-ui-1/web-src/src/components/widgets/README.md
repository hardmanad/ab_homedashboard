# Widget Components

This directory contains reusable widget components.

## Structure

Each widget is organized in its own folder with an `index.js` file for clean imports:

```
widgets/
├── AIPoweredActionsWidget/
│   └── index.js
├── AnalyticsWidget/
│   └── index.js
├── CalendarWidget/
│   └── index.js
├── CampaignTimelineWidget/
│   └── index.js
├── HeaderWidget/
│   └── index.js
├── LiveCampaignsWidget/
│   └── index.js
├── MediaInsightsWidget/
│   └── index.js
├── PendingApprovalsWidget/
│   └── index.js
├── QuickActionsWidget/
│   └── index.js
├── RecentActivityWidget/
│   └── index.js
├── TasksWidget/
│   └── index.js
└── TopAssetsWidget/
    └── index.js
```

## Usage

Import widgets using the folder path:

```javascript
import AIPoweredActionsWidget from './widgets/AIPoweredActionsWidget';
import MediaInsightsWidget from './widgets/MediaInsightsWidget';
// etc.
```

## Components Overview

- **AIPoweredActionsWidget**: AI-powered action buttons and PowerBI integration
- **AnalyticsWidget**: Analytics dashboard with charts and metrics
- **CalendarWidget**: Calendar view for scheduling and events
- **CampaignTimelineWidget**: Campaign timeline and progress tracking
- **HeaderWidget**: Header component with navigation
- **LiveCampaignsWidget**: Live campaign monitoring
- **MediaInsightsWidget**: Media performance insights and KPIs
- **PendingApprovalsWidget**: Approval workflow management
- **QuickActionsWidget**: Quick action buttons
- **RecentActivityWidget**: Recent activity feed
- **TasksWidget**: Task management interface
- **TopAssetsWidget**: Top performing assets display

## Notes

- All components use inline styles and CSS classes
- May need CSS adaptation to match your design system
- Components are self-contained with no external dependencies
- Consider adding PropTypes for better type safety 