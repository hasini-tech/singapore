export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: "Events" | "Workshops" | "Networking";
  title: string;
  description: string;
  date?: string;
  location?: string;
  videoUrl?: string;
}

export const galleryImages: GalleryImage[] = [
  {
    id: 6,
    src: "/gallery/images/JH2_2893.jpg",
    alt: "Founders networking at GrowthLab Rooftop Christmas Mixer in Singapore",
    category: "Networking",
    title: "ROOFTOP CHRISTMAS MIXER",
    description: "Connecting founders at Singapore's highest private rooftop",
    date: "2025-11-07",
    location: "Singapore",
  },
  {
    id: 15,
    src: "/gallery/images/JH2_2922.jpg",
    alt: "Entrepreneurs mingling at rooftop networking event Singapore",
    category: "Networking",
    title: "ROOFTOP CHRISTMAS MIXER",
    description: "Connecting founders at Singapore's highest private rooftop",
    date: "2025-11-07",
    location: "Singapore",
  },
  {
    id: 1,
    src: "/gallery/images/JH2_2873.jpg",
    alt: "Startup founders connecting at Christmas networking mixer",
    category: "Networking",
    title: "ROOFTOP CHRISTMAS MIXER",
    description: "Connecting founders at Singapore's highest private rooftop",
    date: "2025-11-07",
    location: "Singapore",
  },
  {
    id: 2,
    src: "/gallery/images/JH2_2875.jpg",
    alt: "Business professionals at exclusive rooftop event Singapore",
    category: "Networking",
    title: "ROOFTOP CHRISTMAS MIXER",
    description: "Connecting founders at Singapore's highest private rooftop",
    date: "2025-11-07",
    location: "Singapore",
  },
  {
    id: 19,
    src: "/gallery/images/2_2.jpg",
    alt: "Speaker presenting health strategies for entrepreneurs at GrowthLab conference",
    category: "Events",
    title: "Annual Conference",
    description: "Keynote speakers and presentations",
    date: "2025-08-20",
    location: "Singapore",
  },
  {
    id: 25,
    src: "/gallery/images/3_2.jpg",
    alt: "Workshop participants learning about AI tools for inclusive workplaces",
    category: "Workshops",
    title: "Tea & Jam: AI for All",
    description: "Building Inclusive Workplaces in the Age of Intelligence",
    date: "2025-11-14",
    location: "Singapore",
  },
  {
    id: 29,
    src: "/gallery/images/4_1.jpg",
    alt: "Founders networking at Tech and Tonic Friday social event",
    category: "Events",
    title: "Tech & Tonic Friday",
    description: "Learning new technologies",
    date: "2025-08-01",
    location: "Singapore",
  },
];

export function getUniqueEvents(category?: string): GalleryImage[] {
  const images = category && category !== "All"
    ? galleryImages.filter((img) => img.category === category)
    : galleryImages;

  const seenTitles = new Set<string>();
  return images.filter((img) => {
    if (seenTitles.has(img.title)) return false;
    seenTitles.add(img.title);
    return true;
  });
}

export function getImagesByEventTitle(title: string): GalleryImage[] {
  return galleryImages.filter((img) => img.title === title);
}

export function getEventImageCount(title: string): number {
  return galleryImages.filter((img) => img.title === title).length;
}
