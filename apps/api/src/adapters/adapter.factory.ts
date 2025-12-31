import type { AdapterType, AdapterTypeInfo } from '@canary/shared';
import { ADAPTER_DISPLAY_NAMES, ADAPTER_DESCRIPTIONS } from '@canary/shared';
import { BaseEmailAdapter } from './base.adapter';
import { SendGridAdapter } from './sendgrid.adapter';
import { ResendAdapter } from './resend.adapter';
import { MailgunAdapter } from './mailgun.adapter';
import { SESAdapter } from './ses.adapter';
import { PostmarkAdapter } from './postmark.adapter';
import { SMTPAdapter } from './smtp.adapter';

type AdapterConstructor = new (config: Record<string, unknown>) => BaseEmailAdapter;

const adapterMap: Record<AdapterType, AdapterConstructor> = {
  sendgrid: SendGridAdapter,
  resend: ResendAdapter,
  mailgun: MailgunAdapter,
  ses: SESAdapter,
  postmark: PostmarkAdapter,
  smtp: SMTPAdapter,
};

export function createAdapter(type: AdapterType, config: Record<string, unknown>): BaseEmailAdapter {
  const AdapterClass = adapterMap[type];
  if (!AdapterClass) {
    throw new Error(`Unknown adapter type: ${type}`);
  }
  return new AdapterClass(config);
}

export function getAdapterTypeInfo(type: AdapterType): AdapterTypeInfo {
  const AdapterClass = adapterMap[type];
  if (!AdapterClass) {
    throw new Error(`Unknown adapter type: ${type}`);
  }

  const tempAdapter = new AdapterClass({});

  return {
    type,
    name: ADAPTER_DISPLAY_NAMES[type],
    description: ADAPTER_DESCRIPTIONS[type],
    configFields: tempAdapter.getConfigFields(),
  };
}

export function getAllAdapterTypes(): AdapterTypeInfo[] {
  return (Object.keys(adapterMap) as AdapterType[]).map(getAdapterTypeInfo);
}
