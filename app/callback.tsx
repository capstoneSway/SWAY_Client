import { useSearchParams } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Callback() {
  const searchParams = useSearchParams();
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const processAuthCode = () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        setErrorMessage("Authorization failed. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!code) {
        setErrorMessage("Authorization code not found.");
        setIsLoading(false);
        return;
      }

      console.log("Authorization Code:", code);
      setAuthCode(code);
      setIsLoading(false);
    };

    processAuthCode();
  }, [searchParams]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
        <Text>인증 처리 중...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {errorMessage ? (
        <Text style={{ color: "red" }}>{errorMessage}</Text>
      ) : (
        <>
          <Text>Authorization Code:</Text>
          <Text style={{ color: "green", marginTop: 10 }}>{authCode}</Text>
        </>
      )}
    </View>
  );
}
