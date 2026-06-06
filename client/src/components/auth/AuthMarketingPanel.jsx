import { Zap, Target, BookOpen, Users, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'AI Career Guidance',
    description: 'Personalized recommendations powered by intelligent career insights.',
  },
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    description: 'Identify what to learn next with data-driven skill mapping.',
  },
  {
    icon: BookOpen,
    title: 'Personalized Learning Paths',
    description: 'Roadmaps tailored to your stream, goals, and progress.',
  },
  {
    icon: Users,
    title: 'Career Community',
    description: 'Connect with mentors and resources aligned to your path.',
  },
];

const AuthMarketingPanel = () => (
  <aside className="hidden lg:flex lg:w-[48%] xl:w-[50%] lg:min-h-screen lg:border-r lg:border-white/[0.06]">
    <div className="flex h-full w-full flex-col px-10 py-10 xl:px-12 xl:py-11 text-slate-100">
      <div className="relative z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
            <Sparkles className="h-5 w-5 text-slate-100" strokeWidth={1.75} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">IntelliPath</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center gap-8 py-8">
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight leading-snug text-white">
            Navigate your career with clarity
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
            The AI-powered platform that turns your academic stream into actionable roadmaps,
            courses, and mentor connections.
          </p>
        </div>

        <ul className="space-y-2.5">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="flex gap-3.5 rounded-lg border border-white/[0.07] bg-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/[0.06] ring-1 ring-white/10">
                <Icon className="h-4 w-4 text-slate-300" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-100">{title}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-slate-500">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 shrink-0 text-xs text-slate-500">
        © {new Date().getFullYear()} IntelliPath. Your journey, intelligently guided.
      </p>
    </div>
  </aside>
);

export default AuthMarketingPanel;
