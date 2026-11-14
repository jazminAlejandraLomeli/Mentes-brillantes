<?php

namespace App\Enums;

enum SchoolGrade: string
{
    case Preschool1 = 'preschool_1';
    case Preschool2 = 'preschool_2';
    case Preschool3 = 'preschool_3';
    case Primary1 = 'primary_1';
    case Primary2 = 'primary_2';
    case Primary3 = 'primary_3';
    case Primary4 = 'primary_4';
    case Primary5 = 'primary_5';
    case Primary6 = 'primary_6';
    case Secondary1 = 'secondary_1';
    case Secondary2 = 'secondary_2';
    case Secondary3 = 'secondary_3';

    public function label(): string
    {
        [$level, $year] = explode('_', $this->value);

        $levelName = match ($level) {
            'preschool' => 'Preescolar',
            'primary' => 'Primaria',
            'secondary' => 'Secundaria',
        };

        return "{$year}° de {$levelName}";
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $g) => ['value' => $g->value, 'label' => $g->label()], self::cases());
    }
}
