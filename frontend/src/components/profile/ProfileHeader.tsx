import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { users} from '../../features/user/api/users';
import { getConversationWithUser } from '../../features/chat/api/chat.api';
import { useChatStore } from '../../store/chatStore';
import UserListModal from '../common/UserListModal';
import type { User } from '../../types';

interface ProfileHeaderProps {
  profile: User;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);

  const isMe = currentUser?.username === profile.username;
  const navigate = useNavigate();
  const { addOrUpdateConversation, setActiveConversation } = useChatStore();

  const handleMessageClick = async () => {
    try {
      const conv = await getConversationWithUser(profile.username);
      addOrUpdateConversation(conv);
      setActiveConversation(conv);
      navigate('/messages');
    } catch (error) {
      console.error('Failed to init conversation', error);
    }
  };

  const followMutation = useMutation({
    mutationFn: () => users.toggleFollow(profile.username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', profile.username] });
    }
  });

  return (
    <>
      <header className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-12 mb-12 px-4">
        <div className="w-20 h-20 md:w-36 md:h-36 rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
          <img
            src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.username}&background=random`}
            alt={profile.username}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
            <h2 className="text-xl font-light">{profile.username}</h2>

            <div className="flex space-x-2">
              {isMe ? (
                <Link to="/accounts/edit" className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors inline-block text-center flex items-center justify-center">
                  Edit Profile
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    className={`px-6 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      profile.isFollowing
                        ? 'bg-gray-100 text-black hover:bg-gray-200'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {profile.isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button
                    onClick={handleMessageClick}
                    className="px-6 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors bg-white text-black"
                  >
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex space-x-8 text-sm md:text-base">
            <button onClick={() => setIsFollowersModalOpen(true)} className="hover:opacity-70 focus:outline-none"><span className="font-semibold">{profile.numOfFollowers || 0}</span> followers</button>
            <button onClick={() => setIsFollowingModalOpen(true)} className="hover:opacity-70 focus:outline-none"><span className="font-semibold">{profile.numOfFollowing || 0}</span> following</button>
          </div>

          <div className="text-sm">
            <p className="font-semibold">{profile.displayName}</p>
            <p className="whitespace-pre-wrap mt-1">{profile.bio}</p>
          </div>
        </div>
      </header>

      <UserListModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        title="Followers"
        queryKey={['followers', profile.username]}
        queryFn={() => users.getFollowers(profile.username)}
      />

      <UserListModal
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        title="Following"
        queryKey={['following', profile.username]}
        queryFn={() => users.getFollowing(profile.username)}
      />
    </>
  );
}