import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

export const Drawer = Dialog.Root;
export const DrawerTrigger = Dialog.Trigger;
export const DrawerClose = Dialog.Close;

export const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className = "", ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={`fixed inset-0 z-40 bg-slate-900/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 ${className}`}
    {...props}
  />
));
DrawerOverlay.displayName = "DrawerOverlay";

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className = "", children, ...props }, ref) => (
  <Dialog.Portal>
    <DrawerOverlay />
    <Dialog.Content
      ref={ref}
      className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white p-4 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom ${className}`}
      {...props}
    >
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
      {children}
    </Dialog.Content>
  </Dialog.Portal>
));
DrawerContent.displayName = "DrawerContent";

export const DrawerHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => <div className={`mb-3 ${className}`} {...props} />;

export const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className = "", ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={`text-sm font-semibold text-slate-900 ${className}`}
    {...props}
  />
));
DrawerTitle.displayName = "DrawerTitle";

export const DrawerFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => (
  <div
    className={`mt-4 flex items-center justify-end gap-2 ${className}`}
    {...props}
  />
);
