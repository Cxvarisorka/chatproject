import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

const Signup = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await signup(username, password);
            navigate("/");
        } catch {
            setError("Signup failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg w-80">
                <h1 className="text-2xl text-white mb-6 text-center">Sign Up</h1>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Username (5-10 chars)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-2 rounded bg-gray-700 text-white"
                        minLength={5}
                        maxLength={10}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password (min 6 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 rounded bg-gray-700 text-white"
                        minLength={6}
                        required
                    />
                    <button className="bg-blue-600 p-2 rounded text-white hover:bg-blue-700">
                        Sign Up
                    </button>
                </form>
                <p className="text-gray-400 text-sm mt-4 text-center">
                    Have an account? <Link to="/" className="text-blue-400">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
