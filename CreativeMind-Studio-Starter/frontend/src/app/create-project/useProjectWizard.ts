/**
 * useProjectWizard.ts — Central state management hook for the Project Creation Wizard.
 *
 * Manages:
 * - Step navigation
 * - Form data for all 4 steps
 * - Validation
 * - Autosave simulation
 * - File upload management
 */

import { useState, useCallback, useRef } from 'react';
import { projectService } from '../../services';
import type {
  WizardStepId,
  ProjectWizardData,
  ValidationErrors,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  UploadedFile,
  TeamMember,
  ReferenceLink,
} from './types';
import type { ContentType, Platform } from '../../types';

// ─── Default form state ───────────────────────────────────────────────────────

const DEFAULT_STEP1: Step1Data = {
  projectTitle: '',
  description: '',
  contentCategory: 'youtube',
  targetPlatform: 'youtube',
  targetAudience: 'General audience',
  primaryGoal: 'education',
};

const DEFAULT_STEP2: Step2Data = {
  rawIdea: '',
  desiredDuration: '3-10min',
  tone: 'professional',
  language: 'english',
  deadline: '',
};

const DEFAULT_STEP3: Step3Data = {
  teamMembers: [],
  referenceLinks: [],
  uploadedFiles: [],
};

const DEFAULT_STEP4: Step4Data = {
  selectedStartOption: 'strategy',
};

const DEFAULT_WIZARD_DATA: ProjectWizardData = {
  step1: DEFAULT_STEP1,
  step2: DEFAULT_STEP2,
  step3: DEFAULT_STEP3,
  step4: DEFAULT_STEP4,
};

// ─── Validation helpers ───────────────────────────────────────────────────────

function validateStep1(data: Step1Data): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!data.projectTitle.trim()) errors.projectTitle = 'Project title is required';
  return errors;
}

function validateStep2(data: Step2Data): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!data.rawIdea.trim()) errors.rawIdea = 'Please describe your idea';
  return errors;
}

function validateStep3(): ValidationErrors {
  return {};
}

