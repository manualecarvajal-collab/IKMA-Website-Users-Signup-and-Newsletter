import {
  ArrowLeft, ArrowRight, Award, BadgeCheck, Bell, BookOpen, Briefcase, Building,
  Calendar, Check, CheckCircle, ChevronDown, ChevronRight, ClipboardList,
  Eye, EyeOff, FilePlus, FileText, Filter, FlaskConical, Globe, GraduationCap,
  HeartHandshake, HeartPulse, Home, Hospital, ImagePlus, Info, LayoutDashboard,
  Mail, Menu, MinusCircle, MonitorPlay, Newspaper, PenSquare, Pencil, Play,
  PlayCircle, Plus, PlusCircle, Quote, RefreshCw, Save, Search, Send, Star,
  Stethoscope, Trash2, Trophy, Upload, User,   UserMinus, UserPlus, Users, X, MapPin,
  type LucideProps,
} from "lucide-react"

const map: Record<string, React.ComponentType<LucideProps>> = {
  add: Plus,
  add_circle: PlusCircle,
  add_photo_alternate: ImagePlus,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  article: Newspaper,
  award_star: Award,
  business: Building,
  calendar_today: Calendar,
  check: Check,
  check_circle: CheckCircle,
  chevron_right: ChevronRight,
  clinical_notes: ClipboardList,
  close: X,
  cloud_upload: Upload,
  dashboard: LayoutDashboard,
  delete: Trash2,
  description: FileText,
  edit: Pencil,
  edit_note: PenSquare,
  emoji_events: Trophy,
  groups: Users,
  expand_more: ChevronDown,
  filter_list: Filter,
  format_quote: Quote,
  home: Home,
  info: Info,
  local_hospital: Hospital,
  location_on: MapPin,
  mail: Mail,
  medical_services: HeartPulse,
  menu: Menu,
  menu_book: BookOpen,
  note_add: FilePlus,
  person: User,
  person_add: UserPlus,
  person_remove: UserMinus,
  play_arrow: Play,
  play_circle: PlayCircle,
  public: Globe,
  remove_circle: MinusCircle,
  save: Save,
  school: GraduationCap,
  science: FlaskConical,
  search: Search,
  send: Send,
  smart_display: MonitorPlay,
  star: Star,
  stethoscope: Stethoscope,
  subscriptions: Bell,
  sync: RefreshCw,
  verified: BadgeCheck,
  visibility: Eye,
  visibility_off: EyeOff,
  volunteer_activism: HeartHandshake,
  work_history: Briefcase,
}

export default function Icon({
  name,
  className,
  size = 24,
  ...props
}: { name: string; className?: string; size?: number } & Omit<LucideProps, "size" | "ref">) {
  const Component = map[name]
  if (!Component) {
    if (process.env.NODE_ENV === "development") console.warn(`Icon not found: "${name}"`)
    return null
  }
  return <Component className={className} size={size} {...props} />
}
