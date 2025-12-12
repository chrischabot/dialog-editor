"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Dialogue, DialogueLine, Speaker } from "@/types/dialogue";
import {
  getLogs,
  clearLogs,
  subscribeLogs,
  formatLogEntry,
  type LogEntry,
} from "@/lib/elevenlabs/logger";

interface ApiDevToolsDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  dialogue: Dialogue;
}

type TabType = "network" | "logs" | "payload";

/**
 * DevTools-style drawer showing API requests, logs, and JSON payload
 */
export function ApiDevToolsDrawer({
  isOpen,
  onToggle,
  dialogue,
}: ApiDevToolsDrawerProps) {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabType>("network");
  const [height, setHeight] = React.useState(280);
  const [isResizing, setIsResizing] = React.useState(false);
  const [isMinified, setIsMinified] = React.useState(false);

  // Generate JSON payload for the Payload tab
  const jsonPayload = React.useMemo(() => {
    return {
      model_id: "eleven_v3",
      dialogue: dialogue.lines.map((line: DialogueLine) => ({
        text: line.text,
        voice_id:
          dialogue.speakers.find((s: Speaker) => s.id === line.speakerId)?.voiceId ?? "",
      })),
    };
  }, [dialogue]);

  const jsonString = React.useMemo(() => {
    return isMinified
      ? JSON.stringify(jsonPayload)
      : JSON.stringify(jsonPayload, null, 2);
  }, [jsonPayload, isMinified]);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(jsonString);
    toast.success("JSON copied to clipboard");
  };

  // Subscribe to log updates
  React.useEffect(() => {
    setLogs(getLogs());
    const unsubscribe = subscribeLogs((newLogs) => {
      setLogs(newLogs);
    });
    return unsubscribe;
  }, []);

  // Auto-scroll to bottom when new logs arrive
  React.useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Scroll to bottom when panel opens
  React.useEffect(() => {
    if (isOpen && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [isOpen]);

  // Handle resize drag
  React.useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY;
      setHeight(Math.max(150, Math.min(600, newHeight)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleClear = () => {
    clearLogs();
    toast.success("Logs cleared");
  };

  const handleCopy = () => {
    const text = displayedLogs.map(formatLogEntry).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Logs copied to clipboard");
  };

  // Network tab shows request/response, Logs tab shows general logs
  const displayedLogs =
    activeTab === "network"
      ? logs.filter((log) => log.type === "request" || log.type === "response")
      : logs.filter((log) => log.type === "log");

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600";
      case "warn":
        return "text-amber-600";
      case "info":
        return "text-blue-600";
      case "debug":
        return "text-gray-500";
      default:
        return "text-gray-600";
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return "";
    if (status >= 500) return "text-red-600";
    if (status >= 400) return "text-amber-600";
    return "text-green-600";
  };

  const networkCount = logs.filter((l) => l.type === "request" || l.type === "response").length;
  const logsCount = logs.filter((l) => l.type === "log").length;

  return (
    <>
      {/* Slim toggle bar - always visible */}
      <div
        className="flex items-center justify-center py-1 bg-gray-100 border-t border-gray-alpha-200 cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <ChevronUp className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
          <span>Developer Tools</span>
          {(networkCount > 0 || logsCount > 0) && (
            <span className="text-gray-500">
              ({networkCount} requests, {logsCount} logs)
            </span>
          )}
        </div>
      </div>

      {/* Expandable drawer content */}
      <div
        className={cn(
          "bg-background border-t border-gray-alpha-200 flex flex-col overflow-hidden",
          isOpen ? "" : "h-0"
        )}
        style={{ height: isOpen ? height : 0 }}
      >
        {isOpen && (
          <>
            {/* Resize handle */}
            <div
              className="h-1 bg-gray-100 hover:bg-blue-400 cursor-ns-resize shrink-0 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
              }}
            />

            {/* Drawer Header with Tabs */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-alpha-200 shrink-0">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-3 text-xs rounded-none border-b-2",
                    activeTab === "network"
                      ? "border-blue-500 text-foreground bg-transparent"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                  onClick={() => setActiveTab("network")}
                >
                  Network
                  {networkCount > 0 && (
                    <span className="ml-1.5 text-[10px] text-gray-400">({networkCount})</span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-3 text-xs rounded-none border-b-2",
                    activeTab === "logs"
                      ? "border-blue-500 text-foreground bg-transparent"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                  onClick={() => setActiveTab("logs")}
                >
                  Logs
                  {logsCount > 0 && (
                    <span className="ml-1.5 text-[10px] text-gray-400">({logsCount})</span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-3 text-xs rounded-none border-b-2",
                    activeTab === "payload"
                      ? "border-blue-500 text-foreground bg-transparent"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                  onClick={() => setActiveTab("payload")}
                >
                  Payload
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {activeTab !== "payload" && (
                  <>
                    <label className="flex items-center gap-1.5 text-xs text-gray-500">
                      <input
                        type="checkbox"
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                        className="rounded h-3 w-3"
                      />
                      Auto-scroll
                    </label>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500" onClick={handleCopy}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500" onClick={handleClear}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </>
                )}
                {activeTab === "payload" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-gray-500"
                      onClick={() => setIsMinified(!isMinified)}
                    >
                      {isMinified ? "Formatted" : "Minified"}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500" onClick={handleCopyPayload}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Drawer Content */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-auto font-mono text-sm p-3"
            >
              {activeTab === "payload" ? (
                <pre className="text-xs whitespace-pre-wrap break-all text-gray-700">{jsonString}</pre>
              ) : displayedLogs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  {activeTab === "network"
                    ? "No API activity yet. Make a request to see network traffic here."
                    : "No logs yet. SDK activity will appear here."}
                </div>
              ) : (
                <div className="space-y-2">
                  {displayedLogs.map((log) => (
                    <div
                      key={log.id}
                      className="py-2 px-3 rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Request/Response indicator */}
                        {log.type === "request" && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                            <ChevronUp className="h-3 w-3" />
                            REQ
                          </span>
                        )}
                        {log.type === "response" && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                            <ChevronDown className="h-3 w-3" />
                            RES
                          </span>
                        )}
                        {/* Timestamp */}
                        <span className="text-gray-500 text-xs">
                          {log.timestamp.toLocaleTimeString("en-US", {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                        {/* Status code for responses */}
                        {log.status && (
                          <span className={cn("font-semibold text-sm", getStatusColor(log.status))}>
                            {log.status}
                          </span>
                        )}
                        {/* HTTP method */}
                        {log.method && (
                          <span className="text-purple-600 font-semibold text-sm">{log.method}</span>
                        )}
                        {/* Endpoint */}
                        {log.endpoint && (
                          <span className="text-gray-700 text-sm">{log.endpoint}</span>
                        )}
                        {/* Duration for responses */}
                        {log.duration && (
                          <span className="text-gray-500 text-xs">{log.duration}ms</span>
                        )}
                        {/* Log message for non-network logs */}
                        {!log.method && log.type === "log" && (
                          <span className={cn("text-sm", getLogLevelColor(log.level))}>{log.message}</span>
                        )}
                      </div>
                      {/* Payload/response data */}
                      {log.data !== undefined && (
                        <pre className="mt-2 ml-14 text-gray-600 whitespace-pre-wrap break-all text-xs bg-gray-50 border border-gray-200 p-3 rounded">
                          {typeof log.data === "string"
                            ? log.data
                            : JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
