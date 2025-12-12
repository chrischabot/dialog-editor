"use client";

import * as React from "react";

interface DialogueEditorLayoutProps {
  header: React.ReactNode;
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  devtools: React.ReactNode;
  bottom: React.ReactNode;
  dialogs?: React.ReactNode;
}

/**
 * Slot-based layout wrapper for the dialogue editor
 * Locks the layout structure - all logic lives in the slot components
 */
export function DialogueEditorLayout({
  header,
  left,
  center,
  right,
  devtools,
  bottom,
  dialogs,
}: DialogueEditorLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header Bar */}
      {header}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Speakers Panel */}
        {left}

        {/* Center Column - Script Editor */}
        {center}

        {/* Right Column - Tools Panel */}
        {right}
      </div>

      {/* DevTools Drawer - positioned above bottom bar */}
      {devtools}

      {/* Bottom Preview Pane */}
      {bottom}

      {/* Dialogs (rendered in portals) */}
      {dialogs}
    </div>
  );
}
