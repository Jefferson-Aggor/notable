"use client"

import { useScrollTop } from "@/hooks/use-scroll-top"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import { ModeToggle } from "@/components/mode-toggle"
import { useConvexAuth } from "convex/react"
import { SignInButton } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/spinner"

export const Navbar = () => {
    const { isAuthenticated, isLoading } = useConvexAuth()

    const scrolled = useScrollTop()
    return (
        <div className={cn("z-50 bg-background fixed top-0 flex items-center w-full p-6 dark:bg-[#1f1f1f]", scrolled && "border-b shadow-sm")}>
            <Logo />
            <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
                {isLoading && (
                    <Spinner />
                )}
                {!isAuthenticated && !isLoading && (
                    <>
                        <SignInButton mode="modal">
                            <Button variant='ghost' size='sm'>
                                Login
                            </Button>
                        </SignInButton>
                        <SignInButton mode="modal">
                            <Button size='sm'>
                                Get Notable. Free
                            </Button>
                        </SignInButton>
                    </>
                )}
                <ModeToggle />
            </div>
        </div>
    )
}