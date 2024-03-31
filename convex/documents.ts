import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
// import { useCheckUser } from "../hooks/check-user"
import { Id } from "./_generated/dataModel"

// Memoization object to store processed documents
const processedDocuments: { [key: string]: boolean } = {};

export const archive = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error('Unauthorized')
        const userId = identity.subject;

        const existingDoc = await ctx.db.get(args.id);

        if (!existingDoc) throw new Error("Document not found");

        if (existingDoc.userId !== userId) throw new Error("User unauthorized");

        const recursiveArchive = async (documentId: Id<"documents">) => {
            if (processedDocuments[documentId]) return;

            const children = await ctx.db
                .query("documents")
                .withIndex('by_user_parent', (q) => (
                    q
                        .eq('userId', userId)
                        .eq('parentDocument', documentId)
                ))
                .collect();

            for (const child of children) {
                await ctx.db.patch(child._id, { isArchived: true });
                await recursiveArchive(child._id);
            }

            processedDocuments[documentId] = true;
        };

        await recursiveArchive(args.id);

        const document = await ctx.db.patch(args.id, { isArchived: true });
        return document;
    }
});

export const getSidebar = query({
    args: {
        parentDocument: v.optional(v.id("documents"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error('Unauthorized')
        const userId = identity.subject;

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
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error('Unauthorized')
        const userId = identity.subject;

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