// backend/routes/media-performance.js
const express = require('express');
const Papa = require('papaparse');
const fs = require('fs').promises;
const _ = require('lodash');
const router = express.Router();

// Generate stock-style ticker from partner name
function generateTicker(partnerName) {
  if (!partnerName) return 'UNK';
  
  // Handle special cases first (real stock tickers)
  const specialCases = {
    'Google': 'GOOGL',
    'Meta': 'META',
    'Facebook': 'META',
    'Microsoft': 'MSFT',
    'Amazon': 'AMZN',
    'Apple': 'AAPL',
    'Netflix': 'NFLX',
    'Tesla': 'TSLA',
    'Snapchat': 'SNAP',
    'Twitter': 'TWTR',
    'LinkedIn': 'LNKD',
    'Pinterest': 'PINS',
    'TikTok': 'TKTK',
    'YouTube': 'YTBE',
    'Instagram': 'INST',
    'WhatsApp': 'WHAP',
    'Spotify': 'SPOT',
    'Uber': 'UBER',
    'Airbnb': 'ABNB',
    'The Trade Desk': 'TTD',
    'Trade Desk': 'TTD',
    'Adobe': 'ADBE',
    'Salesforce': 'CRM',
    'Oracle': 'ORCL',
    'IBM': 'IBM',
    'Intel': 'INTC',
    'NVIDIA': 'NVDA',
    'AMD': 'AMD',
    'Roku': 'ROKU',
    'Disney': 'DIS',
    'Paramount': 'PARA',
    'Warner Bros': 'WBD',
    'Comcast': 'CMCSA',
    'Verizon': 'VZ',
    'AT&T': 'T'
  };
  
  // Check if it's a special case
  if (specialCases[partnerName]) {
    return specialCases[partnerName];
  }
  
  // Clean the name: remove common business terms
  const cleanName = partnerName
    .replace(/\b(Inc|LLC|Corp|Corporation|Company|Co|Ltd|Limited|Group|Media|Digital|Marketing|Advertising|Agency|Solutions|Technologies|Tech|Systems|Services|Partners|Holdings)\b/gi, '')
    .trim();
  
  // Split into words and filter out empty strings
  const words = cleanName.split(/[\s\-\_\.]+/).filter(word => word.length > 0);
  
  if (words.length === 0) {
    // Fallback: use first 4 chars of original name
    return partnerName.substring(0, 4).toUpperCase();
  }
  
  if (words.length === 1) {
    const word = words[0];
    if (word.length <= 4) {
      return word.toUpperCase();
    } else {
      // Take first and last 2 characters for longer single words
      return (word.substring(0, 2) + word.substring(word.length - 2)).toUpperCase();
    }
  }
  
  // Multiple words: create ticker from initials or strategic combinations
  if (words.length === 2) {
    const [first, second] = words;
    if (first.length >= 2 && second.length >= 2) {
      return (first.substring(0, 2) + second.substring(0, 2)).toUpperCase();
    } else {
      return (first.substring(0, 3) + second.substring(0, 1)).toUpperCase();
    }
  }
  
  if (words.length === 3) {
    // Three words: take first letter of each + first letter of first word
    return (words[0].charAt(0) + words[1].charAt(0) + words[2].charAt(0) + words[0].charAt(1)).toUpperCase();
  }
  
  // More than 3 words: take first letter of first 4 words
  return words.slice(0, 4).map(word => word.charAt(0)).join('').toUpperCase();
}

// Utility function to add year and week fields
function addYearWeek(row) {
  const [month, day, year] = row['week-date'].split('/').map(Number);
  const date = new Date(year, month - 1, day);
  const startOfYear = new Date(year, 0, 1);
  const daysSinceStart = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
  
  return {
    ...row,
    year,
    week: weekNumber,
    yearWeek: `${year}-W${weekNumber.toString().padStart(2, '0')}`
  };
}

// Load and parse CSV data with caching
let cachedData = null;
async function loadData() {
  if (cachedData) return cachedData;
  
  const fileContent = await fs.readFile('./data/mediacontribution.csv', 'utf8');
  const parsed = Papa.parse(fileContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  });
  
  // Add year, week fields and sort by date
  cachedData = parsed.data
    .map(addYearWeek)
    .sort((a, b) => a.yearWeek.localeCompare(b.yearWeek));
  
  return cachedData;
}