function validateStep4(_data: Step4Data): ValidationErrors {
  return {};
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseProjectWizardReturn {
  // State
  currentStep: WizardStepId;
  formData: ProjectWizardData;
  errors: ValidationErrors;
  isSubmitting: boolean;
  isDirty: boolean;
  autosaveStatus: 'idle' | 'saving' | 'saved';

  // Navigation
  goToStep: (step: WizardStepId) => void;
  goNext: () => void;
  goBack: () => void;

  // Step 1 updates
  updateStep1: (patch: Partial<Step1Data>) => void;

  // Step 2 updates
  updateStep2: (patch: Partial<Step2Data>) => void;

  // Step 3 updates
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  removeTeamMember: (id: string) => void;
  addReferenceLink: (link: Omit<ReferenceLink, 'id'>) => void;
  removeReferenceLink: (id: string) => void;
  addUploadedFile: (file: Omit<UploadedFile, 'id' | 'uploadedAt'>) => void;
  removeUploadedFile: (id: string) => void;

  // Step 4 updates
  updateStep4: (patch: Partial<Step4Data>) => void;

  // Actions
  saveDraft: () => void;
  submitProject: () => void;
}

function mapContentType(category: Step1Data['contentCategory']): ContentType {
  if (category === 'social-media') return 'social-post';
  if (category === 'blog') return 'article';
  if (category === 'youtube') return 'video';
  return category || 'video';
}

function mapPlatform(platform: Step1Data['targetPlatform']): Platform {
  if (platform === 'spotify') return 'podcast';
  return platform || 'youtube';
}

export function useProjectWizard(
  onProjectCreated: (projectId: string) => void,
  initialData?: Partial<ProjectWizardData>,
): UseProjectWizardReturn {
  const [currentStep, setCurrentStep] = useState<WizardStepId>(1);
  const [formData, setFormData] = useState<ProjectWizardData>({
    step1: { ...DEFAULT_STEP1, ...initialData?.step1 },
    step2: { ...DEFAULT_STEP2, ...initialData?.step2 },
    step3: { ...DEFAULT_STEP3, ...initialData?.step3 },
    step4: { ...DEFAULT_STEP4, ...initialData?.step4 },
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autosaveTimerRef = useRef<number | null>(null);

  const isDirty =
    JSON.stringify(formData) !==
    JSON.stringify({
      step1: { ...DEFAULT_STEP1, ...initialData?.step1 },
      step2: { ...DEFAULT_STEP2, ...initialData?.step2 },
      step3: { ...DEFAULT_STEP3, ...initialData?.step3 },
      step4: { ...DEFAULT_STEP4, ...initialData?.step4 },
    });

  const triggerAutosave = useCallback(() => {
    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    setAutosaveStatus('saving');
    autosaveTimerRef.current = window.setTimeout(() => {
      setAutosaveStatus('saved');
    }, 600);
  }, []);

  // ── Step update functions ─────────────────────────────────────────────────

  const updateStep1 = useCallback(
    (patch: Partial<Step1Data>) => {
      setFormData(prev => ({
        ...prev,
        step1: { ...prev.step1, ...patch },
      }));
      setErrors(prev => ({ ...prev, projectTitle: undefined, contentCategory: undefined, targetPlatform: undefined }));
      triggerAutosave();
    },
    [triggerAutosave],
  );

  const updateStep2 = useCallback(
    (patch: Partial<Step2Data>) => {
      setFormData(prev => ({
        ...prev,
        step2: { ...prev.step2, ...patch },
      }));
      setErrors(prev => ({ ...prev, rawIdea: undefined, tone: undefined, language: undefined }));
      triggerAutosave();
    },
    [triggerAutosave],
  );

  const addTeamMember = useCallback((member: Omit<TeamMember, 'id'>) => {
    setFormData(prev => ({
      ...prev,
      step3: {
        ...prev.step3,
        teamMembers: [...prev.step3.teamMembers, { ...member, id: `tm-${Date.now()}` }],
      },
    }));
  }, []);

  const removeTeamMember = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      step3: {
        ...prev.step3,
        teamMembers: prev.step3.teamMembers.filter(m => m.id !== id),
      },
    }));
  }, []);

  const addReferenceLink = useCallback((link: Omit<ReferenceLink, 'id'>) => {
    setFormData(prev => ({
      ...prev,
      step3: {
        ...prev.step3,
        referenceLinks: [...prev.step3.referenceLinks, { ...link, id: `ref-${Date.now()}` }],
      },
    }));
  }, []);

  const removeReferenceLink = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      step3: {
        ...prev.step3,
        referenceLinks: prev.step3.referenceLinks.filter(l => l.id !== id),
      },
    }));
  }, []);

  const addUploadedFile = useCallback((file: Omit<UploadedFile, 'id' | 'uploadedAt'>) => {
    setFormData(prev => ({
      ...prev,
      step3: {
        ...prev.step3,
        uploadedFiles: [
          ...prev.step3.uploadedFiles,
          { ...file, id: `file-${Date.now()}`, uploadedAt: 'Just now' },
        ],
      },
    }));
  }, []);

  const removeUploadedFile = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      step3: {
        ...prev.step3,
        uploadedFiles: prev.step3.uploadedFiles.filter(f => f.id !== id),
      },
    }));
  }, []);

  const updateStep4 = useCallback(
    (patch: Partial<Step4Data>) => {
      setFormData(prev => ({
        ...prev,
        step4: { ...prev.step4, ...patch },
      }));
      setErrors(prev => ({ ...prev, selectedStartOption: undefined }));
      triggerAutosave();
    },
    [triggerAutosave],
  );

  // ── Navigation ────────────────────────────────────────────────────────────

  const validateCurrentStep = useCallback((): boolean => {
    let errs: ValidationErrors = {};
    if (currentStep === 1) errs = validateStep1(formData.step1);
    else if (currentStep === 2) errs = validateStep2(formData.step2);
    else if (currentStep === 3) errs = validateStep3();
    else if (currentStep === 4) errs = validateStep4(formData.step4);

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [currentStep, formData]);

  const goToStep = useCallback((step: WizardStepId) => {
    setErrors({});
    setCurrentStep(step);
  }, []);

  const goNext = useCallback(() => {
    if (!validateCurrentStep()) return;
    if (currentStep < 4) {
      setCurrentStep(prev => (prev + 1) as WizardStepId);
      setErrors({});
    }
  }, [currentStep, validateCurrentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as WizardStepId);
      setErrors({});
    }
  }, [currentStep]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const saveDraft = useCallback(() => {
    triggerAutosave();
  }, [triggerAutosave]);

  const submitProject = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const created = await projectService.create({
        title: formData.step1.projectTitle || 'New Creative Project',
        description: formData.step1.description || 'Creative Video Series',
        raw_idea: formData.step2.rawIdea || formData.step1.projectTitle || 'Exploring creative concept',
        contentType: mapContentType(formData.step1.contentCategory),
        primaryPlatform: mapPlatform(formData.step1.targetPlatform),
        targetPlatforms: [mapPlatform(formData.step1.targetPlatform)],
        targetAudience: formData.step1.targetAudience || 'General audience',
        primaryGoal: formData.step1.primaryGoal || 'education',
        tone: formData.step2.tone || 'professional',
        language: formData.step2.language || 'english',
        estimatedDuration: formData.step2.desiredDuration || '3-10min',
        deadline: formData.step2.deadline || undefined,
        tags: [
          formData.step1.contentCategory,
          formData.step1.targetPlatform,
          formData.step4.selectedStartOption,
        ].filter(Boolean) as string[],
      });
      onProjectCreated(created.id);
    } catch (err) {
      setErrors({ projectTitle: (err as Error).message ?? 'Failed to create project' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onProjectCreated]);

  return {
    currentStep,
    formData,
    errors,
    isSubmitting,
    isDirty,
    autosaveStatus,
    goToStep,
    goNext,
    goBack,
    updateStep1,
    updateStep2,
    addTeamMember,
    removeTeamMember,
    addReferenceLink,
    removeReferenceLink,
    addUploadedFile,
    removeUploadedFile,
    updateStep4,
    saveDraft,
    submitProject,
  };
}
