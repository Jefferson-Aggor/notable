"use client"

import { useScrollTop } from "@/hooks/use-scroll-top"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import { ModeToggle } from "@/components/mode-toggle"
import { SignedOut, SignedIn, UserButton, useUser, SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/spinner"
import { LogInIcon, UserRoundPlusIcon } from "lucide-react"

export const Navbar = () => {
    const scrolled = useScrollTop()
    const { isLoaded, isSignedIn } = useUser()
    return (
        <div className={cn("z-50 bg-background fixed top-0 flex items-center w-full p-6 dark:bg-[#1f1f1f]", scrolled && "border-b shadow-sm")}>
            <Logo />
            <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
                <div>
                    {!isLoaded && !isSignedIn && (
                        <Spinner />
                    )}

                    <SignedOut>
                        <SignUpButton mode="modal">
                            <Button variant='ghost' size='sm'>
                                <UserRoundPlusIcon className="h-4 w-4 mr-2" />
                                Sign Up
                            </Button>
                        </SignUpButton>
                        <SignInButton mode="modal">
                            <Button size='sm'>
                                <LogInIcon className="h-4 w-4 mr-2" />
                                Login
                            </Button>
                        </SignInButton>

                    </SignedOut>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
                <ModeToggle />
            </div>
        </div>
    )
}