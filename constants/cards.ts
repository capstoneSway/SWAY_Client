// KST 기준으로 createdAt + 24시간 계산
function calculateExpiresAtFromKST(createdAt: string): string {
  const created = new Date(createdAt);
  return new Date(created.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

// KST 시각 하드코딩 헬퍼 (ex: 2025년 5월 23일 19시)
function getKSTISOString(
  year: number,
  month: number,
  day: number,
  hour: number
): string {
  const utc = new Date(Date.UTC(year, month - 1, day, hour - 9));
  return utc.toISOString();
}

export const CARDS = [
  {
    id: 1,
    title: "Seongsu Walk",
    tag: "WorkOut",
    status: "register",
    participants: "4/5",
    meetupTime: getKSTISOString(2025, 5, 27, 17),
    createdAt: getKSTISOString(2025, 5, 23, 20), // ✅ 어제 19시 생성
    expiresAt: calculateExpiresAtFromKST(getKSTISOString(2025, 5, 23, 20)), // → 오늘 19시 만료
    content: "Walk and talk in Seongsu! Let's get active and make new friends.",
    image:
      "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&fit=crop&w=800&q=60",
    participantAvatars: [
      "https://i.pravatar.cc/100?img=11",
      "https://i.pravatar.cc/100?img=12",
      "https://i.pravatar.cc/100?img=13",
      "https://i.pravatar.cc/100?img=14",
    ],
    gender: "All",
  },
  {
    id: 2,
    title: "Incheon Tour",
    tag: "Travel",
    status: "register",
    participants: "2/5",
    meetupTime: getKSTISOString(2025, 5, 25, 10),
    createdAt: getKSTISOString(2025, 5, 24, 10),
    expiresAt: calculateExpiresAtFromKST(getKSTISOString(2025, 5, 24, 10)),
    content: "Join a fun day in Incheon! Great sights and even better company.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60",
    participantAvatars: [
      "https://i.pravatar.cc/100?img=21",
      "https://i.pravatar.cc/100?img=22",
    ],
    gender: "Male",
  },
  {
    id: 3,
    title: "Hongdae Cafe Tour",
    tag: "Foodie",
    status: "register",
    participants: "2/5",
    meetupTime: getKSTISOString(2025, 5, 24, 19),
    createdAt: getKSTISOString(2025, 5, 24, 9),
    expiresAt: calculateExpiresAtFromKST(getKSTISOString(2025, 5, 24, 9)),
    content:
      "I've found so many popular cafes around Hongdae! Let's go together!",
    image:
      "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?auto=format&fit=crop&w=800&q=60",
    participantAvatars: [
      "https://i.pravatar.cc/100?img=31",
      "https://i.pravatar.cc/100?img=32",
    ],
    gender: "Female",
  },
];
