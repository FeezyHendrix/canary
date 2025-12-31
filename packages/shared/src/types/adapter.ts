import type { AdapterType } from '../constants/adapter-types';

export interface Adapter {
  id: string;
  teamId: string;
  name: string;
  type: AdapterType;
  defaultFrom: string | null;
  isDefault: boolean;
  isActive: boolean;
  lastTestedAt: Date | null;
  lastTestSuccess: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdapterWithConfig extends Adapter {
  config: Record<string, unknown>;
}

export interface CreateAdapterInput {
  name: string;
  type: AdapterType;
  config: Record<string, unknown>;
  defaultFrom?: string;
  isDefault?: boolean;
}

export interface UpdateAdapterInput {
  name?: string;
  config?: Record<string, unknown>;
  defaultFrom?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface AdapterTestResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'boolean' | 'number';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  defaultValue?: unknown;
}

export interface AdapterTypeInfo {
  type: AdapterType;
  name: string;
  description: string;
  logoUrl?: string;
  configFields: ConfigField[];
}
