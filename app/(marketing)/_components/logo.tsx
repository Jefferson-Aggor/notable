import Image from "next/image";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({
    subsets: ['latin'],
    weight: ['400', '600']
});

export const Logo = () => {
    return (
        <div className=" hidden md:flex items-center gap-x-1">
            <Image
                src='/dark-logo.png'
                height={40}
                width={40}
                alt="logo"
                className="dark:hidden"
            />
            <Image
                src='/white-logo.png'
                height={40}
                width={40}
                alt="logo"
                className="hidden dark:block"
            />
            <p className={cn('font-semibold', font.className)}>
                Notable.
            </p>
        </div>
    );
}

