import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, 'At least 3 characters').max(50),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
});

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [publicRegEnabled, setPublicRegEnabled] = useState(true);
  const [token, setToken] = useState('');
  const [tokenVerified, setTokenVerified] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    apiGet<{ data: { registrationEnabled: boolean } }>('/auth/registration-status')
      .then((res) => {
        setPublicRegEnabled(res.data.registrationEnabled);
        if (res.data.registrationEnabled) {
          setTokenVerified(true); // No token needed
        }
      })
      .catch(() => {
        setPublicRegEnabled(true);
        setTokenVerified(true);
      })
      .finally(() => setCheckingStatus(false));
  }, []);

  const onSubmit = async (data: RegisterData) => {
    setLoading(true);
    try {
      await apiPost('/auth/register', {
        ...data,
        token: publicRegEnabled ? undefined : token,
      });
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/auth/login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Token entry step (when public registration is disabled)
  if (!publicRegEnabled && !tokenVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Registration Token Required
          </CardTitle>
          <CardDescription>
            Public registration is disabled. Enter a valid registration token to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-token">Registration Token</Label>
              <Input
                id="reg-token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your token here"
              />
            </div>
            <Button
              className="w-full"
              disabled={!token.trim()}
              onClick={() => {
                if (token.trim()) setTokenVerified(true);
              }}
            >
              Continue
            </Button>
            <p className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-primary hover:underline">Login</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Registration form
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Register to start creating battle plans</CardDescription>
      </CardHeader>
      <CardContent>
        {!publicRegEnabled && (
          <button
            type="button"
            onClick={() => setTokenVerified(false)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-3 w-3" /> Change token
          </button>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register('username')} />
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </Button>
          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary hover:underline">Login</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
