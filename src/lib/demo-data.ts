import { format, addDays } from "date-fns";
import { Data, WorkEntry } from "./types";
import { durationBetween, uid } from "./utils";

const d = (offset: number) => format(addDays(new Date(), offset), "yyyy-MM-dd");
const S = true; // is_sample

export function sampleData(): Data {
  const snowId = "sample-proj-snow";
  const entries = (e: Partial<WorkEntry> & Pick<WorkEntry, "title" | "date" | "start_time" | "end_time">): WorkEntry => ({
    id: uid(),
    description: "",
    project_id: snowId,
    category: "Testing",
    status: "Completed",
    priority: "Medium",
    duration_min: durationBetween(e.start_time, e.end_time),
    is_extra: false,
    extra_reason: "",
    tags: [],
    notes: "",
    accomplishments: "",
    issues_found: "",
    is_sample: S,
    ...e,
  });

  const workEntries: WorkEntry[] = [
    entries({ title: "[Sample] Tested Ramp Creation Agent", date: d(0), start_time: "09:00", end_time: "10:30",
      description: "Ran end-to-end tests on the Ramp Creation Agent in the dev instance.",
      accomplishments: "Validated ramp creation flow for standard quotes.", tags: ["AI Agents", "ServiceNow", "Testing"] }),
    entries({ title: "[Sample] Tested Ramp Deletion Agent", date: d(0), start_time: "10:30", end_time: "12:00",
      status: "In Progress", description: "Partial run of deletion scenarios; edge cases pending.", tags: ["AI Agents", "Testing"] }),
    entries({ title: "[Sample] Team standup", date: d(0), start_time: "12:00", end_time: "12:30", category: "Meeting", project_id: null }),
    entries({ title: "[Sample] Product Recommendation Agent testing", date: d(0), start_time: "14:00", end_time: "16:00",
      issues_found: "Recommendation list empty for quote-lines with missing category." }),
    entries({ title: "[Sample] Additional testing & issue documentation", date: d(0), start_time: "18:30", end_time: "20:00",
      is_extra: true, extra_reason: "Additional testing requested by team", tags: ["Testing", "Urgent"] }),
    entries({ title: "[Sample] Investigated duplicate ramp creation", date: d(-1), start_time: "09:30", end_time: "12:30",
      category: "Bug Fix", issues_found: "Duplicate ramps created when agent retried after timeout." }),
    entries({ title: "[Sample] Removed final Summary Assistant step", date: d(-1), start_time: "14:00", end_time: "16:30", category: "Development" }),
    entries({ title: "[Sample] Documented UI issues", date: d(-2), start_time: "10:00", end_time: "12:00", category: "Documentation" }),
    entries({ title: "[Sample] Tested quote-line selection", date: d(-2), start_time: "13:30", end_time: "17:00" }),
    entries({ title: "[Sample] ServiceNow learning", date: d(-3), start_time: "16:00", end_time: "18:00", category: "Learning", project_id: null, tags: ["ServiceNow", "Learning"] }),
    entries({ title: "[Sample] Code review: agent trigger conditions", date: d(-4), start_time: "11:00", end_time: "12:30", category: "Code Review" }),
    entries({ title: "[Sample] Ramp Creation regression suite", date: d(-4), start_time: "13:30", end_time: "17:30" }),
  ];

  const w1 = workEntries[0], w2 = workEntries[5];

  return {
    projects: [
      { id: snowId, name: "SNOW-SAUG", description: "ServiceNow AI agent testing and automation for quote ramp workflows.", client: "Internal", start_date: d(-60), end_date: "", status: "Active", notes: "", is_sample: S },
      { id: "sample-proj-docs", name: "QA Documentation", description: "Internal QA process documentation.", client: "Internal", start_date: d(-30), end_date: "", status: "Active", notes: "", is_sample: S },
    ],
    workEntries,
    evidence: [
      { id: uid(), name: "Ramp creation test result", type: "Screenshot", url: "", file_path: "", project_id: snowId, work_entry_id: w1.id, description: "Screenshot of successful ramp creation (sample).", date: d(0), is_sample: S },
      { id: uid(), name: "ServiceNow ticket INC0012345", type: "ServiceNow", url: "https://example.service-now.com/incident/INC0012345", file_path: "", project_id: snowId, work_entry_id: w1.id, description: "Ticket tracking the display issue (sample).", date: d(0), is_sample: S },
      { id: uid(), name: "Duplicate ramp bug evidence", type: "Ticket", url: "https://github.com/example/repo/issues/42", file_path: "", project_id: snowId, work_entry_id: w2.id, description: "GitHub issue filed for duplicate creation (sample).", date: d(-1), is_sample: S },
    ],
    blockers: [
      { id: uid(), title: "Waiting for access to testing instance", project_id: snowId, waiting_for: "Team/Admin", description: "Unable to continue testing until access is provided.", status: "Waiting", created_date: d(-2), resolution: "", resolution_date: "", resolved_by: "", resolution_notes: "", is_sample: S },
      { id: uid(), title: "Waiting for clarification on ramp edge cases", project_id: snowId, waiting_for: "Product team", description: "Need clarification on expected behavior for expired ramps.", status: "Open", created_date: d(-1), resolution: "", resolution_date: "", resolved_by: "", resolution_notes: "", is_sample: S },
    ],
    meetings: [
      { id: uid(), name: "Team standup", date: d(0), start_time: "12:00", end_time: "12:30", attendees: "QA team", project_id: snowId, discussion: "Progress on ramp agents; deletion edge cases.", decisions: "Prioritize deletion agent edge cases this week.", action_items: "Follow up on instance access.", follow_up_date: d(1), notes: "", is_sample: S },
      { id: uid(), name: "Sprint planning", date: d(-3), start_time: "10:00", end_time: "11:00", attendees: "Engineering", project_id: snowId, discussion: "Sprint scope for agent testing.", decisions: "", action_items: "", follow_up_date: "", notes: "", is_sample: S },
    ],
    learning: [
      { id: uid(), topic: "ServiceNow AI Agents", course: "ServiceNow Learning", date: d(-3), duration_min: 120, learned: "Learned about AI Agents and testing workflows.", notes: "", certificate_url: "", is_sample: S },
    ],
  };
}
