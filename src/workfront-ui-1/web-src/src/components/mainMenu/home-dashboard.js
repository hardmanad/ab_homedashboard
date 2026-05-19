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




const HomeDashboard = () => {
    const [accessToken, setAccessToken] = useState('');
    const [hostname, sethostname] = useState('');
    useEffect(() => {
      const doAttach = async () => {
        try {
          const conn = await attach({ id: "home-dashboard" });
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

    return (
        <div className="app">
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

export default HomeDashboard;
