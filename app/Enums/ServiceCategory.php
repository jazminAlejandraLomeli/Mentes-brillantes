<?php

namespace App\Enums;

enum ServiceCategory: string
{
    case Regularization = 'regularization';
    case Workshop = 'workshop';
    case SummerCourse = 'summer_course';

    public function label(): string
    {
        return match ($this) {
            self::Regularization => 'Regularización',
            self::Workshop => 'Taller',
            self::SummerCourse => 'Curso de verano',
        };
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $c) => ['value' => $c->value, 'label' => $c->label()], self::cases());
    }
}
