import { FormActions } from '@/components/admin/form-actions';
import { FormCard, FormField } from '@/components/admin/form-field';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { PhoneInput } from '@/components/ui/phone-input';
import { SwitchField } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type Guardian, type Student } from '@/types/admin';
import { type Option } from '@/types/models';
import { Head, useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';

type StudentForm = {
    name: string;
    school_grade: string;
    school_name: string;
    birth_date: string;
    notes: string;
    is_active: boolean;
    guardian_mode: 'existing' | 'new';
    guardian_id: string;
    guardian: { name: string; whatsapp_phone: string; email: string };
};

interface Props {
    student: Student | null;
    grades: Option[];
    guardians: Guardian[];
}

export default function StudentFormPage({ student, grades, guardians }: Props) {
    const editing = student !== null;
    const { data, setData, post, put, processing, errors, transform } = useForm<StudentForm>({
        name: student?.name ?? '',
        school_grade: student?.school_grade ?? grades.find((g) => g.value === 'primary_1')?.value ?? grades[0]?.value ?? '',
        school_name: student?.school_name ?? '',
        birth_date: student?.birth_date ?? '',
        notes: student?.notes ?? '',
        is_active: student?.is_active ?? true,
        // Al registrar a alguien nuevo, lo normal es que el tutor también sea nuevo
        guardian_mode: editing ? 'existing' : 'new',
        guardian_id: student ? String(student.guardian_id) : '',
        guardian: { name: '', whatsapp_phone: '', email: '' },
    });

    const mode = guardians.length === 0 ? 'new' : data.guardian_mode;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((d) => {
            const base = {
                name: d.name,
                school_grade: d.school_grade,
                school_name: d.school_name,
                birth_date: d.birth_date,
                notes: d.notes,
                is_active: d.is_active,
            };
            return mode === 'existing' ? { ...base, guardian_id: d.guardian_id } : { ...base, guardian_id: '', guardian: d.guardian };
        });
        if (editing) put(route('admin.students.update', student.id));
        else post(route('admin.students.store'));
    };

    const title = editing ? `Editar a ${student.name.split(' ')[0]}` : 'Nuevo alumno';
    const guardianError = (field: string) => (errors as Record<string, string>)[`guardian.${field}`];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Alumnos', href: route('admin.students.index') },
                { title, href: '#' },
            ]}
        >
            <Head title={title} />
            <PageBody>
                <PageHeader title={title} />

                <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
                    <FormCard title="👧 Datos del niño o niña">
                        <FormField label="Nombre completo" htmlFor="name" error={errors.name}>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Sofía Ramírez López"
                                autoFocus={!editing}
                            />
                        </FormField>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <FormField label="Grado escolar" htmlFor="school_grade" error={errors.school_grade}>
                                <NativeSelect id="school_grade" value={data.school_grade} onChange={(e) => setData('school_grade', e.target.value)}>
                                    {grades.map((g) => (
                                        <option key={g.value} value={g.value}>
                                            {g.label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </FormField>
                            <FormField label="Fecha de nacimiento" htmlFor="birth_date" error={errors.birth_date} optional>
                                <Input id="birth_date" type="date" value={data.birth_date} onChange={(e) => setData('birth_date', e.target.value)} />
                            </FormField>
                        </div>
                        <FormField label="Escuela" htmlFor="school_name" error={errors.school_name} optional>
                            <Input
                                id="school_name"
                                value={data.school_name}
                                onChange={(e) => setData('school_name', e.target.value)}
                                placeholder="Primaria Benito Juárez"
                            />
                        </FormField>
                        <FormField
                            label="Notas"
                            htmlFor="notes"
                            error={errors.notes}
                            optional
                            hint="Solo tú las ves: temas difíciles, alergias, cómo aprende mejor…"
                        >
                            <Textarea id="notes" rows={3} value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                        </FormField>
                        {editing && (
                            <SwitchField
                                id="is_active"
                                label="Alumno activo"
                                description="Apágalo si ya no toma clases (no se borra su historial)."
                                checked={data.is_active}
                                onCheckedChange={(v) => setData('is_active', v)}
                            />
                        )}
                    </FormCard>

                    <FormCard title="👩 Mamá, papá o tutor" description="A este WhatsApp se mandan los recordatorios.">
                        {guardians.length > 0 && (
                            <div className="bg-muted grid grid-cols-2 gap-1 rounded-xl p-1" role="radiogroup" aria-label="Tutor">
                                {(['existing', 'new'] as const).map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        role="radio"
                                        aria-checked={mode === m}
                                        onClick={() => setData('guardian_mode', m)}
                                        className={cn(
                                            'rounded-lg px-3 py-2 text-sm font-semibold transition',
                                            mode === m ? 'bg-background shadow-sm' : 'text-muted-foreground',
                                        )}
                                    >
                                        {m === 'existing' ? 'Ya está registrado' : 'Es nuevo'}
                                    </button>
                                ))}
                            </div>
                        )}

                        {mode === 'existing' ? (
                            <FormField
                                label="Elige al tutor"
                                htmlFor="guardian_id"
                                error={errors.guardian_id}
                                hint="Útil cuando registras a un hermanito."
                            >
                                <NativeSelect id="guardian_id" value={data.guardian_id} onChange={(e) => setData('guardian_id', e.target.value)}>
                                    <option value="" disabled>
                                        Elige…
                                    </option>
                                    {guardians.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.name} · {g.whatsapp_phone_formatted}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </FormField>
                        ) : (
                            <>
                                <FormField label="Nombre" htmlFor="guardian_name" error={guardianError('name')}>
                                    <Input
                                        id="guardian_name"
                                        value={data.guardian.name}
                                        onChange={(e) => setData('guardian', { ...data.guardian, name: e.target.value })}
                                        placeholder="Mariana López"
                                    />
                                </FormField>
                                <FormField
                                    label="WhatsApp"
                                    htmlFor="guardian_phone"
                                    error={guardianError('whatsapp_phone')}
                                    hint="Si ese número ya está registrado, lo ligamos al mismo tutor."
                                >
                                    <PhoneInput
                                        id="guardian_phone"
                                        value={data.guardian.whatsapp_phone}
                                        onChange={(digits) => setData('guardian', { ...data.guardian, whatsapp_phone: digits })}
                                        invalid={Boolean(guardianError('whatsapp_phone'))}
                                    />
                                </FormField>
                                <FormField label="Correo" htmlFor="guardian_email" error={guardianError('email')} optional>
                                    <Input
                                        id="guardian_email"
                                        type="email"
                                        value={data.guardian.email}
                                        onChange={(e) => setData('guardian', { ...data.guardian, email: e.target.value })}
                                    />
                                </FormField>
                            </>
                        )}
                    </FormCard>

                    <div className="lg:col-span-2">
                        <FormActions
                            cancelHref={editing ? route('admin.students.show', student.id) : route('admin.students.index')}
                            processing={processing}
                        />
                    </div>
                </form>
            </PageBody>
        </AppLayout>
    );
}
