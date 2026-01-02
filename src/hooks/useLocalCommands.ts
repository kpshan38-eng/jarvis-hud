import { useCallback } from "react";

interface CommandResult {
  handled: boolean;
  response: string;
}

export const useLocalCommands = () => {
  const executeCommand = useCallback((input: string): CommandResult => {
    const command = input.toLowerCase().trim();

    // Time commands
    if (command.includes("time") || command.includes("what time") || command === "time?") {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      });
      const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      return {
        handled: true,
        response: `The current time is ${timeStr}, boss. Today is ${dateStr}.`,
      };
    }

    // Date commands
    if (command.includes("date") || command.includes("what day") || command.includes("today")) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      return {
        handled: true,
        response: `Today is ${dateStr}, boss.`,
      };
    }

    // Browser/Chrome commands - explain limitation
    if (command.includes("open chrome") || command.includes("open browser") || 
        command.includes("launch chrome") || command.includes("start chrome")) {
      return {
        handled: true,
        response: `I apologize, boss, but as a web-based interface, I cannot directly control applications on your device. Browser security protocols prevent web applications from launching external programs. However, I can assist you with web-based tasks, information retrieval, and system monitoring within this interface. For native device control, you would need a desktop application variant of my systems.`,
      };
    }

    // Open website commands
    if (command.includes("open google") || command.includes("go to google")) {
      window.open("https://www.google.com", "_blank");
      return {
        handled: true,
        response: `Opening Google in a new tab, boss.`,
      };
    }

    if (command.includes("open youtube") || command.includes("go to youtube")) {
      window.open("https://www.youtube.com", "_blank");
      return {
        handled: true,
        response: `Opening YouTube in a new tab, boss.`,
      };
    }

    if (command.includes("open github") || command.includes("go to github")) {
      window.open("https://www.github.com", "_blank");
      return {
        handled: true,
        response: `Opening GitHub in a new tab, boss.`,
      };
    }

    // Generic open website
    const urlMatch = command.match(/open\s+(https?:\/\/[^\s]+)/i) || 
                     command.match(/go to\s+(https?:\/\/[^\s]+)/i);
    if (urlMatch) {
      window.open(urlMatch[1], "_blank");
      return {
        handled: true,
        response: `Opening ${urlMatch[1]} in a new tab, boss.`,
      };
    }

    // Status commands
    if (command === "status" || command.includes("system status") || command.includes("how are you")) {
      return {
        handled: true,
        response: `All systems operational, boss. Arc reactor output stable at 100%. Neural networks functioning optimally. Security protocols active. Awaiting your commands.`,
      };
    }

    // Help command
    if (command === "help" || command.includes("what can you do")) {
      return {
        handled: true,
        response: `I can assist with the following, boss:\n• "time" or "what time is it" - Display current time\n• "date" or "today" - Show current date\n• "status" - System diagnostics\n• "open google/youtube/github" - Open websites\n• "clear" - Clear conversation\nFor all other queries, I'll engage the AI core for a comprehensive response.`,
      };
    }

    // Weather quick check (handled by the panel, but provide response)
    if (command.includes("weather")) {
      return {
        handled: false, // Let AI handle for detailed response
        response: "",
      };
    }

    // Not a local command
    return {
      handled: false,
      response: "",
    };
  }, []);

  return { executeCommand };
};
