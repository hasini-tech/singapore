"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  AlertTriangle,
  ArrowLeft,
  AtSign,
  Calendar,
  ChevronRight,
  Clock3,
  Copy,
  Apple,
  Download,
  ExternalLink,
  Eye,
  Info,
  Layout,
  Link as LinkIcon,
  List,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  Monitor,
  PencilLine,
  Phone,
  Play,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  Send,
  Settings,
  Share2,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import Facebook from "@/components/icons/facebook";
import Linkedin from "@/components/icons/linkedin";
import Twitter from "@/components/icons/twitter";
import { useAuth } from "@/context/auth-context";
import { useMedia } from "@/hooks/use-media";
import api from "@/lib/api";
import { DEFAULT_EVENT_COVER } from "@/lib/defaults";
import { routes } from "@/config/routes";
import { QRCodeSVG } from "qrcode.react";

type EventRecord = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  is_online?: boolean;
  cover_image?: string;
  share_url?: string;
  is_paid?: boolean;
  ticket_price?: number;
  max_seats?: number;
  status?: string;
  agenda?: string[];
  confirmed_count?: number;
  attendee_count?: number;
  checked_in_count?: number;
  ticket_sales?: number;
  conversion_rate?: number;
  waitlisted_count?: number;
  registration_questions?: unknown;
  custom_questions?: unknown;
  questions?: unknown;
  [key: string]: any;
};

type Insight = { label: string; value: string | number };

type EditForm = {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  is_online: boolean;
  is_paid: boolean;
  ticket_price: number;
  max_seats: number;
  status: string;
};

type RegistrationQuestionType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "website"
  | "checkbox"
  | "single_select"
  | "multi_select"
  | "social_profile"
  | "company"
  | "terms";

type SocialPlatform = "linkedin" | "instagram" | "x" | "facebook";

type QuestionEditorKind =
  | "text"
  | "options"
  | "checkbox"
  | "phone"
  | "website"
  | "email"
  | "company"
  | "social_profile"
  | "terms";

type QuestionTypeMeta = {
  title: string;
  subtitle: string;
  placeholder: string;
  icon: React.ReactNode;
  helperText?: string;
  requiredHint?: string;
};

type RegistrationQuestion = {
  id: string;
  label: string;
  description: string;
  type: RegistrationQuestionType;
  required: boolean;
  options: string[];
  platform?: SocialPlatform;
};

type QuestionFormState = {
  label: string;
  description: string;
  type: RegistrationQuestionType;
  required: boolean;
  options: string[];
  optionDraft: string;
  platform: SocialPlatform;
};

const QUESTION_TYPE_OPTIONS: Array<{ value: RegistrationQuestionType; label: string }> = [
  { value: "short_text", label: "Text" },
  { value: "long_text", label: "Multi-Line Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Mobile" },
  { value: "website", label: "Website" },
  { value: "social_profile", label: "Social Profile" },
  { value: "company", label: "Company" },
  { value: "checkbox", label: "Checkbox" },
  { value: "single_select", label: "Single Choice" },
  { value: "multi_select", label: "Multiple Choice" },
  { value: "terms", label: "Terms" },
];

const QUESTION_PICKER_TYPES: RegistrationQuestionType[] = [
  "short_text",
  "single_select",
  "social_profile",
  "checkbox",
  "phone",
  "website",
  "email",
  "company",
  "terms",
];

const SOCIAL_PLATFORM_OPTIONS: Array<{ value: SocialPlatform; label: string }> = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X" },
  { value: "facebook", label: "Facebook" },
];

const QUESTION_TYPES_WITH_OPTIONS = new Set<RegistrationQuestionType>(["single_select", "multi_select"]);

const EMPTY_QUESTION_FORM: QuestionFormState = {
  label: "",
  description: "",
  type: "short_text",
  required: false,
  options: [],
  optionDraft: "",
  platform: "linkedin",
};

function normalizeSocialPlatform(value: unknown): SocialPlatform {
  const normalized = String(value || "").trim().toLowerCase();

  switch (normalized) {
    case "instagram":
    case "x":
    case "facebook":
    case "linkedin":
      return normalized as SocialPlatform;
    default:
      return "linkedin";
  }
}

function buildQuestionFormState(question?: RegistrationQuestion): QuestionFormState {
  return {
    label: question?.label || "",
    description: question?.description || "",
    type: question?.type || "short_text",
    required: Boolean(question?.required),
    options: normalizeQuestionOptions(question?.options),
    optionDraft: "",
    platform: normalizeSocialPlatform(question?.platform),
  };
}

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "guests", label: "Guests" },
  { key: "registration", label: "Registration" },
  { key: "blasts", label: "Blasts" },
  { key: "insights", label: "Insights" },
  { key: "more", label: "More" },
] as const;

const statuses = ["published", "private", "draft", "cancelled"] as const;

function dateValue(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
}

function timeValue(event: EventRecord) {
  if (event.time) return String(event.time).slice(0, 5);
  if (!event.date) return "";
  const d = new Date(event.date);
  if (Number.isNaN(d.getTime())) return "";
  return `${`${d.getHours()}`.padStart(2, "0")}:${`${d.getMinutes()}`.padStart(2, "0")}`;
}

function buildEditForm(event: EventRecord): EditForm {
  return {
    title: event.title || "",
    description: event.description || "",
    date: dateValue(event.date),
    time: timeValue(event),
    location: event.location || "",
    is_online: Boolean(event.is_online),
    is_paid: Boolean(event.is_paid),
    ticket_price: Number(event.ticket_price || 0),
    max_seats: Number(event.max_seats || 0),
    status: event.status || "published",
  };
}

function buildShareUrl(event: EventRecord | null) {
  if (!event) return "";
  if (event.share_url) return event.share_url;
  const configuredBase = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || "";
  const base = configuredBase.replace(/\/$/, "");
  return base ? `${base}/events/${event.slug}` : `/events/${event.slug}`;
}

function buildInviteMessage(event: EventRecord, shareUrl: string) {
  const when = event.date ? new Date(event.date).toLocaleString() : "Date and time to be announced";
  const where = event.is_online ? "Online event" : event.location || "Venue to be announced";
  return `You are invited to ${event.title}.\n\nWhen: ${when}\nWhere: ${where}\n\nRSVP here: ${shareUrl}`;
}

async function copyText(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "absolute";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
}

