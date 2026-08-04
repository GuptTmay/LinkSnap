import AuthDialog from '@/components/AuthDialog';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { logoutUser, me } from '@/lib/api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const Intro = () => {
  const [isLogged, setIsLogged] = useState(false);

  const handleLogOut = async () => {
    const res = await logoutUser();
    const body = await res.json();
    toast.success(body.message);
    if (res.ok) {
      console.log("user log out");
      setIsLogged(false);
    }
  }


  useEffect(() => {
    async function checkUserStatus() {
      const res = await me();
      if (res.ok) {
        console.log("user has session id");
        setIsLogged(true);
      }
    }
    checkUserStatus();
  }, []);

  return (
    <div>
      <div className='h-screen flex justify-center items-center gap-4'>
        <ModeToggle />
        {isLogged ?
          <>
            <Button onClick={handleLogOut}>LogOut</Button>
          </>
          :
          <>
            <AuthDialog type="signup" />
            <AuthDialog type="login" />
          </>
        }
      </div>
    </div>
  )
}

export default Intro