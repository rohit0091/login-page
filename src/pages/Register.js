import { useState } from "react";
import axios from "axios";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1); // 1 = Register, 2 = Enter OTP
    const [message, setMessage] = useState("");

    const handleRegister = async () => {
        try {
            const res = await axios.post("http://localhost:5000/register", { email, password });
            setMessage(res.data.message);
            setStep(2);
        } catch (error) {
            setMessage(error.response?.data.message || "Registration failed");
        }
    };

    const verifyOTP = async () => {
        try {
            const res = await axios.post("http://localhost:5000/verify-otp", { email, otp });
            setMessage("Registration successful! You can now log in.");
        } catch (error) {
            setMessage(error.response?.data.message || "OTP verification failed");
        }
    };

    return (
        <div>
            <h2>Register</h2>
            {message && <p>{message}</p>}
            {step === 1 ? (
                <>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={handleRegister}>Register</button>
                </>
            ) : (
                <>
                    <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                    <button onClick={verifyOTP}>Verify OTP</button>
                </>
            )}
        </div>
    );
};

export default Register;
