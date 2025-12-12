# Ticket 07: Insights & Performance Metrics Dashboard

## Overview
Build an Insights view that displays performance metrics and usage analytics, helping users validate their hardware investment. Show tokens per second, FLOPS, usage trends, and other metrics that demonstrate cluster capabilities.

## Prototype Requirements

### Access Point
- "Insights" item in sidebar navigation (near Settings)
- Icon: chart/graph icon

### Insights Dashboard Layout
- Header with title and date range selector
- Grid of metric cards for key stats
- Larger charts for trend data below

### Key Metrics Cards
Display as prominent cards at top:
- **Tokens/Second**: Current and average (e.g., "1,247 tok/s avg")
- **Total Queries**: Count this period (e.g., "3,847 queries")
- **Compute Utilization**: Percentage (e.g., "34% avg")
- **Uptime**: Percentage and duration (e.g., "99.9% • 47 days")

### Charts & Visualizations

**Usage Over Time**
- Line chart showing queries or compute usage
- Selectable time range: 24h, 7d, 30d, 90d
- Hoverable data points with exact values

**Performance Distribution**
- Bar chart or histogram of response times
- Show distribution of fast vs. slow queries

**Model Usage Breakdown**
- Pie or bar chart showing which models are used most
- Click to filter other metrics by model

### Data Export
- "Export" button in header
- Options: CSV, PDF report
- Mock download functionality

### Real-Time Indicator
- Show "Live" badge if displaying real-time data
- Last updated timestamp

## Technical Notes
- Use charting library (Recharts recommended for React)
- Generate realistic mock data with some variance
- Consider skeleton loading states
```javascript
// Example metrics data
{
  tokensPerSecond: { current: 1892, average: 1247 },
  totalQueries: 3847,
  computeUtilization: 34,
  uptime: { percentage: 99.9, days: 47 },
  usageHistory: [
    { date: "2024-01-15", queries: 423, avgTokens: 1200 },
    { date: "2024-01-16", queries: 512, avgTokens: 1350 },
    // ...
  ]
}
```

## Acceptance Criteria
- [ ] Insights page accessible from navigation
- [ ] Key metrics display in card format
- [ ] At least one interactive chart with time range selection
- [ ] Data can be "exported" (mock download)
- [ ] Responsive layout for different screen sizes