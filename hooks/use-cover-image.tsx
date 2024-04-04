import { create } from "zustand"

interface CoverImageStore {
    url?: string,
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onReplace: (url: string) => void;
}

export const useCoverImage = create<CoverImageStore>(set => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true, url: undefined }),
    onClose: () => set({ isOpen: false, url: undefined }),
    onReplace: (url) => set({ isOpen: true, url })
}))