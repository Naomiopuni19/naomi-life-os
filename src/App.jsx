import React, { useEffect, useState } from "react";
import {
  Search, Bell, Coffee, Home, Calendar, CheckSquare, GraduationCap,
  Briefcase, Target, BookOpen, Heart, DollarSign, Moon as MoonIcon,
  Film, Image as ImageIcon, Library, Clock, StickyNote, Settings,
  Plus, ChevronLeft, ChevronRight, Play, Sun as SunIcon, Menu, X,
  FileText, UserCircle, Link as LinkIcon, Cake, Download,
  Sparkles, MapPin, Trophy, Users, BarChart3, Lock, MessageCircle, Trash2,
} from "lucide-react";

import { useTasks } from "./lib/useTasks";
import { useCareerApps } from "./lib/useCareerApps";
import { useJournal } from "./lib/useJournal";
import { useSupabaseList, useSupabaseRow } from "./lib/useSupabaseList";
import { useMemories } from "./lib/useMemories";
import { useSleepLog, deriveSleepSummary } from "./lib/useSleepLog";
import { usePushNotifications } from "./lib/usePushNotifications";
import { useProfile } from "./lib/useProfile";
import { useDocuments } from "./lib/useDocuments";
import { supabase } from "./lib/supabaseClient";
import { useBrainDump } from "./lib/useBrainDump";
import { useNaomiChat } from "./lib/useNaomiChat";
import { useChatConversations } from "./lib/useChatConversations";
import { useDailyInsight } from "./lib/useDailyInsight";
import { useRecommendations } from "./lib/useRecommendations";

/* ---------------- storage ---------------- */
const useStored = (key, initial) => {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

const daysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
};

const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------------- sidebar config ---------------- */
const defaultGoalsShared = [
  { text: "Build my portfolio", progress: 80 },
  { text: "Save GHC 10,000", progress: 60 },
  { text: "Learn Python deeply", progress: 65 },
  { text: "Read 12 books this year", progress: 40 },
];

