import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Settings {
  registrationEnabled: boolean;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => apiGet<{ data: Settings }>('/admin/settings'),
  });

  const updateMutation = useMutation({
    mutationFn: (settings: Partial<Settings>) => apiPut('/admin/settings', settings),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] }); toast.success('Settings updated'); },
    onError: (err: Error) => toast.error(err.message),
  });

  const regEnabled = data?.data.registrationEnabled ?? true;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-base font-medium">Public Registration</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {regEnabled
                  ? 'Anyone can create an account. No registration token required.'
                  : 'Disabled — users need a registration token from an admin to create an account.'}
              </p>
            </div>
            <Switch
              checked={regEnabled}
              onCheckedChange={(checked) => updateMutation.mutate({ registrationEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
