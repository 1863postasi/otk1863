export interface CalendarDateTime {
  dateTime: string; // ISO string
  timeZone?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: CalendarDateTime;
  end: CalendarDateTime;
  clubShortName: string; // Custom field for UI
  category: 'academic' | 'social' | 'cultural' | 'sports';
}

export interface Announcement {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  isPinned?: boolean;
}

export interface ArchiveItem {
  id: string;
  title: string;
  type: 'pdf' | 'img' | 'doc' | 'video';
  size: string;
  date: string;
  category: string;
  rights: string;
  previewUrl?: string;
}

export interface Representative {
  id: string;
  name: string;
  department: string;
  role: string;
  imageUrl?: string;
}

export interface Commission {
  id: string;
  name: string;
  description: string;
  detailedContent: string;
  status: 'active' | 'coming_soon';
}
