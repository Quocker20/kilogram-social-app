import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { users as usersApi } from '../features/user/api/users';
import { posts as postsApi } from '../features/post/api/posts';
import ProfileHeader from '../components/profile/ProfileHeader';
import PostGrid from '../components/profile/PostGrid';

export default function Profile() {
  const { username } = useParams<{ username: string }>();

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => usersApi.getProfile(username!),
    enabled: !!username,
  });

  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ['user-posts', username],
    queryFn: () => postsApi.getUserPosts(username!, 0, 50),
    enabled: !!username,
  });

  if (isProfileLoading) {
    return <div className="py-10 text-center text-gray-500">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="py-10 text-center text-gray-500">User not found.</div>;
  }

  return (
    <main className="max-w-4xl mx-auto py-8">
      <ProfileHeader profile={profile} />
      <PostGrid posts={postsData?.content || []} isLoading={isPostsLoading} />
    </main>
  );
}