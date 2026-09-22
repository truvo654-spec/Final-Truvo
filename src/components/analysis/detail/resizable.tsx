import * as React from 'react';
import * as ResizablePrimitive from 'react-resizable-panels';

export function ResizablePanelGroup({
  className = '',
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={`flex h-full w-full aria-[orientation=vertical]:flex-col ${className}`}
      {...props}
    />
  );
}

export function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

export function ResizableHandle({
  className = '',
  ...props
}: ResizablePrimitive.SeparatorProps) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={`relative flex w-px items-center justify-center bg-slate-200 ring-offset-background focus-visible:outline-none aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=vertical]:h-2 aria-[orientation=vertical]:w-full cursor-row-resize ${className}`}
      {...props}
    />
  );
}
