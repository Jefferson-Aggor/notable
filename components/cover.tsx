"use client"

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEdgeStore } from "@/lib/edgestore";
import { Skeleton } from "./ui/skeleton";

interface CoverImageProps {
    url?: string;
    preview?: boolean
}
export const Cover = ({ url, preview }: CoverImageProps) => {
    const params = useParams()
    const { edgestore } = useEdgeStore()
    const removeCoverImage = useMutation(api.documents.removeCoverImage)
    const coverImage = useCoverImage()

    const onRemoveCoverImage = async () => {
        if (url) {
            await edgestore.publicFiles.delete({
                url: url as Id<"documents">,
            });
        }
        removeCoverImage({ id: params.documentId as Id<"documents"> })
    }
    return (
        <div className={cn(
            "relative w-full h-[55vh] group",
            !url && "h-[12vh]",
            url && "bg-muted"
        )}>
            {!!url && (
                <Image src={url} fill alt="cover image" className="object-cover" />
            )}

            {
                url && !preview && (
                    <div className="opacity-0 group-hover:opacity-100 absolute flex items-center bottom-5 right-5 gap-x-2">
                        <Button
                            onClick={() => coverImage.onReplace(url)}
                            className="text-muted-foreground text-xs"
                            variant='outline'
                            size='sm'
                        >
                            <ImageIcon className="h-4 w-4 mr-2" /> Change Cover
                        </Button>
                        <Button
                            onClick={onRemoveCoverImage}
                            className="text-muted-foreground text-xs"
                            variant='outline'
                            size='sm'
                        >
                            <X className="h-4 w-4 mr-2" /> Remove
                        </Button>
                    </div>
                )
            }
        </div>
    )
}

Cover.Skeleton = function CoverSkeleton() {
    return (
        <Skeleton className="w-full h-[12vh]" />
    )
}