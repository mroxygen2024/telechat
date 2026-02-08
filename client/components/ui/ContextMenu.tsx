import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";

export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
export const ContextMenuPortal = ContextMenuPrimitive.Portal;
export const ContextMenuSub = ContextMenuPrimitive.Sub;
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

export const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className = "", ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={`z-50 min-w-[10rem] rounded-md border border-slate-200 bg-white p-1 text-slate-800 shadow-lg animate-in fade-in-0 zoom-in-95 ${className}`}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = "ContextMenuContent";

export const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>
>(({ className = "", ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={`flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    {...props}
  />
));
ContextMenuItem.displayName = "ContextMenuItem";

export const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className = "", ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={`my-1 h-px bg-slate-200 ${className}`}
    {...props}
  />
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";

export const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger>
>(({ className = "", children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={`flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-slate-100 ${className}`}
    {...props}
  >
    {children}
    <span className="ml-auto text-xs">▶</span>
  </ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

export const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className = "", ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={`z-50 min-w-[10rem] rounded-md border border-slate-200 bg-white p-1 text-slate-800 shadow-lg animate-in fade-in-0 zoom-in-95 ${className}`}
    {...props}
  />
));
ContextMenuSubContent.displayName = "ContextMenuSubContent";
