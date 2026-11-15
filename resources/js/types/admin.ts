/**
 * Datos del panel (alumnos, agenda) que llegan de Laravel.
 */

export interface Guardian {
    id: number;
    name: string;
    whatsapp_phone: string;
    whatsapp_phone_formatted: string;
    whatsapp_url: string;
    email: string | null;
    notes: string | null;
    students?: Student[];
    students_count?: number;
}

export interface Student {
    id: number;
    name: string;
    school_grade: string;
    school_grade_label: string;
    school_name: string | null;
    birth_date: string | null;
    age: number | null;
    notes: string | null;
    is_active: boolean;
    guardian_id: number;
    guardian?: Guardian;
    upcoming_appointments_count?: number;
    next_appointment?: Appointment | null;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
    id: number;
    student_id: number;
    service_id: number | null;
    teacher_id: number | null;
    appointment_series_id: number | null;
    subject: string | null;
    topic: string;
    starts_at: string;
    ends_at: string;
    date: string;
    time: string;
    date_label: string;
    time_label: string;
    duration_minutes: number;
    status: AppointmentStatus;
    status_label: string;
    status_color: string;
    is_past: boolean;
    notes: string | null;
    reminder_sent_at: string | null;
    student?: Student;
    service?: { id: number; title: string } | null;
    teacher?: TeacherOption | null;
    whatsapp?: { reminder: string; cancellation: string; reschedule: string };
}

export interface AppointmentSeries {
    id: number;
    student_id: number;
    service_id: number | null;
    subject: string | null;
    weekdays: number[];
    start_time: string;
    duration_minutes: number;
    starts_on: string;
    sessions_count: number | null;
    ends_on: string | null;
    notes: string | null;
    summary: string;
    appointments_count?: number;
    remaining_count?: number;
}

export interface StatusOption {
    value: AppointmentStatus;
    label: string;
    color: string;
}

export interface StudentOption {
    id: number;
    name: string;
    guardian: string | null;
}

export interface TeacherOption {
    id: number;
    name: string;
    color: string;
}

/** Perfil público del maestro (también lo usa la página) */
export interface TeacherProfile extends TeacherOption {
    full_name: string | null;
    title: string | null;
    photo_url: string | null;
    bio: string | null;
    education: string | null;
    education_list: string[];
    specialties: string[];
}

export interface Teacher extends TeacherProfile {
    whatsapp_phone: string | null;
    whatsapp_phone_formatted: string | null;
    is_active: boolean;
    show_on_website: boolean;
    upcoming_count?: number;
}

export interface ServiceOption {
    id: number;
    title: string;
}

export interface Paginated<T> {
    data: T[];
    links: { first: string | null; last: string | null; prev: string | null; next: string | null };
    meta: {
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
}
