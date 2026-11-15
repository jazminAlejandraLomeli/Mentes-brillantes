import { type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { site, demo } = usePage<SharedData>().props;
    // En la demo el acceso viene ya escrito para que cualquiera pueda probar
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: demo?.email ?? '',
        password: demo?.password ?? '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title={`¡Hola, ${site.business.owner}! 👋`} description="Entra a tu panel para administrar tu página y tu agenda">
            <Head title="Iniciar sesión" />

            {status && <div className="text-center text-sm font-medium text-green-600">{status}</div>}

            {demo && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center text-sm text-amber-900">
                    <p className="font-bold">✨ Acceso de demostración</p>
                    <p className="mt-1">
                        {demo.email}
                        <br />
                        Contraseña: <span className="font-mono font-semibold">{demo.password}</span>
                    </p>
                    <p className="mt-1 text-xs text-amber-800/80">Ya están escritos abajo: solo da clic en «Entrar».</p>
                </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="tu@correo.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Contraseña</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    ¿La olvidaste?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Tu contraseña"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox id="remember" checked={data.remember} onCheckedChange={(v) => setData('remember', v === true)} tabIndex={3} />
                        <Label htmlFor="remember">Mantener mi sesión abierta</Label>
                    </div>

                    <Button type="submit" size="lg" className="mt-2 w-full rounded-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Entrar
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
