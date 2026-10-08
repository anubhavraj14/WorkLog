export type ID = string;

export const WORK_CATEGORIES = [
  "Development", "Testing", "Bug Fix", "Research", "Meeting",
  "Documentation", "Learning", "Code Review", "Deployment", "Support", "Other",
] as const;
export type WorkCategory = (typeof WORK_CATEGORIES)[number];

export const WORK_STATUSES = ["Planned", "In Progress", "Completed", "Blocked", "Cancelled"] as const;
export type WorkStatus = (typeof WORK_STATUSES)[number];

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PROJECT_STATUSES = ["Active", "Completed", "On Hold", "Archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const BLOCKER_STATUSES = ["Open", "Waiting", "Resolved"] as const;
export type BlockerStatus = (typeof BLOCKER_STATUSES)[number];

export const EVIDENCE_TYPES = [
  "Screenshot", "Document", "Link", "Ticket", "ServiceNow", "GitHub", "Pull Request", "Meeting Notes", "File", "Other",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export interface Project {
  id: ID;
  name: string;
  description: string;
  client: string;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  notes: string;
  is_sample?: boolean;
}

export interface WorkEntry {
  id: ID;
  title: string;
  description: string;
  project_id: ID | null;
  category: WorkCategory;
  status: WorkStatus;
  priority: Priority;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  duration_min: number;
  is_extra: boolean;
  extra_reason: string;
  tags: string[];
  notes: string;
  accomplishments: string;
  issues_found: string;
  is_sample?: boolean;
}

export interface Evidence {
  id: ID;
  name: string;
  type: EvidenceType;
  url: string;
  file_path: string;
  project_id: ID | null;
  work_entry_id: ID | null;
  description: string;
  date: string;
  is_sample?: boolean;
}

export interface Blocker {
  id: ID;
  title: string;
  project_id: ID | null;
  waiting_for: string;
  description: string;
  status: BlockerStatus;
  created_date: string;
  resolution: string;
  resolution_date: string;
  resolved_by: string;
  resolution_notes: string;
  is_sample?: boolean;
}

export interface Meeting {
  id: ID;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  attendees: string;
  project_id: ID | null;
  discussion: string;
  decisions: string;
  action_items: string;
  follow_up_date: string;
  notes: string;
  is_sample?: boolean;
}

export interface LearningEntry {
  id: ID;
  topic: string;
  course: string;
  date: string;
  duration_min: number;
  learned: string;
  notes: string;
  certificate_url: string;
  is_sample?: boolean;
}

export interface WorkTemplate {
  id: ID;
  name: string;
  title: string;
  description: string;
  project_id: ID | null;
  category: WorkCategory;
  priority: Priority;
  tags: string[];
}

export interface Settings {
  name: string;
  title: string;
  work_hours_per_day: number;
  work_start_time: string;
  work_end_time: string;
  working_days: number[]; // 0=Sun
  work_templates: WorkTemplate[];
  theme: "light" | "dark" | "system";
}

export interface Data {
  projects: Project[];
  workEntries: WorkEntry[];
  evidence: Evidence[];
  blockers: Blocker[];
  meetings: Meeting[];
  learning: LearningEntry[];
}
