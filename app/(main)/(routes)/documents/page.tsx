"use client"
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { PlusCircle } from "lucide-react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Documents = () => {
    const { user } = useUser()
    const router = useRouter()
    const createDocument = useMutation(api.documents.createDocument)
    const onCreateDocument = () => {
        const promise = createDocument({ title: "Untitled" })
            .then((documentId) => {
                router.push(`/documents/${documentId}`)
            })
        toast.promise(promise, {
            loading: "Creating Document",
            success: "Document Created",
            error: "Failed to create note"
        })
    }
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-4">
            <Image
                width="300"
                height="300"
                src='/empty.png'
                alt="Empty"
                className="dark:hidden"
            />
            <Image
                width="300"
                height="300"
                src='/empty-dark.png'
                alt="Empty"
                className="hidden dark:block"
            />

            <h2 className="text-lg font-medium">
                Welcome to {user?.firstName && `${user?.firstName}'s`} Notable.
            </h2>
            <Button onClick={onCreateDocument}>
                <PlusCircle className="h-4 w-4 mr-2" /> Create a note
            </Button>
        </div>
    );
}

export default Documents;