const NAV = [
  { key: "home", label: "Home", icon: Home },
  { key: "calendar", label: "Calendar", icon: Calendar },
  { key: "tasks", label: "Tasks", icon: CheckSquare },
  { key: "reminders", label: "Reminders", icon: Bell },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "career", label: "Career / NSS", icon: Briefcase },
  { key: "goals", label: "Goals", icon: Target },
  { key: "journal", label: "Journal", icon: BookOpen },
  { key: "love", label: "Love Life", icon: Heart },
  { key: "finance", label: "Finance", icon: DollarSign },
  { key: "health", label: "Health & Sleep", icon: MoonIcon },
  { key: "entertainment", label: "Entertainment", icon: Film },
  { key: "memories", label: "Memories", icon: ImageIcon },
  { key: "library", label: "Library", icon: Library },
  { key: "timeline", label: "Timeline", icon: Clock },
  { key: "notes", label: "Notes & Ideas", icon: StickyNote },
  { key: "about", label: "About Me", icon: UserCircle },
  { key: "habits", label: "Habits", icon: Sparkles },
  { key: "places", label: "Places & Bucket List", icon: MapPin },
  { key: "wins", label: "Wins", icon: Trophy },
  { key: "recommenders", label: "References", icon: Users },
  { key: "numbers", label: "Life in Numbers", icon: BarChart3 },
  { key: "chat", label: "Chat with Naomi", icon: MessageCircle },
  { key: "documents", label: "My Documents", icon: FileText },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function App() {
  const [active, setActive] = useState("home");
  const [themeMode, setThemeMode] = useStored("theme_mode", "ivory"); // "ivory" | "blush" | "midnight"
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { profile, uploadAvatar, uploading: avatarUploading } = useProfile();
  const profileName = profile.name;
  const tagline = profile.tagline;
  const [unlockedSections, setUnlockedSections] = useState(new Set());
  const unlockSection = (key) => setUnlockedSections((prev) => new Set(prev).add(key));

  const [gradDate] = useStored("grad_date", "2026-09-02");
  const [nssDate] = useStored("nss_date", "2026-09-12");
  const [mood, setMood] = useStored("mood", null);
  const { tasks, addTask: addTaskDb, toggleTask, removeTask, clearCompleted } = useTasks();
  const [newTask, setNewTask] = useState("");

  const defaultEvents = [
    { title: "Graduation Day", date: gradDate, icon_key: "graduation" },
    { title: "NSS Registration Opens", date: nssDate, icon_key: "briefcase" },
  ];
  const { rows: events } = useSupabaseList("events", "created_at", true, defaultEvents);

  const { logs: sleepLogs } = useSleepLog();
  const sleep = deriveSleepSummary(sleepLogs);

  const [journalEntry, setJournalEntry] = useStored("journal_quote", "Today, I choose progress over perfection.");
  const { row: watching, update: updateWatching } = useSupabaseRow("watching", { title: "Stranger Things", detail: "Season 2 · Episode 4", progress: 42, next: "S2 E5 - Chapter Five" });

  const { rows: goals } = useSupabaseList("goals", "created_at", true, defaultGoalsShared);

  const today = new Date();
  const todayStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const gradDays = daysUntil(gradDate);
  const nssDays = daysUntil(nssDate);
  const doneCount = tasks.filter((t) => t.done).length;

  const addTask = () => {
    if (!newTask.trim()) return;
    addTaskDb(newTask.trim());
    setNewTask("");
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "midnight");
    document.documentElement.classList.toggle("blush", themeMode === "blush");
  }, [themeMode]);

  return (
    <>
    <div className="min-h-screen flex text-[#2E241C] dark:text-[#F2E7DA]">
        {/* -------- Sidebar (desktop) -------- */}
        <aside className="w-[230px] shrink-0 hidden md:flex flex-col justify-between px-5 py-6 glass-strong m-3 mr-0 rounded-2xl overflow-y-auto sticky top-3 h-[calc(100vh-1.5rem)]">
          <SidebarContent active={active} setActive={setActive} profileName={profileName} tagline={tagline} avatarUrl={profile.avatar_url} onUploadAvatar={uploadAvatar} avatarUploading={avatarUploading} />
        </aside>

        {/* -------- Sidebar (mobile overlay) -------- */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-[260px] glass-strong px-5 py-6 flex flex-col justify-between animate-in overflow-y-auto">
              <button onClick={() => setMobileNavOpen(false)} className="absolute top-4 right-4 text-[#8A5A44]">
                <X size={18} />
              </button>
              <SidebarContent active={active} setActive={(k) => { setActive(k); setMobileNavOpen(false); }} profileName={profileName} tagline={tagline} avatarUrl={profile.avatar_url} onUploadAvatar={uploadAvatar} avatarUploading={avatarUploading} />
            </aside>
          </div>
        )}

        {/* -------- Main -------- */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6 gap-3">
            <button onClick={() => setMobileNavOpen(true)} className="md:hidden text-[#8A5A44] dark:text-[#D8B48C]">
              <Menu size={20} />
            </button>
            <GlobalSearch setActive={setActive} />
            <div className="flex items-center gap-3 sm:gap-4">
              <ThemeSwitcher themeMode={themeMode} setThemeMode={setThemeMode} />
              <button className="relative text-[#8A5A44] dark:text-[#D8B48C]">
                <Bell size={17} />
                {tasks.some((t) => !t.done) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#B8863B]" />
                )}
              </button>
              <Coffee size={17} className="text-[#8A5A44] dark:text-[#D8B48C] hidden sm:block" />
              <span className="text-sm hidden lg:inline">{greeting}, Naomi</span>
              <div className="w-9 h-9 rounded-full bg-[#E7A6A0] flex items-center justify-center text-white font-display text-sm shrink-0 overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profileName?.charAt(0) || "N"
                )}
              </div>
            </div>
          </div>

          {active === "home" && (
            <>
              {/* Hero */}
              <div className="rounded-3xl relative mb-6 h-[190px] bg-gradient-to-br from-[#F3D9CE] via-[#F0E3D3] to-[#E9DCC6] dark:from-[#3A2A2E] dark:via-[#2E2220] dark:to-[#241A18] flex items-center px-8">
                <div className="relative z-10">
                  <p className="font-display text-3xl sm:text-[34px] text-[#2E241C] dark:text-[#F2E7DA]">{greeting}, Naomi</p>
                  <p className="text-sm text-[#6B5A48] dark:text-[#C9B8A8] mt-1">{todayStr}</p>
                  <p className="text-sm text-[#6B5A48] dark:text-[#C9B8A8] mt-2">You are exactly where you need to be. Keep going, beautiful.</p>
                  <QuickAddButton setActive={setActive} />
                </div>
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                  <div className="absolute right-0 top-0 h-full w-1/3 opacity-70 dark:opacity-40" style={{
                    background: "radial-gradient(circle at 70% 30%, rgba(231,166,160,0.45), transparent 60%)",
                  }} />
                </div>
              </div>

              <DailyInsight
                snapshot={{
                  gradDays,
                  nssDays,
                  tasksOpen: tasks.filter((t) => !t.done).map((t) => t.text),
                  mood,
                  sleepLastNight: sleep.total,
                  upcomingEvents: events.map((e) => ({ title: e.title, days: daysUntil(e.date) })),
                  goals: goals.map((g) => ({ text: g.text, progress: g.progress })),
                }}
              />

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={GraduationCap} label="Graduation" value={gradDays >= 0 ? gradDays : 0} unit="days left" sub={fmt(gradDate)} />
                <StatCard icon={Briefcase} label="NSS Registration" value={nssDays >= 0 ? nssDays : 0} unit="days left" sub={fmt(nssDate)} />
                <StatCard icon={CheckSquare} label="Tasks Today" value={tasks.length - doneCount} unit="tasks" sub="Keep focusing!" />
                <StatCard icon={MoonIcon} label="Sleep Last Night" value={sleep.total} unit="" sub="Good sleep •" />
              </div>

              <div className="grid lg:grid-cols-3 gap-5">
                {/* Today's plan */}
                <div className="lg:col-span-2 glass rounded-2xl animate-in p-5">
                  <CardHeader title="Today's Plan" action="View all tasks" />
                  <ul className="mt-3 divide-y divide-[#F3E8D8] dark:divide-[#2A231C]">
                    {tasks.map((t) => (
                      <li key={t.id} className="flex items-center gap-3 py-2.5">
                        <button
                          onClick={() => toggleTask(t.id)}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            t.done ? "bg-[#5C4433] border-[#5C4433] text-white" : "border-[#CBB99C]"
                          }`}
                        >
                          {t.done && <span className="w-2 h-2 rounded-full bg-[#F3D9CE]" />}
                        </button>
                        <div className="flex-1">
                          <p className={`text-sm ${t.done ? "line-through text-[#B0A08A]" : "font-medium"}`}>{t.text}</p>
                          {t.sub && <p className="text-xs text-[#9A8A76]">{t.sub}</p>}
                        </div>
                        {t.time && <span className="text-xs text-[#9A8A76]">{t.time}</span>}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 mt-3">
                    <input
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTask()}
                      placeholder="Add a task"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
                    />
                    <button onClick={addTask} className="px-3 rounded-lg bg-[#5C4433] text-white text-sm">Add</button>
                  </div>
                </div>

                {/* Upcoming events */}
                <div className="glass rounded-2xl animate-in p-5">
                  <CardHeader title="Upcoming Events" action="View calendar" />
                  <ul className="mt-3 space-y-3">
                    {events.map((e) => {
                      const d = daysUntil(e.date);
                      return (
                        <li key={e.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <IconFor iconKey={e.icon_key} size={15} className="text-[#8A5A44]" />
                            <div>
                              <p className="text-sm font-medium">{e.title}</p>
                              <p className="text-xs text-[#9A8A76]">{fmt(e.date)}</p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-[#F3E8D8] dark:bg-[#2A231C]">{d} days</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-5 mt-5">
                {/* Mini calendar */}
                <MiniCalendar />

                {/* Sleep tracker */}
                <div className="glass rounded-2xl animate-in p-5">
                  <CardHeader title="Sleep Tracker" action="Edit" />
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-center">
                      <p className="text-xs text-[#9A8A76]">Went to bed</p>
                      <p className="text-sm font-medium">{sleep.bed}</p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-[#F3D9CE] flex items-center justify-center">
                      <MoonIcon size={20} className="text-[#8A5A44]" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[#9A8A76]">Woke up</p>
                      <p className="text-sm font-medium">{sleep.wake}</p>
                    </div>
                  </div>
                  <p className="text-center text-sm mt-3 font-medium">{sleep.total} <span className="text-xs text-[#9A8A76] font-normal">Total Sleep</span></p>
                  <div className="flex items-end gap-1.5 mt-4 h-14">
                    {sleep.week.map((h, i) => (
                      <div key={i} className="flex-1 bg-[#F0DCC9] rounded-full" style={{ height: `${(h / 5) * 100}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-[#9A8A76] mt-1">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
                  </div>
                </div>

                {/* Love life */}
                <div className="glass rounded-2xl animate-in p-5">
                  <CardHeader title="Love Life" action="View all" />
                  <p className="text-sm mt-3 font-medium">A quiet space for you</p>
                  <p className="text-xs text-[#9A8A76] mt-1">Add important dates, notes, and moments you want to remember.</p>
                  <button onClick={() => setActive("love")} className="text-xs text-[#8A5A44] dark:text-[#D8B48C] mt-3">Open Love Life →</button>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-5 mt-5">
                {/* Mood */}
                <div className="glass rounded-2xl animate-in p-5">
                  <CardHeader title="How Are You Feeling?" action="Today" />
                  <div className="flex justify-between mt-4">
                    {["Great", "Good", "Okay", "Low", "Exhausted"].map((label) => (
                      <button key={label} onClick={() => setMood(label)} className="flex flex-col items-center gap-1.5">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center border transition ${
                            mood === label ? "bg-[#5C4433] border-[#5C4433]" : "border-[#CBB99C] bg-white/40"
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${mood === label ? "bg-[#F3D9CE]" : "bg-transparent"}`} />
                        </span>
                        <span className="text-[10px] text-[#9A8A76]">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Journal */}
                <div className="glass rounded-2xl animate-in p-5">
                  <CardHeader title="Journal" action="New entry" />
                  <div className="bg-[#FDF3EC] dark:bg-[#2A231C] rounded-xl p-3 mt-3">
                    <textarea
                      value={journalEntry}
                      onChange={(e) => setJournalEntry(e.target.value)}
                      className="w-full bg-transparent text-sm italic outline-none resize-none"
                      rows={2}
                    />
                  </div>
                  <p className="text-xs text-[#9A8A76] mt-2">Daily reflection... · {fmt(new Date().toISOString())}</p>
                </div>

                {/* Currently watching */}
                <div className="glass rounded-2xl animate-in p-5">
                  <CardHeader title="Currently Watching" action="View all" />
                  <div className="flex gap-3 mt-3">
                    <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-[#5C4433] to-[#2E241C] shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{watching.title}</p>
                      <p className="text-xs text-[#9A8A76]">{watching.detail}</p>
                      <div className="h-1.5 rounded-full bg-[#F3E8D8] dark:bg-[#2A231C] mt-2">
                        <div className="h-full rounded-full bg-[#5C4433]" style={{ width: `${watching.progress}%` }} />
                      </div>
                      <p className="text-[10px] text-[#9A8A76] mt-2">Up next: {watching.next}</p>
                    </div>
                    <button className="w-7 h-7 rounded-full border border-[#EEE0CE] dark:border-[#3B2F26] flex items-center justify-center self-end">
                      <Play size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-5 mt-5">
                {/* Goals */}
                <div className="glass rounded-2xl animate-in p-5">
                  <CardHeader title="Current Goals" action="View all" />
                  <div className="space-y-3 mt-3">
                    {goals.map((g) => (
                      <div key={g.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{g.text}</span>
                          <span className="text-[#9A8A76]">{g.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#F3E8D8] dark:bg-[#2A231C]">
                          <div className="h-full rounded-full bg-[#5C4433]" style={{ width: `${g.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Memory of the day */}
                <div className="glass rounded-2xl animate-in p-5">
                  <CardHeader title="Memory Of The Day" action="View all" />
                  <div className="rounded-xl overflow-hidden mt-3 h-32 bg-gradient-to-br from-[#8A5A44] via-[#5C4433] to-[#2E241C]" />
                  <p className="text-xs text-[#9A8A76] mt-2">{fmt(new Date().toISOString())}</p>
                  <p className="text-sm mt-1">One of those peaceful evenings that healed something in me.</p>
                </div>
              </div>

              <div className="mt-6 glass rounded-full text-center py-3 text-sm text-[#6B5A48] dark:text-[#D8C6AE] italic font-display animate-in">
                You are becoming the woman you prayed for. Don't give up now.
              </div>

              <OnThisDay />
            </>
          )}

          {active === "career" && <CareerSection />}
          {active === "memories" && <LockGate section="memories" profile={profile} unlocked={unlockedSections} onUnlock={unlockSection}><MemoriesSection /></LockGate>}
          {active === "journal" && <LockGate section="journal" profile={profile} unlocked={unlockedSections} onUnlock={unlockSection}><JournalSection /></LockGate>}
          {active === "goals" && <GoalsSection />}
          {active === "entertainment" && <EntertainmentSection watching={watching} updateWatching={updateWatching} />}
          {active === "health" && <HealthSection />}
          {active === "education" && <EducationSection gradDate={gradDate} />}
          {active === "finance" && <LockGate section="finance" profile={profile} unlocked={unlockedSections} onUnlock={unlockSection}><FinanceSection /></LockGate>}
          {active === "love" && <LockGate section="love" profile={profile} unlocked={unlockedSections} onUnlock={unlockSection}><LoveLifeSection /></LockGate>}
          {active === "notes" && <NotesSection />}
          {active === "settings" && <SettingsSection />}
          {active === "timeline" && <TimelineSection />}
          {active === "library" && <LibrarySection />}
          {active === "reminders" && <RemindersSection />}
          {active === "tasks" && <TasksSection tasks={tasks} addTask={addTaskDb} toggleTask={toggleTask} removeTask={removeTask} clearCompleted={clearCompleted} />}
          {active === "calendar" && <CalendarSection />}
          {active === "about" && <AboutSection />}
          {active === "documents" && <LockGate section="documents" profile={profile} unlocked={unlockedSections} onUnlock={unlockSection}><DocumentsSection /></LockGate>}
          {active === "habits" && <HabitsSection />}
          {active === "places" && <PlacesSection />}
          {active === "wins" && <WinsSection />}
          {active === "recommenders" && <RecommendersSection />}
          {active === "numbers" && <LifeInNumbersSection />}
          {active === "chat" && <ChatSection />}

          {active !== "home" && active !== "career" && active !== "memories" && active !== "journal" && active !== "goals" && active !== "entertainment" && active !== "health" && active !== "education" && active !== "finance" && active !== "love" && active !== "notes" && active !== "settings" && active !== "timeline" && active !== "library" && active !== "reminders" && active !== "tasks" && active !== "calendar" && active !== "about" && active !== "documents" && active !== "habits" && active !== "places" && active !== "wins" && active !== "recommenders" && active !== "numbers" && active !== "chat" && (
            <div className="glass rounded-2xl animate-in p-8 text-center text-[#9A8A76]">
              <p className="font-display text-lg mb-1">{NAV.find((n) => n.key === active)?.label}</p>
              <p className="text-sm">This section is ready to be built out next. Head back to Home for the full dashboard.</p>
            </div>
          )}
        </main>
      </div>
      <NaomiChatWidget />
    </>
  );
}

const ICON_MAP = { graduation: GraduationCap, briefcase: Briefcase, heart: Heart, calendar: Calendar };
/* ---------------- Theme Studio ---------------- */
const THEMES = [
  { key: "ivory", label: "Ivory Atelier", swatch: "#F8F4EE", icon: SunIcon },
  { key: "blush", label: "Blush Élan", swatch: "#E9C8C8", icon: Heart },
  { key: "midnight", label: "Midnight Velvet", swatch: "#3B3028", icon: MoonIcon },
];

/* ---------------- Global Search ---------------- */
const SEARCH_TARGETS = [
  { table: "tasks", cols: ["text"], nav: "tasks", getLabel: (r) => r.text, source: "Task" },
  { table: "journal_entries", cols: ["text"], nav: "journal", getLabel: (r) => r.text, source: "Journal" },
  { table: "career_apps", cols: ["org", "note"], nav: "career", getLabel: (r) => r.org, source: "Career/NSS" },
  { table: "goals", cols: ["text"], nav: "goals", getLabel: (r) => r.text, source: "Goals" },
  { table: "memories", cols: ["caption"], nav: "memories", getLabel: (r) => r.caption || "Memory", source: "Memories" },
  { table: "free_notes", cols: ["text"], nav: "notes", getLabel: (r) => r.text, source: "Notes & Ideas" },
  { table: "love_dates", cols: ["label"], nav: "love", getLabel: (r) => r.label, source: "Love Life" },
  { table: "love_notes", cols: ["text"], nav: "love", getLabel: (r) => r.text, source: "Love Life" },
  { table: "timeline_milestones", cols: ["title", "note"], nav: "timeline", getLabel: (r) => r.title, source: "Timeline" },
  { table: "library_items", cols: ["title"], nav: "library", getLabel: (r) => r.title, source: "Library" },
  { table: "documents", cols: ["title", "file_name"], nav: "documents", getLabel: (r) => r.title, source: "My Documents" },
  { table: "wins", cols: ["text"], nav: "wins", getLabel: (r) => r.text, source: "Wins" },
  { table: "places", cols: ["name"], nav: "places", getLabel: (r) => r.name, source: "Places & Bucket List" },
  { table: "recommenders", cols: ["name", "role"], nav: "recommenders", getLabel: (r) => r.name, source: "References" },
  { table: "entertainment_items", cols: ["title"], nav: "entertainment", getLabel: (r) => r.title, source: "Entertainment" },
  { table: "education_courses", cols: ["name", "note"], nav: "education", getLabel: (r) => r.name, source: "Education" },
];

/* ---------------- Quick Add ---------------- */
const QUICK_ADD_OPTIONS = [
  { nav: "tasks", label: "Task", icon: CheckSquare },
  { nav: "journal", label: "Journal entry", icon: BookOpen },
  { nav: "notes", label: "Idea or note", icon: StickyNote },
  { nav: "memories", label: "Memory", icon: ImageIcon },
  { nav: "goals", label: "Goal", icon: Target },
  { nav: "career", label: "Application", icon: Briefcase },
];

function QuickAddButton({ setActive }) {
  const [open, setOpen] = useState(false);
  const [showBrainDump, setShowBrainDump] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-4 flex items-center gap-1.5 bg-[#5C4433] text-white text-sm px-4 py-2 rounded-full"
      >
        <Plus size={14} /> Add new
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 z-50 glass-strong rounded-2xl p-2 w-60 animate-in">
            <button
              onClick={() => { setShowBrainDump(true); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left hover:bg-white/40 dark:hover:bg-white/5 transition font-medium"
            >
              <Sparkles size={15} className="text-[#B8863B]" />
              Brain dump, let AI sort it
            </button>
            <div className="h-px bg-[#EEE0CE] dark:bg-[#3B2F26] my-1.5" />
            {QUICK_ADD_OPTIONS.map((o) => {
              const Icon = o.icon;
              return (
                <button
                  key={o.nav}
                  onClick={() => { setActive(o.nav); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left hover:bg-white/40 dark:hover:bg-white/5 transition"
                >
                  <Icon size={15} className="text-[#8A5A44] dark:text-[#D8B48C]" />
                  {o.label}
                </button>
              );
            })}
          </div>
        </>
      )}
      {showBrainDump && <BrainDumpModal onClose={() => setShowBrainDump(false)} setActive={setActive} />}
    </div>
  );
}

/* ---------------- Brain Dump ---------------- */
const CATEGORY_META = {
  task: { label: "Task", icon: CheckSquare, color: "bg-sky-50 text-sky-800 border-sky-200" },
  journal: { label: "Journal entry", icon: BookOpen, color: "bg-violet-50 text-violet-800 border-violet-200" },
  note: { label: "Idea or note", icon: StickyNote, color: "bg-amber-50 text-amber-800 border-amber-200" },
  goal: { label: "Goal", icon: Target, color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
};

function BrainDumpModal({ onClose, setActive }) {
  const { organize, loading, error } = useBrainDump();
  const [input, setInput] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const result = await organize(input.trim());
    if (result) setSuggestion(result);
  };

  const handleSave = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;
    if (!user_id || !suggestion) return;

    if (suggestion.category === "task") {
      await supabase.from("tasks").insert({ text: suggestion.text, sub: suggestion.sub || "", done: false, user_id });
    } else if (suggestion.category === "journal") {
      await supabase.from("journal_entries").insert({ text: suggestion.text, user_id });
    } else if (suggestion.category === "note") {
      await supabase.from("free_notes").insert({ text: suggestion.text, tag: "idea", user_id });
    } else if (suggestion.category === "goal") {
      await supabase.from("goals").insert({ text: suggestion.text, progress: 0, user_id });
    }
    setSaved(true);
    setTimeout(() => {
      setActive(
        suggestion.category === "task" ? "tasks" :
        suggestion.category === "journal" ? "journal" :
        suggestion.category === "goal" ? "goals" : "notes"
      );
      onClose();
    }, 700);
  };

  const meta = suggestion ? CATEGORY_META[suggestion.category] : null;
  const MetaIcon = meta?.icon;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-2xl p-6 w-full max-w-md animate-in">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display text-lg flex items-center gap-2">
            <Sparkles size={16} className="text-[#B8863B]" /> Brain dump
          </p>
          <button onClick={onClose} className="text-[#9A8A76]"><X size={16} /></button>
        </div>

        {!suggestion && (
          <>
            <p className="text-xs text-[#9A8A76] mb-3">
              Type anything, a task, a thought, an idea, and Naomi will sort it for you.
            </p>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="I need to renew my passport before December..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none resize-none focus:ring-1 focus:ring-[#8A5A44]"
              autoFocus
            />
            {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="mt-3 w-full px-4 py-2.5 rounded-lg bg-[#5C4433] text-white text-sm disabled:opacity-50"
            >
              {loading ? "Thinking..." : "Sort it"}
            </button>
          </>
        )}

        {suggestion && !saved && (
          <>
            <p className="text-xs text-[#9A8A76] mb-2">Naomi thinks this is a...</p>
            <div className={`rounded-xl border p-4 ${meta.color}`}>
              <div className="flex items-center gap-2 text-xs font-medium mb-1">
                <MetaIcon size={13} /> {meta.label}
              </div>
              <p className="text-sm">{suggestion.text}</p>
              {suggestion.sub && <p className="text-xs mt-1 opacity-80">{suggestion.sub}</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-lg bg-[#5C4433] text-white text-sm">
                Looks right, save it
              </button>
              <button
                onClick={() => setSuggestion(null)}
                className="px-4 py-2.5 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] text-sm text-[#9A8A76]"
              >
                Try again
              </button>
            </div>
          </>
        )}

        {saved && (
          <div className="py-6 text-center">
            <p className="text-sm text-[#5C4433] dark:text-[#D8B48C]">Saved.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GlobalSearch({ setActive }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      const q = query.trim();
      const all = await Promise.all(
        SEARCH_TARGETS.map(async (target) => {
          const orFilter = target.cols.map((c) => `${c}.ilike.%${q}%`).join(",");
          const { data } = await supabase.from(target.table).select("*").or(orFilter).limit(4);
          return (data || []).map((row) => ({
            id: `${target.table}-${row.id}`,
            label: target.getLabel(row) || "Untitled",
            source: target.source,
            nav: target.nav,
          }));
        })
      );
      setResults(all.flat().slice(0, 20));
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative flex-1 max-w-xs hidden sm:block">
      <div className="flex items-center gap-2 px-3 py-2 rounded-full glass">
        <Search size={15} className="text-[#B0A08A]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search anything..."
          className="bg-transparent text-sm outline-none flex-1 placeholder:text-[#B0A08A]"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); }} className="text-[#B0A08A]">
            <X size={13} />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-11 z-50 glass-strong rounded-2xl p-2 w-80 max-h-96 overflow-y-auto animate-in">
            {searching && <p className="text-xs text-[#9A8A76] px-3 py-2">Searching...</p>}
            {!searching && results.length === 0 && (
              <p className="text-xs text-[#9A8A76] px-3 py-2">Nothing found for "{query}".</p>
            )}
            {!searching && results.map((r) => (
              <button
                key={r.id}
                onClick={() => { setActive(r.nav); setOpen(false); setQuery(""); }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-white/40 dark:hover:bg-white/5 transition"
              >
                <p className="truncate">{r.label}</p>
                <p className="text-[10px] text-[#9A8A76]">{r.source}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ThemeSwitcher({ themeMode, setThemeMode }) {
  const [open, setOpen] = useState(false);
  const active = THEMES.find((t) => t.key === themeMode) || THEMES[0];
  const ActiveIcon = active.icon;

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="text-[#8A5A44] dark:text-[#D8B48C]" title="Theme">
        <ActiveIcon size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 glass-strong rounded-2xl p-2 w-52 animate-in">
            {THEMES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => { setThemeMode(t.key); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition text-left ${
                    themeMode === t.key ? "bg-white/50 dark:bg-white/10" : "hover:bg-white/30 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-black/10 shrink-0" style={{ background: t.swatch }} />
                  <span className="flex-1">{t.label}</span>
                  <Icon size={13} className="text-[#9A8A76]" />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Chat with Naomi ---------------- */
/* ---------------- Chat with Naomi (full page, persistent history) ---------------- */
function ChatSection() {
  const {
    conversations, listLoading, activeId, messages, loading,
    startNewChat, selectConversation, deleteConversation, sendMessage,
  } = useChatConversations();
  const [input, setInput] = useState("");
  const [mobileListOpen, setMobileListOpen] = useState(false);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="glass rounded-2xl overflow-hidden animate-in flex h-[calc(100vh-140px)]">
      {/* Conversation list */}
      <div className={`w-64 border-r border-[#EEE0CE] dark:border-[#3B2F26] flex-col ${mobileListOpen ? "flex absolute inset-0 z-20 bg-[#FBF6EF] dark:bg-[#221B16] sm:relative sm:bg-transparent" : "hidden sm:flex"}`}>
        <div className="p-3 border-b border-[#EEE0CE] dark:border-[#3B2F26]">
          <button
            onClick={() => { startNewChat(); setMobileListOpen(false); }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#5C4433] text-white text-sm"
          >
            <Plus size={14} /> New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {listLoading && <p className="text-xs text-[#9A8A76] px-2 py-2">Loading...</p>}
          {!listLoading && conversations.length === 0 && (
            <p className="text-xs text-[#9A8A76] px-2 py-2">No chats yet.</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => { selectConversation(c.id); setMobileListOpen(false); }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-sm group transition ${
                activeId === c.id ? "bg-white/50 dark:bg-white/10" : "hover:bg-white/30 dark:hover:bg-white/5"
              }`}
            >
              <span className="truncate">{c.title}</span>
              <span
                onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                className="opacity-0 group-hover:opacity-100 text-[#B08C77] shrink-0"
              >
                <Trash2 size={12} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-3 border-b border-[#EEE0CE] dark:border-[#3B2F26] flex items-center gap-2 sm:hidden">
          <button onClick={() => setMobileListOpen(true)} className="text-[#8A5A44] dark:text-[#D8B48C]">
            <MessageCircle size={18} />
          </button>
          <p className="text-sm font-medium">Chats</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center px-6">
              <div>
                <Sparkles size={20} className="mx-auto text-[#B8863B] mb-2" />
                <p className="text-sm text-[#9A8A76]">Start a new conversation whenever you're ready.</p>
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={m.id || i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  m.role === "user"
                    ? "bg-[#5C4433] text-white rounded-br-sm"
                    : "bg-white/60 dark:bg-white/10 rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2.5 rounded-2xl text-sm bg-white/60 dark:bg-white/10 rounded-bl-sm text-[#9A8A76]">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[#EEE0CE] dark:border-[#3B2F26] flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-full border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <button onClick={handleSend} className="w-10 h-10 rounded-full bg-[#5C4433] text-white flex items-center justify-center shrink-0">
            <Plus size={18} className="rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
}

function NaomiChatWidget() {
  const [open, setOpen] = useState(false);
  const { messages, sendMessage, loading } = useNaomiChat();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#5C4433] text-white shadow-lg flex items-center justify-center"
      >
        {open ? <X size={20} /> : <Sparkles size={20} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[28rem] glass-strong rounded-2xl flex flex-col overflow-hidden animate-in">
          <div className="px-4 py-3 border-b border-[#EEE0CE] dark:border-[#3B2F26]">
            <p className="font-display text-sm">Naomi</p>
            <p className="text-[10px] text-[#9A8A76]">your assistant</p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "bg-[#5C4433] text-white rounded-br-sm"
                      : "bg-white/60 dark:bg-white/10 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl text-sm bg-white/60 dark:bg-white/10 rounded-bl-sm text-[#9A8A76]">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-[#EEE0CE] dark:border-[#3B2F26] flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-full border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
            />
            <button onClick={handleSend} className="w-9 h-9 rounded-full bg-[#5C4433] text-white flex items-center justify-center shrink-0">
              <Plus size={16} className="rotate-45" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function IconFor({ iconKey, ...props }) {
  const Icon = ICON_MAP[iconKey] || Calendar;
  return <Icon {...props} />;
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatCard({ icon: Icon, label, value, unit, sub }) {
  return (
    <div className="glass rounded-2xl animate-in p-4">
      <div className="flex items-center gap-2 text-[#8A5A44] dark:text-[#D8B48C]">
        <Icon size={15} />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-display mt-1.5">
        {value} <span className="text-xs font-sans text-[#9A8A76]">{unit}</span>
      </p>
      <p className="text-xs text-[#B87A6B] mt-0.5">{sub}</p>
    </div>
  );
}

function CardHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B5A48] dark:text-[#D8C6AE]">{title}</p>
      <button className="text-xs text-[#9A8A76]">{action}</button>
    </div>
  );
}

// Click any text using this to edit it in place, blur or Enter saves, Escape cancels.
function EditableText({ value, onSave, className = "", placeholder = "", multiline = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== (value || "")) onSave(draft.trim());
  };
  const cancel = () => {
    setDraft(value || "");
    setEditing(false);
  };

  if (editing) {
    const Field = multiline ? "textarea" : "input";
    return (
      <Field
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !multiline) commit();
          if (e.key === "Escape") cancel();
        }}
        rows={multiline ? 2 : undefined}
        className={`bg-transparent border-b border-[#8A5A44] outline-none w-full ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-text hover:bg-white/30 dark:hover:bg-white/5 rounded px-0.5 -mx-0.5 transition ${className}`}
      title="Click to edit"
    >
      {value || <span className="text-[#B0A08A] italic">{placeholder}</span>}
    </span>
  );
}

function SidebarContent({ active, setActive, profileName, tagline, avatarUrl, onUploadAvatar, avatarUploading }) {
  return (
    <>
      <div>
        <div className="mb-8">
          <p className="font-display text-xl tracking-[0.15em] dark:text-[#E8D5B0]">NAOMI</p>
          <p className="text-[11px] text-[#9A8A76] dark:text-[#B9A88F] tracking-wide">my life. my space.</p>
        </div>
        <nav className="space-y-0.5">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition text-left ${
                active === key
                  ? "bg-[#5C4433] text-[#FBF6EF]"
                  : "text-[#5C4A3B] dark:text-[#D8C6AE] hover:bg-white/40 dark:hover:bg-white/5"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        <div className="flex items-center gap-2.5 px-2 py-3 rounded-xl bg-white/40 dark:bg-white/5 mb-3">
          <label className="relative w-9 h-9 rounded-full bg-[#E7A6A0] flex items-center justify-center text-white font-display text-sm shrink-0 overflow-hidden cursor-pointer group">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              profileName?.charAt(0) || "N"
            )}
            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[9px]">
              {avatarUploading ? "..." : "Edit"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadAvatar(file);
              }}
            />
          </label>
          <div>
            <p className="text-sm font-medium leading-tight">{profileName}</p>
            <p className="text-[11px] text-[#9A8A76] dark:text-[#B9A88F]">{tagline}</p>
          </div>
        </div>
        <div className="text-[11px] italic text-[#9A8A76] dark:text-[#B9A88F] px-1 leading-snug">
          "The future depends on what you do today."
          <br />— Mahatma Gandhi
        </div>
      </div>
    </>
  );
}

/* ---------------- Career / NSS section ---------------- */
const STATUS_OPTIONS = [
  { key: "researching", label: "Researching", color: "bg-[#B9AA9A]/20 text-[#5C4A3B] border-[#B9AA9A]/40" },
  { key: "applied", label: "Applied", color: "bg-sky-50 text-sky-800 border-sky-200" },
  { key: "assessment", label: "Assessment", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { key: "interview", label: "Interview", color: "bg-violet-50 text-violet-800 border-violet-200" },
  { key: "pursuing", label: "Pursuing via connection", color: "bg-[#F3D9CE] text-[#8A5A44] border-[#E7C4B4]" },
  { key: "offer", label: "Offer", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  { key: "rejected", label: "Not moving forward", color: "bg-rose-50 text-rose-700 border-rose-200" },
];
const statusMeta = (key) => STATUS_OPTIONS.find((s) => s.key === key) || STATUS_OPTIONS[0];

function CareerSection() {
  const { apps, addApp: addAppDb, setStatus, setNoteLocal, saveNote, removeApp } = useCareerApps();
  const [form, setForm] = useState({ org: "", note: "" });
  const [filter, setFilter] = useState("all");

  const addApp = () => {
    if (!form.org.trim()) return;
    addAppDb(form.org.trim(), form.note.trim());
    setForm({ org: "", note: "" });
  };

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s.key] = apps.filter((a) => a.status === s.key).length;
    return acc;
  }, {});
  const visible = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 animate-in">
        <button
          onClick={() => setFilter("all")}
          className={`glass rounded-xl p-3 text-left transition ${filter === "all" ? "ring-1 ring-[#5C4433]" : ""}`}
        >
          <p className="text-xl font-display">{apps.length}</p>
          <p className="text-[11px] text-[#9A8A76]">All</p>
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`glass rounded-xl p-3 text-left transition ${filter === s.key ? "ring-1 ring-[#5C4433]" : ""}`}
          >
            <p className="text-xl font-display">{counts[s.key] || 0}</p>
            <p className="text-[11px] text-[#9A8A76] leading-tight">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Add new */}
      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <CardHeader title="Add an application or opportunity" action="" />
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            value={form.org}
            onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))}
            placeholder="Organisation (e.g. CalBank)"
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none focus:ring-1 focus:ring-[#8A5A44]"
          />
          <input
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="Note (optional)"
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none focus:ring-1 focus:ring-[#8A5A44]"
          />
          <button onClick={addApp} className="px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1 justify-center">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Applications list */}
      <div className="grid sm:grid-cols-2 gap-3">
        {visible.map((a, i) => {
          const meta = statusMeta(a.status);
          return (
            <div key={a.id} className={`glass rounded-2xl p-4 animate-in delay-${Math.min((i % 6) + 1, 6)} relative`}>
              <button
                onClick={() => removeApp(a.id)}
                className="absolute top-3 right-3 text-[#B08C77] opacity-50 hover:opacity-100"
                aria-label="Remove"
              >
                <X size={14} />
              </button>
              <p className="font-medium pr-6">{a.org}</p>
              {a.note !== undefined && (
                <input
                  value={a.note}
                  onChange={(e) => setNoteLocal(a.id, e.target.value)}
                  onBlur={(e) => saveNote(a.id, e.target.value)}
                  placeholder="Add a note"
                  className="text-xs text-[#9A8A76] bg-transparent outline-none w-full mt-1"
                />
              )}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStatus(a.id, s.key)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                      a.status === s.key ? s.color + " font-medium" : "border-transparent text-[#B0A08A] hover:bg-white/40"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-[#9A8A76] sm:col-span-2">
            Nothing in this status yet.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Memory Vault ---------------- */
function monthYear(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function MemoriesSection() {
  const { memories, uploading, prepareUpload, saveMemory, removeMemory } = useMemories();
  const [caption, setCaption] = useState("");
  const [pendingBlob, setPendingBlob] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { blob, dataUrl } = await prepareUpload(file);
      setPendingBlob(blob);
      setPendingPreview(dataUrl);
    } catch {
      alert("Could not read that image, try another one.");
    }
  };

  const handleSave = async () => {
    if (!pendingBlob) return;
    await saveMemory(pendingBlob, caption);
    setPendingBlob(null);
    setPendingPreview(null);
    setCaption("");
  };

  const groups = memories.reduce((acc, m) => {
    const key = monthYear(m.created_at);
    (acc[key] ||= []).push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 animate-in">
        <CardHeader title="Add a memory" action="" />
        <div className="mt-3 flex flex-col sm:flex-row gap-3 items-start">
          <label className="shrink-0 cursor-pointer px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm">
            Choose photo
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>
          {pendingPreview && (
            <div className="flex-1 flex flex-col sm:flex-row gap-3 items-start w-full">
              <img src={pendingPreview} alt="preview" className="w-24 h-24 object-cover rounded-xl" />
              <div className="flex-1 flex flex-col gap-2 w-full">
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption for this moment"
                  className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none focus:ring-1 focus:ring-[#8A5A44]"
                />
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={uploading} className="px-4 py-1.5 rounded-lg bg-[#5C4433] text-white text-sm">
                    {uploading ? "Saving..." : "Save memory"}
                  </button>
                  <button onClick={() => { setPendingBlob(null); setPendingPreview(null); }} className="px-4 py-1.5 rounded-lg text-sm text-[#9A8A76]">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {Object.keys(groups).length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-sm text-[#9A8A76] animate-in delay-1">
          No memories saved yet. Your first one starts your archive.
        </div>
      )}

      {Object.entries(groups).map(([label, items], gi) => (
        <div key={label} className={`animate-in delay-${Math.min(gi + 1, 6)}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B5A48] dark:text-[#D8C6AE] mb-2">{label}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((m) => (
              <div key={m.id} className="glass rounded-2xl overflow-hidden group relative">
                <img src={m.image_url} alt={m.caption || "memory"} className="w-full h-40 object-cover" />
                <button
                  onClick={() => removeMemory(m.id)}
                  className="absolute top-2 right-2 bg-black/30 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={13} />
                </button>
                <div className="p-3">
                  {m.caption && <p className="text-sm">{m.caption}</p>}
                  <p className="text-[11px] text-[#9A8A76] mt-1">
                    {new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Journal ---------------- */
function JournalSection() {
  const { entries, addEntry: addEntryDb, removeEntry } = useJournal();
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");

  const addEntry = () => {
    if (!draft.trim()) return;
    addEntryDb(draft.trim());
    setDraft("");
  };

  const filtered = query.trim()
    ? entries.filter((e) => e.text.toLowerCase().includes(query.trim().toLowerCase()))
    : entries;

  const groups = filtered.reduce((acc, e) => {
    const key = monthYear(e.created_at);
    (acc[key] ||= []).push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 animate-in">
        <CardHeader title="New entry" action="" />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What's on your mind today..."
          rows={4}
          className="w-full mt-3 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none focus:ring-1 focus:ring-[#8A5A44] resize-none"
        />
        <button onClick={addEntry} className="mt-2 px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1">
          <Plus size={14} /> Save entry
        </button>
      </div>

      {entries.length > 0 && (
        <div className="animate-in delay-1 flex items-center gap-2 px-3 py-2 rounded-full glass max-w-xs">
          <Search size={14} className="text-[#B0A08A]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your journal..."
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-[#B0A08A]"
          />
        </div>
      )}

      {Object.keys(groups).length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-sm text-[#9A8A76] animate-in delay-1">
          {query ? "Nothing matches that search." : "Your first entry starts here."}
        </div>
      )}

      {Object.entries(groups).map(([label, items], gi) => (
        <div key={label} className={`animate-in delay-${Math.min(gi + 2, 6)}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B5A48] dark:text-[#D8C6AE] mb-2">{label}</p>
          <div className="space-y-3">
            {items.map((e) => (
              <div key={e.id} className="glass rounded-2xl p-4 relative group">
                <p className="text-sm leading-relaxed pr-6">{e.text}</p>
                <p className="text-[11px] text-[#9A8A76] mt-2">
                  {new Date(e.created_at).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
                <button
                  onClick={() => removeEntry(e.id)}
                  className="absolute top-3 right-3 text-[#B08C77] opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Goals ---------------- */
function GoalsSection() {
  const { rows: goals, addRow, updateRow, updateRowLocal, removeRow } = useSupabaseList("goals", "created_at", true, defaultGoalsShared);
  const [newGoal, setNewGoal] = useState("");

  const addGoal = () => {
    if (!newGoal.trim()) return;
    addRow({ text: newGoal.trim(), progress: 0 });
    setNewGoal("");
  };
  const setProgress = (id, progress) => {
    updateRowLocal(id, { progress });
    updateRow(id, { progress });
  };
  const removeGoal = (id) => removeRow(id);

  const completed = goals.filter((g) => g.progress >= 100).length;
  const inProgress = goals.length - completed;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in">
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-display">{goals.length}</p>
          <p className="text-[11px] text-[#9A8A76]">Total goals</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-display">{inProgress}</p>
          <p className="text-[11px] text-[#9A8A76]">In progress</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-display">{completed}</p>
          <p className="text-[11px] text-[#9A8A76]">Completed</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <CardHeader title="Add a goal" action="" />
        <div className="flex gap-2 mt-3">
          <input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
            placeholder="A goal worth working toward"
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none focus:ring-1 focus:ring-[#8A5A44]"
          />
          <button onClick={addGoal} className="px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {goals.map((g, i) => (
          <div key={g.id} className={`glass rounded-2xl p-4 animate-in delay-${Math.min((i % 6) + 2, 6)} group relative`}>
            <div className="flex justify-between items-center mb-2">
              <p className={`text-sm font-medium ${g.progress >= 100 ? "text-[#9A8A76] line-through" : ""}`}>{g.text}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9A8A76]">{g.progress}%</span>
                <button onClick={() => removeGoal(g.id)} className="opacity-0 group-hover:opacity-100 text-[#B08C77]">
                  <X size={14} />
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={g.progress}
              onChange={(e) => setProgress(g.id, Number(e.target.value))}
              className="w-full accent-[#5C4433]"
            />
          </div>
        ))}
        {goals.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-[#9A8A76]">No goals yet, add your first above.</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Entertainment ---------------- */
const ENT_TYPES = ["Movie", "Series", "Book"];
const ENT_STATUS = [
  { key: "want", label: "Want to watch/read" },
  { key: "progress", label: "In progress" },
  { key: "finished", label: "Finished" },
];

const defaultEntItems = [
  { title: "The Diplomat", type: "Series", status: "want", rating: 0 },
];

function EntertainmentSection({ watching, updateWatching }) {
  const { rows: items, addRow, updateRow, updateRowLocal, removeRow: removeItem } = useSupabaseList("entertainment_items", "created_at", false, defaultEntItems);
  const [form, setForm] = useState({ title: "", type: "Movie" });
  const [filterType, setFilterType] = useState("all");

  const addItem = () => {
    if (!form.title.trim()) return;
    addRow({ title: form.title.trim(), type: form.type, status: "want", rating: 0 });
    setForm({ title: "", type: form.type });
  };
  const setStatus = (id, status) => {
    updateRowLocal(id, { status });
    updateRow(id, { status });
  };
  const setRating = (id, rating) => {
    updateRowLocal(id, { rating });
    updateRow(id, { rating });
  };

  const visible = filterType === "all" ? items : items.filter((i) => i.type === filterType);

  const { recommendations, getRecommendations, loading: recLoading } = useRecommendations();
  const ratedItems = items.filter((i) => i.rating > 0).map((i) => ({ title: i.title, type: i.type, rating: i.rating }));

  const addRecommendation = (rec) => {
    addRow({ title: rec.title, type: rec.type, status: "want", rating: 0 });
  };

  return (
    <div className="space-y-5">
      {/* Currently watching / reading, editable, feeds Home */}
      <div className="glass rounded-2xl p-5 animate-in">
        <CardHeader title="Currently watching" action="" />
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          <input
            value={watching.title}
            onChange={(e) => updateWatching({ title: e.target.value })}
            placeholder="Title"
            className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none focus:ring-1 focus:ring-[#8A5A44]"
          />
          <input
            value={watching.detail}
            onChange={(e) => updateWatching({ detail: e.target.value })}
            placeholder="e.g. Season 2, Episode 4"
            className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none focus:ring-1 focus:ring-[#8A5A44]"
          />
        </div>
        <div className="mt-3">
          <label className="text-xs text-[#9A8A76]">Progress: {watching.progress}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={watching.progress}
            onChange={(e) => updateWatching({ progress: Number(e.target.value) })}
            className="w-full accent-[#5C4433]"
          />
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <div className="flex items-center justify-between">
          <CardHeader title="Recommended for you" action="" />
          <button
            onClick={() => getRecommendations(ratedItems)}
            disabled={recLoading || ratedItems.length === 0}
            className="text-xs px-3 py-1.5 rounded-full bg-[#5C4433] text-white flex items-center gap-1 disabled:opacity-50 shrink-0"
          >
            <Sparkles size={12} /> {recLoading ? "Thinking..." : "Get recommendations"}
          </button>
        </div>
        {ratedItems.length === 0 && (
          <p className="text-xs text-[#9A8A76] mt-2">Rate a few titles first, then Naomi can suggest what's next.</p>
        )}
        {recommendations.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-2 mt-3">
            {recommendations.map((r, i) => (
              <div key={i} className="glass rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wide text-[#9A8A76]">{r.type}</p>
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-[#9A8A76] mt-1">{r.reason}</p>
                <button
                  onClick={() => addRecommendation(r)}
                  className="text-xs text-[#8A5A44] dark:text-[#D8B48C] mt-2 flex items-center gap-1"
                >
                  <Plus size={11} /> Add to list
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add to library */}
      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <CardHeader title="Add to your library" action="" />
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none focus:ring-1 focus:ring-[#8A5A44]"
          />
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          >
            {ENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button onClick={addItem} className="px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1 justify-center">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 animate-in delay-2">
        {["all", ...ENT_TYPES].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filterType === t ? "bg-[#5C4433] text-white border-[#5C4433]" : "border-[#EEE0CE] dark:border-[#3B2F26] text-[#9A8A76]"
            }`}
          >
            {t === "all" ? "All" : t + "s"}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {visible.map((item, i) => (
          <div key={item.id} className={`glass rounded-2xl p-4 animate-in delay-${Math.min((i % 6) + 1, 6)} relative`}>
            <button
              onClick={() => removeItem(item.id)}
              className="absolute top-3 right-3 text-[#B08C77] opacity-50 hover:opacity-100"
            >
              <X size={14} />
            </button>
            <p className="text-[10px] uppercase tracking-wide text-[#9A8A76]">{item.type}</p>
            <p className="font-medium pr-6">{item.title}</p>

            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(item.id, n === item.rating ? 0 : n)}>
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      n <= item.rating ? "bg-[#B8863B]" : "bg-[#EEE0CE] dark:bg-[#3B2F26]"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {ENT_STATUS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStatus(item.id, s.key)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                    item.status === s.key
                      ? "bg-[#F3D9CE] text-[#8A5A44] border-[#E7C4B4] font-medium"
                      : "border-transparent text-[#B0A08A] hover:bg-white/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-[#9A8A76] sm:col-span-2">
            Nothing here yet, add your first title above.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Health & Sleep ---------------- */
function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function fmtDuration(hoursDecimal) {
  const h = Math.floor(hoursDecimal);
  const m = Math.round((hoursDecimal - h) * 60);
  return `${h}h ${m}m`;
}

function fmtClock(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function SleepTracker({ sleep, logs, addLog }) {
  const [session, setSession] = useStored("sleep_session", null); // { start: iso } or null while asleep, device-local
  const [, forceTick] = useState(0);

  // Live-update the elapsed timer while a sleep session is active
  useEffect(() => {
    if (!session) return;
    const t = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, [session]);

  const goToSleep = () => setSession({ start: new Date().toISOString() });

  const wakeUp = async () => {
    if (!session) return;
    const start = new Date(session.start);
    const end = new Date();
    const hours = Math.round(((end - start) / 3600000) * 10) / 10;
    await addLog({ bed_at: session.start, wake_at: end.toISOString(), hours });
    setSession(null);
  };

  const elapsedHours = session ? (Date.now() - new Date(session.start).getTime()) / 3600000 : 0;

  // Gentle, non-medical suggestion based on recent pattern (logs are newest first)
  const lastEntry = logs[0];
  const previousNights = logs.slice(1, 8);
  const avgPrev = previousNights.length
    ? previousNights.reduce((s, e) => s + Number(e.hours), 0) / previousNights.length
    : null;
  let suggestion = null;
  if (lastEntry && avgPrev !== null) {
    const lastHours = Number(lastEntry.hours);
    if (lastHours < avgPrev - 1.5) {
      suggestion = "You slept noticeably less than your recent average. Some water, a short walk, or natural light today can help you feel steadier.";
    } else if (lastHours > avgPrev + 1.5) {
      suggestion = "You slept longer than usual, your body may have needed the extra rest.";
    } else {
      const bedTime = new Date(lastEntry.bed_at);
      const avgBedMinutes = previousNights.reduce((s, e) => s + new Date(e.bed_at).getHours() * 60 + new Date(e.bed_at).getMinutes(), 0) / previousNights.length;
      const thisBedMinutes = bedTime.getHours() * 60 + bedTime.getMinutes();
      if (Math.abs(thisBedMinutes - avgBedMinutes) > 60) {
        suggestion = "Your bedtime shifted more than usual compared to your recent pattern, worth keeping an eye on as your week goes on.";
      }
    }
  }

  return (
    <div className="glass rounded-2xl p-5 animate-in">
      <CardHeader title="Sleep" action="" />

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 py-4">
        {!session ? (
          <button onClick={goToSleep} className="px-6 py-3 rounded-full bg-[#5C4433] text-white text-sm flex items-center gap-2">
            <MoonIcon size={16} /> Going to sleep
          </button>
        ) : (
          <div className="text-center">
            <p className="text-xs text-[#9A8A76]">Asleep since {fmtClock(session.start)}</p>
            <p className="text-2xl font-display mt-1">{fmtDuration(elapsedHours)}</p>
            <button onClick={wakeUp} className="mt-3 px-6 py-3 rounded-full bg-[#5C4433] text-white text-sm flex items-center gap-2 mx-auto">
              <SunIcon size={16} /> I'm awake
            </button>
          </div>
        )}
      </div>

      {sleep.week && sleep.week.length > 0 && (
        <>
          <div className="flex items-end gap-1.5 mt-2 h-14">
            {sleep.week.map((h, i) => (
              <div key={i} className="flex-1 bg-[#F0DCC9] rounded-full" style={{ height: `${Math.min(100, (h / 10) * 100)}%` }} />
            ))}
          </div>
          <p className="text-center text-sm mt-2">
            Last night: <span className="font-medium">{sleep.total}</span>
            <span className="text-[#9A8A76]"> · bed {sleep.bed} · woke {sleep.wake}</span>
          </p>
        </>
      )}

      {suggestion && (
        <div className="mt-4 px-4 py-3 rounded-xl bg-[#F3D9CE]/50 text-sm text-[#5C4433]">
          {suggestion}
        </div>
      )}
    </div>
  );
}

function HealthSection() {
  const { logs, addLog } = useSleepLog();
  const sleep = deriveSleepSummary(logs);

  const { rows: cycles, addRow: addCycleRow, removeRow: removeCycle } = useSupabaseList("period_cycles", "start_date", true);
  const [newStart, setNewStart] = useState("");

  const addCycle = () => {
    if (!newStart) return;
    addCycleRow({ start_date: newStart });
    setNewStart("");
  };

  const lengths = cycles.slice(1).map((c, i) => daysBetween(cycles[i].start_date, c.start_date));
  const avgLength = lengths.length ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : 28;
  const lastStart = cycles[cycles.length - 1]?.start_date;
  const predictedNext = lastStart
    ? new Date(new Date(lastStart).getTime() + avgLength * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <div className="space-y-5">
      {/* Sleep, real time tracking */}
      <SleepTracker sleep={sleep} logs={logs} addLog={addLog} />

      {/* Period tracker */}
      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <CardHeader title="Cycle tracker" action="" />
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <div className="glass rounded-xl p-3">
            <p className="text-lg font-display">{avgLength}</p>
            <p className="text-[11px] text-[#9A8A76]">Average cycle length (days)</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-lg font-display">{predictedNext || "—"}</p>
            <p className="text-[11px] text-[#9A8A76]">Predicted next start</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-lg font-display">{cycles.length}</p>
            <p className="text-[11px] text-[#9A8A76]">Logged cycles</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <input
            type="date"
            value={newStart}
            onChange={(e) => setNewStart(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <button onClick={addCycle} className="px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1">
            <Plus size={14} /> Log start date
          </button>
        </div>
        {cycles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {cycles.slice().reverse().map((c) => (
              <span key={c.id} className="text-xs px-3 py-1.5 rounded-full glass flex items-center gap-2">
                {new Date(c.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                <button onClick={() => removeCycle(c.id)} className="text-[#B08C77]"><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
        <p className="text-[11px] text-[#9A8A76] mt-3">
          Predictions improve the more cycles you log, this is a personal record, not medical advice.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Education ---------------- */
const COURSE_STATUS = [
  { key: "studying", label: "Studying", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { key: "ready", label: "Feeling ready", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  { key: "done", label: "Exam done", color: "bg-[#B9AA9A]/20 text-[#5C4A3B] border-[#B9AA9A]/40" },
];

const defaultCourses = [
  { name: "ME 492, Management and Entrepreneurship", exam_date: null, status: "studying", note: "Imminent, MCQ revision in progress" },
  { name: "COE 472, Digital Signal Processing", exam_date: null, status: "ready", note: "Midsem 85%" },
  { name: "COE 480, Fault Tolerance", exam_date: null, status: "studying", note: "" },
  { name: "COE 454, Software Engineering Project", exam_date: null, status: "ready", note: "Beryl's Beauty Mark, feature complete" },
];

function EducationSection({ gradDate }) {
  const { rows: courses, addRow, updateRow, updateRowLocal, removeRow } = useSupabaseList("education_courses", "created_at", true, defaultCourses);
  const [form, setForm] = useState({ name: "", examDate: "" });

  const addCourse = () => {
    if (!form.name.trim()) return;
    addRow({ name: form.name.trim(), exam_date: form.examDate || null, status: "studying", note: "" });
    setForm({ name: "", examDate: "" });
  };
  const setStatus = (id, status) => {
    updateRowLocal(id, { status });
    updateRow(id, { status });
  };
  const setNote = (id, note) => {
    updateRowLocal(id, { note });
    updateRow(id, { note });
  };
  const removeCourse = (id) => removeRow(id);

  const gradDays = daysUntil(gradDate);
  const remaining = courses.filter((c) => c.status !== "done").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in">
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-display">{gradDays >= 0 ? gradDays : 0}</p>
          <p className="text-[11px] text-[#9A8A76]">Days to graduation</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-display">{courses.length}</p>
          <p className="text-[11px] text-[#9A8A76]">Courses tracked</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-display">{remaining}</p>
          <p className="text-[11px] text-[#9A8A76]">Still to finish</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <CardHeader title="Add a course or exam" action="" />
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Course name"
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none focus:ring-1 focus:ring-[#8A5A44]"
          />
          <input
            type="date"
            value={form.examDate}
            onChange={(e) => setForm((f) => ({ ...f, examDate: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <button onClick={addCourse} className="px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1 justify-center">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {courses.map((c, i) => {
          const d = c.exam_date ? daysUntil(c.exam_date) : null;
          return (
            <div key={c.id} className={`glass rounded-2xl p-4 animate-in delay-${Math.min((i % 6) + 2, 6)} relative group`}>
              <button
                onClick={() => removeCourse(c.id)}
                className="absolute top-3 right-3 text-[#B08C77] opacity-0 group-hover:opacity-100 transition"
              >
                <X size={14} />
              </button>
              <div className="flex justify-between items-start pr-6">
                <p className="font-medium">{c.name}</p>
                {d !== null && (
                  <span className="text-xs px-2 py-1 rounded-full bg-[#F3E8D8] dark:bg-[#2A231C] shrink-0 ml-2">
                    {d >= 0 ? `${d} days` : "Past"}
                  </span>
                )}
              </div>
              <input
                value={c.note}
                onChange={(e) => setNote(c.id, e.target.value)}
                placeholder="Add a note"
                className="text-xs text-[#9A8A76] bg-transparent outline-none w-full mt-1"
              />
              <div className="flex flex-wrap gap-1.5 mt-3">
                {COURSE_STATUS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStatus(c.id, s.key)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                      c.status === s.key ? s.color + " font-medium" : "border-transparent text-[#B0A08A] hover:bg-white/40"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {courses.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-[#9A8A76]">No courses yet, add your first above.</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Finance ---------------- */
const FIN_CATEGORIES = ["Food", "Transport", "Education", "Beauty", "Shopping", "Personal", "Other"];

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function FinanceSection() {
  const { rows: txns, addRow: addTxnDb, removeRow: removeTxn } = useSupabaseList("finance_txns", "created_at", false);
  const { row: savingsGoal, update: updateSavingsGoal } = useSupabaseRow("savings_goal", { label: "UK Masters fund", target: 20000, saved: 3200 });
  const [form, setForm] = useState({ desc: "", amount: "", type: "expense", category: "Food" });

  const addTxn = () => {
    const amt = parseFloat(form.amount);
    if (!form.desc.trim() || !amt || amt <= 0) return;
    addTxnDb({ description: form.desc.trim(), amount: amt, type: form.type, category: form.category });
    setForm({ desc: "", amount: "", type: form.type, category: form.category });
  };

  const monthTxns = txns.filter((t) => {
    const d = new Date(t.created_at);
    return `${d.getFullYear()}-${d.getMonth()}` === currentMonthKey();
  });
  const income = monthTxns.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = monthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const net = income - expenses;

  const byCategory = FIN_CATEGORIES.map((cat) => ({
    cat,
    total: monthTxns.filter((t) => t.type === "expense" && t.category === cat).reduce((s, t) => s + Number(t.amount), 0),
  })).filter((c) => c.total > 0);

  const savingsPct = Math.min(100, Math.round((savingsGoal.saved / savingsGoal.target) * 100) || 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3 animate-in">
        <div className="glass rounded-xl p-4">
          <p className="text-xl font-display">GHC {income.toLocaleString()}</p>
          <p className="text-[11px] text-[#9A8A76]">Income this month</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xl font-display">GHC {expenses.toLocaleString()}</p>
          <p className="text-[11px] text-[#9A8A76]">Spent this month</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className={`text-xl font-display ${net < 0 ? "text-rose-700" : ""}`}>GHC {net.toLocaleString()}</p>
          <p className="text-[11px] text-[#9A8A76]">Net this month</p>
        </div>
      </div>

      {/* Savings goal */}
      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <CardHeader title="Savings goal" action="" />
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            value={savingsGoal.label}
            onChange={(e) => updateSavingsGoal({ label: e.target.value })}
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <input
            type="number"
            value={savingsGoal.saved}
            onChange={(e) => updateSavingsGoal({ saved: Number(e.target.value) })}
            placeholder="Saved so far"
            className="w-full sm:w-36 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <input
            type="number"
            value={savingsGoal.target}
            onChange={(e) => updateSavingsGoal({ target: Number(e.target.value) })}
            placeholder="Target"
            className="w-full sm:w-36 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
        </div>
        <div className="h-2 rounded-full bg-[#F3E8D8] dark:bg-[#2A231C] mt-4">
          <div className="h-full rounded-full bg-[#5C4433]" style={{ width: `${savingsPct}%` }} />
        </div>
        <p className="text-xs text-[#9A8A76] mt-2">GHC {savingsGoal.saved.toLocaleString()} of GHC {savingsGoal.target.toLocaleString()}, {savingsPct}%</p>
      </div>

      {/* Add transaction */}
      <div className="glass rounded-2xl p-5 animate-in delay-2">
        <CardHeader title="Add a transaction" action="" />
        <div className="grid sm:grid-cols-5 gap-2 mt-3">
          <input
            value={form.desc}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            placeholder="Description"
            className="sm:col-span-2 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder="Amount"
            className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          >
            {FIN_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <button onClick={addTxn} className="mt-3 px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1">
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="glass rounded-2xl p-5 animate-in delay-3">
          <CardHeader title="This month by category" action="" />
          <div className="space-y-2 mt-3">
            {byCategory.map((c) => (
              <div key={c.cat} className="flex items-center justify-between text-sm">
                <span>{c.cat}</span>
                <span className="text-[#9A8A76]">GHC {c.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="space-y-2">
        {txns.slice(0, 15).map((t) => (
          <div key={t.id} className="glass rounded-xl p-3 flex items-center justify-between group">
            <div>
              <p className="text-sm">{t.description}</p>
              <p className="text-[11px] text-[#9A8A76]">{t.category} · {new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${t.type === "income" ? "text-emerald-700" : "text-[#5C4433]"}`}>
                {t.type === "income" ? "+" : "-"}GHC {Number(t.amount).toLocaleString()}
              </span>
              <button onClick={() => removeTxn(t.id)} className="opacity-0 group-hover:opacity-100 text-[#B08C77]">
                <X size={13} />
              </button>
            </div>
          </div>
        ))}
        {txns.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-[#9A8A76]">No transactions logged yet.</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Love Life ---------------- */
function LoveLifeSection() {
  const { rows: dates, addRow: addDateRow, removeRow: removeDate } = useSupabaseList("love_dates", "created_at", true, [
    { label: "Anniversary", date: "2026-09-07" },
  ]);
  const { rows: notes, addRow: addNoteRow, removeRow: removeNote } = useSupabaseList("love_notes", "created_at", false, [
    { text: "He mentioned he really likes sunflowers" },
  ]);
  const [dateForm, setDateForm] = useState({ label: "", date: "" });
  const [noteDraft, setNoteDraft] = useState("");

  const addDate = () => {
    if (!dateForm.label.trim() || !dateForm.date) return;
    addDateRow({ label: dateForm.label.trim(), date: dateForm.date });
    setDateForm({ label: "", date: "" });
  };

  const addNote = () => {
    if (!noteDraft.trim()) return;
    addNoteRow({ text: noteDraft.trim() });
    setNoteDraft("");
  };

  const sortedDates = dates
    .map((d) => ({ ...d, days: daysUntil(d.date) }))
    .sort((a, b) => a.days - b.days);

  return (
    <div className="space-y-5">
      {/* Important dates */}
      <div className="glass rounded-2xl p-5 animate-in">
        <CardHeader title="Important dates" action="" />
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            value={dateForm.label}
            onChange={(e) => setDateForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="e.g. His birthday"
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none focus:ring-1 focus:ring-[#8A5A44]"
          />
          <input
            type="date"
            value={dateForm.date}
            onChange={(e) => setDateForm((f) => ({ ...f, date: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <button onClick={addDate} className="px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1 justify-center">
            <Plus size={14} /> Add
          </button>
        </div>

        <div className="space-y-2 mt-4">
          {sortedDates.map((d) => (
            <div key={d.id} className="flex items-center justify-between glass rounded-xl p-3 group">
              <div>
                <p className="text-sm font-medium">{d.label}</p>
                <p className="text-xs text-[#9A8A76]">{fmt(d.date)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-[#F3D9CE] text-[#8A5A44]">
                  {d.days >= 0 ? `${d.days} days` : "Passed"}
                </span>
                <button onClick={() => removeDate(d.id)} className="opacity-0 group-hover:opacity-100 text-[#B08C77]">
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
          {dates.length === 0 && <p className="text-sm text-[#9A8A76]">No dates saved yet.</p>}
        </div>
      </div>

      {/* Notes to remember */}
      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <CardHeader title="Things to remember" action="" />
        <div className="flex gap-2 mt-3">
          <input
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
            placeholder="Something worth remembering"
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none focus:ring-1 focus:ring-[#8A5A44]"
          />
          <button onClick={addNote} className="px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1">
            <Plus size={14} /> Save
          </button>
        </div>
        <div className="space-y-2 mt-4">
          {notes.map((n) => (
            <div key={n.id} className="flex items-start justify-between glass rounded-xl p-3 group">
              <div>
                <p className="text-sm">{n.text}</p>
                <p className="text-[11px] text-[#9A8A76] mt-1">
                  {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <button onClick={() => removeNote(n.id)} className="opacity-0 group-hover:opacity-100 text-[#B08C77] shrink-0">
                <X size={13} />
              </button>
            </div>
          ))}
          {notes.length === 0 && <p className="text-sm text-[#9A8A76]">Nothing saved yet.</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Notes & Ideas ---------------- */
const NOTE_TAGS = [
  { key: "idea", label: "Idea", color: "bg-violet-50 text-violet-800 border-violet-200" },
  { key: "wishlist", label: "Wishlist", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { key: "bucket", label: "Bucket List", color: "bg-sky-50 text-sky-800 border-sky-200" },
  { key: "other", label: "Other", color: "bg-[#B9AA9A]/20 text-[#5C4A3B] border-[#B9AA9A]/40" },
];
const tagMeta = (key) => NOTE_TAGS.find((t) => t.key === key) || NOTE_TAGS[3];

function NotesSection() {
  const { rows: notes, addRow: addNoteRow, removeRow: removeNote } = useSupabaseList("free_notes", "created_at", false);
  const [draft, setDraft] = useState("");
  const [tag, setTag] = useState("idea");
  const [filter, setFilter] = useState("all");

  const addNote = () => {
    if (!draft.trim()) return;
    addNoteRow({ text: draft.trim(), tag });
    setDraft("");
  };

  const visible = filter === "all" ? notes : notes.filter((n) => n.tag === filter);
  const counts = NOTE_TAGS.reduce((acc, t) => {
    acc[t.key] = notes.filter((n) => n.tag === t.key).length;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 animate-in">
        <CardHeader title="Capture something" action="" />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="An idea, something you want, somewhere you want to go, anything worth saving"
          rows={3}
          className="w-full mt-3 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none focus:ring-1 focus:ring-[#8A5A44] resize-none"
        />
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {NOTE_TAGS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTag(t.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                tag === t.key ? t.color + " font-medium" : "border-[#EEE0CE] dark:border-[#3B2F26] text-[#9A8A76]"
              }`}
            >
              {t.label}
            </button>
          ))}
          <button onClick={addNote} className="ml-auto px-4 py-1.5 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1">
            <Plus size={14} /> Save
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 animate-in delay-1">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-3 py-1.5 rounded-full border transition ${
            filter === "all" ? "bg-[#5C4433] text-white border-[#5C4433]" : "border-[#EEE0CE] dark:border-[#3B2F26] text-[#9A8A76]"
          }`}
        >
          All ({notes.length})
        </button>
        {NOTE_TAGS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filter === t.key ? "bg-[#5C4433] text-white border-[#5C4433]" : "border-[#EEE0CE] dark:border-[#3B2F26] text-[#9A8A76]"
            }`}
          >
            {t.label} ({counts[t.key] || 0})
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {visible.map((n, i) => {
          const meta = tagMeta(n.tag);
          return (
            <div key={n.id} className={`glass rounded-2xl p-4 animate-in delay-${Math.min((i % 6) + 2, 6)} relative group`}>
              <button
                onClick={() => removeNote(n.id)}
                className="absolute top-3 right-3 text-[#B08C77] opacity-0 group-hover:opacity-100 transition"
              >
                <X size={14} />
              </button>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${meta.color}`}>{meta.label}</span>
              <p className="text-sm mt-2 pr-6">{n.text}</p>
              <p className="text-[11px] text-[#9A8A76] mt-2">
                {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-[#9A8A76] sm:col-span-2">
            Nothing here yet.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
// Most data now lives in Supabase. These are the few things still kept
// device-local on purpose (theme, mood, a quick quote, your current sleep session).
const ALL_DATA_KEYS = [
  "theme_dark", "mood", "journal_quote", "sleep_session",
];

function SettingsSection() {
  const { profile, update: updateProfile, uploadAvatar, uploading: avatarUploading } = useProfile();
  const [exportMsg, setExportMsg] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const { permission, subscribed, loading: pushLoading, enablePush, sendTestPush } = usePushNotifications();

  const exportData = () => {
    const data = {};
    ALL_DATA_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
      }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `naomi-life-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMsg("Backup downloaded.");
    setTimeout(() => setExportMsg(""), 3000);
  };

  const clearAllData = () => {
    ALL_DATA_KEYS.forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  };

  return (
    <div className="space-y-5 max-w-xl">
      <div className="glass rounded-2xl p-5 animate-in">
        <CardHeader title="Profile" action="" />
        <div className="flex items-center gap-4 mt-3">
          <label className="relative w-16 h-16 rounded-full bg-[#E7A6A0] flex items-center justify-center text-white font-display text-xl shrink-0 overflow-hidden cursor-pointer group">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              profile.name?.charAt(0) || "N"
            )}
            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[11px]">
              {avatarUploading ? "Uploading..." : "Change"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar(file);
              }}
            />
          </label>
          <p className="text-xs text-[#9A8A76]">Tap your photo to change it.</p>
        </div>
        <div className="space-y-3 mt-4">
          <div>
            <label className="text-xs text-[#9A8A76]">Name</label>
            <input
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-[#9A8A76]">Tagline</label>
            <input
              value={profile.tagline}
              onChange={(e) => updateProfile({ tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none mt-1"
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <CardHeader title="Privacy locking" action="" />
        <p className="text-xs text-[#9A8A76] mt-2">
          Set a PIN, then choose which sections should ask for it. Unlocking lasts until you close the tab.
        </p>
        <div className="mt-3">
          <label className="text-xs text-[#9A8A76]">PIN</label>
          <input
            type="password"
            inputMode="numeric"
            value={profile.privacy_pin || ""}
            onChange={(e) => updateProfile({ privacy_pin: e.target.value })}
            placeholder="Choose a PIN"
            className="w-full px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none mt-1"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { key: "love", label: "Love Life" },
            { key: "journal", label: "Journal" },
            { key: "memories", label: "Memories" },
            { key: "finance", label: "Finance" },
            { key: "documents", label: "My Documents" },
          ].map((s) => {
            const locked = (profile.locked_sections || []).includes(s.key);
            return (
              <button
                key={s.key}
                onClick={() => {
                  const current = profile.locked_sections || [];
                  updateProfile({
                    locked_sections: locked ? current.filter((k) => k !== s.key) : [...current, s.key],
                  });
                }}
                className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1 ${
                  locked ? "bg-[#F3D9CE] text-[#8A5A44] border-[#E7C4B4]" : "border-[#EEE0CE] dark:border-[#3B2F26] text-[#9A8A76]"
                }`}
              >
                {locked && <Lock size={11} />} {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <CardHeader title="Notifications" action="" />
        {permission === "unsupported" && (
          <p className="text-sm text-[#9A8A76] mt-2">Your browser doesn't support push notifications.</p>
        )}
        {permission === "granted" && subscribed && (
          <>
            <p className="text-sm text-[#9A8A76] mt-2">
              Push notifications are on for this device. You'll get a real one with your daily digest, even with the app closed.
            </p>
            <button onClick={sendTestPush} className="mt-3 px-4 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] text-sm">
              Send a test push
            </button>
          </>
        )}
        {permission === "denied" && (
          <p className="text-sm text-[#9A8A76] mt-2">
            Notifications are blocked for this site. You can re-enable them in your browser's site settings.
          </p>
        )}
        {(permission === "default" || (permission === "granted" && !subscribed)) && (
          <>
            <p className="text-sm text-[#9A8A76] mt-2">
              Turn these on so Naomi can reach you with a real notification, even when the app is closed.
            </p>
            <button onClick={enablePush} disabled={pushLoading} className="mt-3 px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm disabled:opacity-50">
              {pushLoading ? "Enabling..." : "Enable push notifications"}
            </button>
          </>
        )}
        <p className="text-[11px] text-[#9A8A76] mt-3">
          On iPhone, add this app to your Home Screen first (Share → Add to Home Screen), then open it from there to enable notifications.
        </p>
      </div>

      <div className="glass rounded-2xl p-5 animate-in delay-2">
        <CardHeader title="Backup your data" action="" />
        <p className="text-sm text-[#9A8A76] mt-2">
          Backs up your device settings (theme, mood, today's quote). Your tasks, applications, journal, memories, and everything else now live safely in your Supabase database, synced automatically.
        </p>
        <button onClick={exportData} className="mt-3 px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm">
          Export my data
        </button>
        {exportMsg && <p className="text-xs text-emerald-700 mt-2">{exportMsg}</p>}
      </div>

      <div className="glass rounded-2xl p-5 animate-in delay-2 border border-rose-200">
        <CardHeader title="Danger zone" action="" />
        <p className="text-sm text-[#9A8A76] mt-2">
          This clears everything saved in this browser. Export a backup first if you're not sure.
        </p>
        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            className="mt-3 px-4 py-2 rounded-lg border border-rose-300 text-rose-700 text-sm"
          >
            Clear all data
          </button>
        ) : (
          <div className="mt-3 flex gap-2">
            <button onClick={clearAllData} className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm">
              Yes, clear everything
            </button>
            <button onClick={() => setConfirmClear(false)} className="px-4 py-2 rounded-lg text-sm text-[#9A8A76]">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Timeline ---------------- */
const defaultMilestones = [
  { title: "Started at KNUST", date: "2021-08-01", note: "BSc Computer Engineering begins" },
  { title: "Final year begins", date: "2025-09-01", note: "" },
  { title: "Graduation", date: "2026-09-02", note: "" },
  { title: "National Service", date: "2026-10-01", note: "" },
];

function TimelineSection() {
  const { rows: milestones, addRow: addMilestoneRow, removeRow: removeMilestone } = useSupabaseList("timeline_milestones", "created_at", true, defaultMilestones);
  const [form, setForm] = useState({ title: "", date: "", note: "" });

  const addMilestone = () => {
    if (!form.title.trim() || !form.date) return;
    addMilestoneRow({ title: form.title.trim(), date: form.date, note: form.note.trim() });
    setForm({ title: "", date: "", note: "" });
  };

  const sorted = [...milestones].sort((a, b) => new Date(a.date) - new Date(b.date));
  const today = new Date();
  const groups = sorted.reduce((acc, m) => {
    const year = new Date(m.date).getFullYear();
    (acc[year] ||= []).push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 animate-in">
        <CardHeader title="Add a milestone" action="" />
        <div className="grid sm:grid-cols-4 gap-2 mt-3">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Milestone"
            className="sm:col-span-2 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <button onClick={addMilestone} className="px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1 justify-center">
            <Plus size={14} /> Add
          </button>
        </div>
        <input
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          placeholder="Note (optional)"
          className="w-full mt-2 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
        />
      </div>

      <div className="space-y-8">
        {Object.entries(groups).map(([year, items], gi) => (
          <div key={year} className={`animate-in delay-${Math.min(gi + 1, 6)}`}>
            <p className="font-display text-xl mb-3">{year}</p>
            <div className="relative pl-6 border-l-2 border-[#EEE0CE] dark:border-[#3B2F26] space-y-4">
              {items.map((m) => {
                const isPast = new Date(m.date) < today;
                return (
                  <div key={m.id} className="relative group">
                    <span
                      className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 ${
                        isPast ? "bg-[#5C4433] border-[#5C4433]" : "bg-[#FBF6EF] dark:bg-[#221B16] border-[#5C4433]"
                      }`}
                    />
                    <div className="glass rounded-xl p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{m.title}</p>
                          {m.note && <p className="text-xs text-[#9A8A76] mt-0.5">{m.note}</p>}
                          <p className="text-[11px] text-[#9A8A76] mt-1">{fmt(m.date)}</p>
                        </div>
                        <button
                          onClick={() => removeMilestone(m.id)}
                          className="opacity-0 group-hover:opacity-100 text-[#B08C77] shrink-0"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {milestones.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-[#9A8A76]">No milestones yet, add your first above.</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Library ---------------- */
const LIB_TYPES = ["Course", "Certification", "Skill", "Tutorial"];

const defaultLibraryItems = [
  { title: "Python, advanced", type: "Skill", progress: 65, link: "" },
  { title: "AWS Certificate", type: "Certification", progress: 100, link: "" },
];

function LibrarySection() {
  const { rows: items, addRow, updateRow, updateRowLocal, removeRow: removeItem } = useSupabaseList("library_items", "created_at", true, defaultLibraryItems);
  const [form, setForm] = useState({ title: "", type: "Course", link: "" });

  const addItem = () => {
    if (!form.title.trim()) return;
    addRow({ title: form.title.trim(), type: form.type, progress: 0, link: form.link.trim() });
    setForm({ title: "", type: form.type, link: "" });
  };
  const setProgress = (id, progress) => {
    updateRowLocal(id, { progress });
    updateRow(id, { progress });
  };

  const completed = items.filter((i) => i.progress >= 100).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in">
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-display">{items.length}</p>
          <p className="text-[11px] text-[#9A8A76]">Total tracked</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-display">{completed}</p>
          <p className="text-[11px] text-[#9A8A76]">Completed</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-display">{items.length - completed}</p>
          <p className="text-[11px] text-[#9A8A76]">In progress</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <CardHeader title="Add something you're learning" action="" />
        <div className="grid sm:grid-cols-4 gap-2 mt-3">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            className="sm:col-span-2 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          >
            {LIB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={addItem} className="px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1 justify-center">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.id} className={`glass rounded-2xl p-4 animate-in delay-${Math.min((i % 6) + 2, 6)} group relative`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#9A8A76]">{item.type}</p>
                <p className={`text-sm font-medium ${item.progress >= 100 ? "text-[#9A8A76]" : ""}`}>{item.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9A8A76]">{item.progress}%</span>
                <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 text-[#B08C77]">
                  <X size={14} />
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={item.progress}
              onChange={(e) => setProgress(item.id, Number(e.target.value))}
              className="w-full accent-[#5C4433]"
            />
          </div>
        ))}
        {items.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-[#9A8A76]">Nothing tracked yet, add your first above.</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Reminders / Life Radar ---------------- */
function RemindersSection() {
  const { rows: events, updateRow: updateEvent } = useSupabaseList("events");
  const { rows: courses, updateRow: updateCourse } = useSupabaseList("education_courses");
  const { rows: loveDates, updateRow: updateLoveDate } = useSupabaseList("love_dates");
  const { rows: milestones, updateRow: updateMilestone } = useSupabaseList("timeline_milestones");
  const { rows: goals } = useSupabaseList("goals");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const items = [
    ...events.map((e) => ({ id: e.id, label: e.title, date: e.date, source: "Home", update: (patch) => updateEvent(e.id, { title: patch.label ?? e.title, date: patch.date ?? e.date }) })),
    ...courses.filter((c) => c.exam_date && c.status !== "done").map((c) => ({ id: c.id, label: c.name, date: c.exam_date, source: "Education", update: (patch) => updateCourse(c.id, { name: patch.label ?? c.name, exam_date: patch.date ?? c.exam_date }) })),
    ...loveDates.map((d) => ({ id: d.id, label: d.label, date: d.date, source: "Love Life", update: (patch) => updateLoveDate(d.id, { label: patch.label ?? d.label, date: patch.date ?? d.date }) })),
    ...milestones.map((m) => ({ id: m.id, label: m.title, date: m.date, source: "Timeline", update: (patch) => updateMilestone(m.id, { title: patch.label ?? m.title, date: patch.date ?? m.date }) })),
  ]
    .map((i) => ({ ...i, days: daysUntil(i.date) }))
    .filter((i) => i.days >= 0)
    .sort((a, b) => a.days - b.days);

  const within = (max, min = 0) => items.filter((i) => i.days >= min && i.days <= max);
  const next7 = within(7);
  const next30 = within(30, 8);
  const next90 = within(90, 31);
  const later = items.filter((i) => i.days > 90);

  const incompleteGoals = goals.filter((g) => g.progress < 100);

  const Bucket = ({ title, list }) => (
    <div className="glass rounded-2xl p-5 animate-in">
      <CardHeader title={title} action="" />
      <div className="space-y-2 mt-3">
        {list.length === 0 && <p className="text-sm text-[#9A8A76]">Nothing here.</p>}
        {list.map((i, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm gap-2">
            <div className="min-w-0">
              {i.update ? (
                <p><EditableText value={i.label} onSave={(v) => v && i.update({ label: v })} /></p>
              ) : (
                <p>{i.label} <span className="text-[10px] text-[#B0A08A]">(edit in {i.source})</span></p>
              )}
              <div className="flex items-center gap-1 text-[11px] text-[#9A8A76]">
                <span>{i.source} ·</span>
                {i.update ? (
                  <input
                    type="date"
                    value={i.date}
                    onChange={(e) => i.update({ date: e.target.value })}
                    className="bg-transparent outline-none text-[11px] text-[#9A8A76] cursor-pointer"
                  />
                ) : (
                  <span>{fmt(i.date)}</span>
                )}
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-[#F3E8D8] dark:bg-[#2A231C] shrink-0">{i.days} days</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <Bucket title="Next 7 days" list={next7} />
      <Bucket title="Next 30 days" list={next30} />
      <Bucket title="Next 90 days" list={next90} />
      {later.length > 0 && <Bucket title="Further ahead" list={later} />}

      {incompleteGoals.length > 0 && (
        <div className="glass rounded-2xl p-5 animate-in delay-1">
          <CardHeader title="Goals still moving" action="" />
          <div className="space-y-2 mt-3">
            {incompleteGoals.map((g) => (
              <div key={g.id} className="flex items-center justify-between text-sm">
                <span>{g.text}</span>
                <span className="text-[#9A8A76]">{g.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Tasks (full page) ---------------- */
function TasksSection({ tasks, addTask: addTaskDb, toggleTask, removeTask, clearCompleted }) {
  const [form, setForm] = useState({ text: "", sub: "", time: "" });
  const [filter, setFilter] = useState("active");

  const addTask = () => {
    if (!form.text.trim()) return;
    addTaskDb(form.text.trim(), form.sub.trim(), form.time);
    setForm({ text: "", sub: "", time: "" });
  };

  const visible = tasks.filter((t) => (filter === "all" ? true : filter === "active" ? !t.done : t.done));
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3 animate-in">
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-display">{tasks.length}</p>
          <p className="text-[11px] text-[#9A8A76]">Total</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-display">{tasks.length - doneCount}</p>
          <p className="text-[11px] text-[#9A8A76]">Active</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-2xl font-display">{doneCount}</p>
          <p className="text-[11px] text-[#9A8A76]">Done</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <CardHeader title="Add a task" action="" />
        <div className="grid sm:grid-cols-4 gap-2 mt-3">
          <input
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Task"
            className="sm:col-span-2 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <input
            value={form.sub}
            onChange={(e) => setForm((f) => ({ ...f, sub: e.target.value }))}
            placeholder="Detail (optional)"
            className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <input
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            placeholder="Time (optional)"
            className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
        </div>
        <button onClick={addTask} className="mt-3 px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1">
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="flex items-center justify-between animate-in delay-2">
        <div className="flex gap-2">
          {["active", "all", "done"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                filter === f ? "bg-[#5C4433] text-white border-[#5C4433]" : "border-[#EEE0CE] dark:border-[#3B2F26] text-[#9A8A76]"
              }`}
            >
              {f === "active" ? "Active" : f === "all" ? "All" : "Completed"}
            </button>
          ))}
        </div>
        {doneCount > 0 && (
          <button onClick={clearCompleted} className="text-xs text-[#B08C77]">Clear completed</button>
        )}
      </div>

      <div className="space-y-2">
        {visible.map((t) => (
          <div key={t.id} className="glass rounded-xl p-3 flex items-center gap-3 group">
            <button
              onClick={() => toggleTask(t.id)}
              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                t.done ? "bg-[#5C4433] border-[#5C4433]" : "border-[#CBB99C]"
              }`}
            >
              {t.done && <span className="w-2 h-2 rounded-full bg-[#F3D9CE]" />}
            </button>
            <div className="flex-1">
              <p className={`text-sm ${t.done ? "line-through text-[#B0A08A]" : "font-medium"}`}>{t.text}</p>
              {t.sub && <p className="text-xs text-[#9A8A76]">{t.sub}</p>}
            </div>
            {t.time && <span className="text-xs text-[#9A8A76]">{t.time}</span>}
            <button onClick={() => removeTask(t.id)} className="opacity-0 group-hover:opacity-100 text-[#B08C77]">
              <X size={14} />
            </button>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-sm text-[#9A8A76]">Nothing here.</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Calendar (full page) ---------------- */
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function CalendarSection() {
  const { rows: events } = useSupabaseList("events");
  const { rows: courses } = useSupabaseList("education_courses");
  const { rows: loveDates } = useSupabaseList("love_dates");
  const { rows: milestones } = useSupabaseList("timeline_milestones");
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(isoDate(new Date()));

  const allItems = [
    ...events.map((e) => ({ label: e.title, date: e.date, source: "Home" })),
    ...courses.filter((c) => c.exam_date).map((c) => ({ label: c.name, date: c.exam_date, source: "Education" })),
    ...loveDates.map((d) => ({ label: d.label, date: d.date, source: "Love Life" })),
    ...milestones.map((m) => ({ label: m.title, date: m.date, source: "Timeline" })),
  ];

  const byDate = allItems.reduce((acc, i) => {
    (acc[i.date] ||= []).push(i);
    return acc;
  }, {});

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: startDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );
  const todayIso = isoDate(new Date());

  const selectedItems = byDate[selected] || [];

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 glass rounded-2xl p-5 animate-in">
        <div className="flex items-center justify-between">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft size={16} /></button>
          <p className="font-display text-lg">{cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight size={16} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mt-4 text-center text-[11px] text-[#9A8A76]">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => <span key={d}>{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-2">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const dateStr = isoDate(new Date(year, month, d));
            const hasItems = byDate[dateStr]?.length > 0;
            const isToday = dateStr === todayIso;
            const isSelected = dateStr === selected;
            return (
              <button
                key={i}
                onClick={() => setSelected(dateStr)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition ${
                  isSelected ? "bg-[#5C4433] text-white" : isToday ? "bg-[#F3D9CE]" : "hover:bg-white/40"
                }`}
              >
                {d}
                {hasItems && !isSelected && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#B8863B]" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <CardHeader title={fmt(selected)} action="" />
        <div className="space-y-2 mt-3">
          {selectedItems.length === 0 && <p className="text-sm text-[#9A8A76]">Nothing on this day.</p>}
          {selectedItems.map((item, i) => (
            <div key={i} className="glass rounded-xl p-3">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-[11px] text-[#9A8A76] mt-0.5">{item.source}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- About Me ---------------- */
function AboutSection() {
  const { profile, update, uploadAvatar, uploading: avatarUploading } = useProfile();
  const [newLink, setNewLink] = useState({ label: "", url: "" });

  const addLink = () => {
    if (!newLink.label.trim() || !newLink.url.trim()) return;
    let url = newLink.url.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    update({ links: [...(profile.links || []), { label: newLink.label.trim(), url }] });
    setNewLink({ label: "", url: "" });
  };
  const removeLink = (i) => {
    update({ links: (profile.links || []).filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="glass rounded-2xl p-6 animate-in flex flex-col sm:flex-row gap-5 items-start">
        <label className="relative w-24 h-24 rounded-full bg-[#E7A6A0] flex items-center justify-center text-white font-display text-3xl shrink-0 overflow-hidden cursor-pointer group">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            profile.name?.charAt(0) || "N"
          )}
          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px]">
            {avatarUploading ? "..." : "Change"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }}
          />
        </label>
        <div className="flex-1">
          <p className="font-display text-2xl">{profile.name}</p>
          <p className="text-sm text-[#9A8A76] mt-0.5">{profile.tagline}</p>
          <div className="mt-3">
            <label className="text-xs text-[#9A8A76] flex items-center gap-1"><Cake size={12} /> Date of birth</label>
            <input
              type="date"
              value={profile.date_of_birth || ""}
              onChange={(e) => update({ date_of_birth: e.target.value })}
              className="mt-1 px-3 py-1.5 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <CardHeader title="About me" action="" />
        <textarea
          value={profile.bio || ""}
          onChange={(e) => update({ bio: e.target.value })}
          placeholder="Who are you right now? Values, dreams, what you're becoming..."
          rows={4}
          className="w-full mt-3 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none focus:ring-1 focus:ring-[#8A5A44] resize-none"
        />
      </div>

      <div className="glass rounded-2xl p-5 animate-in delay-2">
        <CardHeader title="Favorite things" action="" />
        <textarea
          value={profile.favorites || ""}
          onChange={(e) => update({ favorites: e.target.value })}
          placeholder="Favorite books, songs, places, quotes, whatever feels like you..."
          rows={4}
          className="w-full mt-3 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none focus:ring-1 focus:ring-[#8A5A44] resize-none"
        />
      </div>

      <div className="glass rounded-2xl p-5 animate-in delay-3">
        <CardHeader title="My links" action="" />
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            value={newLink.label}
            onChange={(e) => setNewLink((f) => ({ ...f, label: e.target.value }))}
            placeholder="Label, e.g. Beryl's Beauty Mark"
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <input
            value={newLink.url}
            onChange={(e) => setNewLink((f) => ({ ...f, url: e.target.value }))}
            placeholder="URL"
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <button onClick={addLink} className="px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1 justify-center">
            <Plus size={14} /> Add
          </button>
        </div>
        <div className="space-y-2 mt-4">
          {(profile.links || []).map((l, i) => (
            <div key={i} className="flex items-center justify-between glass rounded-xl p-3 group">
              <a href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-[#8A5A44] dark:text-[#D8B48C] hover:underline">
                <LinkIcon size={13} /> {l.label}
              </a>
              <button onClick={() => removeLink(i)} className="opacity-0 group-hover:opacity-100 text-[#B08C77]">
                <X size={14} />
              </button>
            </div>
          ))}
          {(!profile.links || profile.links.length === 0) && (
            <p className="text-sm text-[#9A8A76]">No links saved yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- My Documents ---------------- */
const DOC_CATEGORIES = ["Identification", "Education", "Career", "Other"];

function DocumentsSection() {
  const { documents, uploading, uploadDocument, viewDocument, removeDocument, renameDocument } = useDocuments();
  const [form, setForm] = useState({ title: "", category: "Identification" });
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file || !form.title.trim()) return;
    await uploadDocument(file, form.title, form.category);
    setForm({ title: "", category: form.category });
    setFile(null);
  };

  const groups = DOC_CATEGORIES.map((cat) => ({
    cat,
    items: documents.filter((d) => d.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 animate-in">
        <CardHeader title="Add a document" action="" />
        <p className="text-[11px] text-[#9A8A76] mt-1">
          Stored privately. Only you can view or download these, never a public link.
        </p>
        <div className="grid sm:grid-cols-4 gap-2 mt-3">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title, e.g. Passport"
            className="sm:col-span-2 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          >
            {DOC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] text-sm text-center cursor-pointer truncate">
            {file ? file.name : "Choose file"}
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        <button
          onClick={handleUpload}
          disabled={uploading || !file || !form.title.trim()}
          className="mt-3 px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1 disabled:opacity-50"
        >
          <Plus size={14} /> {uploading ? "Uploading..." : "Save document"}
        </button>
      </div>

      {groups.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-sm text-[#9A8A76] animate-in delay-1">
          No documents saved yet. Your CV, transcript, passport, whatever matters, starts here.
        </div>
      )}

      {groups.map(({ cat, items }, gi) => (
        <div key={cat} className={`animate-in delay-${Math.min(gi + 2, 6)}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B5A48] dark:text-[#D8C6AE] mb-2">{cat}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {items.map((d) => (
              <div key={d.id} className="glass rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate"><EditableText value={d.title} onSave={(v) => v && renameDocument(d.id, v)} /></p>
                  <p className="text-[11px] text-[#9A8A76] truncate">{d.file_name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => viewDocument(d.file_path)} className="p-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26]">
                    <Download size={14} />
                  </button>
                  <button onClick={() => removeDocument(d.id, d.file_path)} className="p-2 text-[#B08C77]">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Habits ---------------- */
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
function last7Dates() {
  const arr = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

function HabitsSection() {
  const { rows: habits, addRow, updateRow, removeRow } = useSupabaseList("habits", "created_at", true, [
    { name: "Drink water", completed_dates: [] },
    { name: "Read", completed_dates: [] },
    { name: "Skincare", completed_dates: [] },
  ]);
  const [newHabit, setNewHabit] = useState("");
  const week = last7Dates();
  const today = todayKey();

  const addHabit = () => {
    if (!newHabit.trim()) return;
    addRow({ name: newHabit.trim(), completed_dates: [] });
    setNewHabit("");
  };

  const toggleDay = (habit, date) => {
    const set = new Set(habit.completed_dates || []);
    if (set.has(date)) set.delete(date); else set.add(date);
    updateRow(habit.id, { completed_dates: Array.from(set) });
  };

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 animate-in">
        <CardHeader title="Add a habit" action="" />
        <div className="flex gap-2 mt-3">
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="e.g. Morning walk"
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <button onClick={addHabit} className="px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 animate-in delay-1 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left pb-2 font-medium text-[#6B5A48] dark:text-[#D8C6AE]">Habit</th>
              {week.map((d) => (
                <th key={d} className="text-center pb-2 text-[10px] text-[#9A8A76] font-normal w-9">
                  {new Date(d).toLocaleDateString("en-US", { weekday: "narrow" })}
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {habits.map((h) => {
              const done = new Set(h.completed_dates || []);
              const streak = week.filter((d) => done.has(d)).length;
              return (
                <tr key={h.id} className="border-t border-[#EEE0CE] dark:border-[#3B2F26]">
                  <td className="py-2.5 pr-2">
                    <p className="font-medium"><EditableText value={h.name} onSave={(v) => v && updateRow(h.id, { name: v })} /></p>
                    <p className="text-[10px] text-[#9A8A76]">{streak}/7 this week</p>
                  </td>
                  {week.map((d) => (
                    <td key={d} className="text-center">
                      <button
                        onClick={() => toggleDay(h, d)}
                        className={`w-6 h-6 rounded-full border transition ${
                          done.has(d)
                            ? "bg-[#5C4433] border-[#5C4433]"
                            : d === today
                            ? "border-[#8A5A44]"
                            : "border-[#EEE0CE] dark:border-[#3B2F26]"
                        }`}
                      />
                    </td>
                  ))}
                  <td>
                    <button onClick={() => removeRow(h.id)} className="text-[#B08C77]"><X size={13} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {habits.length === 0 && <p className="text-sm text-[#9A8A76] mt-3">No habits yet, add your first above.</p>}
      </div>
    </div>
  );
}

/* ---------------- Places & Bucket List ---------------- */
function PlacesSection() {
  const { rows: places, addRow, updateRow, removeRow } = useSupabaseList("places", "created_at", true, [
    { name: "Cape Coast", status: "want", notes: "" },
    { name: "London", status: "want", notes: "" },
  ]);
  const [newPlace, setNewPlace] = useState("");
  const [filter, setFilter] = useState("all");

  const addPlace = () => {
    if (!newPlace.trim()) return;
    addRow({ name: newPlace.trim(), status: "want", notes: "" });
    setNewPlace("");
  };

  const visible = filter === "all" ? places : places.filter((p) => p.status === filter);
  const wantCount = places.filter((p) => p.status === "want").length;
  const visitedCount = places.filter((p) => p.status === "visited").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in">
        <div className="glass rounded-xl p-4"><p className="text-2xl font-display">{places.length}</p><p className="text-[11px] text-[#9A8A76]">Total</p></div>
        <div className="glass rounded-xl p-4"><p className="text-2xl font-display">{wantCount}</p><p className="text-[11px] text-[#9A8A76]">Want to visit</p></div>
        <div className="glass rounded-xl p-4"><p className="text-2xl font-display">{visitedCount}</p><p className="text-[11px] text-[#9A8A76]">Visited</p></div>
      </div>

      <div className="glass rounded-2xl p-5 animate-in delay-1">
        <CardHeader title="Add a place" action="" />
        <div className="flex gap-2 mt-3">
          <input
            value={newPlace}
            onChange={(e) => setNewPlace(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPlace()}
            placeholder="e.g. Paris"
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <button onClick={addPlace} className="px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="flex gap-2 animate-in delay-2">
        {["all", "want", "visited"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filter === f ? "bg-[#5C4433] text-white border-[#5C4433]" : "border-[#EEE0CE] dark:border-[#3B2F26] text-[#9A8A76]"
            }`}
          >
            {f === "all" ? "All" : f === "want" ? "Want to visit" : "Visited"}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {visible.map((p) => (
          <div key={p.id} className="glass rounded-2xl p-4 relative group">
            <button onClick={() => removeRow(p.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[#B08C77]"><X size={13} /></button>
            <div className="flex items-center gap-2 pr-6">
              <MapPin size={14} className="text-[#8A5A44] shrink-0" />
              <p className="font-medium"><EditableText value={p.name} onSave={(v) => v && updateRow(p.id, { name: v })} /></p>
            </div>
            <div className="flex gap-1.5 mt-2">
              {["want", "visited"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateRow(p.id, { status: s })}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                    p.status === s ? "bg-[#F3D9CE] text-[#8A5A44] border-[#E7C4B4] font-medium" : "border-transparent text-[#B0A08A]"
                  }`}
                >
                  {s === "want" ? "Want to visit" : "Visited"}
                </button>
              ))}
            </div>
          </div>
        ))}
        {visible.length === 0 && <div className="glass rounded-2xl p-6 text-center text-sm text-[#9A8A76] sm:col-span-2">Nothing here yet.</div>}
      </div>
    </div>
  );
}

/* ---------------- Wins ---------------- */
function WinsSection() {
  const { rows: wins, addRow, updateRow, removeRow } = useSupabaseList("wins", "created_at", false, [
    { text: "Halliburton interview via Career Services" },
    { text: "Huawei extended interview" },
  ]);
  const [draft, setDraft] = useState("");

  const addWin = () => {
    if (!draft.trim()) return;
    addRow({ text: draft.trim() });
    setDraft("");
  };

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 animate-in">
        <CardHeader title="Add a win" action="" />
        <p className="text-[11px] text-[#9A8A76] mt-1">Separate from goals, just proof of how far you've come.</p>
        <div className="flex gap-2 mt-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addWin()}
            placeholder="Something you're proud of"
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <button onClick={addWin} className="px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1">
            <Plus size={14} /> Save
          </button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {wins.map((w, i) => (
          <div key={w.id} className={`glass rounded-2xl p-4 animate-in delay-${Math.min((i % 6) + 1, 6)} relative group`}>
            <Trophy size={16} className="text-[#B8863B] mb-2" />
            <p className="text-sm pr-6">
              <EditableText value={w.text} onSave={(v) => v && updateRow(w.id, { text: v })} />
            </p>
            <p className="text-[11px] text-[#9A8A76] mt-2">{new Date(w.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            <button onClick={() => removeRow(w.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[#B08C77]"><X size={13} /></button>
          </div>
        ))}
        {wins.length === 0 && <div className="glass rounded-2xl p-6 text-center text-sm text-[#9A8A76] sm:col-span-2">Nothing saved yet.</div>}
      </div>
    </div>
  );
}

/* ---------------- References / Recommenders ---------------- */
function RecommendersSection() {
  const { rows: recommenders, addRow, updateRow, removeRow } = useSupabaseList("recommenders", "created_at", true, [
    { name: "Dr. Prince Amponsah Kwabi", role: "Lecturer, Mathematics, KNUST", last_asked: null, response: "", last_thanked: null },
    { name: "Dr. Griffith Selorm Klogo", role: "Senior Lecturer, Computer Engineering, KNUST", last_asked: null, response: "", last_thanked: null },
    { name: "Dr. Justice Owusu Agyemang", role: "Lecturer, Telecommunication Engineering, KNUST", last_asked: null, response: "", last_thanked: null },
  ]);
  const [form, setForm] = useState({ name: "", role: "" });

  const addPerson = () => {
    if (!form.name.trim()) return;
    addRow({ name: form.name.trim(), role: form.role.trim(), last_asked: null, response: "", last_thanked: null });
    setForm({ name: "", role: "" });
  };

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 animate-in">
        <CardHeader title="Add a referee" action="" />
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name"
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <input
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            placeholder="Role"
            className="flex-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none"
          />
          <button onClick={addPerson} className="px-4 py-2 rounded-lg bg-[#5C4433] text-white text-sm flex items-center gap-1 justify-center">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {recommenders.map((r) => (
          <div key={r.id} className="glass rounded-2xl p-4 animate-in relative group">
            <button onClick={() => removeRow(r.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-[#B08C77]"><X size={14} /></button>
            <p className="font-medium pr-6"><EditableText value={r.name} onSave={(v) => v && updateRow(r.id, { name: v })} /></p>
            <p className="text-xs text-[#9A8A76]"><EditableText value={r.role} onSave={(v) => updateRow(r.id, { role: v })} placeholder="Add a role" /></p>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-[11px] text-[#9A8A76]">Last asked</label>
                <input
                  type="date"
                  value={r.last_asked || ""}
                  onChange={(e) => updateRow(r.id, { last_asked: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#9A8A76]">Last thanked</label>
                <input
                  type="date"
                  value={r.last_thanked || ""}
                  onChange={(e) => updateRow(r.id, { last_thanked: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none mt-1"
                />
              </div>
            </div>
            <label className="text-[11px] text-[#9A8A76] block mt-3">What they said / notes</label>
            <textarea
              value={r.response || ""}
              onChange={(e) => updateRow(r.id, { response: e.target.value })}
              rows={2}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Privacy Lock ---------------- */
function LockGate({ section, profile, unlocked, onUnlock, children }) {
  const isLocked = (profile.locked_sections || []).includes(section);
  const isUnlockedThisSession = unlocked.has(section);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  if (!isLocked || isUnlockedThisSession) return children;

  const submit = () => {
    if (!profile.privacy_pin) {
      onUnlock(section);
      return;
    }
    if (pin === profile.privacy_pin) {
      onUnlock(section);
      setError("");
    } else {
      setError("Wrong PIN.");
    }
  };

  return (
    <div className="glass rounded-2xl p-8 max-w-sm mx-auto text-center animate-in">
      <Lock size={20} className="mx-auto text-[#8A5A44] dark:text-[#D8B48C]" />
      <p className="font-display text-lg mt-3">This section is locked</p>
      <p className="text-xs text-[#9A8A76] mt-1">Enter your PIN to continue.</p>
      <input
        type="password"
        inputMode="numeric"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="PIN"
        className="w-full mt-4 px-3 py-2 rounded-lg border border-[#EEE0CE] dark:border-[#3B2F26] bg-transparent text-sm outline-none text-center tracking-widest"
      />
      {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
      <button onClick={submit} className="mt-3 px-5 py-2 rounded-full bg-[#5C4433] text-white text-sm">
        Unlock
      </button>
    </div>
  );
}

/* ---------------- Life in Numbers ---------------- */
function LifeInNumbersSection() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    const yearStart = `${new Date().getFullYear()}-01-01`;
    const tables = [
      { key: "tasksDone", table: "tasks", filters: (q) => q.eq("done", true) },
      { key: "journalEntries", table: "journal_entries", filters: (q) => q },
      { key: "memories", table: "memories", filters: (q) => q },
      { key: "goalsCompleted", table: "goals", filters: (q) => q.gte("progress", 100) },
      { key: "applications", table: "career_apps", filters: (q) => q },
      { key: "wins", table: "wins", filters: (q) => q },
      { key: "placesVisited", table: "places", filters: (q) => q.eq("status", "visited") },
      { key: "entertainmentFinished", table: "entertainment_items", filters: (q) => q.eq("status", "finished") },
    ];

    Promise.all(
      tables.map(async ({ key, table, filters }) => {
        let query = supabase.from(table).select("*", { count: "exact", head: true }).gte("created_at", yearStart);
        query = filters(query);
        const { count } = await query;
        return [key, count || 0];
      })
    ).then((entries) => setCounts(Object.fromEntries(entries)));
  }, []);

  const year = new Date().getFullYear();

  if (!counts) {
    return <div className="glass rounded-2xl p-8 text-center text-sm text-[#9A8A76] animate-in">Adding up your year...</div>;
  }

  const items = [
    { label: "Tasks completed", value: counts.tasksDone },
    { label: "Journal entries", value: counts.journalEntries },
    { label: "Memories saved", value: counts.memories },
    { label: "Goals completed", value: counts.goalsCompleted },
    { label: "Applications tracked", value: counts.applications },
    { label: "Wins recorded", value: counts.wins },
    { label: "Places visited", value: counts.placesVisited },
    { label: "Movies/series finished", value: counts.entertainmentFinished },
  ];

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-6 animate-in text-center">
        <p className="font-display text-2xl">{year} in numbers</p>
        <p className="text-sm text-[#9A8A76] mt-1">Everything you've done this year, in one place.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <div key={item.label} className={`glass rounded-2xl p-5 text-center animate-in delay-${Math.min(i + 1, 6)}`}>
            <p className="text-3xl font-display">{item.value}</p>
            <p className="text-[11px] text-[#9A8A76] mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- On This Day (Home widget) ---------------- */
/* ---------------- Daily Insight ---------------- */
function DailyInsight({ snapshot }) {
  const { insight, loading, refresh } = useDailyInsight(snapshot);

  if (loading && !insight) {
    return (
      <div className="glass rounded-2xl p-5 mb-6 animate-in text-sm text-[#9A8A76]">
        Reading your day...
      </div>
    );
  }

  if (!insight || (!insight.briefing && !insight.forgetting)) return null;

  return (
    <div className="glass rounded-2xl p-5 mb-6 animate-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Sparkles size={16} className="text-[#B8863B] mt-0.5 shrink-0" />
          <div>
            {insight.briefing && <p className="text-sm">{insight.briefing}</p>}
            {insight.forgetting && (
              <p className="text-sm mt-2 px-3 py-2 rounded-lg bg-[#F3D9CE]/50 dark:bg-white/5 text-[#5C4433] dark:text-[#D8B48C]">
                {insight.forgetting}
              </p>
            )}
          </div>
        </div>
        <button onClick={refresh} className="text-[10px] text-[#9A8A76] shrink-0 hover:underline">
          Refresh
        </button>
      </div>
    </div>
  );
}

function OnThisDay() {
  const { entries } = useJournal();
  const { memories } = useMemories();
  const today = new Date();

  const pastEntries = entries.filter((e) => {
    const d = new Date(e.created_at);
    return d.getMonth() === today.getMonth() && d.getDate() === today.getDate() && d.getFullYear() < today.getFullYear();
  });
  const pastMemories = memories.filter((m) => {
    const d = new Date(m.created_at);
    return d.getMonth() === today.getMonth() && d.getDate() === today.getDate() && d.getFullYear() < today.getFullYear();
  });

  if (pastEntries.length === 0 && pastMemories.length === 0) return null;

  return (
    <div className="glass rounded-2xl animate-in p-5 mt-5">
      <CardHeader title="On This Day" action="" />
      <div className="space-y-3 mt-3">
        {pastMemories.map((m) => (
          <div key={m.id} className="flex items-center gap-3">
            <img src={m.image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
            <div>
              <p className="text-sm">{m.caption || "A memory"}</p>
              <p className="text-[11px] text-[#9A8A76]">{new Date(m.created_at).getFullYear()}</p>
            </div>
          </div>
        ))}
        {pastEntries.map((e) => (
          <div key={e.id}>
            <p className="text-sm italic">"{e.text}"</p>
            <p className="text-[11px] text-[#9A8A76] mt-0.5">{new Date(e.created_at).getFullYear()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniCalendar() {
  const [cursor, setCursor] = useState(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // Monday start
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const cells = Array.from({ length: startDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  return (
    <div className="glass rounded-2xl animate-in p-5">
      <div className="flex items-center justify-between">
        <button onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft size={15} /></button>
        <p className="text-sm font-medium">{cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        <button onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight size={15} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mt-3 text-center text-[10px] text-[#9A8A76]">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-1 text-center text-xs">
        {cells.map((d, i) => {
          const isToday = d && d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <span
              key={i}
              className={`w-7 h-7 flex items-center justify-center rounded-full mx-auto ${
                isToday ? "bg-[#5C4433] text-white" : d ? "hover:bg-[#F3E8D8] dark:hover:bg-[#2A231C]" : ""
              }`}
            >
              {d || ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}