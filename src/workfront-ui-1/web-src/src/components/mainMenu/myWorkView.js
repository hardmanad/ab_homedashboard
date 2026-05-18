import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Flex, View, Heading, Text, ActionButton, ProgressCircle, Provider, defaultTheme } from '@adobe/react-spectrum';
import CampaignTimelineWidget from '../widgets/CampaignTimelineWidget';
import PendingApprovalsWidget from '../widgets/PendingApprovalsWidget';
import ProjectsTableWidget from '../widgets/ProjectsTableWidget';
import LiveCampaignsWidget from '../widgets/LiveCampaignsWidget';
import MediaInsightsWidget from '../widgets/MediaInsightsWidget';
import TopAssetsWidget from '../widgets/TopAssetsWidget';
import AIPoweredActionsWidget from '../widgets/AIPoweredActionsWidget';
import { attach } from "@adobe/uix-guest";
import authTokenManager from '../utils/authTokenManager';





const MyWorkView = () => {
    const [accessToken, setAccessToken] = useState('');
    const [hostname, sethostname] = useState('');
    useEffect(() => {
      const doAttach = async () => {
        try {
          const conn = await attach({ id: "my-work-view" }); // replace with your actual extensionId
          const auth = conn?.sharedContext?.get("auth");
          const imsToken = auth?.imsToken;
          if (imsToken) {
            authTokenManager.initialize(imsToken);
            setAccessToken(imsToken);
          }
          const hostname = conn?.sharedContext?.get("hostname");
          if (hostname) {
            sethostname(hostname);
          }

        } catch (e) {
          console.error("Failed to attach and get auth token", e);
        }
      };
      doAttach();
    }, []);
    console.log(accessToken);

    return (
        <div className="app">
          {/* Header 
          <header className="header">
            <div className="header-content">
              <div className="header-left">
                <h1 className="header-title">Adobe Workfront</h1>
                <nav className="header-nav">
                  <a href="#" className="nav-link">Projects</a>
                  <a href="#" className="nav-link">Tasks</a>
                  <a href="#" className="nav-link">Reports</a>
                  <a href="#" className="nav-link">Analytics</a>
                </nav>
              </div>
              
              <div className="header-right">
                <div className="header-search">
                  <input 
                    type="text" 
                    placeholder="Search projects, tasks..." 
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>
                <button className="btn btn-ghost" aria-label="Notifications">
                  🔔
                </button>
                <button className="btn btn-ghost" aria-label="Settings">
                  ⚙️
                </button>
                <div className="user-profile">
                  <div className="user-avatar">JD</div>
                </div>
              </div>
            </div>
          </header>
          */}
          {/* Main Content */}
          <main className="main-content">
            <div className="content-wrapper">
              {/* Top Section - Campaign Timeline & Pending Approvals */}
              <div className="top-section">
                <div className="campaign-timeline-section">
                  <CampaignTimelineWidget accessToken={accessToken} hostname={hostname} />
                </div>
                <div className="pending-approvals-section">
                  <PendingApprovalsWidget accessToken={accessToken} hostname={hostname} />
                </div>
              </div>
    
              {/* Projects Table Section - Full Width */}
              <div className="full-width-section">
                <ProjectsTableWidget accessToken={accessToken} hostname={hostname} />
              </div>
    
              {/* Middle Section - Live Campaigns & Media Insights */}
              <div className="middle-section">
                <div className="live-campaigns-section">
                  <LiveCampaignsWidget />
                </div>
                <div className="media-insights-section">
                  <MediaInsightsWidget />
                </div>
              </div>
    
              {/* Bottom Section - Top Assets & AI Actions */}
              <div className="bottom-section">
                <div className="top-assets-section">
                  <TopAssetsWidget />
                </div>
                <div className="ai-actions-section">
                  <AIPoweredActionsWidget />
                </div>
              </div>
            </div>
          </main>
        </div>
      );
};

export default MyWorkView;