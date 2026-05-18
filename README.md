# Home Dashboard

A demo Adobe Workfront Main Menu Extension showcasing a custom dashboard with interactive widgets.

## Overview

This project demonstrates how to create a **Main Menu Item** for Adobe Workfront that provides users with a comprehensive custom dashboard experience. The extension adds a new menu item to Workfront's main navigation that opens a full-featured dashboard containing various widgets for enhanced productivity and insights.

## Features

### 🎯 **Main Menu Integration**
- Seamlessly integrates with Adobe Workfront's main navigation
- Provides a custom route (`/my-work-view`) accessible from the main menu
- Maintains Workfront's design language and user experience

### 📊 **Custom Dashboard with Widgets**
The dashboard includes a collection of reusable widget components:

- **Campaign Timeline Widget** - Visual timeline for campaign progress tracking
- **Pending Approvals Widget** - Streamlined approval workflow management
- **Live Campaigns Widget** - Real-time campaign monitoring and status
- **Media Insights Widget** - Performance metrics and analytics dashboard
- **Top Assets Widget** - Showcase of high-performing assets
- **AI-Powered Actions Widget** - Smart action buttons with PowerBI integration

### 🏗️ **Architecture**
- **React 18** with modern `createRoot` API
- **Error Boundary** for robust error handling
- **Modular Widget System** - Each widget in its own folder for maintainability
- **Responsive Design** - Works across different screen sizes
- **Adobe I/O Runtime** integration for backend services

## Setup

- Populate the `.env` file in the project root and fill it as shown [below](#env)

## Setup

- Populate the `.env` file in the project root and fill it as shown [below](#env)

## Local Development

- `aio app run` to start your local Dev server
- App will run on `localhost:9080` by default

**⚠️ Important**: This is a **Workfront UI Extension** that requires the Adobe Workfront environment to function properly. The extension cannot be tested directly via localhost because it depends on the Workfront UIX-Host for authentication, context, and message passing.

## Testing & Deployment

### **Local Development Workflow:**
1. `aio app run` - Start local development server
2. Make code changes and see them reflected in real-time
3. Deploy when ready for testing

### **Deploy to Adobe I/O Runtime:**
```bash
aio app deploy
```

### **Configure in Workfront:**
1. Go to your Adobe Workfront instance
2. Navigate to **Setup → Extensibility → UI Extensions**
3. Configure your extension to point to the deployed URL
4. Add it as a **Main Menu item** in Workfront's navigation

### **Test in Workfront Environment:**
- The extension will only work when loaded within the actual Workfront interface
- Access your custom dashboard through the Main Menu item in Workfront
- The extension requires Workfront's UIX-Host context and authentication

**Note**: The extension cannot be tested via:
- Direct localhost access (`http://localhost:9080/my-work-view`)
- Adobe Experience Cloud shell (`https://experience.adobe.com/?devMode=true#/custom-apps/?localDevUrl=https://localhost:9080`)

It must be deployed and configured within the actual Workfront environment.

## Widget System

The project includes a modular widget system located in `src/workfront-ui-1/web-src/src/components/widgets/`. Each widget is organized in its own folder with an `index.js` file for clean imports.

### Available Widgets
- `AIPoweredActionsWidget/` - AI-powered action buttons
- `AnalyticsWidget/` - Analytics dashboard with charts
- `CalendarWidget/` - Calendar view for scheduling
- `CampaignTimelineWidget/` - Campaign timeline and progress
- `HeaderWidget/` - Header component with navigation
- `LiveCampaignsWidget/` - Live campaign monitoring
- `MediaInsightsWidget/` - Media performance insights
- `PendingApprovalsWidget/` - Approval workflow management
- `QuickActionsWidget/` - Quick action buttons
- `RecentActivityWidget/` - Recent activity feed
- `TasksWidget/` - Task management interface
- `TopAssetsWidget/` - Top performing assets display

### Using Widgets
```javascript
import AIPoweredActionsWidget from './widgets/AIPoweredActionsWidget';
import MediaInsightsWidget from './widgets/MediaInsightsWidget';
// etc.
```

By default the UI will be served locally but actions will be deployed and served from Adobe I/O Runtime. To start a
local serverless stack and also run your actions locally use the `aio app run --local` option.

## Test & Coverage

- Run `aio app test` to run unit tests for ui and actions
- Run `aio app test --e2e` to run e2e tests

## Deploy & Cleanup

- `aio app deploy` to build and deploy all actions on Runtime and static files to CDN
- `aio app undeploy` to undeploy the app

## Config

### `.env`

You can generate this file using the command `aio app use`. 

```bash
# This file must **not** be committed to source control

## please provide your Adobe I/O Runtime credentials
# AIO_RUNTIME_AUTH=
# AIO_RUNTIME_NAMESPACE=
# Hostname only for static and runtime action endpoint construction
# AIO_STATIC_HOST=YOUR_NAMESPACE.adobeio-static.net
```

### `app.config.yaml`

- Main configuration file that defines an application's implementation. 
- More information on this file, application configuration, and extension configuration 
  can be found [here](https://developer.adobe.com/app-builder/docs/guides/appbuilder-configuration/#appconfigyaml)

#### Action Dependencies

- You have two options to resolve your actions' dependencies:

  1. **Packaged action file**: Add your action's dependencies to the root
   `package.json` and install them using `npm install`. Then set the `function`
   field in `app.config.yaml` to point to the **entry file** of your action
   folder. We will use `webpack` to package your code and dependencies into a
   single minified js file. The action will then be deployed as a single file.
   Use this method if you want to reduce the size of your actions.

  2. **Zipped action folder**: In the folder containing the action code add a
     `package.json` with the action's dependencies. Then set the `function`
     field in `app.config.yaml` to point to the **folder** of that action. We will
     install the required dependencies within that directory and zip the folder
     before deploying it as a zipped action. Use this method if you want to keep
     your action's dependencies separated.

## Debugging in VS Code

While running your local server (`aio app run`), both UI and actions can be debugged, to do so open the vscode debugger
and select the debugging configuration called `WebAndActions`.
Alternatively, there are also debug configs for only UI and each separate action.

## Typescript support for UI

To use typescript use `.tsx` extension for react components and add a `tsconfig.json` 
and make sure you have the below config added
```
 {
  "compilerOptions": {
      "jsx": "react"
    }
  } 
```
