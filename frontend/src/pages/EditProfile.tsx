import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { users as usersApi } from '../features/user/api/users';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user: currentUser, token, setAuth, logout } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  useEffect(() => {
    // If not logged in, should ideally redirect (handled by ProtectedRoute already)
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setAvatarPreview(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  // We fetch full profile to get the existing bio as it may not be in AuthStore
  useEffect(() => {
    if (currentUser) {
      usersApi.getProfile(currentUser.username).then((fullProfile) => {
        setBio(fullProfile.bio || '');
      }).catch(err => console.error("Could not fetch full profile for bio", err));
    }
  }, [currentUser]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const updateMutation = useMutation({
    mutationFn: (data: { displayName: string; bio: string; avatar?: File }) =>
      usersApi.updateProfile({ displayName: data.displayName, bio: data.bio }, data.avatar),
    onSuccess: (updatedUser: User) => {
      if (token) {
        // We ensure we keep the required AuthStore user properties
        setAuth({
          id: updatedUser.id,
          username: updatedUser.username,
          displayName: updatedUser.displayName || '',
          avatarUrl: updatedUser.avatarUrl || null,
        }, token);
      }
      navigate(`/${currentUser?.username}`);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => usersApi.deactivateAccount(),
    onSuccess: () => {
      logout();
      navigate('/login', { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      displayName,
      bio,
      ...(avatarFile && { avatar: avatarFile }),
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-light text-gray-900">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
        <div className="flex items-center space-x-6 rounded-2xl bg-gray-50 p-6">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-gray-200">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200 text-lg font-bold text-gray-400">
                {currentUser?.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{currentUser?.username}</h3>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 text-sm font-medium text-blue-500 hover:text-blue-600"
            >
              Change profile photo
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div>
            <label htmlFor="displayName" className="mb-2 block text-sm font-semibold text-gray-900">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
              placeholder="Display Name"
            />
          </div>

          <div>
            <label htmlFor="bio" className="mb-2 block text-sm font-semibold text-gray-900">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full resize-none rounded-xl border border-gray-300 p-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
              placeholder="Write something about yourself..."
              maxLength={150}
            />
            <p className="mt-1 text-right text-xs text-gray-500">
              {bio.length} / 150
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 pb-12">
          <button
            type="button"
            onClick={() => setIsDeactivateDialogOpen(true)}
            className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Vô hiệu hoá tài khoản
          </button>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        {updateMutation.isError && (
          <p className="text-sm text-red-500 mt-2 text-right">Failed to update profile. Please try again.</p>
        )}
      </form>

      {/* Confirmation Dialog Modal */}
      {isDeactivateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              Bạn có chắc chắn muốn vô hiệu hoá tài khoản?
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              Hành động này sẽ tạm ẩn trang cá nhân và các tương tác của bạn khỏi hệ thống.
            </p>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => setIsDeactivateDialogOpen(false)}
                className="w-full rounded-xl bg-blue-500 py-3 text-sm font-bold text-white hover:bg-blue-600 transition-colors shadow-sm"
              >
                Hủy (Giữ lại tài khoản)
              </button>
              <button
                onClick={() => deactivateMutation.mutate()}
                disabled={deactivateMutation.isPending}
                className="w-full rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {deactivateMutation.isPending ? 'Đang xử lý...' : 'Vô hiệu hoá'}
              </button>
            </div>
            {deactivateMutation.isError && (
              <p className="mt-4 text-center text-sm font-semibold text-red-500">
                Đã xảy ra lỗi khi vô hiệu hoá.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
