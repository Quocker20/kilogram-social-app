import { create } from 'zustand';
import type { Post } from '../types';

interface ModalState {
  isPostModalOpen: boolean;
  postToEdit: Post | null;
  openPostModal: (post?: Post) => void;
  closePostModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isPostModalOpen: false,
  postToEdit: null,
  openPostModal: (post) => set({ isPostModalOpen: true, postToEdit: post || null }),
  closePostModal: () => set({ isPostModalOpen: false, postToEdit: null }),
}));