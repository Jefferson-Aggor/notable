import { mutation } from "@/convex/_generated/server";

export const useCheckUser = mutation({
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return "Not Authorized"
        const userId = identity.subject;
        return userId
    }
})