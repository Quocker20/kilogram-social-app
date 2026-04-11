import React, { useState, useRef, useEffect } from 'react';
import { X, ImagePlus, Loader2 } from 'lucide-react';
import { useModalStore } from '../../../store/modalStore';
import { posts } from '../api/posts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function CreatePostModal() {
  const isCreatePostOpen = useModalStore((state) => state.isCreatePostOpen);
  const closeCreatePost = useModalStore((state) => state.closeCreatePost);
  const queryClient = useQueryClient();

  const [content, setContent] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const mutation = useMutation({
    mutationFn: () => posts.createPost(content, selectedFiles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      handleClose();
    },
    onError: (error) => {
      console.error('Failed to create post:', error);
      alert('An error occurred while creating the post. Please try again.');
    }
  });

  if (!isCreatePostOpen) return null;

  const handleClose = () => {
    setContent('');
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    closeCreatePost();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const validImageFiles = filesArray.filter(file => file.type.startsWith('image/'));

      setSelectedFiles((prev) => [...prev, ...validImageFiles]);

      const newPreviewUrls = validImageFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedFiles(files => files.filter((_, idx) => idx !== indexToRemove));
    setPreviewUrls(urls => {
      URL.revokeObjectURL(urls[indexToRemove]);
      return urls.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      alert('You must select at least one image.');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="w-8"></div>
          <h2 className="text-lg font-semibold text-gray-800">Create new post</h2>
          <button
            onClick={handleClose}
            disabled={mutation.isPending}
            className="rounded-full p-1 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="flex flex-col p-4 md:flex-row h-[400px]">

          <div className="flex h-full w-full flex-col items-center justify-center border-b border-gray-200 md:w-1/2 md:border-b-0 md:border-r p-2">
            {previewUrls.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center">
                <ImagePlus size={64} className="mb-4 text-gray-300" strokeWidth={1} />
                <p className="mb-4 text-lg text-gray-600">Drag photos here</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
                >
                  Select from computer
                </button>
              </div>
            ) : (
              <div className="relative h-full w-full overflow-y-auto p-2">
                <div className="grid grid-cols-2 gap-2">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="group relative aspect-square overflow-hidden rounded-md bg-gray-100">
                      <img src={url} alt={`preview-${idx}`} className="h-full w-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ImagePlus size={16} /> Add more photos
                </button>
              </div>
            )}

            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <div className="flex w-full flex-col md:w-1/2 p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a caption..."
              className="h-full w-full resize-none outline-none placeholder:text-gray-400"
              maxLength={2200}
            />

            <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
              <span className="text-xs text-gray-400">{content.length}/2200</span>
              <button
                onClick={handleSubmit}
                disabled={selectedFiles.length === 0 || mutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-blue-300"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Sharing...
                  </>
                ) : (
                  'Share'
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}