export type Video = {
    id: number;
    title: string;
    creator: string;
    views: number;
    description: string;
    videoUrl: string;
    category: string;
    aiTool: string;
    duration: string;
    createdAt: string;
  };
  
  export const videos: Video[] = [
    {
      id: 1,
      title: "AI 단편 드라마: 기억을 잃은 도시",
      creator: "AI Studio",
      views: 1280,
      description: "AI로 제작한 SF 단편 드라마입니다.",
      category: "AI 드라마",
      aiTool: "Runway",
      duration: "03:24",
      createdAt: "2026-07-03",
    },
    {
      id: 2,
      title: "AI 숏폼: 고양이가 회사를 세운다면",
      creator: "Prompt Lab",
      views: 842,
      description: "AI로 제작한 코미디 숏폼 영상입니다.",
      category: "AI 숏폼",
      aiTool: "Kling",
      duration: "00:58",
      createdAt: "2026-07-03",
    },
    {
      id: 3,
      title: "AI 뮤직비디오: Neon Dream",
      creator: "Neon AI",
      views: 2310,
      description: "AI 영상 생성툴로 만든 뮤직비디오입니다.",
      category: "AI 뮤직비디오",
      aiTool: "Pika",
      duration: "02:41",
      createdAt: "2026-07-03",
    },
    {
      id: 4,
      title: "AI 공포 단편: 문 뒤의 목소리",
      creator: "Dark Prompt",
      views: 975,
      description: "AI로 제작한 공포 단편 영상입니다.",
      category: "AI 공포",
      aiTool: "Veo",
      duration: "01:45",
      createdAt: "2026-07-03",
    },
  ];