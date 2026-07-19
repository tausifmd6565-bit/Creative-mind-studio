/**
 * services/review.service.ts
 *
 * Review & Approval Room — review sessions, annotations, and approval chains.
 */

import { apiClient } from '../lib/api/client';
import { REVIEWS } from '../lib/api/endpoints';
import { API_CONFIG } from '../config/api.config';
import type {
  Review,
  Annotation,
  CreateReviewPayload,
  SubmitApprovalDecisionPayload,
  AddAnnotationPayload,
} from '../types';

// ─── Mock adapter ─────────────────────────────────────────────────────────────

const mockReview = {
  async list(_p: string): Promise<Review[]> { return []; },
  async getById(_p: string, _rid: string): Promise<Review | null> { return null; },
  async create(_p: CreateReviewPayload): Promise<Review> { return {} as Review; },
  async update(_p: string, _rid: string, _d: Partial<Review>): Promise<Review> { return {} as Review; },
  async approve(_p: string, _rid: string, _payload: SubmitApprovalDecisionPayload): Promise<Review> { return {} as Review; },
  async reject(_p: string, _rid: string, _payload: SubmitApprovalDecisionPayload): Promise<Review> { return {} as Review; },
  async getAnnotations(_p: string, _rid: string): Promise<Annotation[]> { return []; },
  async addAnnotation(_p: string, _rid: string, _payload: AddAnnotationPayload): Promise<Annotation> { return {} as Annotation; },
  async resolveAnnotation(_p: string, _rid: string, _aid: string): Promise<Annotation> { return {} as Annotation; },
  async deleteAnnotation(_p: string, _rid: string, _aid: string): Promise<void> {},
};

// ─── Real adapter ─────────────────────────────────────────────────────────────

const realReview = {
  async list(projectId: string): Promise<Review[]> {
    return (await apiClient.get<Review[]>(REVIEWS.list(projectId))).data;
  },
  async getById(projectId: string, reviewId: string): Promise<Review | null> {
    return (await apiClient.get<Review | null>(REVIEWS.detail(projectId, reviewId))).data;
  },
  async create(payload: CreateReviewPayload): Promise<Review> {
    return (await apiClient.post<Review>(REVIEWS.create(payload.projectId), payload)).data;
  },
  async update(projectId: string, reviewId: string, delta: Partial<Review>): Promise<Review> {
    return (await apiClient.patch<Review>(REVIEWS.update(projectId, reviewId), delta)).data;
  },
  async approve(projectId: string, reviewId: string, payload: SubmitApprovalDecisionPayload): Promise<Review> {
    return (await apiClient.post<Review>(REVIEWS.approve(projectId, reviewId), payload)).data;
  },
  async reject(projectId: string, reviewId: string, payload: SubmitApprovalDecisionPayload): Promise<Review> {
    return (await apiClient.post<Review>(REVIEWS.reject(projectId, reviewId), payload)).data;
  },
  async getAnnotations(projectId: string, reviewId: string): Promise<Annotation[]> {
    return (await apiClient.get<Annotation[]>(REVIEWS.annotations(projectId, reviewId))).data;
  },
  async addAnnotation(projectId: string, reviewId: string, payload: AddAnnotationPayload): Promise<Annotation> {
    return (await apiClient.post<Annotation>(REVIEWS.annotations(projectId, reviewId), payload)).data;
  },
  async resolveAnnotation(projectId: string, reviewId: string, annotationId: string): Promise<Annotation> {
    return (await apiClient.post<Annotation>(REVIEWS.resolveAnnotation(projectId, reviewId, annotationId))).data;
  },
  async deleteAnnotation(projectId: string, reviewId: string, annotationId: string): Promise<void> {
    await apiClient.delete(REVIEWS.annotation(projectId, reviewId, annotationId));
  },
};

// ─── Exported service ─────────────────────────────────────────────────────────

const adapter = API_CONFIG.useMock ? mockReview : realReview;

export const reviewService = {
  list:              (projectId: string) => adapter.list(projectId),
  getById:           (projectId: string, reviewId: string) => adapter.getById(projectId, reviewId),
  create:            (p: CreateReviewPayload) => adapter.create(p),
  update:            (projectId: string, reviewId: string, d: Partial<Review>) => adapter.update(projectId, reviewId, d),
  approve:           (projectId: string, reviewId: string, p: SubmitApprovalDecisionPayload) => adapter.approve(projectId, reviewId, p),
  reject:            (projectId: string, reviewId: string, p: SubmitApprovalDecisionPayload) => adapter.reject(projectId, reviewId, p),
  getAnnotations:    (projectId: string, reviewId: string) => adapter.getAnnotations(projectId, reviewId),
  addAnnotation:     (projectId: string, reviewId: string, p: AddAnnotationPayload) => adapter.addAnnotation(projectId, reviewId, p),
  resolveAnnotation: (projectId: string, reviewId: string, annotationId: string) => adapter.resolveAnnotation(projectId, reviewId, annotationId),
  deleteAnnotation:  (projectId: string, reviewId: string, annotationId: string) => adapter.deleteAnnotation(projectId, reviewId, annotationId),
};
