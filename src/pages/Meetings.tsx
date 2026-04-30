import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Calendar, Clock, Plus, Video } from "lucide-react";
import { useMeetings, type Meeting } from "@/data/store";
import { toast } from "sonner";

const MeetingCard = ({ m }: { m: Meeting }) => (
  <div className="bg-card rounded-2xl shadow-card p-6">
    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
        <GraduationCap className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg">{m.title}</h3>
        <div className="text-sm text-muted-foreground">{m.technology}</div>
        <div className="flex flex-wrap gap-2 mt-2 items-center">
          <Badge variant={m.status === "scheduled" ? "default" : "secondary"}>{m.status}</Badge>
          <Badge variant={m.priority === "high" ? "destructive" : "secondary"} className="capitalize">
            {m.priority} priority
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {m.date}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {m.time}
          </span>
          <span className="text-xs text-muted-foreground">{m.duration} minutes</span>
        </div>
        <div className="text-sm mt-3">
          <span className="text-primary font-medium">{m.client}</span>
          <span className="text-muted-foreground"> with </span>
          <span className="text-emerald-600 font-medium">{m.developer}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Edit</Button>
          {m.status === "scheduled" && <Button size="sm" variant="outline">Reschedule</Button>}
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {m.status === "scheduled" ? "Join Meeting" : "View Recording"}
          </Button>
        </div>
        {m.zoom && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Video className="h-3.5 w-3.5" /> Zoom Link Available
          </span>
        )}
      </div>
    </div>
    <div className="mt-4 p-4 rounded-xl bg-secondary/50">
      <div className="font-semibold text-sm">Agenda:</div>
      <p className="text-sm text-muted-foreground mt-1">{m.agenda}</p>
    </div>
  </div>
);

const Meetings = () => {
  const meetings = useMeetings();
  const upcoming = meetings.filter((m) => m.status === "scheduled");
  const completed = meetings.filter((m) => m.status === "completed");

  return (
    <>
      <PageHeader
        title="Meeting Management"
        subtitle="Schedule, manage and track all client meetings"
        action={
          <Button onClick={() => toast.info("Coming soon")}>
            <Plus className="h-4 w-4" />
            Schedule Meeting
          </Button>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={String(meetings.length)} label="Total Meetings" variant="blue" />
        <StatCard value={String(upcoming.length)} label="Scheduled" variant="green" />
        <StatCard value={String(completed.length)} label="Completed" variant="purple" />
        <StatCard value={String(completed.length)} label="Recordings" variant="orange" />
      </section>

      <section className="bg-card rounded-2xl shadow-card p-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm">All Meetings</Button>
        <Button variant="outline" size="sm">Today's Meetings</Button>
        <Button variant="outline" size="sm">This Week</Button>
        <Button variant="outline" size="sm" className="ml-auto">Export Calendar</Button>
      </section>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-4 bg-card shadow-card rounded-xl p-1 h-auto">
          <TabsTrigger value="upcoming" className="py-2.5">Upcoming</TabsTrigger>
          <TabsTrigger value="completed" className="py-2.5">Completed</TabsTrigger>
          <TabsTrigger value="calendar" className="py-2.5">Calendar View</TabsTrigger>
          <TabsTrigger value="recordings" className="py-2.5">Recordings</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {upcoming.map((m) => <MeetingCard key={m.id} m={m} />)}
        </TabsContent>
        <TabsContent value="completed" className="mt-4 space-y-4">
          {completed.map((m) => <MeetingCard key={m.id} m={m} />)}
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <div className="bg-card rounded-2xl shadow-card p-8 text-center text-muted-foreground">
            Calendar view — coming soon
          </div>
        </TabsContent>
        <TabsContent value="recordings" className="mt-4 space-y-3">
          {completed.map((m) => (
            <div key={m.id} className="bg-card rounded-2xl shadow-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.date} • {m.duration} min</div>
                </div>
              </div>
              <Button size="sm" variant="outline">Watch</Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Meetings;