function createQuestionId() {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `question-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeQuestionType(value: unknown): RegistrationQuestionType {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  switch (normalized) {
    case "textarea":
    case "paragraph":
    case "long_text":
      return "long_text";
    case "mail":
      return "email";
    case "mobile":
    case "mobile_number":
    case "phone_number":
      return "phone";
    case "url":
      return "website";
    case "single":
    case "single_select":
    case "single_choice":
    case "select":
    case "radio":
      return "single_select";
    case "multi":
    case "multiselect":
    case "multiple_choice":
    case "multi_select":
      return "multi_select";
    case "bool":
    case "boolean":
      return "checkbox";
    case "organization":
      return "company";
    case "social":
    case "social_profile":
    case "social_link":
      return "social_profile";
    case "agreement":
      return "terms";
    case "short_text":
    case "long_text":
    case "email":
    case "phone":
    case "website":
    case "checkbox":
    case "social_profile":
    case "company":
    case "terms":
      return normalized as RegistrationQuestionType;
    default:
      return "short_text";
  }
}

function getQuestionEditorKind(type: RegistrationQuestionType): QuestionEditorKind {
  switch (type) {
    case "short_text":
    case "long_text":
      return "text";
    case "single_select":
    case "multi_select":
      return "options";
    case "checkbox":
      return "checkbox";
    case "phone":
      return "phone";
    case "website":
      return "website";
    case "email":
      return "email";
    case "company":
      return "company";
    case "social_profile":
      return "social_profile";
    case "terms":
      return "terms";
    default:
      return "text";
  }
}

function updateQuestionFormType(
  current: QuestionFormState,
  nextType: RegistrationQuestionType
): QuestionFormState {
  const normalizedType = normalizeQuestionType(nextType);
  const keepsOptions = QUESTION_TYPES_WITH_OPTIONS.has(normalizedType);

  return {
    ...current,
    type: normalizedType,
    options: keepsOptions ? current.options : [],
    optionDraft: keepsOptions ? current.optionDraft : "",
  };
}

function getQuestionTypeMeta(
  type: RegistrationQuestionType,
  platform: SocialPlatform
): QuestionTypeMeta {
  const editorKind = getQuestionEditorKind(type);

  switch (editorKind) {
    case "text":
      return {
        title: "Text",
        subtitle: "Ask for a free-form response",
        placeholder: "What should guests answer?",
        icon: <Info size={18} />,
      };
    case "options":
      return {
        title: "Options",
        subtitle: "Let the guest choose from a list of options",
        placeholder: "What should guests answer?",
        icon: <List size={18} />,
      };
    case "checkbox":
      return {
        title: "Checkbox",
        subtitle: "Ask guests to tick a box",
        placeholder: "What should guests confirm?",
        icon: <List size={18} />,
        requiredHint:
          "When set to Required, guests must tick the box (answer Yes) to proceed. Consider using the Terms question type for event terms.",
      };
    case "phone":
      return {
        title: "Mobile",
        subtitle: "Ask for a mobile number",
        placeholder: "What should guests answer?",
        icon: <Phone size={18} />,
        helperText:
          "Please use the Mobile Number question under the Personal Information section to get the mobile number of the guest.",
      };
    case "website":
      return {
        title: "Website",
        subtitle: "Ask for a website URL",
        placeholder: "What should guests answer?",
        icon: <LinkIcon size={18} />,
      };
    case "email":
      return {
        title: "Email",
        subtitle: "Ask for an email address",
        placeholder: "What should guests answer?",
        icon: <Mail size={18} />,
      };
    case "company":
      return {
        title: "Company",
        subtitle: "Ask for a company or job title",
        placeholder: "What should guests answer?",
        icon: <UserPlus size={18} />,
      };
    case "social_profile": {
      const platformLabel =
        SOCIAL_PLATFORM_OPTIONS.find((option) => option.value === platform)?.label || "Social";
      return {
        title: "Social Profile",
        subtitle: `Ask for a ${platformLabel} URL or handle`,
        placeholder: "What should guests answer?",
        icon: <AtSign size={18} />,
      };
    }
    case "terms":
      return {
        title: "Terms",
        subtitle: "Ask guests to agree before they register",
        placeholder: "What should guests agree to?",
        icon: <Lock size={18} />,
        requiredHint: "Guests usually need to accept this before they can complete registration.",
      };
    default:
      return {
        title: "Text",
        subtitle: "Ask for a free-form response",
        placeholder: "What should guests answer?",
        icon: <Info size={18} />,
      };
  }
}

function isQuestionPickerSelected(
  currentType: RegistrationQuestionType,
  pickerType: RegistrationQuestionType
) {
  return getQuestionEditorKind(currentType) === getQuestionEditorKind(pickerType);
}

function getSocialPlatformIcon(platform: SocialPlatform): React.ReactNode {
  switch (platform) {
    case "linkedin":
      return <Linkedin width={16} height={16} />;
    case "x":
      return <Twitter width={16} height={16} />;
    case "facebook":
      return <Facebook width={16} height={16} />;
    default:
      return <AtSign size={16} />;
  }
}

function parseQuestionOptions(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((option) => option.trim())
    .filter(Boolean);
}

function normalizeQuestionOptions(value: unknown) {
  if (!Array.isArray(value)) {
    if (typeof value === "string") {
      return parseQuestionOptions(value);
    }
    return [] as string[];
  }

  return value
    .map((option) => String(option || "").trim())
    .filter(Boolean);
}

function normalizeRegistrationQuestions(value: unknown): RegistrationQuestion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index): RegistrationQuestion | null => {
      if (typeof item === "string") {
        const label = item.trim();
        if (!label) return null;
        const normalizedQuestion: RegistrationQuestion = {
          id: `question-${index + 1}`,
          label,
          description: "",
          type: "short_text",
          required: false,
          options: [],
        };
        return normalizedQuestion;
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const raw = item as Record<string, unknown>;
      const label = String(
        raw.label ?? raw.question ?? raw.title ?? raw.name ?? raw.field_label ?? ""
      ).trim();

      if (!label) {
        return null;
      }

      const normalizedQuestion: RegistrationQuestion = {
        id: String(raw.id ?? raw.key ?? `question-${index + 1}`),
        label,
        description: String(
          raw.description ??
            raw.helper_text ??
            raw.subtitle ??
            raw.placeholder ??
            raw.collecting ??
            ""
        ).trim(),
        type: normalizeQuestionType(raw.type ?? raw.field_type ?? raw.kind ?? raw.input_type),
        required:
          raw.required === true || String(raw.required ?? "").trim().toLowerCase() === "true",
        options: normalizeQuestionOptions(raw.options ?? raw.choices ?? raw.values),
        platform: normalizeSocialPlatform(raw.platform ?? raw.social_platform),
      };
      return normalizedQuestion;
    })
    .filter((question): question is RegistrationQuestion => Boolean(question));
}

function extractRawRegistrationQuestions(event: EventRecord | null) {
  if (!event) return undefined;
  return (
    event.registration_questions ??
    event.custom_questions ??
    event.questions ??
    event.registration?.questions
  );
}

function getQuestionStorageKey(eventId?: string) {
  return eventId ? `growthlab.manage.registration-questions:${eventId}` : "";
}

function readStoredRegistrationQuestions(eventId?: string) {
  if (!eventId || typeof window === "undefined") {
    return [] as RegistrationQuestion[];
  }

  try {
    const raw = window.localStorage.getItem(getQuestionStorageKey(eventId));
    if (!raw) return [];
    return normalizeRegistrationQuestions(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeStoredRegistrationQuestions(eventId: string, questions: RegistrationQuestion[]) {
  if (!eventId || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(getQuestionStorageKey(eventId), JSON.stringify(questions));
  } catch {
    // Ignore storage failures and keep the in-memory UI working.
  }
}

function withRegistrationQuestions(event: EventRecord, questions: RegistrationQuestion[]): EventRecord {
  return {
    ...event,
    registration_questions: questions,
  };
}

function hydrateEventQuestions(
  eventData: EventRecord,
  fallbackQuestions: RegistrationQuestion[] = []
) {
  const apiQuestions = normalizeRegistrationQuestions(extractRawRegistrationQuestions(eventData));
  const storedQuestions = readStoredRegistrationQuestions(eventData.id);
  const questions = apiQuestions.length
    ? apiQuestions
    : fallbackQuestions.length
      ? fallbackQuestions
      : storedQuestions;

  writeStoredRegistrationQuestions(eventData.id, questions);

  return {
    event: withRegistrationQuestions(eventData, questions),
    questions,
  };
}

function getQuestionTypeLabel(type: RegistrationQuestionType) {
  return QUESTION_TYPE_OPTIONS.find((option) => option.value === type)?.label || "Short Text";
}

function getQuestionTypeIcon(type: RegistrationQuestionType) {
  switch (type) {
    case "short_text":
    case "long_text":
      return <Info size={14} />;
    case "email":
      return <Mail size={14} />;
    case "phone":
      return <Phone size={14} />;
    case "website":
      return <LinkIcon size={14} />;
    case "social_profile":
      return <AtSign size={14} />;
    case "company":
      return <UserPlus size={14} />;
    case "checkbox":
      return <List size={14} />;
    case "single_select":
    case "multi_select":
      return <List size={14} />;
    case "terms":
      return <Lock size={14} />;
    default:
      return <Info size={14} />;
  }
}

export default function ManageEventPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { user, loading: authLoading } = useAuth();
  const isMobile = useMedia("(max-width: 900px)", false);
  const isCompact = useMedia("(max-width: 640px)", false);

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("overview");
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [blasts, setBlasts] = useState<any[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isGuestListOpen, setIsGuestListOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<RegistrationQuestion[]>([]);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionTypePickerOpen, setQuestionTypePickerOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionFormState>(EMPTY_QUESTION_FORM);
  const [questionSaving, setQuestionSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("evently_token") : null;
    if (!user || !token) router.replace(`/signin?redirect=/manage/${slug}`);
  }, [authLoading, router, slug, user]);

  useEffect(() => {
    if (authLoading || !user || !slug) {
      return;
    }

    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/events/manage/${slug}`);
        const hydrated = hydrateEventQuestions(response.data);
        if (!mounted) return;
        setEvent(hydrated.event);
        setCustomQuestions(hydrated.questions);
        setEditForm(buildEditForm(hydrated.event));

        // Fetch guests from ticket service
        api
          .get(`/tickets/event/${hydrated.event.id}`)
          .then((res) => mounted && setGuests(res.data || []))
          .catch(() => {});

        // Fetch registrations from attendee service
        api
          .get(`/attendees/event/${hydrated.event.id}`)
          .then((res) => mounted && setRegistrations(res.data || []))
          .catch(() => {});

        // Fetch blasts (currently simulated or empty)
        api
          .get(`/blasts?event_id=${hydrated.event.id}`)
          .then((res) => mounted && setBlasts(res.data || []))
          .catch(() => {});

        // Set insights from event metrics instead of a failing dedicated endpoint
        const metrics = [
          { label: "Confirmed Guests", value: hydrated.event.confirmed_count || 0 },
          { label: "Total Registrations", value: hydrated.event.attendee_count || 0 },
          { label: "Checked-in", value: hydrated.event.checked_in_count || 0 },
          { label: "Ticket Sales", value: `Rs ${hydrated.event.ticket_sales || 0}` },
          { label: "Conversion Rate", value: `${hydrated.event.conversion_rate || 0}%` },
          { label: "Waitlisted", value: hydrated.event.waitlisted_count || 0 },
        ];
        setInsights(metrics);
      } catch (err: any) {
        if (!mounted) return;
        const status = err?.response?.status;
        const detail = err?.response?.data?.detail;

        if (status === 401) {
          router.replace(`/signin?redirect=/manage/${slug}`);
          return;
        }

        if (status === 403) {
          setError("You are not authorized to manage this event.");
          return;
        }

        setError(detail || "Failed to load event");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [authLoading, router, slug, user]);

  const eventDate = useMemo(() => (event?.date ? new Date(event.date) : null), [event?.date]);
  const formattedDate = eventDate ? eventDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Date TBA";
  const formattedTime = event?.time || (eventDate ? eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Time TBA");
  const shareUrl = useMemo(() => buildShareUrl(event), [event]);
  const inviteMessage = useMemo(() => (event ? buildInviteMessage(event, shareUrl) : ""), [event, shareUrl]);
  const locationLabel = useMemo(() => {
    if (!event) return "";
    if (event.is_online) return "Online";
    return event.location || "Venue TBA";
  }, [event]);
  const createEventHref = user
    ? routes.createEvent === "/create-event"
      ? "/create-event/form"
      : routes.createEvent
    : "/create-event/continue?redirect=/create-event/form";

  const shareEvent = async () => {
    if (!event || !shareUrl) return;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: event.title, text: `Join ${event.title}`, url: shareUrl });
        setMessage("Share options opened for this event.");
        return;
      }
      await copyText(shareUrl);
      setMessage("Event link copied.");
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        await copyText(shareUrl);
        setMessage("Event link copied.");
      }
    }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !editForm) return;
    setSaving(true);
    try {
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        date: new Date(`${editForm.date}T${editForm.time || "00:00"}`).toISOString(),
        time: editForm.time,
        location: editForm.location.trim(),
        is_online: editForm.is_online,
        is_paid: editForm.is_paid,
        ticket_price: editForm.is_paid ? Number(editForm.ticket_price || 0) : 0,
        max_seats: Math.max(0, Number(editForm.max_seats || 0)),
        status: editForm.status,
        agenda: (event as any).agenda || [],
      };
      const { data } = await api.put(`/events/${event.id}`, payload);
      const hydrated = hydrateEventQuestions(data, customQuestions);
      setEvent(hydrated.event);
      setCustomQuestions(hydrated.questions);
      setEditForm(buildEditForm(hydrated.event));
      setEditOpen(false);
      setMessage("Event details updated.");
    } catch (err: any) {
      setMessage(err?.response?.data?.detail || "Failed to update event details.");
    } finally {
      setSaving(false);
    }
  };

  const resetQuestionForm = () => {
    setEditingQuestionId(null);
    setQuestionForm(buildQuestionFormState());
    setQuestionTypePickerOpen(false);
    setQuestionSaving(false);
  };

  const closeQuestionModal = () => {
    setQuestionModalOpen(false);
    resetQuestionForm();
  };

  const openAddQuestionModal = () => {
    resetQuestionForm();
    setQuestionTypePickerOpen(true);
    setQuestionModalOpen(true);
  };

  const openEditQuestionModal = (question: RegistrationQuestion) => {
    setEditingQuestionId(question.id);
    setQuestionForm(buildQuestionFormState(question));
    setQuestionTypePickerOpen(false);
    setQuestionModalOpen(true);
  };

  const handleQuestionTypeChange = (nextType: RegistrationQuestionType) => {
    setQuestionForm((current) => updateQuestionFormType(current, nextType));
  };

  const handleQuestionModalBack = () => {
    if (questionTypePickerOpen) {
      closeQuestionModal();
      return;
    }

    setQuestionTypePickerOpen(true);
  };

  const addOptionFromDraft = () => {
    const draft = questionForm.optionDraft.trim();
    if (!draft) return;

    setQuestionForm((current) => {
      const exists = current.options.some(
        (option) => option.trim().toLowerCase() === draft.toLowerCase()
      );

      if (exists) {
        return {
          ...current,
          optionDraft: "",
        };
      }

      return {
        ...current,
        options: [...current.options, draft],
        optionDraft: "",
      };
    });
  };

  const removeQuestionOption = (optionToRemove: string) => {
    setQuestionForm((current) => ({
      ...current,
      options: current.options.filter((option) => option !== optionToRemove),
    }));
  };

  const handleOptionDraftKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" && e.key !== "Tab") {
      return;
    }

    e.preventDefault();
    addOptionFromDraft();
  };

  const persistQuestions = async (
    nextQuestions: RegistrationQuestion[],
    successMessage: string,
    fallbackMessage: string
  ) => {
    if (!event) return;

    setCustomQuestions(nextQuestions);
    setEvent(withRegistrationQuestions(event, nextQuestions));
    writeStoredRegistrationQuestions(event.id, nextQuestions);

    try {
      const { data } = await api.put(`/events/${event.id}`, {
        registration_questions: nextQuestions,
      });
      const hydrated = hydrateEventQuestions(data, nextQuestions);
      setEvent(hydrated.event);
      setCustomQuestions(hydrated.questions);
      setEditForm((current) => (current ? buildEditForm(hydrated.event) : current));
      setMessage(successMessage);
    } catch (err: any) {
      setMessage(err?.response?.data?.detail || fallbackMessage);
    }
  };

  const saveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    const label = questionForm.label.trim();
    if (!label) {
      setMessage("Question title is required.");
      return;
    }

    const options = normalizeQuestionOptions([
      ...questionForm.options,
      questionForm.optionDraft,
    ]);
    if (QUESTION_TYPES_WITH_OPTIONS.has(questionForm.type) && options.length === 0) {
      setMessage("Add at least one option for this question.");
      return;
    }

    const nextQuestion: RegistrationQuestion = {
      id: editingQuestionId || createQuestionId(),
      label,
      description: questionForm.description.trim(),
      type: questionForm.type,
      required: questionForm.required,
      options,
      platform:
        questionForm.type === "social_profile" ? questionForm.platform : undefined,
    };

    const nextQuestions = editingQuestionId
      ? customQuestions.map((question) =>
          question.id === editingQuestionId ? nextQuestion : question
        )
      : [...customQuestions, nextQuestion];

    setQuestionSaving(true);
    await persistQuestions(
      nextQuestions,
      editingQuestionId ? "Question updated." : "Question added.",
      editingQuestionId
        ? "Question updated locally. Sync with the event service failed."
        : "Question added locally. Sync with the event service failed."
    );
    closeQuestionModal();
  };

  const deleteQuestion = async (questionId: string, label: string) => {
    if (!event) return;
    if (typeof window !== "undefined" && !window.confirm(`Delete "${label}"?`)) {
      return;
    }

    const nextQuestions = customQuestions.filter((question) => question.id !== questionId);
    await persistQuestions(
      nextQuestions,
      "Question removed.",
      "Question removed locally. Sync with the event service failed."
    );
  };

  const questionTypeMeta = getQuestionTypeMeta(questionForm.type, questionForm.platform);
  const questionEditorKind = getQuestionEditorKind(questionForm.type);
  const isTextQuestion = questionEditorKind === "text";
  const isOptionsQuestion = questionEditorKind === "options";
  const showQuestionHelperText =
    questionEditorKind !== "checkbox" && questionTypeMeta.helperText;

  if (loading) {
    return <PageShell><div style={{ minHeight: "40vh", display: "grid", placeItems: "center" }}><Loader2 className="animate-spin" size={34} color="var(--primary-color)" /></div></PageShell>;
  }
  if (error) return <PageShell>{error}</PageShell>;
  if (!event) return <PageShell>Event not found.</PageShell>;

  return (
    <PageShell>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: isMobile ? "20px 14px 56px" : "34px 18px 72px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: isMobile ? "12px" : "18px",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            padding: isMobile ? "12px 14px" : "14px 18px",
            borderRadius: isMobile ? "18px" : "24px",
            background: "rgba(255,255,255,0.96)",
            border: "1px solid rgba(15,23,42,0.08)",
            backdropFilter: "blur(16px)",
            position: "sticky",
            top: isMobile ? 10 : 16,
            zIndex: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: isMobile ? "12px" : "18px",
              alignItems: "center",
              width: isMobile ? "100%" : "auto",
            }}
          >
            <Link href={routes.events} style={topNavActiveLinkStyle}>
              Events
            </Link>
            <Link href={routes.calendars} style={topNavLinkStyle}>
              Calendars
            </Link>
            <Link href={routes.discover} style={topNavLinkStyle}>
              Discover
            </Link>
          </div>

          <Link href={createEventHref} style={isMobile ? { ...topCreateEventButtonStyle, width: "100%", justifyContent: "center" } : topCreateEventButtonStyle}>
            <Plus size={14} />
            Create Event
          </Link>
        </div>

        {/* Breadcrumb & Header */}
        <div style={{ marginBottom: 32 }}>
          <div 
            onClick={() => router.back()}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--manage-muted)", fontSize: "0.92rem", marginBottom: 10, cursor: "pointer", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--manage-muted)")}
          >
            <ArrowLeft size={14} />
            <span style={{ fontWeight: 600 }}>Personal</span>
          </div>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "flex-end", gap: isMobile ? 14 : 24 }}>
            <h1 style={{ fontSize: isMobile ? "2rem" : "2.6rem", fontWeight: 800, margin: 0, letterSpacing: "-0.04em", overflowWrap: "anywhere" }}>{event.title}</h1>
            <a 
              href={`/events/${event.slug}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: isMobile ? "100%" : "auto", padding: "9px 12px", borderRadius: 10, background: "var(--manage-hover)", color: "var(--manage-fg)", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none" }}
            >
              Event Page <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} onChange={setActiveTab} />

        {/* Main Content Sections */}
        <section style={{ marginTop: 0 }}>
          {activeTab === "overview" && (
            <div style={{ display: "grid", gap: 32 }}>
               {/* Event Status / Header */}
               {eventDate && eventDate.getTime() < Date.now() ? (
                 <div>
                   <h3 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 8px" }}>This Event Has Ended</h3>
                   <p style={{ color: "var(--manage-muted)", fontSize: "0.95rem", margin: 0 }}>Thank you for hosting. We hope it was a success!</p>
                 </div>
               ) : (
                 <div>
                   <h3 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 8px" }}>Event Dashboard</h3>
                   <p style={{ color: "var(--manage-muted)", fontSize: "0.95rem", margin: 0 }}>Manage your event details and guests.</p>
                 </div>
               )}

               <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
                 {/* Event Recap */}
                 <div style={{ padding: 24, background: "var(--manage-card)", borderRadius: 16, border: "1px solid #f1f1f1", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--manage-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Event Recap</span>
                      <LinkIcon size={14} color="var(--manage-muted)" style={{ cursor: 'pointer' }} onClick={shareEvent} />
                    </div>
                    <div style={{ display: "grid", gap: 12, color: "var(--manage-fg)", fontSize: "0.95rem", fontWeight: 500 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Calendar size={16} color="var(--manage-muted)" />
                        <span>{formattedDate}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Clock3 size={16} color="var(--manage-muted)" />
                        <span>{formattedTime} GMT{eventDate ? eventDate.toLocaleTimeString("en-us",{timeZoneName:"short"}).split(" ").pop() : "+5:30"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <MapPin size={16} color="var(--manage-muted)" />
                        <span>{event.is_online ? "Virtual Event" : event.location || "Offline"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <User size={16} color="var(--manage-muted)" />
                        <span>{event.attendee_count || guests.length || 0} Guest{guests.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                 </div>

                 {/* Feedback */}
                 <div style={{ padding: 24, background: "var(--manage-card)", borderRadius: 16, border: "1px solid #f1f1f1", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--manage-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>Feedback</div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                      <div style={{ marginBottom: 16 }}><span style={{ display: "inline-block", background: "var(--manage-hover)", padding: "12px", borderRadius: "50%", fontSize: "1.2rem" }}>💬</span></div>
                      <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>No Feedback Collected</div>
                      <div style={{ color: "var(--manage-muted)", fontSize: "0.85rem", marginBottom: 12 }}>You are not collecting feedback for this event.</div>
                      <button style={{ color: "#ec4899", fontWeight: 700, fontSize: "0.9rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Schedule Feedback Email</button>
                    </div>
                 </div>
               </div>

               {/* Invitations */}
               <div>
                 <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "baseline", gap: 12, marginBottom: 4 }}>
                   <h3 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0 }}>Invitations</h3>
                   <button onClick={() => setInviteOpen(true)} style={{ background: "none", color: "var(--manage-muted)", border: "none", fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 6, cursor: "pointer", padding: 0 }}>
                     <Plus size={16} /> Invite Guests
                   </button>
                 </div>
                 <p style={{ color: "var(--manage-muted)", fontSize: "0.95rem", marginTop: 8, marginBottom: 24 }}>Invite subscribers, contacts and past guests via email or SMS.</p>
                 
                 <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: 20 }}>
                   <div style={{ padding: 24, background: "var(--manage-card)", borderRadius: 16, border: "1px solid #f1f1f1", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
                      <ExternalLink size={14} color="#ccc" style={{ position: "absolute", top: 20, right: 20 }} />
                      <div>
                        <div style={{ display: "flex", alignItems: "baseline" }}>
                          <span style={{ fontSize: "2.4rem", fontWeight: 800, letterSpacing: "-0.04em" }}>{guests.filter(g => g.status === 'confirmed').length}</span>
                          <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ccc" }}>/{Math.max(1, guests.length)}</span>
                        </div>
                        <div style={{ color: "var(--manage-muted)", fontSize: "0.95rem", fontWeight: 500 }}>Invitation{guests.length !== 1 ? 's' : ''} Accepted</div>
                      </div>
                      <div style={{ marginTop: 32, fontSize: "0.85rem", color: "var(--manage-muted)", display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>1 Email Opened <Info size={12} color="#ccc" /></div>
                        <div>0 Declined</div>
                      </div>
                   </div>

                   <div style={{ padding: 24, background: "var(--manage-card)", borderRadius: 16, border: "1px solid #f1f1f1", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--manage-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>Recently Accepted</div>
                      {guests.filter(g => g.status === 'confirmed').length === 0 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--manage-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                             <User size={16} color="var(--manage-muted)" />
                          </div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                             <span style={{ fontWeight: 700, fontSize: "0.95rem" }}></span>
                             <span style={{ fontSize: "0.85rem", color: "var(--manage-muted)" }}></span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          {guests.filter(g => g.status === 'confirmed').slice(0, 3).map((g, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--manage-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${g.user_email}`} alt="avatar" style={{width: 32, height: 32, borderRadius: "50%"}} />
                              </div>
                              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "baseline", gap: 8, minWidth: 0 }}>
                                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{g.user_name || "Guest"}</span>
                                <span style={{ fontSize: "0.85rem", color: "var(--manage-muted)", overflowWrap: "anywhere" }}>{g.user_email}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                   </div>
                 </div>
               </div>

            </div>
          )}

          {activeTab === "guests" && (
            <div style={{ display: "grid", gap: 32 }}>
              {/* Stats & Quick Actions */}
              <div>
                <h3 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 16px" }}>At a Glance</h3>
                <div style={{ color: "#bbb", fontSize: "1.8rem", fontWeight: 800, marginBottom: 20 }}>0 Going</div>
                <div style={{ height: 4, background: "#eee", borderRadius: 2, marginBottom: 32 }} />
                
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
                  <div onClick={() => setInviteOpen(true)} style={quickActionCardSmall}>
                    <div style={{ ...iconCircleSmall, background: "rgba(0, 102, 255, 0.08)", color: "#0066FF" }}><Users size={16} /></div>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Invite Guests</span>
                  </div>
                  <div onClick={() => setIsCheckInOpen(true)} style={quickActionCardSmall}>
                    <div style={{ ...iconCircleSmall, background: "rgba(34, 197, 94, 0.08)", color: "#16a34a" }}><QrCode size={16} /></div>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Check In Guests</span>
                  </div>
                  <div onClick={() => setIsGuestListOpen(true)} style={quickActionCardSmall}>
                    <div style={{ ...iconCircleSmall, background: "rgba(245, 158, 11, 0.08)", color: "#f59e0b" }}><Users size={16} /></div>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Guest List <span style={{ fontWeight: 500, fontSize: "0.8rem", color: "var(--manage-muted)" }}>Shown to guests</span></span>
                  </div>
                </div>
              </div>

              {/* Guest List Display */}
              <div>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 12, marginBottom: 24 }}>
                  <h3 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0 }}>Guest List</h3>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button style={tinyBtn}><UserPlus size={16} /></button>
                    <button style={tinyBtn}><List size={16} /></button>
                    <button style={tinyBtn}><Download size={16} /></button>
                  </div>
                </div>
                
                {guests.length === 0 ? (
                  <div style={{ padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, color: "#ccc" }}>
                    <Users size={64} strokeWidth={1} />
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#bbb", marginBottom: 4 }}>No Guests Yet</div>
                      <div style={{ color: "var(--manage-muted)" }}>Share the event or invite people to get started!</div>
                    </div>
                  </div>
                ) : (
                  <Card style={{ padding: 0 }}>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {guests.map((g, i) => (
                        <li key={i} style={{ padding: isMobile ? "16px" : "16px 24px", borderBottom: i === guests.length - 1 ? "none" : "1px solid #f5f5f5", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--manage-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <User size={18} color="var(--manage-muted)" />
                            </div>
                            <div>
                               <div style={{ fontWeight: 700, fontSize: "1.02rem" }}>{g.user_name || g.user_email || "Guest"}</div>
                               <div style={{ fontSize: "0.85rem", color: "var(--manage-muted)" }}>{g.user_email}</div>
                            </div>
                          </div>
                          <span style={{ alignSelf: isMobile ? "flex-start" : "auto", fontSize: "0.72rem", padding: "4px 10px", borderRadius: 99, background: g.status === 'confirmed' ? "rgba(34, 197, 94, 0.1)" : "var(--manage-hover)", color: g.status === 'confirmed' ? "#16a34a" : "var(--manage-muted)", fontWeight: 800 }}>{g.status}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === "registration" && (
            <div style={{ display: "grid", gap: 32 }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
                <div style={quickActionCardSmall}>
                  <div style={{ ...iconCircleSmall, background: "rgba(34, 197, 94, 0.08)", color: "#16a34a" }}><Layout size={16} /></div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Registration</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--manage-muted)" }}>Open</span>
                  </div>
                </div>
                <div style={quickActionCardSmall}>
                  <div style={{ ...iconCircleSmall, background: "rgba(245, 158, 11, 0.08)", color: "#f59e0b" }}><Monitor size={16} /></div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Event Capacity</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--manage-muted)" }}>{event.max_seats || "Unlimited"}</span>
                  </div>
                </div>
                <div style={quickActionCardSmall}>
                  <div style={{ ...iconCircleSmall, background: "rgba(147, 51, 234, 0.08)", color: "#9333ea" }}><Users size={16} /></div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Group Registration</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--manage-muted)" }}>Off</span>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 12, marginBottom: 16 }}>
                  <h3 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0 }}>Tickets</h3>
                  <button style={{ ...pillBtn, background: "var(--manage-hover)", color: "var(--manage-fg)", border: "none", boxShadow: "none", borderRadius: 10, padding: "8px 12px", fontSize: "0.9rem", width: isMobile ? "100%" : "auto", justifyContent: "center" }}>
                    <Plus size={16} /> New Ticket Type
                  </button>
                </div>
                <div style={{ marginBottom: 20, padding: 20, background: "var(--manage-card)", borderRadius: 20, border: "1px solid #f1f1f1", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "auto 1fr auto", gap: 16, alignItems: "center" }}>
                   <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg, #000, #333)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--manage-card)" }}>
                      <Zap size={24} />
                   </div>
                   <div>
                      <div style={{ fontWeight: 800, fontSize: "1.02rem" }}>Start Selling. <span style={{ fontWeight: 500, color: "var(--manage-muted)" }}>Connect Stripe to accept payments and receive payouts.</span></div>
                   </div>
                   <button style={{ ...actionPrimary, padding: "10px 18px", borderRadius: 12, width: isMobile ? "100%" : "auto", justifyContent: "center" }}>Get Started</button>
                </div>
                <div style={{ padding: "16px 20px", background: "var(--manage-card)", borderRadius: 16, border: "1px solid #f1f1f1", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: 12 }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, flexWrap: "wrap" }}>
                      Standard <span style={{ color: "var(--manage-muted)", fontWeight: 500 }}>Free</span>
                   </div>
                   <div style={{ color: "var(--manage-muted)", display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem" }}>
                      <Users size={16} /> 0
                   </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 8px" }}>Registration Email</h3>
                <p style={{ color: "var(--manage-muted)", fontSize: "0.95rem", marginBottom: 20 }}>Tailor the confirmation email sent to guests after they register.</p>
                <button style={{ ...actionPrimary, background: "#000", color: "var(--manage-card)" }}><Mail size={16} /> Customize Email</button>
              </div>

              <div>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 12, marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 6px" }}>Registration Questions</h3>
                    <p style={{ color: "var(--manage-muted)", fontSize: "0.92rem", margin: 0 }}>
                      Add custom questions and they will appear here in the registration UI.
                    </p>
                  </div>
                  <button
                    onClick={openAddQuestionModal}
                    style={{
                      ...pillBtn,
                      background: "var(--manage-hover)",
                      boxShadow: "none",
                      borderRadius: 10,
                      padding: "9px 14px",
                      width: isMobile ? "100%" : "auto",
                      justifyContent: "center",
                    }}
                  >
                    <Plus size={16} /> Add Question
                  </button>
                </div>
                <div style={{ display: "grid", gap: 24 }}>
                   <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, marginBottom: 12, color: "#16a34a" }}>
                         <UserCheck size={18} /> Personal Information
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                         <div style={questionBox}><User size={14} /> Name <span style={{ marginLeft: "auto", color: "#ccc" }}>Full Name</span></div>
                         <div style={questionBox}><Mail size={14} /> Email <span style={{ marginLeft: "auto", color: "#16a34a" }}>Required</span></div>
                         <div style={questionBox}><Phone size={14} /> Phone <span style={{ marginLeft: "auto", color: "var(--manage-muted)" }}>Off</span></div>
                      </div>
                   </div>
                   <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, marginBottom: 12, color: "#9333ea" }}>
                         <Wallet size={18} /> Web3 Identity
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                         <div style={questionBox}>ETH Address <span style={{ marginLeft: "auto", color: "var(--manage-muted)" }}>Off</span></div>
                         <div style={questionBox}>SOL Address <span style={{ marginLeft: "auto", color: "var(--manage-muted)" }}>Off</span></div>
                      </div>
                   </div>
                   <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: 12, flexDirection: isMobile ? "column" : "row", marginBottom: 12 }}>
                         <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#0f766e" }}>
                            <List size={18} /> Custom Questions
                         </div>
                         <div style={{ color: "var(--manage-muted)", fontSize: "0.86rem" }}>
                            {customQuestions.length} question{customQuestions.length === 1 ? "" : "s"}
                         </div>
                      </div>

                      {customQuestions.length === 0 ? (
                        <div style={questionEmptyState}>
                          No custom questions yet. Add one and it will show here right away.
                        </div>
                      ) : (
                        <div style={{ display: "grid", gap: 12 }}>
                          {customQuestions.map((question) => (
                            <div key={question.id} style={questionRowCard}>
                              <div style={questionHandle}>
                                <List size={16} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--manage-fg)" }}>
                                  {question.label}
                                </div>
                                {question.description ? (
                                  <div style={{ color: "var(--manage-muted)", fontSize: "0.9rem", marginTop: 4 }}>
                                    {question.description}
                                  </div>
                                ) : null}
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                                  <span style={questionMetaPill}>
                                    {getQuestionTypeIcon(question.type)}
                                    {getQuestionTypeLabel(question.type)}
                                  </span>
                                  {question.options.length > 0 ? (
                                    <span style={questionMetaPill}>
                                      {question.options.length} option{question.options.length === 1 ? "" : "s"}
                                    </span>
                                  ) : null}
                                  {question.required ? (
                                    <span style={{ ...questionMetaPill, color: "#16a34a" }}>
                                      Required
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 8, alignSelf: isMobile ? "flex-start" : "center" }}>
                                <button
                                  type="button"
                                  onClick={() => openEditQuestionModal(question)}
                                  style={questionActionBtn}
                                  aria-label={`Edit ${question.label}`}
                                >
                                  <PencilLine size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteQuestion(question.id, question.label)}
                                  style={questionActionBtn}
                                  aria-label={`Delete ${question.label}`}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "blasts" && (
            <div style={{ display: "grid", gap: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", background: "var(--manage-card)", borderRadius: 20, border: "1px solid #f1f1f1", flexWrap: "wrap" }}>
                 <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--manage-hover)", overflow: "hidden" }}>
                   {user?.profile_image ? <img src={user.profile_image} alt="" style={{ width: "100%", height: "100%" }} /> : <User size={20} style={{ transform: "translate(6px, 6px)" }} />}
                 </div>
                 <span style={{ color: "#bbb", fontWeight: 600 }}>Send a blast to your guests...</span>
              </div>
              <div style={{ padding: isMobile ? "28px 20px" : "48px 32px", borderRadius: 24, background: "var(--manage-card)", border: "1px dashed #ddd", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: 40, alignItems: "center" }}>
                 <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 10px" }}>Send Blasts</h3>
                    <p style={{ color: "var(--manage-muted)", fontSize: "1rem", lineHeight: 1.5, maxWidth: 360, margin: 0 }}>Share updates with your guests via email, SMS, and push notifications.</p>
                 </div>
                 <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", width: 140, height: 140 }}>
                    <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", border: "1px dashed #eee" }} />
                    <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", border: "1px dashed #eee" }} />
                    <div style={{ ...blastIcon, background: "var(--manage-card)", color: "#0066FF", top: 10, right: 10 }}><Mail size={20} /></div>
                    <div style={{ ...blastIcon, background: "var(--manage-card)", color: "#16a34a", top: 10, left: 10 }}><Smartphone size={20} /></div>
                    <div style={{ ...blastIcon, background: "var(--manage-card)", color: "#9333ea", bottom: 20, right: 20 }}><Zap size={20} /></div>
                    <div style={{ padding: 12, borderRadius: "50%", background: "#f9f9f9", color: "var(--manage-muted)" }}><Megaphone size={28} /></div>
                 </div>
              </div>
              <div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 24px" }}>System Messages</h3>
                <div style={{ display: "grid", gap: 12 }}>
                   <div style={systemMsgRow}>
                      <div style={{ ...iconCircleSmall, background: "#f9f9f9", color: "#bbb" }}><Calendar size={16} /></div>
                      <div style={{ flex: 1 }}>
                         <div style={{ fontWeight: 700, fontSize: "1.02rem" }}>Event Reminders</div>
                         <div style={{ fontSize: "0.85rem", color: "var(--manage-muted)" }}>Reminders are sent automatically via email, SMS, and push notification.</div>
                      </div>
                      <button style={tinyBtn}>Manage</button>
                   </div>
                   <div style={systemMsgRow}>
                      <div style={{ ...iconCircleSmall, background: "#f9f9f9", color: "#bbb" }}><Star size={16} /></div>
                      <div style={{ flex: 1 }}>
                         <div style={{ fontWeight: 700, fontSize: "1.02rem" }}>Post-Event Feedback</div>
                         <div style={{ fontSize: "0.85rem", color: "var(--manage-muted)" }}>Schedule a feedback email to go out after the event.</div>
                      </div>
                      <button style={tinyBtn}>Schedule</button>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "insights" && (
            <div style={{ display: "grid", gap: 32 }}>
              <div>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 12, marginBottom: 8 }}>
                  <h3 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0 }}>Page Views</h3>
                  <button style={{ ...tinyBtn, width: isMobile ? "100%" : "auto", justifyContent: "center" }}><Clock3 size={16} /> Past 7 Days <ChevronRight size={14} style={{ transform: "rotate(90deg)" }} /></button>
                </div>
                <p style={{ color: "var(--manage-muted)", fontSize: "0.95rem", marginBottom: 24 }}>See recent page views of the event page.</p>
                <div style={{ padding: 40, background: "var(--manage-card)", borderRadius: 24, border: "1px solid #f1f1f1", position: "relative", minHeight: 300, display: "flex", alignItems: "flex-end", gap: 12 }}>
                   {[0.2, 0.1, 0.4, 0.3, 0.5, 0.8, 0.4, 0.1, 0.9].map((h, i) => (
                     <div key={i} style={{ flex: 1, height: `${h * 200}px`, background: i === 8 ? "#ec4899" : "#eee", borderRadius: 4 }} />
                   ))}
                   <div style={{ position: "absolute", inset: 0, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#eee", pointerEvents: "none" }}>
                      <div style={{ borderTop: "1px solid #f9f9f9", width: "100%" }} />
                      <div style={{ borderTop: "1px solid #f9f9f9", width: "100%" }} />
                      <div style={{ borderTop: "1px solid #f9f9f9", width: "100%" }} />
                   </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 32 }}>
                <div>
                   <h4 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 20 }}>Page Views</h4>
                   <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 16 }}>
                      <div><div style={{ fontSize: "0.85rem", color: "var(--manage-muted)", fontWeight: 700 }}>24 hours</div><div style={{ fontSize: "1.5rem", fontWeight: 800 }}>2</div></div>
                      <div><div style={{ fontSize: "0.85rem", color: "var(--manage-muted)", fontWeight: 700 }}>7 days</div><div style={{ fontSize: "1.5rem", fontWeight: 800 }}>2</div></div>
                      <div><div style={{ fontSize: "0.85rem", color: "var(--manage-muted)", fontWeight: 700 }}>30 days</div><div style={{ fontSize: "1.5rem", fontWeight: 800 }}>2</div></div>
                   </div>
                   <h4 style={{ fontWeight: 800, fontSize: "1.1rem", marginTop: 40, marginBottom: 20 }}>Live Traffic</h4>
                   <div style={{ display: "grid", gap: 12 }}>
                      <div style={trafficRow}>
                        <Monitor size={16} color="#bbb" />
                        <div style={{ flex: 1 }}>
                           <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Visitor from Luma</div>
                           <div style={{ fontSize: "0.8rem", color: "var(--manage-muted)" }}>Tiruppur, Tamil Nadu • Embed</div>
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "var(--manage-muted)" }}>1h</span>
                      </div>
                   </div>
                </div>
                <div>
                   <div style={{ display: "grid", gap: 32 }}>
                      <section>
                         <h4 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 16 }}>Sources</h4>
                         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                            <span style={{ color: "var(--manage-muted)" }}>Luma</span>
                            <span style={{ fontWeight: 700 }}>100%</span>
                         </div>
                      </section>
                      <section>
                         <h4 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 16 }}>Cities</h4>
                         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                            <span style={{ color: "var(--manage-muted)" }}>Tiruppur, IN</span>
                            <span style={{ fontWeight: 700 }}>100%</span>
                         </div>
                      </section>
                      <section>
                         <h4 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 16 }}>UTM Sources</h4>
                         <p style={{ fontSize: "0.9rem", color: "var(--manage-muted)", lineHeight: 1.5, margin: 0 }}>Set up a tracking link by adding ?utm_source=your-link-name to your URL.</p>
                      </section>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "more" && (
            <div style={{ display: "grid", gap: 48, maxWidth: 680 }}>
              <section>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 12px" }}>Clone Event</h3>
                <p style={{ color: "var(--manage-muted)", fontSize: "1.05rem", lineHeight: 1.5, marginBottom: 28 }}>Create a new event with the same information as this one. Everything except the guest list and event blasts will be copied over.</p>
                <button style={{ ...actionPrimary, background: "var(--manage-fg)", borderRadius: 12, padding: "12px 20px" }}>
                  <RotateCcw size={18} /> Clone Event
                </button>
              </section>
              <section>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 12px" }}>Event Page</h3>
                <p style={{ color: "var(--manage-muted)", fontSize: "1.05rem", lineHeight: 1.5, marginBottom: 28 }}>When you choose a new URL, the current one will no longer work. Do not change your URL if you have already shared the event.</p>
                <div style={{ padding: "14px 20px", background: "var(--manage-hover)", borderRadius: 12, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: 12, marginBottom: 24, fontSize: "0.9rem", color: "var(--manage-muted)" }}>
                   <span>Upgrade to Luma Plus to set a custom URL for this event.</span>
                   <span style={{ fontWeight: 700, cursor: "pointer" }}>Learn More</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                   <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--manage-muted)" }}>Public URL</div>
                   <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12 }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "12px 16px", background: "#f9f9f9", borderRadius: 12, border: "1px solid #eee", fontSize: "1.05rem" }}>
                         <span style={{ color: "#bbb", marginRight: 8 }}>lu.ma/</span>
                         <span style={{ fontWeight: 600 }}>{event.slug}</span>
                      </div>
                      <button style={{ ...actionPrimary, background: "var(--manage-muted)", borderRadius: 12, cursor: "not-allowed", width: isMobile ? "100%" : "auto", justifyContent: "center" }}>Update</button>
                   </div>
                </div>
              </section>
              <section>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 12px" }}>Embed Event</h3>
                <p style={{ color: "var(--manage-muted)", fontSize: "1.05rem", lineHeight: 1.5, marginBottom: 28 }}>Have your own site? Embed the event to let visitors know about it.</p>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 32 }}>
                   <div style={embedCardActive}>
                      <div style={{ ...iconCircleSmall, background: "rgba(236, 72, 153, 0.1)", color: "#ec4899" }}><Layout size={16} /></div>
                      <span style={{ fontWeight: 700 }}>Embed as Button</span>
                      <Users size={16} style={{ marginLeft: "auto", color: "#ec4899" }} />
                   </div>
                   <div style={embedCard}>
                      <div style={{ ...iconCircleSmall, background: "rgba(236, 72, 153, 0.1)", color: "#ec4899" }}><Monitor size={16} /></div>
                      <span style={{ fontWeight: 700 }}>Embed Event Page</span>
                   </div>
                </div>
                <div style={{ fontSize: "0.95rem", color: "var(--manage-muted)", marginBottom: 16 }}>Paste the following HTML code snippet to your page:</div>
                <div style={{ position: "relative", padding: 24, background: "#fdfdfd", border: "1px solid #eee", borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
                   <div onClick={() => copyText(`<script src="${shareUrl}"></script>`)} style={{ position: "absolute", top: 12, right: 12, padding: "6px 12px", background: "var(--manage-hover)", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      <Copy size={14} /> Copy
                   </div>
                   <pre style={{ margin: 0, fontSize: "0.85rem", color: "#9333ea", lineHeight: 1.6 }}>
{`<a
  href="${shareUrl}"
  class="luma-checkout--button"
  data-luma-action="checkout"
  data-luma-event-id="${event.id}"
>
  Register for Event
</a>

<script id="luma-checkout" src="https://embed.lu.ma/checkout-button.js"></script>`}
                   </pre>
                </div>
                <div style={{ fontSize: "0.95rem", color: "var(--manage-muted)", marginBottom: 16 }}>This gives you the following button. Click it to see it in action!</div>
                <div style={{ padding: "40px", background: "var(--manage-card)", border: "1px solid #eee", borderRadius: 20, display: "flex", justifyContent: "center", marginBottom: 32 }}>
                   <button style={{ padding: "14px 28px", background: "#000", color: "white", borderRadius: 99, fontWeight: 900, border: "none" }}>Register for Event</button>
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--manage-muted)", lineHeight: 1.5 }}>
                   If you want to use your own styling for the button, simply remove the <code style={{ color: "var(--manage-fg)", fontWeight: 600 }}>luma-checkout--button</code> class from the snippet above.
                   <br /><br />
                   For advanced usage, check out our <span style={{ color: "#ec4899", fontWeight: 700 }}>example code and documentation.</span>
                </p>
              </section>
              <section style={{ borderTop: "1px solid #eee", paddingTop: 48 }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 12px" }}>Cancel Event</h3>
                <p style={{ color: "var(--manage-muted)", fontSize: "1.05rem", lineHeight: 1.5, marginBottom: 28 }}>Cancel and permanently delete this event. This operation cannot be undone. If there are any registered guests, we will notify them that the event has been canceled.</p>
                <button style={{ ...actionPrimary, background: "#ef4444", borderRadius: 12, opacity: 0.9 }}>
                  <Trash2 size={18} /> Cancel Event
                </button>
              </section>
            </div>
          )}
        </section>
      </div>

      {inviteOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", display: "grid", placeItems: "center", zIndex: 1000 }}>
          <div style={{ width: "min(94vw, 840px)", height: "min(90vh, 600px)", background: "var(--manage-card)", borderRadius: isMobile ? 18 : 24, boxShadow: "0 24px 60px rgba(0,0,0,0.15)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
             <div style={{ padding: isMobile ? "16px" : "16px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Invite Guests</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
                   <div style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid #eee", fontSize: "0.8rem", fontWeight: 700, color: "var(--manage-muted)", display: isCompact ? "none" : "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", border: "2px solid #ddd" }} /> 15 LEFT
                   </div>
                   <button onClick={() => setInviteOpen(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--manage-muted)" }}><X size={20} /></button>
                </div>
             </div>
             <div style={{ flex: 1, display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: 0 }}>
                <div style={{ width: isMobile ? "100%" : 260, borderRight: isMobile ? "none" : "1px solid #f0f0f0", borderBottom: isMobile ? "1px solid #f0f0f0" : "none", background: "#fdfdfd", padding: "20px 12px" }}>
                   <div style={{ display: "grid", gap: 4 }}>
                      <div style={{ ...inviteSidebarItem, background: "var(--manage-hover)", color: "#000" }}><Sparkles size={16} /> Suggestions</div>
                      <div style={inviteSidebarItem}><AtSign size={16} /> Enter Emails</div>
                   </div>
                   <div style={{ marginTop: 32, padding: "0 12px", fontSize: "0.75rem", fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.05em" }}>Calendar Contacts</div>
                   <div style={{ marginTop: 12, display: "grid", gap: 4 }}>
                      <div style={inviteSidebarItem}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#bbb" }} /> Everyone <span style={{ marginLeft: "auto", color: "#bbb" }}>0</span></div>
                   </div>
                   <div style={{ marginTop: 32, padding: "0 12px", fontSize: "0.75rem", fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.05em" }}>Events</div>
                   <div style={{ marginTop: 12, padding: "0 12px", fontSize: "0.85rem", color: "#bbb", display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock3 size={14} /> This is your first event.
                   </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? 24 : 60, textAlign: "center", overflowY: "auto" }}>
                   <div style={{ position: "relative", width: 200, height: 160, marginBottom: 40 }}>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                         <div style={{ width: 80, height: 80, background: "var(--manage-card)", border: "1px solid #eee", borderRadius: 20, boxShadow: "0 12px 24px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ddd" }}>
                            <Sparkles size={40} />
                         </div>
                      </div>
                      <div style={{ ...inviteCircle, background: "#dcfce7", top: 10, left: 10 }}><Users size={16} color="#16a34a" /></div>
                      <div style={{ ...inviteCircle, background: "#ffedd5", top: -20, left: 90 }}><Users size={16} color="#f97316" /></div>
                      <div style={{ ...inviteCircle, background: "#f3e8ff", top: 20, right: 10 }}><Users size={16} color="#9333ea" /></div>
                   </div>
                   <h3 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 12px" }}>Start Inviting Guests</h3>
                   <p style={{ color: "var(--manage-muted)", fontSize: "1rem", lineHeight: 1.5, maxWidth: 320, margin: "0 0 32px" }}>After you host an event, you'll find past guests here.</p>
                   <button style={{ ...actionPrimary, background: "var(--manage-fg)", padding: "14px 40px", borderRadius: 12, marginBottom: 16 }}><Mail size={18} /> Enter Emails</button>
                   <div style={{ fontSize: "0.85rem", color: "#ccc", margin: "10px 0" }}>or</div>
                   <button style={{ ...actionPrimary, background: "#4285f4", padding: "14px 40px", borderRadius: 12 }}><Zap size={18} /> Import from Google</button>
                </div>
             </div>
             <div style={{ padding: isMobile ? "16px" : "16px 24px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "flex-end" }}>
                <button style={{ ...actionPrimary, background: "#bbb", borderRadius: 10, padding: "10px 24px", width: isMobile ? "100%" : "auto", justifyContent: "center" }}>Next <ChevronRight size={18} /></button>
             </div>
          </div>
        </div>
      )}

      {isCheckInOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", display: "grid", placeItems: "center", zIndex: 1100 }}>
          <div style={{ width: "min(92vw, 360px)", background: "var(--manage-card)", borderRadius: 24, padding: isMobile ? 24 : 32, textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.15)", position: "relative" }}>
             <button onClick={() => setIsCheckInOpen(false)} style={{ position: "absolute", top: 16, right: 16, border: "none", background: "transparent", cursor: "pointer", color: "#bbb" }}><X size={20} /></button>
             <div style={{ ...iconCircle, background: "var(--manage-hover)", color: "var(--manage-fg)", width: 64, height: 64, margin: "0 auto 24px" }}><QrCode size={32} /></div>
             <h3 style={{ fontSize: "1.45rem", fontWeight: 800, marginBottom: 16 }}>Check In Guests</h3>
             <p style={{ color: "var(--manage-muted)", fontSize: "1rem", lineHeight: 1.5, marginBottom: 32 }}>You can check in guests with our web scanner, or with our iOS and Android apps.</p>
             <div style={{ display: "grid", gap: 12 }}>
                <button onClick={() => router.push(`/check-in/${event.slug}`)} style={{ ...actionPrimary, background: "var(--manage-fg)", width: "100%", justifyContent: "center", borderRadius: 12 }}>Open Web Scanner</button>
                <button style={{ ...actionPrimary, background: "var(--manage-hover)", color: "var(--manage-fg)", width: "100%", justifyContent: "center", borderRadius: 12 }}><Apple size={18} /> Download for iOS</button>
                <button style={{ ...actionPrimary, background: "var(--manage-hover)", color: "var(--manage-fg)", width: "100%", justifyContent: "center", borderRadius: 12 }}><Play size={18} /> Download for Android</button>
             </div>
          </div>
        </div>
      )}

      {isGuestListOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", display: "grid", placeItems: "center", zIndex: 1100 }}>
          <div style={{ width: "min(92vw, 360px)", background: "var(--manage-card)", borderRadius: 24, padding: isMobile ? 24 : 32, textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.15)", position: "relative" }}>
             <button onClick={() => setIsGuestListOpen(false)} style={{ position: "absolute", top: 16, right: 16, border: "none", background: "transparent", cursor: "pointer", color: "#bbb" }}><X size={20} /></button>
             <div style={{ ...iconCircle, background: "var(--manage-hover)", color: "var(--manage-fg)", width: 64, height: 64, margin: "0 auto 24px" }}><Users size={32} /></div>
             <h3 style={{ fontSize: "1.45rem", fontWeight: 800, marginBottom: 16 }}>Public Guest List</h3>
             <p style={{ color: "var(--manage-muted)", fontSize: "1rem", lineHeight: 1.5, marginBottom: 32 }}>Show guest count and a few guests on the event page, and let registered guests see the full guest list.</p>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#f9f9f9", borderRadius: 16, marginBottom: 32 }}>
                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Show Public Guest List</span>
                <div style={{ width: 44, height: 24, borderRadius: 12, background: "var(--manage-fg)", padding: 2, display: "flex", justifyContent: "flex-end", cursor: "pointer" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--manage-card)" }} />
                </div>
             </div>
             <button onClick={() => setIsGuestListOpen(false)} style={{ ...actionPrimary, background: "var(--manage-fg)", width: "100%", justifyContent: "center", borderRadius: 12 }}>Confirm</button>
          </div>
        </div>
      )}

      {editOpen && editForm && (
        <Modal title="Edit Event Details" subtitle="Update the event page, schedule, and ticket settings here." onClose={() => setEditOpen(false)}>
          <form onSubmit={saveEdit} style={{ display: "grid", gap: 14 }}>
            <input name="title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required style={inputStyle} placeholder="Event title" />
            <textarea name="description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={4} style={{ ...inputStyle, minHeight: 100, fontFamily: "inherit" }} placeholder="Description" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} required style={inputStyle} />
              <input type="time" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} required style={inputStyle} />
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={inputStyle}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
            </div>
            <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} required style={inputStyle} placeholder="Venue address or online link" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              <input type="number" min={0} value={editForm.max_seats} onChange={(e) => setEditForm({ ...editForm, max_seats: Number(e.target.value || 0) })} style={inputStyle} placeholder="Capacity" />
              <input type="number" min={0} step={0.5} value={editForm.ticket_price} onChange={(e) => setEditForm({ ...editForm, ticket_price: Number(e.target.value || 0) })} disabled={!editForm.is_paid} style={{ ...inputStyle, opacity: editForm.is_paid ? 1 : 0.6 }} placeholder="Ticket price" />
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", color: "#334155", fontWeight: 700 }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><input type="checkbox" checked={editForm.is_online} onChange={(e) => setEditForm({ ...editForm, is_online: e.target.checked })} /> Online event</label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><input type="checkbox" checked={editForm.is_paid} onChange={(e) => setEditForm({ ...editForm, is_paid: e.target.checked })} /> Paid tickets</label>
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={label}>Agenda (one item per line)</div>
              <textarea 
                value={(event as any).agenda?.join("\n") || ""} 
                onChange={(e) => {
                  const agenda = e.target.value.split("\n").filter(Boolean);
                  setEvent({ ...event, agenda } as any);
                }} 
                rows={3} 
                style={{ ...inputStyle, minHeight: 80, fontFamily: "inherit" }} 
                placeholder="Welcome\nKeynote\nNetworking" 
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <button type="button" onClick={() => setEditOpen(false)} style={actionSecondary}>Cancel</button>
              <button type="submit" disabled={saving} style={actionPrimary}>{saving ? <Loader2 className="animate-spin" size={16} /> : <PencilLine size={16} />}{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </form>
        </Modal>
      )}

      {questionModalOpen && (
        <Modal
          title=""
          subtitle=""
          onClose={closeQuestionModal}
          hideHeader
          width="min(96vw, 520px)"
          bodyStyle={{ padding: 0, maxHeight: "calc(100vh - 24px)", overflowY: "auto" }}
        >
          {questionTypePickerOpen ? (
            <div style={questionBuilderShell}>
              <div style={questionBuilderTopBar}>
                <button type="button" onClick={handleQuestionModalBack} style={questionBuilderTopAction}>
                  <ArrowLeft size={16} />
                </button>
                <div style={questionBuilderTitle}>Add Question</div>
                <button type="button" onClick={closeQuestionModal} style={questionBuilderTopAction}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: 16 }}>
                <div style={questionTypePickerGrid}>
                  {QUESTION_PICKER_TYPES.map((type) => {
                    const typeMeta = getQuestionTypeMeta(type, questionForm.platform);
                    const active = isQuestionPickerSelected(questionForm.type, type);

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          handleQuestionTypeChange(type);
                          setQuestionTypePickerOpen(false);
                        }}
                        style={active ? questionTypePickerCardActive : questionTypePickerCard}
                      >
                        <div style={questionTypePickerIcon}>{typeMeta.icon}</div>
                        <div style={{ textAlign: "left" }}>
                          <div style={questionTypePickerTitle}>{typeMeta.title}</div>
                          <div style={questionTypePickerSubtitle}>{typeMeta.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={saveQuestion} style={questionBuilderShell}>
              <div style={questionBuilderTopBar}>
                <button type="button" onClick={handleQuestionModalBack} style={questionBuilderTopAction}>
                  <ArrowLeft size={16} />
                </button>
                <div style={questionBuilderTitle}>
                  {editingQuestionId ? "Edit Question" : "Add Question"}
                </div>
                <button type="button" onClick={closeQuestionModal} style={questionBuilderTopAction}>
                  <X size={18} />
                </button>
              </div>

              <div style={questionTypeHero}>
                <div style={questionTypeHeroIcon}>{questionTypeMeta.icon}</div>
                <div>
                  <div style={questionTypeHeroTitle}>{questionTypeMeta.title}</div>
                  <div style={questionTypeHeroSubtitle}>{questionTypeMeta.subtitle}</div>
                </div>
              </div>

              <div style={questionBuilderBody}>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={questionBuilderFieldLabel}>Question</div>
                  <input
                    value={questionForm.label}
                    onChange={(e) => setQuestionForm({ ...questionForm, label: e.target.value })}
                    required
                    style={questionBuilderInput}
                    placeholder={questionTypeMeta.placeholder}
                  />
                </div>

                {showQuestionHelperText ? (
                  <div style={questionBuilderHelperText}>{questionTypeMeta.helperText}</div>
                ) : null}

                {isTextQuestion && (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={questionBuilderFieldLabel}>Response Length</div>
                    <SegmentedControl
                      options={[
                        { value: "short_text", label: "Short", icon: <Info size={14} /> },
                        { value: "long_text", label: "Multi-Line", icon: <List size={14} /> },
                      ]}
                      value={questionForm.type}
                      onChange={(value) =>
                        handleQuestionTypeChange(value as RegistrationQuestionType)
                      }
                    />
                  </div>
                )}

                {isOptionsQuestion && (
                  <>
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={questionBuilderFieldLabel}>Options</div>
                      <input
                        value={questionForm.optionDraft}
                        onChange={(e) =>
                          setQuestionForm({ ...questionForm, optionDraft: e.target.value })
                        }
                        onKeyDown={handleOptionDraftKeyDown}
                        onBlur={addOptionFromDraft}
                        style={questionBuilderInput}
                        placeholder="Add options"
                      />
                      <div style={questionBuilderHelperText}>
                        Press Enter or Tab key to add a new option.
                      </div>
                      {questionForm.options.length > 0 ? (
                        <div style={questionOptionChipRow}>
                          {questionForm.options.map((option) => (
                            <span key={option} style={questionOptionChip}>
                              {option}
                              <button
                                type="button"
                                onClick={() => removeQuestionOption(option)}
                                style={questionOptionChipRemove}
                                aria-label={`Remove ${option}`}
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div style={{ display: "grid", gap: 10 }}>
                      <div style={questionBuilderFieldLabel}>Selection Type</div>
                      <SegmentedControl
                        options={[
                          { value: "single_select", label: "Single", icon: <List size={14} /> },
                          { value: "multi_select", label: "Multiple", icon: <List size={14} /> },
                        ]}
                        value={questionForm.type}
                        onChange={(value) =>
                          handleQuestionTypeChange(value as RegistrationQuestionType)
                        }
                      />
                    </div>
                  </>
                )}

                {questionEditorKind === "social_profile" && (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={questionBuilderFieldLabel}>Platform</div>
                    <div style={questionPlatformRow}>
                      {SOCIAL_PLATFORM_OPTIONS.map((platform) => {
                        const active = questionForm.platform === platform.value;
                        return (
                          <button
                            key={platform.value}
                            type="button"
                            onClick={() =>
                              setQuestionForm({ ...questionForm, platform: platform.value })
                            }
                            style={active ? questionPlatformPillActive : questionPlatformPill}
                          >
                            {getSocialPlatformIcon(platform.value)}
                            {platform.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gap: 10 }}>
                  <div style={questionSwitchRow}>
                    <div style={questionBuilderRequiredLabel}>Required</div>
                    <SwitchToggle
                      checked={questionForm.required}
                      onChange={(checked) =>
                        setQuestionForm({ ...questionForm, required: checked })
                      }
                    />
                  </div>

                  {questionTypeMeta.requiredHint ? (
                    <div style={questionBuilderHelperText}>{questionTypeMeta.requiredHint}</div>
                  ) : null}
                </div>

                <button type="submit" disabled={questionSaving} style={questionBuilderSubmit}>
                  {questionSaving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  {questionSaving
                    ? "Saving..."
                    : editingQuestionId
                      ? "Save Question"
                      : "Add Question"}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </PageShell>
  );
}

const topNavLinkStyle: React.CSSProperties = {
  color: "#6b7280",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "0.98rem",
  padding: "6px 2px",
  whiteSpace: "nowrap",
};

const topNavActiveLinkStyle: React.CSSProperties = {
  ...topNavLinkStyle,
  color: "#5b63ff",
};

const topCreateEventButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "9px 14px",
  borderRadius: "14px",
  background: "#107478",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "0.92rem",
  boxShadow: "0 12px 24px rgba(16,116,120,0.18)",
};

function PageShell({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div style={{
      '--manage-bg': isDark ? '#0f172a' : '#fdfdfd',
      '--manage-fg': isDark ? '#f8fafc' : '#000',
      '--manage-card': isDark ? '#1e293b' : '#fff',
      '--manage-card-border': isDark ? '#334155' : '#f1f1f1',
      '--manage-muted': isDark ? '#94a3b8' : '#666',
      '--manage-hover': isDark ? '#334155' : '#f9f9f9',
      '--manage-input': isDark ? '#0f172a' : '#fff',
      '--manage-btn': isDark ? '#334155' : '#f5f5f5',
      minHeight: "100vh", background: "var(--manage-bg)", color: "var(--manage-fg)", fontFamily: "inherit"
    } as any}>
      {children}
    </div>
  );
}

function TabBar({ activeTab, onChange }: { activeTab: (typeof tabs)[number]["key"]; onChange: (key: (typeof tabs)[number]["key"]) => void; }) {
  return (
    <div style={{ display: "flex", gap: 18, borderBottom: "1px solid var(--manage-card-border)", marginBottom: 24, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none", msOverflowStyle: "none" }}>
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{ 
              padding: "10px 2px", 
              border: "none", 
              background: "transparent", 
              color: active ? "var(--manage-fg)" : "var(--manage-muted)", 
              fontWeight: active ? 700 : 500, 
              fontSize: "0.96rem",
              flex: "0 0 auto",
              whiteSpace: "nowrap",
              cursor: "pointer", 
              borderBottom: active ? "2px solid var(--manage-fg)" : "2px solid transparent",
              transition: "all 0.2s"
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "var(--manage-card)", borderRadius: 18, padding: 18, border: "1px solid var(--manage-card-border)", boxShadow: "0 10px 20px rgba(0,0,0,0.04)", ...style }}>{children}</div>;
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
  hideHeader = false,
  width = "min(96vw, 560px)",
  bodyStyle,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
  hideHeader?: boolean;
  width?: string;
  bodyStyle?: React.CSSProperties;
}) {
  return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.42)", display: "grid", placeItems: "center", padding: 12, zIndex: 200 }}><div style={{ width, maxHeight: "calc(100vh - 24px)", background: "var(--manage-card)", borderRadius: 24, border: "1px solid var(--manage-card-border)", boxShadow: "0 26px 56px rgba(0,0,0,0.16)", overflow: "hidden" }}>{!hideHeader && <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--manage-card-border)", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}><div><div style={{ fontSize: "1.15rem", fontWeight: 800, color:"var(--manage-fg)" }}>{title}</div><div style={{ color: "var(--manage-muted)", marginTop: 6, fontSize: "0.92rem" }}>{subtitle}</div></div><button onClick={onClose} style={{ border: "none", background: "transparent", color: "var(--manage-muted)", cursor: "pointer" }}><X size={20} /></button></div>}<div style={{ padding: 20, maxHeight: "calc(100vh - 140px)", overflowY: "auto", ...bodyStyle }}>{children}</div></div></div>;
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={segmentedControlWrap}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={active ? segmentedControlOptionActive : segmentedControlOption}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function SwitchToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        ...switchTrack,
        justifyContent: checked ? "flex-end" : "flex-start",
        background: checked ? "var(--manage-fg)" : "#d4d4d8",
      }}
    >
      <span style={switchThumb} />
    </button>
  );
}

const metaChip: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 999, background: "var(--manage-card)", border: "1px solid var(--manage-card-border)", fontWeight: 700, fontSize: "0.82rem", color: "var(--manage-fg)" };
const pillBtn: React.CSSProperties = { padding: "10px 12px", borderRadius: 12, border: "1px solid var(--manage-card-border)", background: "var(--manage-card)", color: "var(--manage-fg)", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 10px 20px rgba(0,0,0,0.04)" };
const panel: React.CSSProperties = { padding: "14px 16px", borderRadius: 18, background: "var(--manage-hover)", border: "1px solid var(--manage-card-border)" };
const label: React.CSSProperties = { color: "var(--manage-muted)", fontWeight: 700 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 12px", borderRadius: 12, border: "1px solid var(--manage-card-border)", background: "var(--manage-input)", color: "var(--manage-fg)" };
const actionPrimary: React.CSSProperties = { padding: "11px 14px", borderRadius: 12, border: "none", background: "var(--manage-fg)", color: "var(--manage-bg)", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 };
const actionSecondary: React.CSSProperties = { padding: "11px 14px", borderRadius: 12, border: "1px solid var(--manage-card-border)", background: "var(--manage-card)", color: "var(--manage-fg)", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 };

const quickActionCard: React.CSSProperties = { display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: "var(--manage-card)", color: "var(--manage-fg)", borderRadius: 20, border: "1px solid var(--manage-card-border)", boxShadow: "0 10px 20px rgba(0,0,0,0.04)", cursor: "pointer" };
const iconCircle: React.CSSProperties = { width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" };
const dateBadgeMini: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, background: "var(--manage-hover)", color:"var(--manage-fg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid var(--manage-card-border)" };
const dateBadgeLarge: React.CSSProperties = { width: 50, height: 50, borderRadius: 14, background: "var(--manage-card)", color: "var(--manage-fg)", border: "1px solid var(--manage-card-border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.03)" };
const ghostBtn: React.CSSProperties = { flex: 1, padding: "11px", borderRadius: 12, background: "var(--manage-btn)", color: "var(--manage-fg)", border: "none", fontWeight: 700, fontSize: "0.92rem", cursor: "pointer" };
const tinyBtn: React.CSSProperties = { padding: "7px 10px", borderRadius: 10, background: "var(--manage-btn)", color: "var(--manage-fg)", border: "none", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };

const iconCircleSmall: React.CSSProperties = { width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" };
const quickActionCardSmall: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--manage-card)", color: "var(--manage-fg)", borderRadius: 14, border: "1px solid var(--manage-card-border)", cursor: "pointer" };
const questionBox: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "10px 12px", background: "var(--manage-hover)", borderRadius: 12, fontSize: "0.86rem", color: "var(--manage-muted)", border: "1px solid var(--manage-card-border)" };
const questionEmptyState: React.CSSProperties = { padding: "18px 16px", borderRadius: 16, border: "1px dashed var(--manage-card-border)", background: "var(--manage-hover)", color: "var(--manage-muted)", fontSize: "0.92rem" };
const questionRowCard: React.CSSProperties = { display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap", padding: "16px 18px", borderRadius: 18, background: "var(--manage-card)", border: "1px solid var(--manage-card-border)", boxShadow: "0 8px 18px rgba(0,0,0,0.03)" };
const questionHandle: React.CSSProperties = { width: 34, height: 34, borderRadius: 10, background: "var(--manage-hover)", color: "var(--manage-muted)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--manage-card-border)", flexShrink: 0 };
const questionMetaPill: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px", borderRadius: 999, background: "var(--manage-hover)", border: "1px solid var(--manage-card-border)", color: "var(--manage-muted)", fontSize: "0.82rem", fontWeight: 700 };
const questionActionBtn: React.CSSProperties = { width: 34, height: 34, borderRadius: 10, border: "1px solid var(--manage-card-border)", background: "var(--manage-card)", color: "var(--manage-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
const questionBuilderShell: React.CSSProperties = { display: "grid", gap: 0 };
const questionBuilderTopBar: React.CSSProperties = { display: "grid", gridTemplateColumns: "40px 1fr 40px", alignItems: "center", gap: 12, padding: "12px 14px 10px" };
const questionBuilderTopAction: React.CSSProperties = { width: 30, height: 30, borderRadius: "50%", border: "none", background: "var(--manage-hover)", color: "var(--manage-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
const questionBuilderTitle: React.CSSProperties = { textAlign: "center", fontSize: "1.05rem", fontWeight: 800, color: "var(--manage-fg)" };
const questionTypeHero: React.CSSProperties = { display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 20px 18px", borderBottom: "1px solid var(--manage-card-border)" };
const questionTypeHeroIcon: React.CSSProperties = { width: 34, height: 34, borderRadius: 10, background: "var(--manage-hover)", color: "var(--manage-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const questionTypeHeroTitle: React.CSSProperties = { fontSize: "1rem", fontWeight: 700, color: "var(--manage-fg)" };
const questionTypeHeroSubtitle: React.CSSProperties = { marginTop: 2, color: "var(--manage-muted)", fontSize: "0.94rem", lineHeight: 1.4 };
const questionBuilderBody: React.CSSProperties = { display: "grid", gap: 18, padding: "18px 20px 20px" };
const questionBuilderFieldLabel: React.CSSProperties = { color: "var(--manage-fg)", fontSize: "0.98rem", fontWeight: 700 };
const questionBuilderInput: React.CSSProperties = { width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--manage-card-border)", background: "var(--manage-input)", color: "var(--manage-fg)", fontSize: "0.98rem" };
const questionBuilderHelperText: React.CSSProperties = { color: "var(--manage-muted)", fontSize: "0.9rem", lineHeight: 1.45 };
const questionBuilderRequiredLabel: React.CSSProperties = { fontSize: "0.98rem", fontWeight: 700, color: "var(--manage-fg)" };
const questionBuilderSubmit: React.CSSProperties = { width: "100%", padding: "13px 16px", borderRadius: 10, border: "none", background: "#3f3f46", color: "#ffffff", fontWeight: 800, fontSize: "1rem", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 };
const questionSwitchRow: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 };
const segmentedControlWrap: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 0, padding: 3, borderRadius: 12, background: "var(--manage-hover)", border: "1px solid var(--manage-card-border)" };
const segmentedControlOption: React.CSSProperties = { minHeight: 40, borderRadius: 10, border: "none", background: "transparent", color: "var(--manage-muted)", fontWeight: 700, fontSize: "0.98rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" };
const segmentedControlOptionActive: React.CSSProperties = { ...segmentedControlOption, background: "var(--manage-card)", color: "var(--manage-fg)", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" };
const switchTrack: React.CSSProperties = { width: 44, height: 26, borderRadius: 999, border: "none", padding: 3, display: "inline-flex", alignItems: "center", cursor: "pointer", transition: "all 0.2s ease" };
const switchThumb: React.CSSProperties = { width: 20, height: 20, borderRadius: "50%", background: "#ffffff", boxShadow: "0 1px 2px rgba(15,23,42,0.18)" };
const questionOptionChipRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8 };
const questionOptionChip: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: "var(--manage-hover)", color: "var(--manage-fg)", border: "1px solid var(--manage-card-border)", fontSize: "0.88rem", fontWeight: 600 };
const questionOptionChipRemove: React.CSSProperties = { width: 18, height: 18, borderRadius: "50%", border: "none", background: "transparent", color: "var(--manage-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 };
const questionPlatformRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8 };
const questionPlatformPill: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 999, border: "1px solid var(--manage-card-border)", background: "var(--manage-card)", color: "var(--manage-muted)", fontWeight: 700, cursor: "pointer" };
const questionPlatformPillActive: React.CSSProperties = { ...questionPlatformPill, background: "var(--manage-hover)", color: "var(--manage-fg)", border: "1px solid var(--manage-fg)" };
const questionTypePickerGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 };
const questionTypePickerCard: React.CSSProperties = { display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 16, border: "1px solid var(--manage-card-border)", background: "var(--manage-card)", color: "var(--manage-fg)", cursor: "pointer", textAlign: "left" };
const questionTypePickerCardActive: React.CSSProperties = { ...questionTypePickerCard, border: "1px solid var(--manage-fg)", background: "var(--manage-hover)" };
const questionTypePickerIcon: React.CSSProperties = { width: 34, height: 34, borderRadius: 10, background: "var(--manage-hover)", color: "var(--manage-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const questionTypePickerTitle: React.CSSProperties = { fontSize: "0.96rem", fontWeight: 700, color: "var(--manage-fg)" };
const questionTypePickerSubtitle: React.CSSProperties = { marginTop: 2, color: "var(--manage-muted)", fontSize: "0.87rem", lineHeight: 1.4 };
const blastIcon: React.CSSProperties = { position: "absolute", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" };
const systemMsgRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "10px 0" };
const trafficRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "10px 0" };

const embedCard: React.CSSProperties = { padding: 14, background: "var(--manage-card)", color: "var(--manage-fg)", border: "1px solid var(--manage-card-border)", borderRadius: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" };
const embedCardActive: React.CSSProperties = { ...embedCard, border: "1px solid #a855f7", background: "rgba(168, 85, 247, 0.05)" };

const inviteSidebarItem: React.CSSProperties = { padding: "7px 10px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, fontSize: "0.86rem", fontWeight: 600, color: "var(--manage-muted)", cursor: "pointer" };
const inviteCircle: React.CSSProperties = { position: "absolute", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid var(--manage-bg)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };
