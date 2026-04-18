export type PostType = 'text' | 'image' | 'video' | 'job' | 'event';

export interface FeedPost {
  id: number;
  author: {
    name: string;
    role: string;
    avatar: string;
    initials: string;
  };
  content: string;
  timestamp: string;
  type: PostType;
  image?: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  tags?: string[];
}

export const feedPosts: FeedPost[] = [
  {
    id: 1,
    author: {
      name: "Alex Thompson",
      role: "Founder, EcoTrack",
      avatar: "",
      initials: "AT"
    },
    content: "Just closed our seed round! Grateful for the GrowthLab community for the introductions. 🚀 #startup #funding #milestone",
    timestamp: "2h ago",
    type: "text",
    likes: 124,
    comments: 18,
    tags: ["startup", "funding"]
  },
  {
    id: 2,
    author: {
      name: "Sarah Chen",
      role: "Product Designer",
      avatar: "",
      initials: "SC"
    },
    content: "Working on the new mobile app UI for a fintech startup. What do you think about this gradient? 🎨",
    timestamp: "5h ago",
    type: "image",
    image: "/gallery/images/2_2.jpg",
    likes: 89,
    comments: 12,
    tags: ["design", "uiux"]
  },
  {
    id: 3,
    author: {
      name: "Marcus Miller",
      role: "Venture Partner",
      avatar: "",
      initials: "MM"
    },
    content: "We're looking for early-stage logistics startups based in Southeast Asia. DM me if you're building in this space!",
    timestamp: "1d ago",
    type: "text",
    likes: 45,
    comments: 32,
    tags: ["investment", "logistics"]
  },
  {
    id: 4,
    author: {
      name: "Elena Rodriguez",
      role: "Growth Marketer",
      avatar: "",
      initials: "ER"
    },
    content: "New workshop alert: 'Scaling from 0 to 10k users'. Join us next Thursday at 3 PM SGT. 📈",
    timestamp: "1d ago",
    type: "event",
    likes: 210,
    comments: 45,
    tags: ["growth", "workshop"]
  }
];
