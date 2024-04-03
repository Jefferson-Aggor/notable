import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
// import { useCheckUser } from "../hooks/check-user"
import { Id, Doc } from "./_generated/dataModel"
import { GenericQueryCtx } from "convex/server";

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

export const fetchArchived = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error('Unauthorized')
        const userId = identity.subject;

        const archivedDocs = ctx.db.query('documents')
            .withIndex('by_user', (q) => (q.eq('userId', userId)))
            .filter((q) => (q.eq(q.field("isArchived"), true)))
            .order('desc')
            .collect()

        return archivedDocs
    }
})

export const restore = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error('Unauthorized')
        const userId = identity.subject;

        const existingDoc = await ctx.db.get(args.id)

        if (!existingDoc) throw new Error('Not found')
        if (existingDoc.userId !== userId) throw new Error("Unauthorized")

        const recursiveRestore = async (documentId: Id<"documents">) => {
            const children = await ctx.db
                .query("documents")
                .withIndex("by_user_parent", (q) => (
                    q
                        .eq("userId", userId)
                        .eq("parentDocument", documentId)
                ))
                .collect();

            for (const child of children) {
                await ctx.db.patch(child._id, {
                    isArchived: false,
                });

                await recursiveRestore(child._id);
            }
        }

        const options: Partial<Doc<"documents">> = {
            isArchived: false,
        };

        if (existingDoc.parentDocument) {
            const parent = await ctx.db.get(existingDoc.parentDocument)

            if (parent?.isArchived) options.parentDocument = undefined;
        }

        const document = await ctx.db.patch(args.id, options);

        recursiveRestore(args.id);

        return document
    }
})

export const remove = mutation({
    args: { id: v.id('documents') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error('Unauthorized')
        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if (!existingDocument) throw new Error("Not found");

        if (existingDocument.userId !== userId) throw new Error("Unauthorized");

        const document = await ctx.db.delete(args.id)
        return document
    }
})


export const getSearch = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error('Unauthorized')
        const userId = identity.subject;

        const documents = ctx.db
            .query('documents')
            .withIndex('by_user', (q) => (q.eq("userId", userId)))
            .filter((q) => (q.eq(q.field('isArchived'), false)))
            .order('desc')
            .collect()

        return documents
    }
})

export const getById = query({
    args: { documentId: v.id('documents') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error('Unauthorized')
        const userId = identity.subject;

        const document = await ctx.db.get(args.documentId)

        if (!document) throw new Error("Not found")
        if (document.userId !== userId) throw new Error('Unauthorized...')
        if (document.isPublished && !document.isArchived) return document

        return document
    }
})

export const update = mutation({
    args: {
        id: v.id('documents'),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        icon: v.optional(v.string()),
        isPublished: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error('Unauthorized')
        const userId = identity.subject;

        const { id, ...rest } = args

        const existingDoc = await ctx.db.get(args.id)

        if (!existingDoc) throw new Error("Not found")
        if (existingDoc.userId !== userId) throw new Error('Unauthorized...')

        const document = ctx.db.patch(args.id, { ...rest })
        return document
    }
})

export const removeIcon = mutation({
    args: { id: v.id('documents') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error('Unauthorized')
        const userId = identity.subject;

        const existingDoc = await ctx.db.get(args.id)
        if (!existingDoc) throw new Error("Not found")
        if (existingDoc.userId !== userId) throw new Error('Unauthorized...')

        const document = ctx.db.patch(args.id, {
            icon: undefined
        })

        return document
    }
})

export const removeCoverImage = mutation({
    args: { id: v.id('documents') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error('Unauthorized')
        const userId = identity.subject;

        const existingDoc = await ctx.db.get(args.id)
        if (!existingDoc) throw new Error("Not found")
        if (existingDoc.userId !== userId) throw new Error('Unauthorized...')

        const document = await ctx.db.patch(args.id, { coverImage: undefined })
        return document
    }
})