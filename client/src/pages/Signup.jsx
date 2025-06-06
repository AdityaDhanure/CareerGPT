import {useState, useCallback, useMemo} from 'react';
import GoogleLogo from '../assets/google-logo.svg';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { InputField } from '../components/authComponents/InputField';
import { ButtonField } from '../components/authComponents/ButtonField';
import bg from '../assets/bg.jpg';


export function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = useCallback(async (e) => {
        e.preventDefault(); // prevent default form reload
        try {
        const response = await axios.post('https://careergpt-be.onrender.com/api/auth/register', {
            name,
            email,
            password,
        });
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.msg) {
                alert(error.response.data.msg);
            } else {
                alert('An unexpected error occurred during login.');
            }
            console.error('Signup failed:', error);
        }
    }, [name, email, password, navigate]);

    const handleGoogleSignIn = useCallback(async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log('User info:', user);
            // Send user data to your backend for further processing
            const response = await axios.post('https://careergpt-be.onrender.com/api/auth/google-login', {
                email: user.email,
                name: user.displayName,
                photoURL: user.photoURL,
            });
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.msg) {
                alert(error.response.data.msg);
            } else {
                alert('An unexpected error occurred during login.');
            }
            console.error('Google sign-in error:', error);
        }
    }, []);

    const backgroundStyles = useMemo(() => ({
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            height: '100vh'
    }), []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100" style={backgroundStyles}>
      <div className="bg-white  p-10 md:p-12  rounded-lg shadow-md  md:w-120  text-center">

        <h1 className="text-xl sm:text-2xl md:text-3xl  font-bold  mb-4 md:mb-6  text-zinc-500">Welcome to CareerGPT</h1>
        <h1 className="text-lg sm:text-xl md:text-2xl  font-bold  mb-2 sm:mb-3 md:mb-4">Sign Up</h1>

        <form onSubmit={handleRegister}>
            <InputField type="text" placeholder="Enter your name" onChange={(e) => setName(e.target.value)} />
            <InputField type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

            <div>
                <InputField type={showPassword ? 'text' : 'password'} placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <span
                    className="fixed text-gray-600 hover:cursor-pointer sm:pt-0.5  lg:pb-3.5  lg:px-1.5     top-106.5 md:top-82.5   right-27 sm:right-65 md:right-81 lg:right-112 xl:right-145"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
            </div>

            <ButtonField type="submit" text="Create Account" />
        </form>

        <div>
            <p className="text-gray-500 mt-4">
                Already have an account? <a href="/signin" className="text-blue-500 hover:underline">Sign In</a>
            </p>
        </div>

        <div className="flex items-center justify-center  mb-2 md:mb-4  py-3 md:py-4">
            <span className="border-t border-gray-300 w-full"></span>
            <div className="px-2 text-gray-500">or continue</div>
            <span className="border-t border-gray-300 w-full"></span>
        </div>

        <button
            onClick={handleGoogleSignIn}
            className="w-fit px-2  py-1.5 md:py-2  rounded hover:cursor-pointer hover:bg-gray-100 transition-colors duration-100 shadow-sm">
            <div className="flex items-center justify-center  gap-1 md:gap-2">
                <img className='w-5 md:w-7' src={GoogleLogo} alt="GLogo" />
                <span className="text-black">Sign in with Google</span>
            </div>
        </button>

      </div>
    </div>
  );
}