// Filter data by period (last N weeks)
function filterByPeriod(data, weeks) {
  const uniqueWeeks = _.uniqBy(data, 'yearWeek')
    .sort((a, b) => b.yearWeek.localeCompare(a.yearWeek))
    .slice(0, weeks)
    .map(d => d.yearWeek);
  
  return data.filter(row => uniqueWeeks.includes(row.yearWeek));
}

// Aggregate function that handles total-sales-week correctly
function aggregateData(data, groupByFields, sumFields = ['spend', 'impressions', 'clicks', 'sales']) {
  const grouped = _.groupBy(data, row => 
    groupByFields.map(field => row[field]).join('|')
  );
  
  return Object.entries(grouped).map(([key, rows]) => {
    const keyParts = key.split('|');
    const groupFields = Object.fromEntries(
      groupByFields.map((field, i) => [field, keyParts[i]])
    );
    
    // Sum all regular fields
    const sums = sumFields.reduce((acc, field) => {
      acc[field] = _.sumBy(rows, field) || 0;
      return acc;
    }, {});
    
    // Handle total-sales-week: take unique value per week, then sum
    const weeklyTotalSales = _.uniqBy(rows, 'yearWeek')
      .reduce((sum, row) => sum + (row['total-sales-week'] || 0), 0);
    
    // Calculate derived metrics
    const metrics = {
      roas: sums.spend > 0 ? sums.sales / sums.spend : 0,
      ctr: sums.impressions > 0 ? sums.clicks / sums.impressions : 0,
      cpc: sums.clicks > 0 ? sums.spend / sums.clicks : 0,
      cpm: sums.impressions > 0 ? (sums.spend / sums.impressions) * 1000 : 0,
      effectiveness: sums.impressions > 0 ? sums.sales / sums.impressions : 0
    };
    
    // Count unique values for key dimensions
    const uniqueCounts = {
      uniqueCampaigns: _.uniq(rows.map(row => row.campaign)).length,
      uniquePartners: _.uniq(rows.map(row => row.partner)).length,
      uniqueChannels: _.uniq(rows.map(row => row.channel)).length,
      uniqueTactics: _.uniq(rows.map(row => row.tactic)).length
    };
    
    return {
      ...groupFields,
      ...sums,
      'total-sales-period': weeklyTotalSales,
      ...metrics,
      ...uniqueCounts,
      recordCount: rows.length,
      weekCount: _.uniqBy(rows, 'yearWeek').length
    };
  });
}

