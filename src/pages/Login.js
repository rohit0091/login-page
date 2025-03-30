import { useState } from "react";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [useOtp, setUseOtp] = useState(false);
    const [message, setMessage] = useState("");

    const handleLogin = async () => {
        try {
            const res = await axios.post("http://localhost:5000/login", { email, password });
            setMessage("Login successful! Token: " + res.data.token);
        } catch (error) {
            setMessage(error.response?.data.message || "Login failed");
        }
    };

    const requestOtp = async () => {
        try {
            const res = await axios.post("http://localhost:5000/login-otp", { email });
            setMessage("OTP sent to your email.");
        } catch (error) {
            setMessage(error.response?.data.message || "Failed to send OTP");
        }
    };

    const verifyOtp = async () => {
        try {
            const res = await axios.post("http://localhost:5000/verify-otp", { email, otp });
            setMessage("Login successful! Token: " + res.data.token);
        } catch (error) {
            setMessage(error.response?.data.message || "OTP verification failed");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {message && <p>{message}</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

            {useOtp ? (
                <>
                    <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                    <button onClick={verifyOtp}>Verify OTP</button>
                </>
            ) : (
                <>
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={handleLogin}>Login</button>
                </>
            )}

            <button onClick={() => setUseOtp(!useOtp)}>
                {useOtp ? "Use Password Instead" : "Login with OTP"}
            </button>

            {useOtp && <button onClick={requestOtp}>Request OTP</button>}
        </div>
    );
};

export default Login;
