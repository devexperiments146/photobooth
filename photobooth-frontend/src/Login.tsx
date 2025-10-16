import React from 'react';

import axios from 'axios-typescript';

const Login: React.FC = () => {

      const loginGoogle = React.useCallback(async () => {
          const response = await axios.get('http://localhost:4000/google-auth');
          if(response.data ){
            const result = JSON.parse(response.data);
            window.location.href = result.url;
          }

  }, []);
    
    return(
	<div>
            <button onClick={loginGoogle}>Login</button>
	</div>
)};

export default Login;