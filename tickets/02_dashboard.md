# Ticket 02: Dashboard & Cluster Health Visualization

## Overview
Build the dashboard view that displays cluster health status alongside the chat interface. The dashboard should be minimal, with cluster health as the primary non-chat element, providing at-a-glance status of connected hardware cubes.

## Prototype Requirements

### Layout
- Split view or overlay approach with chat remaining accessible
- Cluster visualization as a compact widget (corner or header placement)
- Clean, minimal aesthetic—avoid widget overload

### Cluster Visualization
- Visual representation of connected cubes (e.g., 1-8 cube grid)
- Each cube displayed as a simple card or icon
- Show cube identifier/name on each unit
- Visual grouping to indicate cluster relationship

### Health Status Display
- Aggregate health indicator for entire cluster (e.g., "All Systems Operational")
- Individual cube health shown via color coding or status icon:
  - Healthy: Green or neutral state
  - Warning: Yellow/amber state
  - Error: Red state
- Temperature, load, or other metrics shown on hover or drill-down

### Drill-Down Capability
- Clicking a cube or "View Details" expands health information
- Detailed view shows:
  - CPU/GPU utilization
  - Memory usage
  - Temperature
  - Uptime
  - Current task (if any)

### States to Design
- All healthy (default state)
- One cube with warning
- One cube with error/offline
- Empty state (no cubes connected—edge case)

## Technical Notes
- Create reusable CubeCard component
- Use mock data for cluster status
- Consider real-time update simulation (status changes every 30s)
- Health data structure example:

```javascript
{
cubes: [
{ id: "cube-01", name: "Cube 1", status: "healthy", temp: 42, load: 23 },
{ id: "cube-02", name: "Cube 2", status: "healthy", temp: 45, load: 67 }
],
aggregateStatus: "healthy"
}
```

## Acceptance Criteria
- [ ] Cluster visualization displays all connected cubes
- [ ] Health status is clearly communicated via visual indicators
- [ ] Clicking a cube shows detailed metrics
- [ ] Aggregate status reflects worst-case individual status
- [ ] Dashboard coexists with chat interface without conflict