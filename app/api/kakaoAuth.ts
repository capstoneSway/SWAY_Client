import { api } from "./axios";

export interface KakaoTokenResponse {
  accessToken: string;
  refreshToken: string;
  scope: string;
}

/*
 인가 코드를 백엔드에 전송하고,
 액세스·리프레시 토큰을 돌려받는다.
 */

export async function exchangeKakaoCode(
  code: string
): Promise<KakaoTokenResponse> {
  const { data } = await api.post<KakaoTokenResponse>("exampleURL", { code });
  return data;
}
// 예시입니다. 백엔드 요청 엔드포인트로 보내셔야 합니다...
