import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Bell } from "lucide-react";
import InfoPanel from "./InfoPanel";

interface Event {
  id: string;
  title: string;
  time: string;
  type: "meeting" | "task" | "reminder";
  urgent?: boolean;
}

const CalendarWidget = ({ delay = 0 }: { delay?: number }) => {
  const [currentDate] = useState(new Date());
  const [events] = useState<Event[]>([
    { id: "1", title: "Board Meeting", time: "09:00", type: "meeting", urgent: true },
    { id: "2", title: "Suit Diagnostics", time: "11:30", type: "task" },
    { id: "3", title: "Call Pepper", time: "14:00", type: "reminder" },
    { id: "4", title: "Lab Review", time: "16:30", type: "meeting" },
    { id: "5", title: "Security Briefing", time: "18:00", type: "meeting", urgent: true },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
  const today = currentDate.getDate();

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meeting": return "bg-primary/20 border-primary/50";
      case "task": return "bg-secondary/20 border-secondary/50";
      default: return "bg-muted/20 border-muted/50";
    }
  };

  return (
    <InfoPanel title="Schedule" delay={delay}>
      {/* Mini Calendar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-primary font-mono">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <span key={i} className="text-[8px] text-muted-foreground/60">{day}</span>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0.5">
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} className="w-5 h-5" />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const isToday = day === today;
            return (
              <div
                key={day}
                className={`w-5 h-5 flex items-center justify-center text-[9px] rounded ${
                  isToday 
                    ? "bg-primary text-primary-foreground font-bold" 
                    : "text-muted-foreground hover:bg-muted/30"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Events */}
      <div className="border-t border-border/30 pt-2">
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">TODAY'S SCHEDULE</span>
        </div>
        
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {events.map((event) => (
            <div 
              key={event.id} 
              className={`flex items-center gap-2 p-1.5 rounded border ${getTypeColor(event.type)}`}
            >
              <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-[10px] font-mono text-muted-foreground">{event.time}</span>
              <span className="text-xs text-foreground truncate flex-1">{event.title}</span>
              {event.urgent && <Bell className="w-3 h-3 text-red-500 animate-pulse flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </InfoPanel>
  );
};

export default CalendarWidget;
