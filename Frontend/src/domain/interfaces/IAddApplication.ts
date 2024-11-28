export interface IAddApplicationViewModel {
  formData: {
    company: string;
    position: string;
    type: string;
    tags: string[];
    description: string;
    salary: string;
    location: string;
    notes: string;
  };
  availableTags: string[];
  isSubmitting: boolean;
  error: string | null;
  submissionSuccessful: boolean;
  fieldErrors: Record<string, string>;

  validateForm(): boolean;
  clearFieldError(field: keyof IAddApplicationViewModel['formData']): void;
  updateField(field: keyof IAddApplicationViewModel['formData'], value: string | string[]): void;
  toggleTag(tag: string): void;
  toggleAddTagInput(): void;
  handleSubmit(e: React.FormEvent): Promise<void>;
  resetForm(): void;
}

export interface IAddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}
