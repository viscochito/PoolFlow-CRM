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
  columnId: LeadStatus;
  budget: string | null;
  quoteStatus: QuoteStatus;
  urgency: UrgencyLevel;
  lastContact: string;
  contactChannels: ContactChannel[];
  context: string;
  createdAt: string;
  history: HistoryEvent[];
}

export interface Column {
  id: LeadStatus;
  title: string;
  color: string;
}

