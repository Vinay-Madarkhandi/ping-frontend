import { Logo, SonarPulse } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const highlights = [
  {
    title: "Real-time checks",
    description: "HTTP monitors run on your schedule, down to 10-second intervals.",
  },
  {
    title: "Instant alerts",
    description: "Get notified by email the moment something goes down or recovers.",
  },
  {
    title: "Accurate uptime history",
    description: "Duration-based uptime that excludes paused time and data gaps.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden w-full max-w-md flex-col justify-between overflow-hidden bg-sidebar p-10 lg:flex xl:max-w-lg">
        <div className="bg-grid-fade absolute inset-0" />

        <div className="relative z-10">
          <Logo tagline="Uptime & server monitoring" />
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center py-16">
          <SonarPulse />
        </div>

        <div className="relative z-10 space-y-5">
          {highlights.map((item) => (
            <div key={item.title} className="flex gap-3">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 lg:justify-end">
          <Logo className="lg:hidden" />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center p-4 pb-16 sm:p-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
