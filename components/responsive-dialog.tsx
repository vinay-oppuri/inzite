"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { cn } from "@/lib/utils";

interface ResponsiveDialogProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    DrawerClassname?: string;
    DialogClassName?: string;
}

const ResponsiveDialog = ({
    title,
    description,
    children,
    open,
    onOpenChange,
    DrawerClassname,
    DialogClassName,

}: ResponsiveDialogProps) => {
    const isMobile = useIsMobile()

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className={cn("rounded-t-2xl border-t bg-background shadow-lg", DrawerClassname)}>
                    <DrawerHeader className="pb-2 pt-4 px-4 border-b">
                        <DrawerTitle className="text-base font-semibold">{title}</DrawerTitle>
                        <DrawerDescription className="text-sm text-muted-foreground">
                            {description}
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 py-4 overflow-y-auto max-h-[60vh]">
                        {children}
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn("max-w-md sm:max-w-lg md:max-w-xl rounded-2xl shadow-xl", DialogClassName)}>
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mb-4">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    )
}
export default ResponsiveDialog