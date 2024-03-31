import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { useCheckUser } from "../hooks/check-user"


export const getSidebar = query({
    args: {
        parentDocument: v.optional(v.id("documents"))
    },
    handler: async (ctx, args) => {
        const userId = useCheckUser();
        const documents = await ctx.db
            .query("documents")
            .withIndex("by_user_parent", (q) =>
                q
                    .eq("userId", userId)
                    .eq("parentDocument", args.parentDocument)
            )
            .filter((q) =>
                q.eq(q.field("isArchived"), false)
            )
            .order("desc")
            .collect();

        return documents;
    },
});

export const createDocument = mutation({
    args: { title: v.string(), parentDocument: v.optional(v.id('documents')) },
    handler: async (ctx, args) => {
        const userId = useCheckUser()

        const document = await ctx.db.insert("documents", {
            title: args.title,
            parentDocument: args.parentDocument,
            userId,
            isArchived: false,
            isPublished: false
        })

        return document
    }
})