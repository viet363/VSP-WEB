import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../api";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const history = useHistory();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await api.post("login", { username, password });
            console.log("RES:", res.data);

            setSuccess("Đăng nhập thành công!");

            // ================================
            // 📌 LƯU TOKEN VÀ THÔNG TIN ADMIN
            // ================================
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("admin_user", JSON.stringify(res.data.user));

            // ================================
            // 📌 CHUYỂN TRANG SAU 1 GIÂY
            // ================================
            setTimeout(() => {
                history.push("/dashboard");
            }, 800);

        } catch (err) {
            console.error("Axios Error:", err);
            setError(
                err.response?.data?.message ||
                "Sai tài khoản hoặc mật khẩu!"
            );
        }
    };

    return (
        <div className="login-container">
            <h2>Đăng nhập Admin</h2>

            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}

                <button type="submit">Đăng nhập</button>

                <p>
                    Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
                </p>
            </form>

            <style>{`
                body {
                    background-color: #f4f4f9;
                    font-family: 'Inter', sans-serif;
                }
                .login-container {
                    width: 400px;
                    max-width: 90%;
                    margin: 80px auto;
                    padding: 40px;
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    text-align: center;
                }
                h2 {
                    margin-bottom: 30px;
                    color: #333;
                    font-weight: 600;
                }
                input {
                    width: 100%;
                    padding: 14px;
                    margin: 15px 0;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                    font-size: 16px;
                    transition: border-color 0.3s;
                }
                input:focus {
                    border-color: #4CAF50;
                    outline: none;
                }
                button {
                    width: 100%;
                    padding: 14px;
                    background: #4CAF50;
                    border: none;
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 18px;
                    font-weight: 700;
                    margin-top: 20px;
                    transition: background-color 0.3s, transform 0.1s;
                }
                button:hover {
                    background: #45a049;
                }
                button:active {
                    transform: scale(0.99);
                }
                .error {
                    color: #e74c3c;
                    margin-top: 10px;
                    font-weight: 500;
                }
                .success {
                    color: #2ecc71;
                    margin-top: 10px;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
};

export default Login;
