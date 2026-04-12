import { create } from 'zustand';
import type { Post } from '../types';

interface ModalState {
  isPostModalOpen: boolean;
  postToEdit: Post | null;
  isPostDetailOpen: boolean;
  selectedPost: Post | null;
  openPostModal: (post?: Post) => void;
  closePostModal: () => void;
  openPostDetail: (post: Post) => void;
  closePostDetail: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isPostModalOpen: false,
  postToEdit: null,
  isPostDetailOpen: false,
  selectedPost: null,
  openPostModal: (post) => set({ isPostModalOpen: true, postToEdit: post || null }),
  closePostModal: () => set({ isPostModalOpen: false, postToEdit: null }),
  openPostDetail: (post) => set({ isPostDetailOpen: true, selectedPost: post }),
  closePostDetail: () => set({ isPostDetailOpen: false, selectedPost: null }),
}));