/**
 * Campaign Service - React Query hooks for campaign operations
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Campaign, CreateCampaignFormData, NegotiateCampaignFormData } from '@/lib/validators';

// ============================================
// QUERY KEYS
// ============================================

export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters: string) => [...campaignKeys.lists(), { filters }] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: number) => [...campaignKeys.details(), id] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Get campaigns for current user
 */
export function useGetCampaigns(status?: string) {
  return useQuery({
    queryKey: campaignKeys.list(status || 'all'),
    queryFn: async () => {
      const params = status ? { status } : {};
      const response = await api.get<Campaign[]>('/campaigns/', { params });
      return response.data;
    },
  });
}

/**
 * Get single campaign by ID
 */
export function useGetCampaign(id: number) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<Campaign>(`/campaigns/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create campaign (empresa only)
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCampaignFormData) => {
      const response = await api.post<Campaign>('/campaigns/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

/**
 * Accept campaign (influencer only)
 */
export function useAcceptCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: number) => {
      const response = await api.post<Campaign>(`/campaigns/${campaignId}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

/**
 * Reject campaign (influencer only)
 */
export function useRejectCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: number) => {
      const response = await api.post<Campaign>(`/campaigns/${campaignId}/reject`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

/**
 * Negotiate campaign (influencer only)
 */
export function useNegotiateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, data }: { campaignId: number; data: NegotiateCampaignFormData }) => {
      const response = await api.post<Campaign>(`/campaigns/${campaignId}/negotiate`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

/**
 * Complete campaign (empresa/admin)
 */
export function useCompleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: number) => {
      const response = await api.post<Campaign>(`/campaigns/${campaignId}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}
