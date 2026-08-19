import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { googleOauth } from "@/api/auth.api";

const Auth = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const res = await googleOauth(credentialResponse); 
          const body = await res.json();
          // console.log(body);
          // console.log("success");
          localStorage.setItem("token", body.token);
          navigate('/home');
        }}
        onError={() => {
          console.log("Login Failed");
        }}
      />
    </div>
  );
};

export default Auth;