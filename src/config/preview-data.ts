import { PreviewConfig } from '@/types/preview';

export const previewData: PreviewConfig = {
  Leaderboard: {
    props: {
      entries: [
        { rank: 1, name: "Joyadeep reddy", points: 1000 },
        { rank: 2, name: "Jane Smith", points: 850 },
        { rank: 3, name: "Bob Johnson", points: 750 }
      ]
    },
    description: "A leaderboard component that displays user rankings"
  },
  UserProfile: {
    props: {
      user: {
        name: "John Doe",
        avatar: "https://example.com/avatar.jpg",
        bio: "Frontend Developer"
      }
    }
  },
  InstaStory: {
    props: {
      stories: [
        {
          id: 1,
          username: "sarah_travels",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
          storyUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e"
        },
        {
          id: 2,
          username: "mike_adventures",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
          storyUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d"
        },
        {
          id: 3,
          username: "nature_lover",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=nature",
          storyUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e"
        }
      ],
      config: {
        autoplay: true,
        duration: 3000
      }
    },
    description: "An Instagram-like story viewer component with autoplay functionality"
  }
  // Add more components as needed
}; 