//import React from 'react';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Flex, View, Heading, Text, ActionButton, ProgressCircle, Provider, defaultTheme } from '@adobe/react-spectrum';
import authTokenManager from '../../utils/authTokenManager';
import actionWebInvoke, { buildActionUrl } from '../../utils/utils';
import { attach } from "@adobe/uix-guest";

const CampaignTimelineWidget = ({ accessToken, hostname }) => {
  //const [accessToken, setAccessToken] = useState('');
  //const [hostname, sethostname] = useState('');
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  /* Need to get data from main myWorkView.js
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
  */

  useEffect(() => {
    if (!accessToken || !hostname) return; // Only run if accessToken and hostname is set and changed
    // You can now use accessToken here
    const fetchData = async () => {
      const actionUrl = buildActionUrl('/api/v1/web/home-dashboard/campaignTimelineWidget');
      const actionHeaders = { 'Authorization': `Bearer ${accessToken}` };
      const actionParams = { 'hostname': hostname };
      const campaignsReq = await actionWebInvoke(actionUrl, actionHeaders, actionParams);
      const myCampaigns = await campaignsReq.json();
      console.log(myCampaigns);
      setMyCampaigns(myCampaigns);
      setIsLoading(false);
    };
    fetchData();
  }, [accessToken, hostname]);
  //console.log(`My IMS Token: ${accessToken}`);

  const staticCampaigns = [
    {
      id: 1,
      name: 'Q1 Digital Marketing Campaign',
      tag: 'Digital',
      person: 'Sarah Chen',
      status: 'on-track',
      budget: 125000,
      spent: 89500,
      progress: 85,
      startDate: 'Dec 2023',
      endDate: 'Jan 2024',
      milestone: 'Dec 31'
    },
    {
      id: 2,
      name: 'Brand Redesign Campaign',
      tag: 'Brand',
      person: 'Mike Johnson',
      status: 'on-track',
      budget: 200000,
      spent: 147000,
      progress: 65,
      startDate: 'Jan 2024',
      endDate: 'Mar 2024',
      milestone: 'Jan 14'
    },
    {
      id: 3,
      name: 'Social Media Blitz',
      tag: 'Social',
      person: 'Emily Davis',
      status: 'at-risk',
      budget: 75000,
      spent: 45000,
      progress: 40,
      startDate: 'Jan 2024',
      endDate: 'Feb 2024',
      milestone: 'Jan 31'
    },
    {
      id: 4,
      name: 'Summer Events Series',
      tag: 'Events',
      person: 'Alex Rodriguez',
      status: 'delayed',
      budget: 180000,
      spent: 67000,
      progress: 25,
      startDate: 'Feb 2024',
      endDate: 'May 2024',
      milestone: 'Feb 14'
    },
    {
      id: 5,
      name: 'Product Launch Campaign',
      tag: 'Digital',
      person: 'Lisa Wang',
      status: 'on-track',
      budget: 300000,
      spent: 52000,
      progress: 15,
      startDate: 'Feb 2024',
      endDate: 'Jun 2024',
      milestone: 'Feb 29'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const objLink = async (workspaceId, recordTypeId, id) => {
    window.top.location.href = `https://${hostname}/maestro/${workspaceId}/${recordTypeId}/${id}/record/details`;
    //window.open(`https://${hostname}/${objType}/${objID}`, "_blank")
    //https://experience.adobe.com/#/@bilbroug/so:bilbroug-Production/workfront/maestro/Ws66c4fc9f266c16020a99ee89/Rt66c4fc9f266c16020a99eec6/Rc6723a34f4ce72669e562b86c/record/details
  }

  const today = new Date().toLocaleDateString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric'
  });

  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  const plusOneYear = `${mm}/${dd}/${yyyy}`;

  if(!myCampaigns.length > 0) {
    myCampaigns = staticCampaigns;
  }
  const campaignCount = myCampaigns.length;

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div>
          <h3 className="widget-title">Campaign Timeline & Budgets</h3>
          <p className="widget-subtitle">{campaignCount} Active Campaigns</p>
        </div>
      </div>

      <div className="timeline-container">
        {/*<div className="timeline-axis">
          <span>Due Timeline: {today} - {plusOneYear}</span>
          <span>Dec 2023</span>
          <span>Jan 2024</span>
          <span>Mar 2024</span>
          <span>Apr 2024</span>
          <span>May 2024</span>
        </div>*/}

        {myCampaigns.map((campaign) => (
          <div key={campaign.id} className="campaign-item">
            <div className="campaign-info">
              <div className="campaign-name" style={{ cursor: 'pointer' }} onClick={() => objLink(campaign.workspaceId, campaign.recordTypeId, campaign.id)}>{campaign.name}
                <br />
                <span className="campaign-due">Due: </span>
                <span className="campaign-endDate">{campaign.endDate}</span>
              </div>
              <div className="campaign-meta">
                <span className={`campaign-tag ${campaign.tag.toLowerCase()}`}>
                  {campaign.tag}
                </span>
                <span>{campaign.person}</span>
                <span className={`campaign-status ${campaign.status}`}>
                  {campaign.status}
                </span>
                <span>{formatCurrency(campaign.spent)}/{formatCurrency(campaign.budget)}</span>
              </div>
            </div>
            <div className="timeline-bar" style={{ width: `${campaign.progress}%` }}>
              <div className={`timeline-bar ${campaign.status}`}></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
            <span>Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
            <span>Upcoming</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
            <span>On Hold</span>
          </div>
        </div>
        {/*<div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Timeline: {today} - {plusOneYear}
        </div>*/}
      </div>
    </div>
  );
};

export default CampaignTimelineWidget; 