// Route 1: Partner Performance Summary with Ticker
router.get('/partners', async (req, res) => {
  try {
    const { period = 12 } = req.query;
    const data = await loadData();
    const filteredData = filterByPeriod(data, parseInt(period));
    
    const partnerPerformance = aggregateData(filteredData, ['partner'])
      .map(partner => ({
        ...partner,
        ticker: generateTicker(partner.partner), // Add ticker to each partner
        // Calculate media contribution percentage
        contribution: partner['total-sales-period'] > 0 
          ? (partner.sales / partner['total-sales-period']) * 100 
          : 0,
        // Ensure CPM and effectiveness are calculated for each partner
        cpm: partner.impressions > 0 ? (partner.spend / partner.impressions) * 1000 : 0,
        effectiveness: partner.impressions > 0 ? partner.sales / partner.impressions : 0
      }))
      .sort((a, b) => b.roas - a.roas);
    
    res.json({
      period: `Last ${period} weeks`,
      totalPartners: partnerPerformance.length,
      data: partnerPerformance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route 2: Partner-Tactic Performance
router.get('/partner-tactics', async (req, res) => {
  try {
    const { period = 12, partner } = req.query;
    const data = await loadData();
    let filteredData = filterByPeriod(data, parseInt(period));
    
    // Filter by partner if specified
    if (partner) {
      filteredData = filteredData.filter(row => row.partner === partner);
    }
    
    const partnerTacticPerformance = aggregateData(filteredData, ['partner', 'tactic'])
      .sort((a, b) => b.spend - a.spend);
    
    res.json({
      period: `Last ${period} weeks`,
      partner: partner || 'All',
      data: partnerTacticPerformance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route 3: Weekly Trend Performance
router.get('/trends', async (req, res) => {
  try {
    const { period = 12, groupBy = 'week' } = req.query;
    const data = await loadData();
    const filteredData = filterByPeriod(data, parseInt(period));
    
    let groupFields;
    if (groupBy === 'week') {
      groupFields = ['yearWeek', 'week-date'];
    } else if (groupBy === 'channel') {
      groupFields = ['yearWeek', 'week-date', 'channel'];
    } else if (groupBy === 'partner') {
      groupFields = ['yearWeek', 'week-date', 'partner'];
    }
    
    const weeklyTrends = aggregateData(filteredData, groupFields)
      .sort((a, b) => a.yearWeek.localeCompare(b.yearWeek));
    
    // Calculate week-over-week changes
    const trendsWithChanges = weeklyTrends.map((week, index) => {
      const prevWeek = weeklyTrends[index - 1];
      const changes = {};
      
      if (prevWeek) {
        ['spend', 'impressions', 'clicks', 'sales', 'roas'].forEach(metric => {
          const current = week[metric] || 0;
          const previous = prevWeek[metric] || 0;
          changes[`${metric}_change`] = previous > 0 ? ((current - previous) / previous) * 100 : 0;
        });
      }
      
      return { ...week, ...changes };
    });
    
    res.json({
      period: `Last ${period} weeks`,
      groupBy,
      data: trendsWithChanges
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route 4: Channel Performance Deep Dive
router.get('/channels', async (req, res) => {
  try {
    const { period = 12 } = req.query;
    const data = await loadData();
    const filteredData = filterByPeriod(data, parseInt(period));
    
    // Multi-level aggregation: channel -> subchannel -> campaign
    const channelHierarchy = {};
    
    // Group by channel first
    const byChannel = aggregateData(filteredData, ['channel']);
    
    for (const channelData of byChannel) {
      const channelRows = filteredData.filter(row => row.channel === channelData.channel);
      
      // Get subchannels within this channel
      const subchannels = aggregateData(channelRows, ['channel', 'subchannel']);
      
      // Get top campaigns within this channel
      const campaigns = aggregateData(channelRows, ['channel', 'campaign'])
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 5); // Top 5 campaigns
      
      channelHierarchy[channelData.channel] = {
        ...channelData,
        subchannels,
        topCampaigns: campaigns
      };
    }
    
    res.json({
      period: `Last ${period} weeks`,
      data: channelHierarchy
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route 5: Global Metrics Summary (for dashboard KPIs)
router.get('/global-metrics', async (req, res) => {
  try {
    const { period = 12 } = req.query;
    const periodWeeks = parseInt(period);
    const data = await loadData();
    
    // Get current period data
    const currentPeriodData = filterByPeriod(data, periodWeeks);
    
    // Get period-over-period comparison data (previous N weeks)
    const periodOverPeriodData = filterByPeriod(data, periodWeeks * 2)
      .filter(row => !filterByPeriod(data, periodWeeks).find(current => current.yearWeek === row.yearWeek));
    
    // Get year-over-year comparison data
    const getYearOverYearData = () => {
      // Get the weeks from current period
      const currentWeeks = _.uniqBy(currentPeriodData, 'yearWeek')
        .map(row => ({ 
          year: row.year, 
          week: row.week, 
          yearWeek: row.yearWeek 
        }));
      
      // Find corresponding weeks from previous year(s)
      const previousYearWeeks = currentWeeks.map(current => {
        const prevYear = current.year - 1;
        return `${prevYear}-W${current.week.toString().padStart(2, '0')}`;
      });
      
      return data.filter(row => previousYearWeeks.includes(row.yearWeek));
    };
    
    const yearOverYearData = getYearOverYearData();
    
    // Calculate aggregations for all three periods
    const currentSummary = aggregateData(currentPeriodData, [])[0] || {};
    const popSummary = aggregateData(periodOverPeriodData, [])[0] || {};
    const yoyPrevSummary = aggregateData(yearOverYearData, [])[0] || {};
    
    // Ensure we have effectiveness and cpm in the summary
    if (currentSummary.impressions > 0) {
      currentSummary.effectiveness = currentSummary.sales / currentSummary.impressions;
      currentSummary.cpm = (currentSummary.spend / currentSummary.impressions) * 1000;
    } else {
      currentSummary.effectiveness = 0;
      currentSummary.cpm = 0;
    }
    
    // Calculate percentage changes
    const calculateChange = (current, previous, field) => {
      const currentVal = current[field] || 0;
      const prevVal = previous[field] || 0;
      
      if (prevVal === 0) return currentVal > 0 ? 100 : 0;
      return ((currentVal - prevVal) / prevVal) * 100;
    };
    
    // Calculate percentage point changes for ratios
    const calculatePercentagePointChange = (currentRatio, previousRatio) => {
      if (currentRatio === null || currentRatio === undefined || 
          previousRatio === null || previousRatio === undefined) return null;
      return (currentRatio * 100) - (previousRatio * 100); // Convert to percentage points
    };
    
    // Calculate media contribution ratios
    const currentMediaContribution = currentSummary['total-sales-period'] > 0 
      ? currentSummary.sales / currentSummary['total-sales-period'] 
      : 0;
    
    const popMediaContribution = popSummary['total-sales-period'] > 0 
      ? popSummary.sales / popSummary['total-sales-period'] 
      : 0;
    
    // Period-over-Period analysis
    const periodOverPeriod = {
      current: {
        period: `Last ${periodWeeks} weeks`,
        weeks: _.uniq(currentPeriodData.map(row => row.yearWeek)).length,
        spend: currentSummary.spend || 0,
        sales: currentSummary.sales || 0,
        impressions: currentSummary.impressions || 0,
        clicks: currentSummary.clicks || 0,
        roas: currentSummary.roas || 0,
        ctr: currentSummary.ctr || 0
      },
      previous: {
        period: `Previous ${periodWeeks} weeks`,
        weeks: _.uniq(periodOverPeriodData.map(row => row.yearWeek)).length,
        spend: popSummary.spend || 0,
        sales: popSummary.sales || 0,
        impressions: popSummary.impressions || 0,
        clicks: popSummary.clicks || 0,
        roas: popSummary.roas || 0,
        ctr: popSummary.ctr || 0
      },
      changes: {
        spend: calculateChange(currentSummary, popSummary, 'spend'),
        sales: calculateChange(currentSummary, popSummary, 'sales'),
        impressions: calculateChange(currentSummary, popSummary, 'impressions'),
        clicks: calculateChange(currentSummary, popSummary, 'clicks'),
        roas: calculateChange(currentSummary, popSummary, 'roas'),
        ctr: calculateChange(currentSummary, popSummary, 'ctr'),
        mediaContributionPoints: calculatePercentagePointChange(currentMediaContribution, popMediaContribution)
      }
    };
    
    // Calculate media contribution ratios for YoY as well
    const yoyMediaContribution = yoyPrevSummary['total-sales-period'] > 0 
      ? yoyPrevSummary.sales / yoyPrevSummary['total-sales-period'] 
      : 0;
    
    // Year-over-Year analysis
    const yearOverYear = {
      current: {
        period: `Last ${periodWeeks} weeks (${new Date().getFullYear()})`,
        weeks: _.uniq(currentPeriodData.map(row => row.yearWeek)).length,
        spend: currentSummary.spend || 0,
        sales: currentSummary.sales || 0,
        impressions: currentSummary.impressions || 0,
        clicks: currentSummary.clicks || 0,
        roas: currentSummary.roas || 0,
        ctr: currentSummary.ctr || 0
      },
      previous: {
        period: `Same ${periodWeeks} weeks (${new Date().getFullYear() - 1})`,
        weeks: _.uniq(yearOverYearData.map(row => row.yearWeek)).length,
        spend: yoyPrevSummary.spend || 0,
        sales: yoyPrevSummary.sales || 0,
        impressions: yoyPrevSummary.impressions || 0,
        clicks: yoyPrevSummary.clicks || 0,
        roas: yoyPrevSummary.roas || 0,
        ctr: yoyPrevSummary.ctr || 0
      },
      changes: {
        spend: calculateChange(currentSummary, yoyPrevSummary, 'spend'),
        sales: calculateChange(currentSummary, yoyPrevSummary, 'sales'),
        impressions: calculateChange(currentSummary, yoyPrevSummary, 'impressions'),
        clicks: calculateChange(currentSummary, yoyPrevSummary, 'clicks'),
        roas: calculateChange(currentSummary, yoyPrevSummary, 'roas'),
        ctr: calculateChange(currentSummary, yoyPrevSummary, 'ctr'),
        mediaContributionPoints: calculatePercentagePointChange(currentMediaContribution, yoyMediaContribution)
      }
    };
    
    // Additional insights
    const insights = {
      activePartners: _.uniq(currentPeriodData.map(row => row.partner)).length,
      activeCampaigns: _.uniq(currentPeriodData.map(row => row.campaign)).length,
      activeChannels: _.uniq(currentPeriodData.map(row => row.channel)).length,
      weeksIncluded: _.uniq(currentPeriodData.map(row => row.yearWeek)).length,
      
      // Date range for the filtered period
      dateRange: (() => {
        const dates = currentPeriodData.map(row => new Date(row['week-date'])).sort((a, b) => a - b);
        return {
          start: dates[0]?.toISOString() || null,
          end: dates[dates.length - 1]?.toISOString() || null
        };
      })(),
      
      // Top performers
      topPartner: aggregateData(currentPeriodData, ['partner'])
        .sort((a, b) => b.spend - a.spend)[0],
      topCampaign: aggregateData(currentPeriodData, ['campaign'])
        .sort((a, b) => b.spend - a.spend)[0],
      
      // Performance distribution
      channelBreakdown: aggregateData(currentPeriodData, ['channel'])
        .map(ch => ({ 
          channel: ch.channel, 
          spendShare: currentSummary.spend > 0 ? (ch.spend / currentSummary.spend) * 100 : 0,
          salesShare: currentSummary.sales > 0 ? (ch.sales / currentSummary.sales) * 100 : 0
        }))
    };
    
    res.json({
      period: `Last ${period} weeks`,
      summary: currentSummary,
      insights,
      periodOverPeriod,
      yearOverYear
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route 6: Period Comparisons (detailed breakdown)
router.get('/comparisons', async (req, res) => {
  try {
    const { period = 12 } = req.query;
    const periodWeeks = parseInt(period);
    const data = await loadData();
    
    // Get all weeks sorted
    const allWeeksSorted = _.uniqBy(data, 'yearWeek')
      .sort((a, b) => b.yearWeek.localeCompare(a.yearWeek));
    
    // Current period data
    const currentWeeks = allWeeksSorted.slice(0, periodWeeks);
    const currentData = data.filter(row => 
      currentWeeks.some(week => week.yearWeek === row.yearWeek)
    );
    
    // Period-over-period data
    const popWeeks = allWeeksSorted.slice(periodWeeks, periodWeeks * 2);
    const popData = data.filter(row => 
      popWeeks.some(week => week.yearWeek === row.yearWeek)
    );
    
    // Year-over-year data
    const currentYearWeeks = currentWeeks.map(week => ({
      year: week.year,
      week: week.week
    }));
    
    const previousYearWeeks = currentYearWeeks.map(current => {
      const prevYear = current.year - 1;
      return `${prevYear}-W${current.week.toString().padStart(2, '0')}`;
    });
    
    const yoyData = data.filter(row => previousYearWeeks.includes(row.yearWeek));
    
    // Detailed breakdown
    res.json({
      periodWeeks,
      current: {
        weeks: currentWeeks.map(w => w.yearWeek),
        weekRange: `${currentWeeks[currentWeeks.length-1]?.yearWeek} to ${currentWeeks[0]?.yearWeek}`,
        recordCount: currentData.length,
        summary: aggregateData(currentData, [])[0] || {}
      },
      periodOverPeriod: {
        weeks: popWeeks.map(w => w.yearWeek),
        weekRange: popWeeks.length > 0 ? `${popWeeks[popWeeks.length-1]?.yearWeek} to ${popWeeks[0]?.yearWeek}` : 'No data',
        recordCount: popData.length,
        summary: aggregateData(popData, [])[0] || {}
      },
      yearOverYear: {
        targetWeeks: previousYearWeeks,
        foundWeeks: _.uniqBy(yoyData, 'yearWeek').map(w => w.yearWeek),
        recordCount: yoyData.length,
        summary: aggregateData(yoyData, [])[0] || {}
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bonus Route: Standalone Ticker Endpoint
router.get('/tickers', async (req, res) => {
  try {
    const data = await loadData();
    const uniquePartners = _.uniq(data.map(row => row.partner));
    
    const tickers = uniquePartners.map(partner => ({
      partner,
      ticker: generateTicker(partner)
    }));
    
    res.json({
      tickers: tickers.sort((a, b) => a.partner.localeCompare(b.partner))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;