"use client"

import { ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";
import { Spinner } from "@/components/spinner";
import { redirect } from "next/navigation";
import { Navigation } from "./_components/navigation";
import { SearchCommand } from "@/components/search-command";

const DocumentsLayout = ({
    children
}: { children: ReactNode }) => {
    const { isLoaded, isSignedIn } = useUser()
    if (!isLoaded) {
        return (
            <div className="h-full flex items-center justify-center">
                <Spinner size='lg' />
            </div>
        )
    }
    if (!isSignedIn) return redirect('/')

    return (
        <div className="h-full flex dark:bg-[#1f1f1f]">
            <Navigation />
            <main className="flex-1 h-full overflow-y-auto">
                <SearchCommand />
                {children}
            </main>
        </div>
    );
}

export default DocumentsLayout;