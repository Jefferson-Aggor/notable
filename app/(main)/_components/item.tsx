"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { ChevronDown, ChevronRight, Plus, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation"
import { toast } from "sonner";

interface ItemProps {
    id?: Id<"documents">;
    documentIcon?: string;
    active?: boolean;
    expanded?: boolean;
    isSearch?: boolean;
    level?: number;
    onExpand?: () => void;
    label: string;
    onClick: () => void;
    icon: LucideIcon;
}

export const Item = ({
    label,
    onClick,
    icon: Icon,
    active,
    id,
    level = 0,
    onExpand,
    documentIcon,
    isSearch,
    expanded
}: ItemProps) => {

    const ChevronIcon = expanded ? ChevronDown : ChevronRight;

    const handleExpand = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        e.stopPropagation()
        onExpand?.()
    }

    const create = useMutation(api.documents.createDocument)
    const router = useRouter()

    const onCreate = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation()
        if (!id) return;

        const promise = create({ parentDocument: id, title: "Untitled" })
            .then((documentId) => {
                if (!expanded) onExpand?.()
                // router.push(`/documents/${documentId}`)
            })
        toast.promise(promise, {
            loading: "Creating document...",
            success: "Created document...",
            error: "Failed to create document"
        })
    }
    return (
        <div
            onClick={onClick}
            role="button"
            style={{
                paddingLeft: level ? `${(level * 12) + 12}px` : "12px"
            }}
            className={cn(
                "group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium",
                active && "bg-primary/5 text-primary"
            )}
        >
            {!!id && (
                <div
                    role="button"
                    className="h-full rounded-sm hover:bg-neutral-300 dark:bg-neutral-600 mr-1"
                    onClick={handleExpand}
                >
                    <ChevronIcon
                        className="h-4 w-4 shrink-0 text-muted-foreground/50"
                    />
                </div>
            )}
            {documentIcon ? (
                <div className="shrin-0 mr-2 text-[18px]">
                    {documentIcon}
                </div>
            ) : (
                <Icon className="shrink-0 h-[18px] mr-2 text-muted-foreground" />
            )}
            <span className="trancate">{label}</span>
            {
                isSearch && (
                    <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                )
            }
            {!!id && (
                <div className="flex ml-auto items-center gap-x-2">
                    <div
                        role="button"
                        className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
                        onClick={onCreate}
                    >
                        <Plus />
                    </div>
                </div>
            )}
        </div>
    );
}

Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
    return (
        <div
            style={{
                paddingLeft: level ? `${(level * 12) + 25}px` : '12px'
            }}
            className="flex gap-x-2 py-[3px]">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[30%]" />
        </div>
    )
}