import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation} from 'react-router-dom'
import axios from 'axios';
import styled from 'styled-components';


const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  font-family: Arial, sans-serif;
`;

const LoginBox = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 300px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border 0.3s;

  &:focus {
    border: 1px solid #6a11cb;
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #6a11cb;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background-color: #2575fc;
  }
`;




const LOGIN_URL = 'http://127.0.0.1:8000/login';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();


    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
          handleSubmit();
        }
      };

    
    const handleSubmit = async (e) => {
        try {
            
            
            let userCredentials = {
                username: username,
                password: password
            };
            const response = await axios.post(LOGIN_URL, new URLSearchParams(userCredentials), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', // Required for OAuth2PasswordRequestForm
                },
            });
            console.log('response:', response);
            localStorage.setItem("access_token", response.data.access_token);
            // localStorage.setItem("refresh_token", response.data.refresh_token);
            localStorage.setItem("role", response.data.role);
            console.log("User's Role:", localStorage.getItem("role"));
            navigate('/tool');
          } catch (error) {
            console.error('Error:', error);
            alert("Login failed");
          }
    }
    return (

          
                <LoginContainer>
      <LoginBox>
        <Title>Login</Title>
        <Input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)
          }
          onKeyDown={handleKeyPress}
        />
        <Button onClick={handleSubmit}
        >Login</Button>
      </LoginBox>
    </LoginContainer>
                    
                
              
        
    )
}

export default Login