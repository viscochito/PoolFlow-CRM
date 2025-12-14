export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'visit_pending' 
  | 'quote_generated' 
  | 'quote_sent' 
  | 'negotiation' 
  | 'won' 
  | 'lost';

export type LeadSource = 
  | 'Meta Ads' 
  | 'Referido' 
  | 'Orgánico' 
  | 'Instagram' 
  | 'Alianza' 
  | 'Directo';

export type UrgencyLevel = 'Alta' | 'Media' | 'Baja';

export type QuoteStatus = 'none' | 'generated' | 'sent';

export type ContactChannel = 'instagram' | 'whatsapp' | 'mail';

export type ServiceStatus = 'propuesto' | 'aceptado' | 'rechazado' | 'en_proceso';

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  price: number | null;
  isCustom?: boolean;
}

export type HistoryEventType = 'system' | 'note' | 'contact';

export interface HistoryEvent {
  type: HistoryEventType;
  text: string;
  date: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  projectType: string;
  source: LeadSource;
  location: string;
  columnId: string; // Changed from LeadStatus to string to support custom columns
  budget: string | null;
  quoteStatus: QuoteStatus;
  urgency: UrgencyLevel;
  lastContact: string;
  contactChannels: ContactChannel[];
  services: Service[];
  context: string;
  createdAt: string;
  history: HistoryEvent[];
}

export interface Column {
  id: string; // Changed from LeadStatus to string to allow custom columns
  title: string;
  color: string;
  dotColor?: string;
  isCustom?: boolean; // Flag to identify custom columns
}

