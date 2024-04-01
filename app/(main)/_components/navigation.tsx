"use client"

import { cn } from "@/lib/utils";
import { ChevronLeft, MenuIcon, PlusCircle, Search, Settings, Trash } from "lucide-react";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";
import { ElementRef, useRef, useState, useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";

import { UserItem } from "./userItem";
import { Item } from "./item";
import { DocumentList } from "./documentList";

import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TrashBox } from "./trash-box";

export const Navigation = () => {
    const pathname = usePathname()
    const isMobile = useMediaQuery("(max-width: 768px)")
    const isResizingRef = useRef(false)
    const sidebarRef = useRef<ElementRef<'aside'>>(null)
    const navbarRef = useRef<ElementRef<'div'>>(null)
    const [isResetting, setIsResetting] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(isMobile)

    // Create Document
    const createDocument = useMutation(api.documents.createDocument)
    const onCreateDocument = () => {
        const promise = createDocument({ title: "Untitled" })
        toast.promise(promise, {
            loading: "Creating new document",
            success: "New document created...",
            error: "Failed to create document"
        })
    }

    useEffect(() => {
        if (isMobile) collapse()
        else resetWidth()
    }, [isMobile])

    useEffect(() => {
        if (isMobile) collapse()
    }, [pathname, isMobile])

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()
        isResizingRef.current = true
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizingRef.current) return
        let newWidth = e.clientX
        if (newWidth < 240) newWidth = 240
        if (newWidth > 480) newWidth = 480

        if (sidebarRef.current && navbarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`
            navbarRef.current.style.setProperty('left', `${newWidth}px`)
            navbarRef.current.style.setProperty('width', `calc:100%-${newWidth}px`)
        }
    }

    const handleMouseUp = () => {
        isResizingRef.current = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    }

    const resetWidth = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(false)
            setIsResetting(true)

            sidebarRef.current.style.width = isMobile ? "100%" : "240px"
            navbarRef.current.style.setProperty(
                "width", isMobile ? '0' : "calc(100% - 240px)"
            )

            navbarRef.current.style.setProperty(
                "left", isMobile ? '100%' : "240px"
            )

            setTimeout(() => setIsResetting(false), 300)
        }
    }

    const collapse = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(true)
            setIsResetting(true)

            sidebarRef.current.style.width = "0"
            navbarRef.current.style.setProperty('width', "100%")
            navbarRef.current.style.setProperty('left', "0")

            setTimeout(() => setIsResetting(false), 300)
        }
    }
    return (
        <>
            <aside
                ref={sidebarRef}
                className={cn(
                    "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[9999]", isResetting && "transition-all ease-in-out duration-300", isMobile && "w-0"
                )}>
                <div
                    role="button"
                    className={cn(
                        "absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition rounded-sm text-muted-foreground hover:bg-neutral-300 dark:hover:bg-neutral-600", isMobile && "opacity-100"
                    )}
                    onClick={collapse}
                >
                    <ChevronLeft className="h-6 w-6" />
                </div>
                <div>
                    <UserItem />
                    <Item
                        label="Search"
                        icon={Search}
                        onClick={() => { }}
                        isSearch
                    />
                    <Item
                        label="Settings"
                        icon={Settings}
                        onClick={() => { }}
                    />
                    <Item
                        label="New Page"
                        onClick={onCreateDocument}
                        icon={PlusCircle}
                    />
                </div>
                <div className="mt-4">
                    <DocumentList />
                    <Item
                        label="Add a page"
                        onClick={onCreateDocument}
                        icon={PlusCircle}
                    />
                </div>
                <Popover>
                    <PopoverTrigger className="w-full mt-4">
                        <Item label="Trash" icon={Trash} />
                        <PopoverContent
                            side={isMobile ? "bottom" : "right"}
                            className="p-0 w-72"
                        >
                            <TrashBox />
                        </PopoverContent>
                    </PopoverTrigger>
                </Popover>
                <div
                    onMouseDown={handleMouseDown}
                    onClick={resetWidth}
                    className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0" />
            </aside>
            <div ref={navbarRef}
                className={cn(
                    "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]", isResetting && "transition-all ease-in-out duration-300",
                    isMobile && "left-0 w-full"
                )}
            >
                <nav className="bg-transparent py-2 px-3 w-full">
                    {isCollapsed &&
                        (<MenuIcon
                            onClick={resetWidth} role="button" className="h-6 w-6 text-muted-foreground" />
                        )}
                </nav>
            </div>
        </>

    );
}
