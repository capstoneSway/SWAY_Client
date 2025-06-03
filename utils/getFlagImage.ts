//프로필에 국기 이미지 가져오기
import { countries } from "@/constants/country";

// nationality: 서버에서 받은 국가명
export function getFlagImage(nationality: string) {
  const country = countries.find(
    (c) => c.name.toLowerCase() === nationality.toLowerCase()
  );
  return country?.flag ?? null;
}
