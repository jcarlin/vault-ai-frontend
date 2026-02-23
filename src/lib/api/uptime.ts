import type {
  UptimeSummaryResponse,
  UptimeEventsResponse,
  AvailabilityResponse,
} from '@/types/api';
import { apiGet } from './client';

export async function getUptimeSummary(
  signal?: AbortSignal,
): Promise<UptimeSummaryResponse> {
  return apiGet<UptimeSummaryResponse>('/vault/system/uptime', signal);
}

export async function getUptimeEvents(
  params?: {
    service?: string;
    since_hours?: number;
    limit?: number;
    offset?: number;
  },
  signal?: AbortSignal,
): Promise<UptimeEventsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.service) searchParams.set('service', params.service);
  if (params?.since_hours) searchParams.set('since_hours', String(params.since_hours));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  const qs = searchParams.toString();
  return apiGet<UptimeEventsResponse>(
    `/vault/system/uptime/events${qs ? `?${qs}` : ''}`,
    signal,
  );
}

export async function getAvailability(
  params?: { service?: string; window?: number },
  signal?: AbortSignal,
): Promise<AvailabilityResponse> {
  const searchParams = new URLSearchParams();
  if (params?.service) searchParams.set('service', params.service);
  if (params?.window) searchParams.set('window', String(params.window));
  const qs = searchParams.toString();
  return apiGet<AvailabilityResponse>(
    `/vault/system/uptime/availability${qs ? `?${qs}` : ''}`,
    signal,
  );
}
