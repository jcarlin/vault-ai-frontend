import { useState, useEffect, useCallback } from 'react';
import {
  type ClusterHealth,
  type CubeMetrics,
  type CubeStatus,
  mockCluster,
  getAggregateStatus,
} from '@/mocks/cluster';

function randomVariation(base: number, variance: number, min = 0, max = 100): number {
  const change = (Math.random() - 0.5) * 2 * variance;
  return Math.max(min, Math.min(max, Math.round(base + change)));
}

function simulateCubeMetrics(cube: CubeMetrics): CubeMetrics {
  const newTemp = randomVariation(cube.temperature, 3, 30, 90);
  const newCpuLoad = randomVariation(cube.cpuLoad, 10, 5, 100);
  const newGpuLoad = randomVariation(cube.gpuLoad, 8, 5, 100);

  // Determine status based on metrics
  let status: CubeStatus = 'healthy';
  if (newTemp > 75 || newCpuLoad > 90 || newGpuLoad > 95) {
    status = 'warning';
  }
  if (newTemp > 85 || (newCpuLoad > 95 && newGpuLoad > 95)) {
    status = 'error';
  }

  return {
    ...cube,
    temperature: newTemp,
    cpuLoad: newCpuLoad,
    gpuLoad: newGpuLoad,
    uptime: cube.uptime + 30,
    status,
  };
}

export function useClusterHealth(updateIntervalMs = 30000): ClusterHealth {
  const [cluster, setCluster] = useState<ClusterHealth>(mockCluster);

  const simulateUpdate = useCallback(() => {
    setCluster((prev) => {
      const updatedCubes = prev.cubes.map(simulateCubeMetrics);
      return {
        cubes: updatedCubes,
        aggregateStatus: getAggregateStatus(updatedCubes),
      };
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(simulateUpdate, updateIntervalMs);
    return () => clearInterval(interval);
  }, [simulateUpdate, updateIntervalMs]);

  return cluster;
}
